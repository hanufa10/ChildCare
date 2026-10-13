
import { useState } from "react";
import { Link } from "react-router-dom";
import "../components/styles/Profile.css";

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "{}");
  } catch {
    return {};
  }
}

export default function Profile() {
  const [profile, setProfile] = useState(() => {
    const user = getSavedUser();

    return {
      firstName: user.firstName || user.FirstName || "",
      lastName: user.lastName || user.LastName || "",
      email: user.email || user.Email || "",
      phoneNumber: user.phoneNumber || user.PhoneNumber || "",
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    const user = getSavedUser();

    setProfile({
      firstName: user.firstName || user.FirstName || "",
      lastName: user.lastName || user.LastName || "",
      email: user.email || user.Email || "",
      phoneNumber: user.phoneNumber || user.PhoneNumber || "",
    });

    setMessage("");
    setIsEditing(false);
  };

  const handleSave = (event) => {
    event.preventDefault();

    const firstName = profile.firstName.trim();
    const lastName = profile.lastName.trim();
    const email = profile.email.trim();
    const phoneNumber = profile.phoneNumber.trim();

    if (!firstName || !lastName || !email) {
      setMessage("First name, last name, and email are required.");
      return;
    }

    try {
      const user = getSavedUser();

      const updatedUser = {
        ...user,
        firstName,
        lastName,
        email,
        phoneNumber,
      };

      localStorage.setItem("authUser", JSON.stringify(updatedUser));

      setProfile({ firstName, lastName, email, phoneNumber });
      setIsEditing(false);
      setMessage("Profile saved successfully in this browser.");

      window.dispatchEvent(new Event("authChanged"));
    } catch {
      setMessage("Could not save the profile. Please try again.");
    }
  };

  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() || "Administrator";

  return (
    <main className="admin-profile">
      <div className="admin-profile-header">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your administrator information.</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="profile-btn profile-btn-primary"
            onClick={() => {
              setMessage("");
              setIsEditing(true);
            }}
          >
            Edit Profile
          </button>
        )}
      </div>

      <section className="admin-profile-card">
        <div className="admin-profile-banner">
          <div className="admin-profile-avatar">
            {profile.firstName.charAt(0).toUpperCase() || "A"}
          </div>

          <div>
            <h2>{fullName}</h2>
            <p>Administrator</p>
          </div>
        </div>

        {message && (
          <p className="profile-message" role="status">
            {message}
          </p>
        )}

        <form onSubmit={handleSave}>
          <h3>Personal Information</h3>

          <div className="admin-profile-grid">
            <label>
              First Name *
              <input
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                required
                maxLength={100}
              />
            </label>

            <label>
              Last Name *
              <input
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                required
                maxLength={100}
              />
            </label>

            <label>
              Email Address *
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
                required
                maxLength={254}
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
                maxLength={30}
                placeholder="Enter phone number"
              />
            </label>
          </div>

          {isEditing && (
            <div className="admin-profile-actions">
              <button
                type="button"
                className="profile-btn profile-btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-btn profile-btn-primary"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>

        <Link to="/" className="profile-back-link">
          ← Back to Dashboard
        </Link>
      </section>
    </main>
  );
}
