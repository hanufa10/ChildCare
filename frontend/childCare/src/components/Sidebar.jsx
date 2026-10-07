import { Link } from 'react-router-dom';
function Sidebar() {
  return (
    <aside>
      <h2>
        Day <span>Care</span>
      </h2>
      <nav>
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/children">Children</Link>
          </li>
          <li>
            <Link to="/parents">Parents</Link>
          </li>
          <li>
            <Link to="/parent-children">
              Parent & Child
            </Link>
          </li>
          <li>
            <Link to="/staff">Staff</Link>
          </li>
          <li>
            <Link to="/meals">Meals</Link>
          </li>
          <li>
            <Link to="/aboutus">About Us</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
export default Sidebar;