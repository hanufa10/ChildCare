
import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Users, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

function Header() {
    const [attendanceOpen, setAttendanceOpen] = useState(false);
    const dropdownRef = useRef(null);

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
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    return (
        <header className="header-component">
            <div className="header-left">
                <Search size={25} />
                <input placeholder="Search anything ..." />

                <div className="attendance-dropdown" ref={dropdownRef}>
                    <button
                        type="button"
                        className="register-child-button attendance-trigger"
                        onClick={() =>
                            setAttendanceOpen((open) => !open)
                        }
                        aria-expanded={attendanceOpen}
                    >
                        Attendance
                        <ChevronDown
                            size={18}
                            className={
                                attendanceOpen ? "chevron-rotated" : ""
                            }
                            color="white"
                        />
                    </button>

                    {attendanceOpen && (
                        <div className="attendance-dropdown-menu">
                            <Link
                                to="/childrenAttendance"
                                className="attendance-dropdown-item"
                                onClick={() => setAttendanceOpen(false)}
                            >
                                <Users size={18} />
                                <span>Children Attendance</span>
                            </Link>

                            <Link
                                to="/staffAttendance"
                                className="attendance-dropdown-item"
                                onClick={() => setAttendanceOpen(false)}
                            >
                                <UserRound size={18} />
                                <span>Staff Attendance</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="header-right">
                <Bell size={22} />

                <div className="name-icon">HF</div>

                <div className="profile-info">
                    <h4>Hanan Fatih</h4>
                    <p>Central Director</p>
                </div>
            </div>
        </header>
    );
}

export default Header;
