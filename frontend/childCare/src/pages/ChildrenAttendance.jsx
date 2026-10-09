
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  RefreshCw,
} from "lucide-react";
import "../components/styles/ChildrenAttendance.css";

const API = "http://localhost:5165/api";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ChildrenAttendance() {
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load children and existing attendance records
  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [childrenResponse, attendanceResponse] = await Promise.all([
        fetch(`${API}/Children`),
        fetch(`${API}/ChildAttendance`),
      ]);

      if (!childrenResponse.ok || !attendanceResponse.ok) {
        throw new Error("Could not load children or attendance records.");
      }

      const childrenData = await childrenResponse.json();
      const attendanceData = await attendanceResponse.json();

      setChildren(childrenData);
      setAttendance(attendanceData);
    } catch (err) {
      setError(err.message || "Failed to load attendance data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Find each child's attendance for the selected date
  const dailyRecords = useMemo(() => {
    return attendance.filter(
      (record) => record.attendanceDate?.slice(0, 10) === selectedDate
    );
  }, [attendance, selectedDate]);

  // Prepare editable rows when the date or records change
  useEffect(() => {
    const nextDrafts = {};

    children.forEach((child) => {
      const record = dailyRecords.find(
        (item) => item.childId === child.id
      );

      nextDrafts[child.id] = {
        id: record?.id ?? null,
        status: record?.status || "Present",
        arrivalTime: record?.arrivalTime?.slice(0, 5) || "",
        pickupTime: record?.pickupTime?.slice(0, 5) || "",
        notes: record?.notes || "",
      };
    });

    setDrafts(nextDrafts);
  }, [children, dailyRecords]);

  const updateDraft = (childId, field, value) => {
    setDrafts((previous) => ({
      ...previous,
      [childId]: {
        ...previous[childId],
        [field]: value,
      },
    }));

    setMessage("");
  };

  const filteredChildren = useMemo(() => {
    const query = search.trim().toLowerCase();

    return children.filter((child) =>
      `${child.firstName || ""} ${child.lastName || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [children, search]);

  // Summary counts are based on saved attendance for the selected date
  const presentCount = dailyRecords.filter(
    (record) => record.status?.toLowerCase() === "present"
  ).length;

  const absentCount = dailyRecords.filter(
    (record) => record.status?.toLowerCase() === "absent"
  ).length;

  const leaveCount = dailyRecords.filter(
    (record) => record.status?.toLowerCase() === "leave"
  ).length;

  async function saveAttendance(child) {
    const draft = drafts[child.id];

    if (!draft) return;

    setSavingId(child.id);
    setError("");
    setMessage("");

    const payload = {
      childId: child.id,
      attendanceDate: selectedDate,
      status: draft.status,
      arrivalTime: draft.arrivalTime
        ? `${draft.arrivalTime}:00`
        : null,
      pickupTime: draft.pickupTime
        ? `${draft.pickupTime}:00`
        : null,
      notes: draft.notes.trim() || null,
    };

    try {
      const existing = dailyRecords.find(
        (record) => record.childId === child.id
      );

      const response = await fetch(
        existing
          ? `${API}/ChildAttendance/${existing.id}`
          : `${API}/ChildAttendance`,
        {
          method: existing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            existing
              ? { ...payload, id: existing.id }
              : payload
          ),
        }
      );

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          detail || `Could not save attendance (${response.status}).`
        );
      }

      // Reload so the table and summary reflect saved data
      await loadData();
      setMessage(
        `Attendance saved for ${child.firstName} ${child.lastName}.`
      );
    } catch (err) {
      setError(err.message || "Failed to save attendance.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="children-attendance-page">
      <div className="attendance-page-header">
        <div>
          <h1>Child Attendance</h1>
          <p>Record and monitor children's daily attendance.</p>
        </div>

        <button
          className="attendance-refresh-button"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Date and search filters */}
      <section className="attendance-filter-card">
        <div className="attendance-filter-heading">
          <CalendarDays size={20} />
          <h2>Attendance Filters</h2>
        </div>

        <div className="attendance-filter-fields">
          <label>
            Attendance date
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setMessage("");
              }}
            />
          </label>

          <label>
            Search child
            <input
              type="search"
              placeholder="Search by child name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      </section>

      {/* Daily summary */}
      <section className="attendance-summary-grid">
        <article className="attendance-summary-card summary-total">
          <div className="attendance-summary-icon">
            <CalendarDays size={23} />
          </div>
          <div>
            <p>Total children</p>
            <h2>{children.length}</h2>
          </div>
        </article>

        <article className="attendance-summary-card summary-present">
          <div className="attendance-summary-icon">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <p>Present today</p>
            <h2>{presentCount}</h2>
          </div>
        </article>

        <article className="attendance-summary-card summary-absent">
          <div className="attendance-summary-icon">
            <XCircle size={23} />
          </div>
          <div>
            <p>Absent today</p>
            <h2>{absentCount}</h2>
          </div>
        </article>

        <article className="attendance-summary-card summary-leave">
          <div className="attendance-summary-icon">
            <Clock size={23} />
          </div>
          <div>
            <p>On leave</p>
            <h2>{leaveCount}</h2>
          </div>
        </article>
      </section>

      {error && (
        <div className="attendance-message attendance-error">
          {error}
        </div>
      )}

      {message && (
        <div className="attendance-message attendance-success">
          {message}
        </div>
      )}

      {/* Attendance table */}
      <section className="attendance-table-card">
        <div className="attendance-table-heading">
          <div>
            <h2>Children's Attendance</h2>
            <p>
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                "en-GB",
                { day: "2-digit", month: "short", year: "numeric" }
              )}
            </p>
          </div>

          <span className="attendance-count-badge">
            {filteredChildren.length} children
          </span>
        </div>

        {loading ? (
          <p className="attendance-empty">Loading attendance...</p>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>CHILD</th>
                  <th>STATUS</th>
                  <th>ARRIVAL</th>
                  <th>PICKUP</th>
                  <th>NOTES</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredChildren.map((child) => {
                  const draft = drafts[child.id];

                  if (!draft) return null;

                  return (
                    <tr key={child.id}>
                      <td>
                        <div className="attendance-child-name">
                          <div className="attendance-child-avatar">
                            {child.firstName?.[0]}
                            {child.lastName?.[0]}
                          </div>
                          <div>
                            <strong>
                              {child.firstName} {child.lastName}
                            </strong>
                            <small>Child ID: {child.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <select
                          className={`attendance-status status-${draft.status.toLowerCase()}`}
                          value={draft.status}
                          onChange={(event) =>
                            updateDraft(
                              child.id,
                              "status",
                              event.target.value
                            )
                          }
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Leave">Leave</option>
                        </select>
                      </td>

                      <td>
                        <input
                          className="attendance-time-input"
                          type="time"
                          value={draft.arrivalTime}
                          disabled={draft.status !== "Present"}
                          onChange={(event) =>
                            updateDraft(
                              child.id,
                              "arrivalTime",
                              event.target.value
                            )
                          }
                          aria-label={`Arrival time for ${child.firstName}`}
                        />
                      </td>

                      <td>
                        <input
                          className="attendance-time-input"
                          type="time"
                          value={draft.pickupTime}
                          disabled={draft.status !== "Present"}
                          onChange={(event) =>
                            updateDraft(
                              child.id,
                              "pickupTime",
                              event.target.value
                            )
                          }
                          aria-label={`Pickup time for ${child.firstName}`}
                        />
                      </td>

                      <td>
                        <input
                          className="attendance-notes-input"
                          type="text"
                          placeholder="Add note..."
                          value={draft.notes}
                          onChange={(event) =>
                            updateDraft(
                              child.id,
                              "notes",
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <button
                          className="attendance-save-button"
                          onClick={() => saveAttendance(child)}
                          disabled={savingId === child.id}
                        >
                          <Save size={15} />
                          {savingId === child.id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredChildren.length === 0 && (
                  <tr>
                    <td colSpan="6" className="attendance-empty">
                      No children found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default ChildrenAttendance;