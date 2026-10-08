function ActivityCard({title, description,updateTime,icon:Icon,iconColor}){
    return (
    <div className="activity-card">
        <div className="stat-icon" style={{color: iconColor, backgroundColor: `${iconColor}20`}}>
            <Icon size={24}/>
        </div>
        <div>
            <strong>{title}</strong>
            <p>{description}</p>
            <p>{updateTime}</p>
        </div>
    </div>
    )
}
export default ActivityCard