
import { useEffect, useState } from "react";
import { Plus, Baby, Users, UserRound, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

import StatCard from "../components/StatCard";
import ActivityCard from "../components/ActivityCard";
import RecentChild from "../components/RecentChild";
import MealCard from "../components/MealCard";
import RegistrationChart from "../components/RegistrationChart";

const API_URL = "http://localhost:5165/api";

function Dashboard() {
    const [children, setChildren] = useState([]);
    const [parents, setParents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [meals, setMeals] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const today = new Date();

    const currentDay = today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const [childrenRes, parentsRes, staffRes, mealsRes] =
                    await Promise.all([
                        fetch(`${API_URL}/Children`),
                        fetch(`${API_URL}/Parent`),
                        fetch(`${API_URL}/Staff`),
                        fetch(`${API_URL}/Meal`),
                    ]);

                if (
                    !childrenRes.ok ||
                    !parentsRes.ok ||
                    !staffRes.ok ||
                    !mealsRes.ok
                ) {
                    throw new Error(
                        "One or more dashboard API requests failed."
                    );
                }

                const [childrenData, parentsData, staffData, mealsData] =
                    await Promise.all([
                        childrenRes.json(),
                        parentsRes.json(),
                        staffRes.json(),
                        mealsRes.json(),
                    ]);

                setChildren(childrenData);
                setParents(parentsData);
                setStaff(staffData);
                setMeals(mealsData);
            } catch (err) {
                setError(
                    "Unable to load dashboard data. Check that your .NET API is running and the endpoints are correct."
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    // Most recently registered children first.
    const recentChildren = [...children]
        .sort((a, b) => {
            const dateA = new Date(a.registrationDate ?? a.createdAt ?? 0);
            const dateB = new Date(b.registrationDate ?? b.createdAt ?? 0);
            return dateB - dateA;
        })
        .slice(0, 3);
        
    const todayDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");


const todayMeals = meals
    .filter((meal) => {
        const mealDate = String(
            meal.date ?? meal.Date ?? ""
        ).slice(0, 10);

        return mealDate === todayDate;
    })
    .sort((a, b) => {
        const order = {
            0: 1, // Breakfast
            1: 2, // Lunch
            2: 3, // Snack
        };

        return (
            (order[a.type ?? a.Type] ?? 99) -
            (order[b.type ?? b.Type] ?? 99)
        );
    });

    return (
        <>
            <div className="dashboard-header">
                <div>
                    <h1>Good Morning!</h1>
                    <p>Here is your daily summary.</p>
                </div>

                <Link to="/registration" className="add-link">
                    <button className="add-button">
                        <Plus size={20} />
                        Register child
                    </button>
                </Link>
            </div>

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            <div className="stats-grid">
                <StatCard
                    title="Total Children"
                    value={loading ? "..." : children.length}
                    update="Registered children"
                    icon={Baby}
                    iconColor="#D96C9D"
                />

                <StatCard
                    title="Total Parents"
                    value={loading ? "..." : parents.length}
                    update="Registered parents"
                    icon={UserRound}
                    iconColor="#8B5CF6"
                />

                <StatCard
                    title="Total Staff"
                    value={loading ? "..." : staff.length}
                    update="Registered staff"
                    icon={Users}
                    iconColor="#3B82F6"
                />

                <StatCard
                    title="Meals this week"
                    value={loading ? "..." : meals.length}
                    update="Scheduled meal records"
                    icon={Utensils}
                    iconColor="#0bf536"
                />
            </div>

            <div className="activity-section">
                <div className="registration-graph">
                    <h3>Child registrations</h3>
                    <p>New registrations over the last 7 months</p>

                    {/* We'll connect the graph to registration dates next. */}
                    <div className="graph">
                      {loading ? (
                          <p>Loading registrations...</p>
                      ) : (
                          <RegistrationChart children={children} />
                      )}
                  </div>
                </div>

                <div className="recent-activities">
                    <h3>Recent activity</h3>
                    <p>Latest updates at the center</p>

                    <div>
                        <ActivityCard
                            title="Registered children"
                            description={`${children.length} children in the system`}
                            updateTime="Current database total"
                            icon={Plus}
                            iconColor="#D96C9D"
                        />

                        <ActivityCard
                            title="Registered staff"
                            description={`${staff.length} staff members in the system`}
                            updateTime="Current database total"
                            icon={UserRound}
                            iconColor="#f729fe"
                        />

                        <ActivityCard
                            title="Meal schedule"
                            description={`${meals.length} meal records available`}
                            updateTime="Current database total"
                            icon={Utensils}
                            iconColor="#0bf536"
                        />
                    </div>
                </div>
            </div>

            <div className="info-table">
                <div className="recent-registration">
                    <h3>Recent registrations</h3>
                    <p>Children recently added to your center</p>

                    <div>
                        {loading ? (
                            <p>Loading children...</p>
                        ) : recentChildren.length === 0 ? (
                            <p>No children registered yet.</p>
                        ) : (
                            recentChildren.map((child) => (
                                <RecentChild
                                    key={child.id}
                                    name={`${child.firstName} ${child.lastName}`}
                                    age={
                                        child.age ??
                                        (child.dateOfBirth
                                            ? calculateAge(child.dateOfBirth)
                                            : "N/A")
                                    }
                                    gender={child.gender ?? "Not specified"}
                                    icon={Baby}
                                    iconColor="#333"
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="today-meal">
                    <h3>Today's meals</h3>
                    <p>{currentDay}</p>

                    <div>
                        {loading ? (
                            <p>Loading meals...</p>
                        ) : todayMeals.length === 0 ? (
                            <p>
                                No meals scheduled for today, or the meal
                                schedule property needs to be configured.
                            </p>
                        ) : (
                            
                        todayMeals.map((meal) => (
                            <MealCard
                                key={meal.id ?? meal.Id}
                                name={meal.name ?? meal.Name ?? "Scheduled meal"}
                                description={meal.description ?? meal.Description ?? ""}
                                mealType={meal.type ?? meal.Type ?? "Meal"}
                                icon={Utensils}
                            />
                        ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function calculateAge(dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const beforeBirthday =
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate());

    if (beforeBirthday) {
        age--;
    }

    return age;
}

export default Dashboard;
