
import { useEffect, useState } from "react";
import { ArrowLeft, HeartPulse, Search, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import "../components/styles/DietaryNeeds.css";

const API_URL = "http://localhost:5165/api";

function DietaryNeeds() {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function loadChildren() {
            try {
                const response = await fetch(`${API_URL}/Children`);

                if (!response.ok) {
                    throw new Error("Unable to load children's information.");
                }

                const data = await response.json();
                setChildren(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadChildren();
    }, []);

    const filteredChildren = children.filter((child) =>
        `${child.firstName ?? ""} ${child.lastName ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const getValue = (value) => {
        if (Array.isArray(value)) {
            return value.length ? value.join(", ") : "None recorded";
        }

        if (typeof value === "string" && value.trim()) {
            return value;
        }

        return "None recorded";
    };

    return (
        <div className="dietary-page">
            <div className="dietary-page-header">
                <div>
                    <Link to="/meals" className="dietary-back-link">
                        <ArrowLeft size={18} /> Back to meals
                    </Link>
                    <h1>Children's Dietary Needs</h1>
                    <p>
                        Review allergies and health conditions before
                        preparing or serving meals.
                    </p>
                </div>

                <div className="dietary-total">
                    <HeartPulse size={22} />
                    <div>
                        <strong>{children.length}</strong>
                        <span>Children</span>
                    </div>
                </div>
            </div>

            <div className="dietary-search">
                <Search size={19} />
                <input
                    type="text"
                    placeholder="Search children by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <p>Loading children's dietary needs...</p>
            ) : error ? (
                <p className="dietary-error">{error}</p>
            ) : filteredChildren.length === 0 ? (
                <p className="dietary-empty">
                    No children found.
                </p>
            ) : (
                <div className="dietary-table-wrapper">
                    <table className="dietary-table">
                        <thead>
                            <tr>
                                <th>Child's name</th>
                                <th>Allergies</th>
                                <th>Health conditions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredChildren.map((child) => {
                                const allergies =
                                    child.allergies ?? child.Allergies;

                                const healthConditions =
                                    child.healthCondition ??
                                    child.HealthCondition;
                                return (
                                    <tr key={child.id ?? child.Id}>
                                        <td>
                                            <strong>
                                                {child.firstName ?? child.FirstName}{" "}
                                                {child.lastName ?? child.LastName}
                                            </strong>
                                        </td>
                                        <td>
                                            <span className="dietary-value">
                                                <AlertTriangle size={16} />
                                                {getValue(allergies)}
                                            </span>
                                        </td>
                                        <td>
                                            {getValue(healthConditions)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="dietary-reminder">
                <AlertTriangle size={20} />
                <p>
                    Verify each child's dietary requirements with their
                    parent or guardian before serving food. "None recorded"
                    means no information was provided by the API; it does
                    not confirm that the child has no allergies or conditions.
                </p>
            </div>
        </div>
    );
}

export default DietaryNeeds;