import { Link } from 'react-router-dom';
import {LayoutDashboard,Baby,Users,UserRound,Utensils,Plus, Heart} from 'lucide-react';
function Sidebar() {
  return (
    <aside>
      <div className='side-header'>
        <div className='side-header-left'>
        <Heart size={30}/>
        <h2>
          Child <span>Care</span>
        </h2>
        </div>
        <p>Management</p>
      </div>
      <nav>
        <ul>
          <li>
            <LayoutDashboard size={25}/>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Baby size={25}/>
            <Link to="/children">Children</Link>
          </li>
          <li>
            <UserRound size={25 }/>
            <Link to="/parents">Parents</Link>
          </li>
          <li>
            <Users size={25}/>
            <Link to="/staff">Staff</Link>
          </li>
          <li>
            <Utensils size={25}/>
            <Link to="/meals">Meals</Link>
          </li>
          {/* <li>
            <Link to="/aboutus">About Us</Link>
          </li> */}
          <li>
            <Plus size={25}/>
            <Link to="/registration">Register Child</Link>
          </li>
        </ul>
      </nav>
      <div className='bottom-profile'>
        <div className="name-icon">HF</div>
                    <div className="profile-info">
                        <h4>Hanan Fatih</h4>
                        <p>hanan@gmail.com</p>
                    </div>
      </div>
    </aside>
  );
}
export default Sidebar;