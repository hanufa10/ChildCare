function StatCard({title, value,update,icon:Icon,iconColor}){
    return (
    <div className="stat-card">
        <div className="stat-icon" style={{color: iconColor, backgroundColor: `${iconColor}20`}}>
            <Icon size={24}/>
        </div>
        <div>
            <p>{title}</p>
            <div className="stat-card-right">
                <h2>{value}</h2>
                <p>{update}</p>
            </div>
        </div>
    </div>
    )
}
export default StatCard