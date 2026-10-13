
import { useState } from "react";
import "../components/styles/AdminUsers.css";
import { apiFetch } from "../utils/apiFetch";

const API = "http://localhost:5165/api/AdminUsers";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "Parent",
  gender: "",
  position: "",
  hireDate: "",
};

function getErrorMessage(data, status) {
  if (data.message) {
    return data.message;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(" ");
  }

  if (data.errors && typeof data.errors === "object") {
    return Object.entries(data.errors)
      .map(([field, messages]) => {
        const fieldName =
          field.charAt(0).toUpperCase() + field.slice(1);

        const details = Array.isArray(messages)
          ? messages.join(" ")
          : String(messages);

        return `${fieldName}: ${details}`;
      })
      .join(" ");
  }

  if (data.title) {
    return data.title;
  }

  return `Unable to create the user (HTTP ${status}). Please try again.`;
}

export default function AdminUsers() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    // Include staff details only when creating a Staff account.
    const requestBody = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password,
      role: form.role,
    };

    if (form.role === "Staff") {
      requestBody.gender = form.gender;
      requestBody.position = form.position.trim();
      requestBody.hireDate = form.hireDate;
    }

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Access denied. Only administrators can create user accounts."
        );
      }

      if (response.status === 409) {
        throw new Error(
          data.message || "This email address is already registered."
        );
      }

      if (!response.ok) {
        throw new Error(getErrorMessage(data, response.status));
      }

      const roleName = data.role || form.role;

      setSuccess(
        `${data.firstName} ${data.lastName} was created successfully as ${roleName}.`
      );

      setForm({ ...initialForm });
    } catch (err) {
      setError(
        err.message || "A network error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-heading">
        <div>
          <h1>User Management</h1>
          <p>Create parent, staff, and administrator accounts.</p>
        </div>
      </div>

      <div className="admin-users-card">
        <h2>Create New User</h2>

        {success && (
          <div className="user-message user-success" role="status">
            {success}
          </div>
        )}

        {error && (
          <div className="user-message user-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="user-form-grid">
            <div className="user-form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                maxLength={100}
                autoComplete="given-name"
                placeholder="Enter first name"
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                maxLength={100}
                autoComplete="family-name"
                placeholder="Enter last name"
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="user@example.com"
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="Enter phone number"
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="password">Temporary Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Create a strong password"
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="role">User Role</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="Parent">Parent</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {form.role === "Staff" && (
              <>
                <div className="user-form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="user-form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    value={form.position}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="e.g. Teacher, Caregiver"
                  />
                </div>

                <div className="user-form-group">
                  <label htmlFor="hireDate">Hire Date</label>
                  <input
                    id="hireDate"
                    name="hireDate"
                    type="date"
                    value={form.hireDate}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="user-form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Creating User..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
