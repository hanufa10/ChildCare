
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Users,
  UserRound,
  CalendarCheck
} from "lucide-react";
import { Link } from "react-router-dom";

function Header() {
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get the logged-in user's details
  const authUser = JSON.parse(
    localStorage.getItem("authUser") || "{}"
  );

  const adminName =
    `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim() ||
    "Admin";

  const adminEmail = authUser.email || "No email available";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setAttendanceOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header-component">
      <div className="header-left"></div>

      <div className="header-right">
        {/* Attendance icon with dropdown */}
        <div className="attendance-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="header-user-link attendance-icon-button"
            onClick={() => setAttendanceOpen((open) => !open)}
            aria-expanded={attendanceOpen}
            aria-label="Open attendance menu"
            title="Attendance"
          >
            <CalendarCheck size={24} />
            <ChevronDown
              size={14}
              className={attendanceOpen ? "chevron-rotated" : ""}
            />
          </button>

          {attendanceOpen && (
            <div className="attendance-dropdown-menu">
              <Link
                to="/dashboard/childrenAttendance"
                className="attendance-dropdown-item"
                onClick={() => setAttendanceOpen(false)}
              >
                <Users size={18} />
                <span>Children Attendance</span>
              </Link>

              <Link
                to="/dashboard/staffAttendance"
                className="attendance-dropdown-item"
                onClick={() => setAttendanceOpen(false)}
              >
                <UserRound size={18} />
                <span>Staff Attendance</span>
              </Link>
            </div>
          )}
        </div>

        {/* Admin profile avatar */}
        <Link
          to="/dashboard/profile"
          className="name-icon profile-avatar-link"
          title="My Profile"
          aria-label="Open My Profile"
        >
          {(
            `${authUser.firstName?.[0] || ""}${
              authUser.lastName?.[0] || ""
            }` || "AD"
          ).toUpperCase()}
        </Link>

        {/* Admin name and email */}
        <div className="profile-info">
          <h5 style={{ margin: "0px" }}>{adminName}</h5>
          <p style={{ margin: "0px" }}>{adminEmail}</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
