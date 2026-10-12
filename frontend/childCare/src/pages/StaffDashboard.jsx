
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/styles/StaffDashboard.css";

const API_URL = "http://localhost:5165/api";

async function fetchApi(path, token) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error("You do not have permission to view this information.");
    }

    throw new Error(`Unable to load data (${response.status}).`);
  }

  return response.json();
}

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function StaffDashboard() {
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const token = localStorage.getItem("authToken");

  const staffName =
    `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim() ||
    "Staff Member";

  const [activePage, setActivePage] = useState("overview");
  const [children, setChildren] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
const [profile, setProfile] = useState(() => {
  const user = JSON.parse(localStorage.getItem("authUser") || "{}");

  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    gender: user.gender || "",
    position: user.position || "",
    hireDate: user.hireDate || "",
  };
});

const [profileMessage, setProfileMessage] = useState("");
const [isEditingProfile, setIsEditingProfile] = useState(false);


  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        fetchApi("/Children", token),
        fetchApi("/Meal", token),
      ]);

      if (cancelled) return;

      if (results[0].status === "fulfilled") {
        setChildren(
          Array.isArray(results[0].value) ? results[0].value : []
        );
      }

      if (results[1].status === "fulfilled") {
        setMeals(
          Array.isArray(results[1].value) ? results[1].value : []
        );
      }

      const failures = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason?.message || "Unable to load data.");

      if (failures.length) {
        setError(failures.join(" "));
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  const upcomingMeals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...meals]
      .filter((meal) => {
        if (!meal.date) return false;

        const date = new Date(meal.date);
        if (Number.isNaN(date.getTime())) return false;

        date.setHours(0, 0, 0, 0);
        return date >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [meals]);

  function handleLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login", { replace: true });
  }

  function renderOverview() {
    return (
      <>
        <section className="sd-welcome-card">
          <div className="sd-welcome-icon">♡</div>

          <div>
            <p className="sd-eyebrow">STAFF WORKSPACE</p>
            <h1>Welcome, {staffName}!</h1>
            <p>
              Thank you for helping our little ones learn, grow, and
              shine every day. Here's your daycare workspace.
            </p>
          </div>
        </section>

        {error && <div className="sd-alert">{error}</div>}

        <section className="sd-stats-grid">
          <article className="sd-stat-card">
            <div className="sd-stat-icon sd-pink">♡</div>
            <div>
              <p>Registered Children</p>
              <h2>{loading ? "—" : children.length}</h2>
            </div>
          </article>

          <article className="sd-stat-card">
            <div className="sd-stat-icon sd-purple">✓</div>
            <div>
              <p>Scheduled Meals</p>
              <h2>{loading ? "—" : upcomingMeals.length}</h2>
            </div>
          </article>

          <article className="sd-stat-card">
            <div className="sd-stat-icon sd-yellow">✿</div>
            <div>
              <p>Today's Date</p>
              <h2 className="sd-date-stat">
                {new Date().toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </h2>
            </div>
          </article>
        </section>

        <section className="sd-panel">
          <div className="sd-panel-heading">
            <div>
              <h2>Quick Access</h2>
              <p>Choose a section to continue your work.</p>
            </div>
          </div>

          <div className="sd-quick-grid">
            <button
              className="sd-quick-card"
              onClick={() => setActivePage("children")}
            >
              <span className="sd-quick-icon sd-pink">♡</span>
              <span>
                <strong>Children</strong>
                <small>View registered children</small>
              </span>
              <span className="sd-arrow">→</span>
            </button>

            <button
              className="sd-quick-card"
              onClick={() => setActivePage("attendance")}
            >
              <span className="sd-quick-icon sd-green">✓</span>
              <span>
                <strong>Attendance</strong>
                <small>Daily attendance workspace</small>
              </span>
              <span className="sd-arrow">→</span>
            </button>

            <button
              className="sd-quick-card"
              onClick={() => setActivePage("meals")}
            >
              <span className="sd-quick-icon sd-yellow">✿</span>
              <span>
                <strong>Meal Schedule</strong>
                <small>Review planned meals</small>
              </span>
              <span className="sd-arrow">→</span>
            </button>
          </div>
        </section>

        <section className="sd-panel">
          <div className="sd-panel-heading">
            <div>
              <h2>Upcoming Meals</h2>
              <p>Meals scheduled for today and future dates.</p>
            </div>

            <button
              className="sd-text-button"
              onClick={() => setActivePage("meals")}
            >
              View all →
            </button>
          </div>

          {loading ? (
            <p className="sd-muted">Loading meal schedule...</p>
          ) : upcomingMeals.length === 0 ? (
            <div className="sd-empty-state">
              <span>✿</span>
              <p>No upcoming meals have been scheduled.</p>
            </div>
          ) : (
            <div className="sd-meal-list">
              {upcomingMeals.slice(0, 4).map((meal) => (
                <article className="sd-meal-row" key={meal.id}>
                  <div className="sd-meal-icon">✿</div>
                  <div className="sd-meal-info">
                    <strong>{meal.name}</strong>
                    <span>
                      {meal.type || "Meal"} · {formatDate(meal.date)}
                    </span>
                    {meal.description && <p>{meal.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  function renderChildren() {
    return (
      <section className="sd-panel">
        <div className="sd-panel-heading">
          <div>
            <h1>Children</h1>
            <p>View information about registered children.</p>
          </div>

          <span className="sd-count-badge">
            {children.length} children
          </span>
        </div>

        {error && <div className="sd-alert">{error}</div>}

        {loading ? (
          <p className="sd-muted">Loading children...</p>
        ) : children.length === 0 ? (
          <div className="sd-empty-state">
            <span>♡</span>
            <p>No children found.</p>
          </div>
        ) : (
          <div className="sd-children-grid">
            {children.map((child) => (
              <article className="sd-child-card" key={child.id}>
                <div className="sd-child-avatar">
                  {(child.firstName || "C").charAt(0).toUpperCase()}
                </div>

                <h3>
                  {child.firstName} {child.lastName}
                </h3>

                <div className="sd-child-details">
                  <p>
                    <span>Date of birth</span>
                    <strong>{formatDate(child.dateOfBirth)}</strong>
                  </p>
                  <p>
                    <span>Gender</span>
                    <strong>{child.gender || "Not provided"}</strong>
                  </p>
                  <p>
                    <span>Allergies</span>
                    <strong>{child.allergies || "None recorded"}</strong>
                  </p>
                  <p>
                    <span>Health condition</span>
                    <strong>
                      {child.healthCondition || "None recorded"}
                    </strong>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderMeals() {
    return (
      <section className="sd-panel">
        <div className="sd-panel-heading">
          <div>
            <h1>Meal Schedule</h1>
            <p>Review meals planned for the children.</p>
          </div>
          <span className="sd-count-badge">{meals.length} meals</span>
        </div>

        {error && <div className="sd-alert">{error}</div>}

        {loading ? (
          <p className="sd-muted">Loading meals...</p>
        ) : meals.length === 0 ? (
          <div className="sd-empty-state">
            <span>✿</span>
            <p>No meals have been scheduled yet.</p>
          </div>
        ) : (
          <div className="sd-table-wrapper">
            <table className="sd-table">
              <thead>
                <tr>
                  <th>Meal</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {[...meals]
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((meal) => (
                    <tr key={meal.id}>
                      <td className="sd-table-name">{meal.name}</td>
                      <td>
                        <span className="sd-meal-type">
                          {meal.type || "Meal"}
                        </span>
                      </td>
                      <td>{formatDate(meal.date)}</td>
                      <td>{meal.description || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  function renderAttendance() {
    return (
      <section className="sd-panel sd-coming-soon">
        <div className="sd-coming-icon">✓</div>
        <p className="sd-eyebrow">STAFF WORKSPACE</p>
        <h1>Attendance</h1>
        <p>
          This section is ready for the attendance feature. Once we
          create the attendance database model and API endpoints, you
          can record check-ins, check-outs, and daily attendance here.
        </p>
      </section>
    );
  }

 const pageTitles = {
  overview: "Overview",
  children: "Children",
  attendance: "Attendance",
  meals: "Meal Schedule",
  profile: "My Profile",
};

const pageContent = {
  overview: renderOverview,
  children: renderChildren,
  attendance: renderAttendance,
  meals: renderMeals,
  profile: renderProfile,
};

const navigation = [
  { id: "overview", icon: "⌂", label: "Overview" },
  { id: "children", icon: "♡", label: "Children" },
  { id: "attendance", icon: "✓", label: "Attendance" },
  { id: "meals", icon: "✿", label: "Meal Schedule" },
  { id: "profile", icon: "♙", label: "My Profile" },
];

  return (
    <div className="sd-layout">
      <aside className="sd-sidebar">
        <div className="sd-brand">
          <div className="sd-brand-icon">♡</div>
          <div>
            <h2>Cuddle Care</h2>
            <p>Staff Portal</p>
          </div>
        </div>

        <div className="sd-profile">
          <div className="sd-profile-avatar">
            {staffName.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{staffName}</strong>
            <span>Staff Member</span>
          </div>
        </div>

        <p className="sd-nav-label">WORKSPACE</p>

        <nav className="sd-navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`sd-nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="sd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activePage === item.id && (
                <span className="sd-nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sd-sidebar-footer">
          <div className="sd-sidebar-note">
            <span>♡</span>
            <p>Little steps make a big difference.</p>
          </div>

          <button className="sd-logout-button" onClick={handleLogout}>
            <span>↪</span> Log Out
          </button>
        </div>
      </aside>

      <main className="sd-main">
        <header className="sd-topbar">
          <div>
            <p className="sd-breadcrumb">Staff Portal / {pageTitles[activePage]}</p>
            <h2>{pageTitles[activePage]}</h2>
          </div>

          <div className="sd-topbar-right">
            <div className="sd-today">
              <span>◷</span>
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="sd-topbar-avatar">
              {staffName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="sd-page-content">
          {pageContent[activePage]()}
        </div>

        <footer className="sd-footer">
          Cuddle Care · Caring for little ones, every day.
        </footer>
      </main>
    </div>
  );
  
function handleProfileChange(event) {
  const { name, value } = event.target;

  setProfile((current) => ({
    ...current,
    [name]: value,
  }));
}

function handleProfileSave(event) {
  event.preventDefault();

  const firstName = profile.firstName.trim();
  const lastName = profile.lastName.trim();
  const email = profile.email.trim();

  if (!firstName || !lastName || !email) {
    setProfileMessage("First name, last name, and email are required.");
    return;
  }

  const currentUser = JSON.parse(
    localStorage.getItem("authUser") || "{}"
  );

  const updatedUser = {
    ...currentUser,
    firstName,
    lastName,
    email,
    phoneNumber: profile.phoneNumber.trim(),
    gender: profile.gender,
    position: profile.position.trim(),
    hireDate: profile.hireDate,
  };

  localStorage.setItem("authUser", JSON.stringify(updatedUser));

  setProfile({
    firstName,
    lastName,
    email,
    phoneNumber: updatedUser.phoneNumber,
    gender: updatedUser.gender,
    position: updatedUser.position,
    hireDate: updatedUser.hireDate,
  });

  setProfileMessage("Profile saved in this browser.");
  setIsEditingProfile(false);
  window.dispatchEvent(new Event("authChanged"));
}

function handleProfileCancel() {
  const user = JSON.parse(localStorage.getItem("authUser") || "{}");

  setProfile({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    gender: user.gender || "",
    position: user.position || "",
    hireDate: user.hireDate || "",
  });

  setProfileMessage("");
  setIsEditingProfile(false);
}

function renderProfile() {
  return (
    <section className="sd-panel sd-profile-page">
      <div className="sd-panel-heading">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your staff information.</p>
        </div>

        {!isEditingProfile && (
          <button
            type="button"
            className="sd-profile-edit-button"
            onClick={() => {
              setProfileMessage("");
              setIsEditingProfile(true);
            }}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="sd-profile-banner">
        <div className="sd-profile-large-avatar">
          {profile.firstName.charAt(0).toUpperCase() || "S"}
        </div>

        <div>
          <h2>
            {profile.firstName} {profile.lastName}
          </h2>
          <p>{profile.position || "Staff Member"}</p>
          <span className="sd-profile-role">Staff Account</span>
        </div>
      </div>

      {profileMessage && (
        <div className="sd-profile-message" role="status">
          {profileMessage}
        </div>
      )}

      <form onSubmit={handleProfileSave}>
        <div className="sd-profile-section-heading">
          <h3>Personal Information</h3>
          <p>Keep your contact and personal details up to date.</p>
        </div>

        <div className="sd-profile-form-grid">
          <label className="sd-profile-field">
            <span>First Name *</span>
            <input
              name="firstName"
              value={profile.firstName}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
              required
            />
          </label>

          <label className="sd-profile-field">
            <span>Last Name *</span>
            <input
              name="lastName"
              value={profile.lastName}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
              required
            />
          </label>

          <label className="sd-profile-field">
            <span>Email Address *</span>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
              required
            />
          </label>

          <label className="sd-profile-field">
            <span>Phone Number</span>
            <input
              type="tel"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
              placeholder="Enter your phone number"
            />
          </label>

          <label className="sd-profile-field">
            <span>Gender</span>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>

          <label className="sd-profile-field">
            <span>Position</span>
            <input
              name="position"
              value={profile.position}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
              placeholder="e.g. Childcare Assistant"
            />
          </label>

          <label className="sd-profile-field">
            <span>Hire Date</span>
            <input
              type="date"
              name="hireDate"
              value={profile.hireDate?.slice(0, 10) || ""}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
            />
          </label>
        </div>

        {isEditingProfile && (
          <div className="sd-profile-actions">
            <button
              type="button"
              className="sd-profile-cancel-button"
              onClick={handleProfileCancel}
            >
              Cancel
            </button>

            <button type="submit" className="sd-profile-save-button">
              Save Changes
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

}
