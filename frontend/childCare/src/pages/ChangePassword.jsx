
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/styles/AuthPage.css";
import {ArrowLeft} from 'lucide-react'
import {Link} from 'react-router-dom'

const API_URL = "http://localhost:5165/api";

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Your new passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Your new password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${API_URL}/Auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errors = data?.errors;

        throw new Error(
          Array.isArray(errors)
            ? errors.join(" ")
            : data?.message ||
                "Unable to change your password. Please try again."
        );
      }

      // The existing JWT still contains the temporary-password
      // claim, so sign in again to receive a fresh token.
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.dispatchEvent(new Event("authChanged"));

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Password changed successfully. Please sign in with your new password.",
        },
      });
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Could not connect to the server. Please check that the backend is running."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-forms">
          <form
            className="auth-form login-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-logo">
                <Link to="/Auth/login">
                 <ArrowLeft/>
                </Link>
              <span className="auth-logo-icon">♡</span>
              Cuddle Care
            </div>

            <h1>Change your password</h1>

            <p className="auth-subtitle">
              For your account's security, create a new password
              before continuing to your parent dashboard.
            </p>

            {message && (
              <p className="auth-message error" role="alert">
                {message}
              </p>
            )}

            <label htmlFor="current-password">
              Temporary password
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Changing password..." : "Change Password"}
            </button>
          </form>
        </div>

        <div className="auth-welcome-panel">
          <div className="welcome-content">
            <div className="welcome-heart">♡</div>
            <h2>Your family's security matters.</h2>
            <p>
              Choose a password that only you know. Use at least
              eight characters, including uppercase and lowercase
              letters, a number, and a special character.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
