function MealCard({name, mealType,description,icon:Icon,iconColor}){
    var time = "";
    if (mealType=="Breakfast"){
        time = "8:30AM";
    }
    else if(mealType=="Lunch"){
        time = "12:00PM"
    }
    else{
        time = "3:00PM"
    }
    return (
    <div className="recent-card">

        <div className="stat-icon" style={{color: iconColor, backgroundColor: `${iconColor}20`}}>
            <Icon size={24}/>
        </div>
        <div className='meal-list'>
            <p>{mealType} - {time}</p>
            <strong>{name}</strong>
            <p>{description}</p>
        </div>
    </div>
    )
}
export default MealCard