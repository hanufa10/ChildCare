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
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Please log in again to view dietary needs.");
        }

        const response = await fetch(`${API_URL}/Children`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

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

  const getValue = (value) => {
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "None recorded";
    }

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    return "None recorded";
  };
  const filteredChildren = children.filter((child) =>
    `${child.firstName ?? ""} ${child.lastName ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const childrenWithDietaryNeeds = filteredChildren.filter((child) => {
    const allergies = getValue(child.allergies ?? child.Allergies);
    const healthCondition = getValue(
      child.healthCondition ?? child.HealthCondition,
    );

    return allergies !== "None recorded" || healthCondition !== "None recorded";
  });

  return (
    <div className="dietary-page">
      <div className="dietary-page-header">
        <div>
          <Link to="/dashboard/meals" className="dietary-back-link">
          <ArrowLeft size={18} /> Back to meals
        </Link>
          <h1>Children's Dietary Needs</h1>
          <p>
            Review allergies and health conditions before preparing or serving
            meals.
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
        <p className="dietary-empty">No children found matching your search.</p>
      ) : childrenWithDietaryNeeds.length === 0 ? (
        <div className="dietary-empty">
          <HeartPulse size={28} />
          <h3>No Dietary Needs Recorded</h3>
          <p>
            No allergies or health conditions have been recorded for the
            children matching your search.
          </p>
        </div>
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
              {childrenWithDietaryNeeds.map((child) => {
                const allergies = child.allergies ?? child.Allergies;

                const healthConditions =
                  child.healthCondition ?? child.HealthCondition;
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
                    <td>{getValue(healthConditions)}</td>
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
          Verify each child's dietary requirements with their parent or guardian
          before serving food. "None recorded" means no information was provided
          by the API; it does not confirm that the child has no allergies or
          conditions.
        </p>
      </div>
    </div>
  );
}

export default DietaryNeeds;
