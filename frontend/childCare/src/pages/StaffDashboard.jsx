
import { useNavigate } from "react-router-dom";
import "../components/styles/StaffDashboard.css";

export default function StaffDashboard() {
  const navigate = useNavigate();

  // Get the logged-in user's details
  const authUser = JSON.parse(
    localStorage.getItem("authUser") || "{}"
  );

  const staffName = `${authUser.firstName || ""} ${
    authUser.lastName || ""
  }`.trim();

  function handleLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    // Notify the application that the user has logged out
    window.dispatchEvent(new Event("authChanged"));

    navigate("/login", { replace: true });
  }

  return (
    <div className="staff-dashboard">
      <header className="staff-header">
        <div className="staff-brand">
          <span className="staff-logo">♡</span>
          <div>
            <h2>Cuddle Care</h2>
            <p>Staff Portal</p>
          </div>
        </div>

        <button
          className="staff-logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="staff-main">
        <section className="staff-welcome-card">
          <div className="staff-welcome-icon">♡</div>

          <div>
            <p className="staff-eyebrow">STAFF DASHBOARD</p>
            <h1>
              Welcome{staffName ? `, ${staffName}` : ""}!
            </h1>
            <p className="staff-welcome-text">
              We're happy to have you here. Thank you for helping
              our little ones learn, grow, and shine every day.
            </p>
          </div>
        </section>

        <section className="staff-info-section">
          <h2>Your Workspace</h2>
          <p className="staff-section-description">
            Your daycare workspace is ready. More staff features
            can be added here as the system develops.
          </p>

          <div className="staff-info-grid">
            <article className="staff-info-card">
              <span className="staff-card-icon">♡</span>
              <h3>Children</h3>
              <p>View information about registered children.</p>
            </article>

            <article className="staff-info-card">
              <span className="staff-card-icon">✓</span>
              <h3>Attendance</h3>
              <p>Record and review children's daily attendance.</p>
            </article>

            <article className="staff-info-card">
              <span className="staff-card-icon">✿</span>
              <h3>Meal Schedule</h3>
              <p>Check the weekly meals planned for the children.</p>
            </article>
          </div>
        </section>

        <footer className="staff-footer">
          Cuddle Care · Caring for little ones, every day.
        </footer>
      </main>
    </div>
  );
}
