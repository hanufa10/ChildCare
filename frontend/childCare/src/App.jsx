import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import Parents from "./pages/Parents";
import Staff from "./pages/Staff";
import Meals from "./pages/Meals";
import ParentChildren from "./pages/ParentChildren";
import AboutUs from "./pages/AboutUs";
import Registration from "./pages/Registration";
import ChildDetails from "./pages/ChildDetails";
import ChildrenAttendance from "./pages/ChildrenAttendance";
import StaffAttendance from "./pages/StaffAttendance";
import DietaryNeeds from "./pages/DietaryNeeds";
import AuthPage from "./pages/AuthPage";
import AdminUsers from "./pages/AdminUsers";

import ParentDashboard from "./pages/ParentDashboard";
import StaffDashboard from "./pages/StaffDashboard";

function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "null");
  } catch {
    return null;
  }
}


function DashboardLayout() {
  return (
    <>
      <Sidebar />
      <main>
        <Header />
        <div className="main-div">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="children" element={<Children />} />
            <Route path="parents" element={<Parents />} />
            <Route path="staff" element={<Staff />} />
            <Route path="meals" element={<Meals />} />
            <Route path="parent-children" element={<ParentChildren />} />
            <Route path="aboutus" element={<AboutUs />} />
            <Route path="registration" element={<Registration />} />
            <Route path="children/:id" element={<ChildDetails />} />
            <Route path="childrenAttendance" element={<ChildrenAttendance />} />
            <Route path="staffAttendance" element={<StaffAttendance />} />
            <Route path="dietary-needs" element={<DietaryNeeds />} />
            <Route path="/admin-users" element={<AdminUsers />} />
            <Route path="/staff-dashboard" element={<StaffDashboard />} />          
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
  const isAdmin = roles.includes("Admin");
  const isStaff = roles.includes("Staff");
  const isParent = roles.includes("Parent");

  let homeRoute = "/login";

  if (isAdmin) {
    homeRoute = "/dashboard";
  } else if (isStaff) {
    homeRoute = "/staff-dashboard";
  } else if (isParent) {
    homeRoute = "/parent-dashboard";
  }

  return (
    <Routes>
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

      {/* Admin dashboard and its existing pages */}
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

      {/* Parent dashboard */}
      <Route
        path="/parent-dashboard"
        element={
          isLoggedIn && isParent && !isAdmin && !isStaff ? (
            <ParentDashboard />
          ) : (
            <Navigate to={homeRoute} replace />
          )
        }
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={
          <Navigate to={homeRoute} replace />
        }
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
