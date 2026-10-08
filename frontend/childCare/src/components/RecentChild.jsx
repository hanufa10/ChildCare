import {ChevronRight } from 'lucide-react'
function RecentChild({name, age,gender,icon:Icon,iconColor}){
    return (
    <div className="recent-card">
        <div className="stat-icon" style={{color: iconColor, backgroundColor: `${iconColor}20`}}>
            <Icon size={24}/>
        </div>
        <div className='list'>
            <div>
                <strong>{name}</strong>
                <p>{age} years - {gender}</p>
            </div>
            <div>
                <ChevronRight size={20}/>
            </div>
        </div>
    </div>
    )
}
export default RecentChild