
function MealCard({ name, mealType, description, icon: Icon }) {

const mealTypeNames = {
    0: "breakfast",
    1: "lunch",
    2: "snack",
};
const normalizedType =
    mealTypeNames[mealType] ??
    String(mealType ?? "").trim().toLowerCase();
const mealStyles = {
    breakfast: {
        color: "#F59E0B",
        backgroundColor: "#FEF3C7",
        time: "8:30 AM",
    },
    lunch: {
        color: "#16A34A",
        backgroundColor: "#DCFCE7",
        time: "12:00 PM",
    },
    snack: {
        color: "#9333EA",
        backgroundColor: "#F3E8FF",
        time: "3:00 PM",
    },
};

const style = mealStyles[normalizedType] ?? {
    color: "#3B82F6",
    backgroundColor: "#DBEAFE",
    time: "3:00 PM",
};
    return (
        <div className="recent-card">
            <div
                className="stat-icon"
                style={{
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                }}
            >
                {Icon && <Icon size={24} />}
            </div>

            <div className="meal-list">
                <p style={{ color: style.color }}>
                    {normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1)}
                    {" - "}
                    {style.time}
                </p>
                <strong>{name}</strong>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default MealCard;