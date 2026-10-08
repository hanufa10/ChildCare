import {Search, Bell} from 'lucide-react'
function Header(){
    return(
        <header className="header-component">
            <div className="header-left">
                    <Search size={25}/>
                    <input placeholder="Search anything ..."></input>
            </div>
            <div className="header-right">
                    <div className="name-icon">HF</div>
                    <div className="profile-info">
                        <h4>Hanan Fatih</h4>
                        <p>Central Director</p>
                    </div>
                    <div>
                        <icon></icon>
                    </div>
            </div>
        </header>
    )
}
export default Header