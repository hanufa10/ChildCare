
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Baby,
  Users,
  UserRound,
  Utensils,
  Plus,
  Heart,
  Megaphone,
  CreditCard
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove saved authentication information
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    // Notify App.jsx that the user has logged out
    window.dispatchEvent(new Event("authChanged"));

    // Redirect to login page
    navigate("/login", { replace: true });
  };

  return (
    <aside>
      <div className="side-header">
        <div className="side-header-left">
          <Heart size={30} />
          <h2>
            Child <span>Care</span>
          </h2>
        </div>

        <p>Management</p>
      </div>

      <nav>
        <ul>
          <li>
            <LayoutDashboard size={20} />
            <Link to="/dashboard">Dashboard</Link>
          </li>

          <li>
            <Baby size={20} />
            <Link to="/dashboard/children">Children</Link>
          </li>

          <li>
            <UserRound size={20} />
            <Link to="/dashboard/parents">Parents</Link>
          </li>

          <li>
            <Users size={20} />
            <Link to="/dashboard/staff">Staff</Link>
          </li>

          <li>
            <Utensils size={20} />
            <Link to="/dashboard/meals">Meals</Link>
          </li>

          <li>
            <Plus size={20} />
            <Link to="/dashboard/registration">Register Child</Link>
          </li>
          <li>
            <Megaphone size={20}/>
            <Link to="/dashboard/admin-announcements">Announcements</Link>
          </li>
          <li>
            <UserRound size={20}/>
            <Link to="/dashboard/admin-users">User Management</Link>
          </li>
          <li>
            <CreditCard size={20}/>
            <Link to="/dashboard/payments">Payments</Link>
          </li>
        </ul>
      </nav>
      <div className="bottom-profile">
        <div></div>

        <button
          type="button"
          className="add-button"
          style={{ margin: "20px" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
