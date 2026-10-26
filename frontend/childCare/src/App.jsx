
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import Parents from "./pages/Parents";
import Staff from "./pages/Staff";
import Meals from "./pages/Meals";
import ParentChildren from "./pages/ParentChildren";
import Registration from "./pages/Registration";
import ChildDetails from "./pages/ChildDetails";
import ChildrenAttendance from "./pages/ChildrenAttendance";
import StaffAttendance from "./pages/StaffAttendance";
import DietaryNeeds from "./pages/DietaryNeeds";
import AuthPage from "./pages/AuthPage";
import AdminUsers from "./pages/AdminUsers";
import Announcements from "./pages/Announcements";
import Complaints from "./pages/Complaints";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";

import ParentDashboard from "./pages/ParentDashboard";
import StaffDashboard from "./pages/StaffDashboard";

import ChangePassword from "./pages/ChangePassword";

import { logout } from './utils/auth'

// Read the logged-in user's information safely.
function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "null");
  } catch {
    return null;
  }
}

// Admin dashboard layout and its nested pages.
function DashboardLayout() {
  return (
    <>
      <Sidebar />

      <main>
        <Header />

        <div className="main-div">
          <Routes>
            {/* Show the dashboard directly at /dashboard */}
            <Route index element={<Dashboard />} />

            <Route path="children" element={<Children />} />
            <Route path="children/:id" element={<ChildDetails />} />
            <Route path="parents" element={<Parents />} />
            <Route path="staff" element={<Staff />} />
            <Route path="meals" element={<Meals />} />
            <Route path="payments" element={<Payment/>}/>

            <Route
              path="parent-children"
              element={<ParentChildren />}
            />

            <Route path="registration" element={<Registration />} />

            <Route
              path="childrenAttendance"
              element={<ChildrenAttendance />}
            />

            <Route
              path="staffAttendance"
              element={<StaffAttendance />}
            />

            <Route
              path="dietary-needs"
              element={<DietaryNeeds />}
            />

            <Route
              path="admin-users"
              element={<AdminUsers />}
            />

            {/* Unknown Admin pages return to the dashboard */}
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />

            <Route path="admin-announcements" element={<Announcements />} />
            <Route path="admin-complaints" element={<Complaints />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

function AppRoutes() {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem("authToken"),
    user: getAuthUser(),
  }));
  
  // Keep authentication state synchronized after login/logout.
  useEffect(() => {
    const syncAuth = () => {
      setAuth({
        token: localStorage.getItem("authToken"),
        user: getAuthUser(),
      });
    };

    window.addEventListener("authChanged", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("authChanged", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const isLoggedIn = Boolean(auth.token && auth.user);
  const roles = auth.user?.roles || [];
  const mustChangePassword =
  auth.user?.mustChangePassword === true;

  const isAdmin = roles.includes("Admin");
  const isStaff = roles.includes("Staff");
  const isParent = roles.includes("Parent");

  // Determine the correct landing page for each role.
  // Admin takes priority if an account has multiple roles.
 let homeRoute = "/login";

if (isParent && mustChangePassword) {
  homeRoute = "/change-password";
} else if (isAdmin) {
  homeRoute = "/dashboard";
} else if (isStaff) {
  homeRoute = "/staff-dashboard";
} else if (isParent) {
  homeRoute = "/parent-dashboard";
}
  
  // Automatically log out when a JWT expires.
  useEffect(() => {
    if (!auth.token) return;

    const checkTokenExpiration = () => {
      try {
        const payloadPart = auth.token.split(".")[1];

        if (!payloadPart) return;

        const base64 = payloadPart
          .replace(/-/g, "+")
          .replace(/_/g, "/");

        const payload = JSON.parse(atob(base64));

        if (
          payload.exp &&
          Date.now() >= payload.exp * 1000
        ) {
          logout();
        }
      } catch {
        // If the token cannot be decoded, the API must
        // still validate it when a request is made.
      }
    };

    checkTokenExpiration();

    const intervalId = setInterval(
      checkTokenExpiration,
      15000
    );

    return () => clearInterval(intervalId);
  }, [auth.token]);

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to={homeRoute} replace />
          ) : (
            <AuthPage />
          )
        }
      />

      {/* Public Parent signup */}
      <Route
        path="/signup"
        element={
          isLoggedIn ? (
            <Navigate to={homeRoute} replace />
          ) : (
            <AuthPage />
          )
        }
      />

      {/* Admin dashboard and management pages */}
      <Route
        path="/dashboard/*"
        element={
          isLoggedIn && isAdmin ? (
            <DashboardLayout />
          ) : (
            <Navigate to={homeRoute} replace />
          )
        }
      />

      {/* Staff dashboard */}
      <Route
        path="/staff-dashboard"
        element={
          isLoggedIn && isStaff && !isAdmin ? (
            <StaffDashboard />
          ) : (
            <Navigate to={homeRoute} replace />
          )
        }
      />

      
      <Route
        path="/change-password"
        element={
          isLoggedIn && isParent && !isAdmin && !isStaff &&
          mustChangePassword ? (
            <ChangePassword />
          ) : (
            <Navigate to={homeRoute} replace />
          )
        }
      />
      {/* Parent dashboard */}
      <Route
        path="/parent-dashboard"
        element={
          isLoggedIn &&
          isParent &&
          !isAdmin &&
          !isStaff &&
          !mustChangePassword ? (
            <ParentDashboard />
          ) : (
            <Navigate to={homeRoute} replace />
          )
        }
      />
      {/* Redirect unknown URLs to the appropriate home page */}
      <Route
        path="*"
        element={<Navigate to={homeRoute} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
