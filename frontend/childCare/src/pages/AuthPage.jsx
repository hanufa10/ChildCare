
import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/styles/AuthPage.css'

function AuthPage() {
  const [isSignup, setIsSignup] = useState(
    window.location.pathname === '/signup'
  )

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })

  const handleLogin = (e) => {
    e.preventDefault()
    // We will connect this to the .NET login API next.
  }

  const handleSignup = (e) => {
    e.preventDefault()

    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match.')
      return
    }

    // Public signup will always create a Parent account.
    // We will connect this to the .NET signup API next.
  }

  const switchMode = (signup) => {
    setIsSignup(signup)
    window.history.replaceState(
      null,
      '',
      signup ? '/signup' : '/login'
    )
  }

  return (
    <div className={`auth-page ${isSignup ? 'signup-mode' : ''}`}>
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

              <button className="auth-submit" type="submit">
                Sign In
              </button>

              <p className="auth-switch-text">
                Don't have an account?{' '}
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

              <div className="auth-name-row">
                <div>
                  <label htmlFor="signup-first-name">First name</label>
                  <input
                    id="signup-first-name"
                    type="text"
                    placeholder="First name"
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
                    placeholder="Last name"
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
                placeholder="you@example.com"
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
                placeholder="Phone number"
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
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                required
                value={signupData.password}
                onChange={(e) =>
                  setSignupData({ ...signupData, password: e.target.value })
                }
              />

              <label htmlFor="signup-confirm-password">
                Confirm password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                placeholder="Repeat your password"
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

              <button className="auth-submit" type="submit">
                Create Parent Account
              </button>

              <p className="auth-switch-text">
                Already have an account?{' '}
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
            <h2>{isSignup ? 'Welcome back!' : 'Little smiles, big care.'}</h2>
            <p>
              {isSignup
                ? 'Already part of our family? Sign in and continue your journey with Cuddle Care.'
                : 'A safe, loving place where every child can learn, grow, and shine.'}
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
              {isSignup ? 'Sign In' : 'Create an Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage