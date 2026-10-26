import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../components/styles/AuthPage.css";

const API_URL = "http://localhost:5165/api";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignup, setIsSignup] = useState(location.pathname === "/signup");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // Keep the displayed form in sync with the URL.

useEffect(() => {
  setIsSignup(location.pathname === "/signup");

  if (location.state?.message) {
    setMessage(location.state.message);
    setMessageType("success");
  } else {
    setMessage("");
    setMessageType("error");
  }
}, [location.pathname, location.state]);


  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const readError = async (response) => {
    const data = await response.json().catch(() => null); 

    if (data?.errors) {
      const errors = Object.values(data.errors).flat();
      if (errors.length) return errors.join(" ");
    }

    return (
      data?.message ||
      data?.title ||
      data?.detail ||
      "The request failed. Please try again."
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email.trim(),
          password: loginData.password,
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const data = await response.json();
      
    console.log("Login response:", data);
    console.log("Must change password:", data.mustChangePassword); 

      if (!data.token) {
        throw new Error("Login succeeded, but the API did not return a token.");
      }

      const roles = Array.isArray(data.roles) ? data.roles : [];
      console.log("Logged-in user:", data.email);
console.log("Roles returned by API:", JSON.stringify(roles));

      // Keep the token and basic user details for this prototype.
      // Never store the user's password.

      localStorage.setItem("authToken", data.token);
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          roles,
          mustChangePassword: data.mustChangePassword === true,
        }),
      );

      // Notify App.jsx that login was successful
      window.dispatchEvent(new Event("authChanged"));


      if (roles.includes("Admin")) {
        navigate("/dashboard", { replace: true });
      } else if (roles.includes("Staff")) {
        navigate("/staff-dashboard", { replace: true });
      } else if (roles.includes("Parent")) {
        if (data.mustChangePassword === true) {
          navigate("/change-password", { replace: true });
        } else {
          navigate("/parent-dashboard", { replace: true });
        }
      }

      else {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        window.dispatchEvent(new Event("authChanged"));

        throw new Error("Your account does not have an assigned role.");
      }

    } catch (error) {
      showMessage(
        error instanceof TypeError
          ? "Could not connect to the server. Make sure the backend is running."
          : error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (signupData.password !== signupData.confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/Auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: signupData.firstName.trim(),
          lastName: signupData.lastName.trim(),
          email: signupData.email.trim(),
          phoneNumber: signupData.phoneNumber.trim() || null,
          password: signupData.password,
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      showMessage(
        "Your Parent account has been created. Please sign in.",
        "success",
      );

      setSignupData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
      });

      navigate("/login", { replace: true });
    } catch (error) {
      showMessage(
        error instanceof TypeError
          ? "Could not connect to the server. Make sure the backend is running."
          : error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (signup) => {
    setMessage("");
    navigate(signup ? "/signup" : "/login");
  };
  return (
    <div className={`auth-page ${isSignup ? "signup-mode" : ""}`}>
      <div className="auth-card">
        <div className="auth-forms">
          {!isSignup ? (
            <form className="auth-form login-form" onSubmit={handleLogin}>
              <Link to="/login" className="auth-logo">
                <span className="auth-logo-icon">♡</span>
                Cuddle Care
              </Link>

              <h1>Welcome back!</h1>
              <p className="auth-subtitle">
                Sign in to continue caring for little ones.
              </p>

              {message && (
                <p className={`auth-message ${messageType}`} role="alert">
                  {message}
                </p>
              )}

              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
              />

              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
              />

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="auth-switch-text">
                Don't have an account?{" "}
                <button type="button" onClick={() => switchMode(true)}>
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form className="auth-form signup-form" onSubmit={handleSignup}>
              <Link to="/signup" className="auth-logo">
                <span className="auth-logo-icon">♡</span>
                Cuddle Care
              </Link>

              <h1>Create an account</h1>
              <p className="auth-subtitle">
                Join our caring community of parents.
              </p>

              {message && (
                <p className={`auth-message ${messageType}`} role="alert">
                  {message}
                </p>
              )}

              <div className="auth-name-row">
                <div>
                  <label htmlFor="signup-first-name">First name</label>
                  <input
                    id="signup-first-name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={signupData.firstName}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="signup-last-name">Last name</label>
                  <input
                    id="signup-last-name"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={signupData.lastName}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={signupData.email}
                onChange={(e) =>
                  setSignupData({ ...signupData, email: e.target.value })
                }
              />

              <label htmlFor="signup-phone">Phone number</label>
              <input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                value={signupData.phoneNumber}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    phoneNumber: e.target.value,
                  })
                }
              />

              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={signupData.password}
                onChange={(e) =>
                  setSignupData({ ...signupData, password: e.target.value })
                }
              />

              <label htmlFor="signup-confirm-password">Confirm password</label>
              <input
                id="signup-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={signupData.confirmPassword}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    confirmPassword: e.target.value,
                  })
                }
              />

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Parent Account"}
              </button>

              <p className="auth-switch-text">
                Already have an account?{" "}
                <button type="button" onClick={() => switchMode(false)}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        <div className="auth-welcome-panel">
          <div className="welcome-decoration decoration-one">♡</div>
          <div className="welcome-decoration decoration-two">✿</div>

          <div className="welcome-content">
            <div className="welcome-heart">♡</div>
            <h2>
              {isSignup ? "Welcome to our family!" : "Little smiles, big care."}
            </h2>
            <p>
              {isSignup
                ? "Create your parent account and join our caring community."
                : "A safe, loving place where every child can learn, grow, and shine."}
            </p>

            <div className="welcome-dots">
              <span />
              <span />
              <span />
            </div>

            <button
              className="welcome-switch"
              type="button"
              onClick={() => switchMode(!isSignup)}
            >
              {isSignup ? "Sign In" : "Create an Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
