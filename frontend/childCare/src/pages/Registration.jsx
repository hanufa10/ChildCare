
import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Check,
  ChevronDown,
  UserRound,
  Calendar,
} from "lucide-react";

const API_URL = "http://localhost:5165/api";

const initialForm = {
  childFirstName: "",
  childLastName: "",
  dateOfBirth: "",
  gender: "",
  allergies: "",
  healthConditions: "",
  existingParentId: null,
  parentFirstName: "",
  parentLastName: "",
  parentPhoneNumber: "",
  parentEmail: "",
  parentPassword: "",
  confirmPassword: "",
  relation: "",
};

function getParentId(parent) {
  return parent?.id ?? parent?.Id;
}

function Registration() {
  const [parents, setParents] = useState([]);
  const [parentMode, setParentMode] = useState("existing");
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);

  // Load existing parents
  useEffect(() => {
    async function loadParents() {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(`${API_URL}/Parent`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load parents.");
        }

        const data = await response.json();
        setParents(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadParents();
  }, []);

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  // Switch between existing and new parent
  function handleParentMode(mode) {
    setParentMode(mode);
    setSelectedParent(null);
    setParentSearch("");
    setError("");
    setMessage("");

    setForm((previous) => ({
      ...previous,
      existingParentId: null,
      parentFirstName: "",
      parentLastName: "",
      parentPhoneNumber: "",
      parentEmail: "",
      parentPassword: "",
      confirmPassword: "",
    }));
  }

  // Select an existing parent
  function handleSelectParent(parent) {
    setSelectedParent(parent);

    setForm((previous) => ({
      ...previous,
      existingParentId: getParentId(parent),
    }));

    setParentSearch("");
    setError("");
  }

  // Submit registration
  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    if (
      parentMode === "existing" &&
      !form.existingParentId
    ) {
      setError("Please select an existing parent.");
      setLoading(false);
      return;
    }

    if (
      parentMode === "new" &&
      form.parentPassword !== form.confirmPassword
    ) {
      setError("The passwords do not match.");
      setLoading(false);
      return;
    }

    if (
      parentMode === "new" &&
      form.parentPassword.length < 8
    ) {
      setError("The password must contain at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        childFirstName: form.childFirstName.trim(),
        childLastName: form.childLastName.trim(),
        childDateOfBirth: form.dateOfBirth,
        gender: form.gender,
        allergies: form.allergies.trim(),
        healthConditions: form.healthConditions.trim(),

        existingParentId:
          parentMode === "existing"
            ? form.existingParentId
            : null,

        parentFirstName:
          parentMode === "new"
            ? form.parentFirstName.trim()
            : "",

        parentLastName:
          parentMode === "new"
            ? form.parentLastName.trim()
            : "",

        parentPhoneNumber:
          parentMode === "new"
            ? form.parentPhoneNumber.trim()
            : "",

        parentEmail:
          parentMode === "new"
            ? form.parentEmail.trim()
            : "",

        // The backend must use this password to create
        // the parent's ASP.NET Core Identity account.
        parentPassword:
          parentMode === "new"
            ? form.parentPassword
            : null,

        // 0 = Parent, 1 = Guardian
        relation: Number(form.relation),
      };

      const response = await fetch(`${API_URL}/Registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const responseText = await response.text();

      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { message: responseText };
        }
      }

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (response.status === 403) {
        throw new Error(
          "Access denied. Only authorized users can register children."
        );
      }

      if (!response.ok) {
        const details =
          result.message ||
          result.title ||
          (typeof result === "string" ? result : "");

        throw new Error(
          details || `Registration failed (HTTP ${response.status}).`
        );
      }

      setMessage(
        parentMode === "new"
          ? "Child registered successfully. The new parent's account should now be available if account creation is enabled in the backend."
          : "Child registered and linked to the existing parent successfully."
      );

      setForm({ ...initialForm });
      setSelectedParent(null);
      setParentSearch("");
      setParentMode("existing");

      // Refresh the parent list in case a new parent was created.
      if (parentMode === "new") {
        const parentsResponse = await fetch(`${API_URL}/Parent`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (parentsResponse.ok) {
          setParents(await parentsResponse.json());
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  // Filter parents by name or phone
  const filteredParents = parents.filter((parent) => {
    const firstName = parent.firstName ?? parent.FirstName ?? "";
    const lastName = parent.lastName ?? parent.LastName ?? "";
    const phone = parent.phoneNumber ?? parent.PhoneNumber ?? "";

    const fullName = `${firstName} ${lastName}`.toLowerCase();

    return (
      fullName.includes(parentSearch.toLowerCase()) ||
      phone.toLowerCase().includes(parentSearch.toLowerCase())
    );
  });

  return (
    <div className="registration-page">
      <div className="registration-header">
        <div>
          <h1>Register child</h1>
          <p>Add a child and connect them with a family contact.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: CHILD INFORMATION */}
        <div className="registration-card">
          <div className="section-header">
            <div className="section-number">1</div>
            <div>
              <h2>Child information</h2>
              <p>Enter the child's basic information.</p>
            </div>
          </div>

          <div className="section-line" />

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="childFirstName">First name</label>
              <div className="input-with-icon">
                <UserRound size={18} />
                <input
                  id="childFirstName"
                  name="childFirstName"
                  value={form.childFirstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="childLastName">Last name</label>
              <div className="input-with-icon">
                <UserRound size={18} />
                <input
                  id="childLastName"
                  name="childLastName"
                  value={form.childLastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of birth</label>
              <div className="input-with-icon">
                <Calendar size={18} />
                <input
                  id="dateOfBirth"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <div className="select-wrapper">
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
                <ChevronDown size={18} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Allergies</label>
              <textarea
                id="allergies"
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="Enter known allergies, or leave blank if none"
                rows={3}
              />
              <small>
                Record food, medicine, or other known allergies.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="healthConditions">Health conditions</label>
              <textarea
                id="healthConditions"
                name="healthConditions"
                value={form.healthConditions}
                onChange={handleChange}
                placeholder="Enter relevant health conditions"
                rows={3}
              />
              <small>
                Record relevant conditions the daycare staff should know about.
              </small>
            </div>
          </div>
        </div>

        {/* SECTION 2: FAMILY CONTACT */}
        <div className="registration-card">
          <div className="section-header">
            <div className="section-number">2</div>
            <div>
              <h2>Family contact</h2>
              <p>Connect this child with a parent or guardian.</p>
            </div>
          </div>

          <div className="section-line" />

          <div className="parent-mode">
            <button
              type="button"
              className={
                parentMode === "existing"
                  ? "parent-option active"
                  : "parent-option"
              }
              onClick={() => handleParentMode("existing")}
            >
              <Users size={23} />
              <div>
                <strong>Existing parent</strong>
                <span>Link someone already registered</span>
              </div>
              {parentMode === "existing" && (
                <div className="selected-check">
                  <Check size={15} />
                </div>
              )}
            </button>

            <button
              type="button"
              className={
                parentMode === "new"
                  ? "parent-option active"
                  : "parent-option"
              }
              onClick={() => handleParentMode("new")}
            >
              <Plus size={23} />
              <div>
                <strong>New parent</strong>
                <span>Create a family contact and login account</span>
              </div>
              {parentMode === "new" && (
                <div className="selected-check">
                  <Check size={15} />
                </div>
              )}
            </button>
          </div>

          {/* EXISTING PARENT */}
          {parentMode === "existing" && (
            <div className="existing-parent-section">
              <label htmlFor="parentSearch">Select existing parent</label>

              <div className="parent-search">
                <Search size={19} />
                <input
                  id="parentSearch"
                  type="text"
                  placeholder="Search parent name or phone..."
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                />
              </div>

              <small>Search by parent name or phone number.</small>

              {parentSearch && (
                <div className="parent-results">
                  {filteredParents.length === 0 ? (
                    <p className="no-parents">No parents found.</p>
                  ) : (
                    filteredParents.map((parent) => {
                      const id = getParentId(parent);
                      const firstName =
                        parent.firstName ?? parent.FirstName ?? "";
                      const lastName =
                        parent.lastName ?? parent.LastName ?? "";
                      const phone =
                        parent.phoneNumber ?? parent.PhoneNumber ?? "";

                      return (
                        <button
                          type="button"
                          key={id}
                          className={
                            getParentId(selectedParent) === id
                              ? "parent-result selected"
                              : "parent-result"
                          }
                          onClick={() => handleSelectParent(parent)}
                        >
                          <div className="parent-avatar">
                            {firstName[0]}
                            {lastName[0]}
                          </div>

                          <div>
                            <strong>
                              {firstName} {lastName}
                            </strong>
                            <span>{phone}</span>
                          </div>

                          {getParentId(selectedParent) === id && (
                            <Check size={18} />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {selectedParent && (
                <div className="selected-parent">
                  <div className="parent-avatar">
                    {(selectedParent.firstName ??
                      selectedParent.FirstName ??
                      "")[0]}
                    {(selectedParent.lastName ??
                      selectedParent.LastName ??
                      "")[0]}
                  </div>

                  <div>
                    <strong>
                      {selectedParent.firstName ??
                        selectedParent.FirstName}{" "}
                      {selectedParent.lastName ??
                        selectedParent.LastName}
                    </strong>
                    <span>
                      {selectedParent.phoneNumber ??
                        selectedParent.PhoneNumber}
                    </span>
                  </div>

                  <Check size={19} />
                </div>
              )}
            </div>
          )}

          {/* NEW PARENT */}
          {parentMode === "new" && (
            <div className="form-grid new-parent-form">
              <div className="form-group">
                <label htmlFor="parentFirstName">First name</label>
                <input
                  id="parentFirstName"
                  name="parentFirstName"
                  value={form.parentFirstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentLastName">Last name</label>
                <input
                  id="parentLastName"
                  name="parentLastName"
                  value={form.parentLastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  autoComplete="family-name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentPhoneNumber">Phone number</label>
                <input
                  id="parentPhoneNumber"
                  name="parentPhoneNumber"
                  type="tel"
                  value={form.parentPhoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentEmail">Email address</label>
                <input
                  id="parentEmail"
                  name="parentEmail"
                  type="email"
                  value={form.parentEmail}
                  onChange={handleChange}
                  placeholder="parent@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentPassword">Temporary password</label>
                <input
                  id="parentPassword"
                  name="parentPassword"
                  type="password"
                  value={form.parentPassword}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <small>Use at least 8 characters.</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm temporary password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter the password again"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: RELATIONSHIP */}
        <div className="registration-card">
          <div className="section-header">
            <div className="section-number">3</div>
            <div>
              <h2>Relationship</h2>
              <p>How is this person related to the child?</p>
            </div>
          </div>

          <div className="section-line" />

          <div className="form-group relationship-field">
            <label htmlFor="relation">Relationship to child</label>
            <div className="select-wrapper">
              <select
                id="relation"
                name="relation"
                value={form.relation}
                onChange={handleChange}
                required
              >
                <option value="">Select relationship</option>
                <option value="0">Parent</option>
                <option value="1">Guardian</option>
              </select>
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="success-message" role="status">
            <Check size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="registration-actions">
          <button
            type="button"
            className="cancel-registration"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            <Check size={18} />
            {loading ? "Registering..." : "Register child"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Registration;