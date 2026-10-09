import { useEffect, useMemo, useState } from "react";
import {
    Search,
    CalendarDays,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    Save,
    RefreshCw,
} from "lucide-react";
import "../components/styles/StaffAttendance.css";

const API_URL = "http://localhost:5165/api";

function getLocalDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function StaffAttendance() {
    const [staff, setStaff] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(getLocalDate());
    const [searchTerm, setSearchTerm] = useState("");
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const [staffResponse, attendanceResponse] = await Promise.all([
                fetch(`${API_URL}/Staff`),
                fetch(`${API_URL}/StaffAttendance`),
            ]);

            if (!staffResponse.ok || !attendanceResponse.ok) {
                throw new Error("Could not load staff attendance data.");
            }

            const staffData = await staffResponse.json();
            const attendanceData = await attendanceResponse.json();

            setStaff(staffData);
            setAttendance(attendanceData);
        } catch (err) {
            setError(
                "Unable to load data. Check that your .NET API is running and the Staff endpoints are correct."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const dailyRecords = useMemo(
        () =>
            attendance.filter(
                (record) =>
                    record.attendanceDate?.slice(0, 10) === selectedDate
            ),
        [attendance, selectedDate]
    );

    const visibleStaff = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return staff.filter((person) =>
            `${person.firstName ?? ""} ${person.lastName ?? ""}`
                .toLowerCase()
                .includes(term)
        );
    }, [staff, searchTerm]);

    useEffect(() => {
        const nextDrafts = {};

        staff.forEach((person) => {
            const record = dailyRecords.find(
                (item) => item.staffId === person.id
            );

            nextDrafts[person.id] = {
                status: record?.status ?? "Present",
                checkInTime: record?.checkInTime?.slice(0, 5) ?? "",
                checkOutTime: record?.checkOutTime?.slice(0, 5) ?? "",
                notes: record?.notes ?? "",
            };
        });

        setDrafts(nextDrafts);
    }, [staff, dailyRecords]);

    function updateDraft(staffId, field, value) {
        setDrafts((current) => ({
            ...current,
            [staffId]: {
                ...current[staffId],
                [field]: value,
            },
        }));
        setSuccess("");
    }

    async function saveAttendance(person) {
        const draft = drafts[person.id];

        if (!draft) return;

        setSavingId(person.id);
        setError("");
        setSuccess("");

        const existing = dailyRecords.find(
            (record) => record.staffId === person.id
        );

        const payload = {
            staffId: person.id,
            attendanceDate: selectedDate,
            status: draft.status,
            checkInTime: draft.checkInTime
                ? `${draft.checkInTime}:00`
                : null,
            checkOutTime: draft.checkOutTime
                ? `${draft.checkOutTime}:00`
                : null,
            notes: draft.notes.trim() || null,
        };

        try {
            const response = await fetch(
                existing
                    ? `${API_URL}/StaffAttendance/${existing.id}`
                    : `${API_URL}/StaffAttendance`,
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
                const message = await response.text();
                throw new Error(message || "Failed to save attendance.");
            }

            await loadData();
            setSuccess(`Attendance saved for ${person.firstName} ${person.lastName}.`);
        } catch (err) {
            setError(err.message || "Unable to save attendance.");
        } finally {
            setSavingId(null);
        }
    }

    const presentCount = dailyRecords.filter(
        (record) => record.status === "Present"
    ).length;

    const absentCount = dailyRecords.filter(
        (record) => record.status === "Absent"
    ).length;

    const leaveCount = dailyRecords.filter(
        (record) => record.status === "Leave"
    ).length;

    return (
        <div className="staff-attendance-page">
            <div className="staff-attendance-heading">
                <div>
                    <h1>Staff Attendance</h1>
                    <p>Track daily staff attendance and working hours.</p>
                </div>

                <button
                    className="staff-attendance-refresh"
                    onClick={loadData}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            <div className="staff-attendance-summary">
                <div className="staff-summary-card">
                    <div className="staff-summary-icon total">
                        <Users size={22} />
                    </div>
                    <div>
                        <p>Total Staff</p>
                        <h2>{staff.length}</h2>
                    </div>
                </div>

                <div className="staff-summary-card">
                    <div className="staff-summary-icon present">
                        <CheckCircle size={22} />
                    </div>
                    <div>
                        <p>Present</p>
                        <h2>{presentCount}</h2>
                    </div>
                </div>

                <div className="staff-summary-card">
                    <div className="staff-summary-icon absent">
                        <XCircle size={22} />
                    </div>
                    <div>
                        <p>Absent</p>
                        <h2>{absentCount}</h2>
                    </div>
                </div>

                <div className="staff-summary-card">
                    <div className="staff-summary-icon leave">
                        <CalendarDays size={22} />
                    </div>
                    <div>
                        <p>On Leave</p>
                        <h2>{leaveCount}</h2>
                    </div>
                </div>
            </div>

            <div className="staff-attendance-card">
                <div className="staff-attendance-toolbar">
                    <div className="staff-attendance-search">
                        <Search size={19} />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                    <label className="staff-attendance-date">
                        <CalendarDays size={18} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(event) =>
                                setSelectedDate(event.target.value)
                            }
                        />
                    </label>
                </div>

                {error && (
                    <div className="staff-attendance-message error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="staff-attendance-message success">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="staff-attendance-empty">
                        Loading staff attendance...
                    </div>
                ) : visibleStaff.length === 0 ? (
                    <div className="staff-attendance-empty">
                        No staff members found.
                    </div>
                ) : (
                    <div className="staff-attendance-table-wrapper">
                        <table className="staff-attendance-table">
                            <thead>
                                <tr>
                                    <th>Staff Member</th>
                                    <th>Status</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleStaff.map((person) => {
                                    const draft = drafts[person.id] ?? {
                                        status: "Present",
                                        checkInTime: "",
                                        checkOutTime: "",
                                        notes: "",
                                    };

                                    return (
                                        <tr key={person.id}>
                                            <td>
                                                <div className="staff-member-cell">
                                                    <div className="staff-avatar">
                                                        {person.firstName?.[0] ?? "S"}
                                                        {person.lastName?.[0] ?? ""}
                                                    </div>
                                                    <div>
                                                        <strong>
                                                            {person.firstName}{" "}
                                                            {person.lastName}
                                                        </strong>
                                                        <span>
                                                            Staff ID: {person.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <select
                                                    className={`staff-status-select ${draft.status.toLowerCase()}`}
                                                    value={draft.status}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            person.id,
                                                            "status",
                                                            event.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="Present">
                                                        Present
                                                    </option>
                                                    <option value="Absent">
                                                        Absent
                                                    </option>
                                                    <option value="Leave">
                                                        Leave
                                                    </option>
                                                </select>
                                            </td>

                                            <td>
                                                <div className="staff-time-input">
                                                    <Clock size={15} />
                                                    <input
                                                        type="time"
                                                        value={draft.checkInTime}
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                person.id,
                                                                "checkInTime",
                                                                event.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>

                                            <td>
                                                <div className="staff-time-input">
                                                    <Clock size={15} />
                                                    <input
                                                        type="time"
                                                        value={draft.checkOutTime}
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                person.id,
                                                                "checkOutTime",
                                                                event.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>

                                            <td>
                                                <input
                                                    className="staff-notes-input"
                                                    type="text"
                                                    placeholder="Add note..."
                                                    value={draft.notes}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            person.id,
                                                            "notes",
                                                            event.target.value
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <button
                                                    className="staff-save-button"
                                                    onClick={() =>
                                                        saveAttendance(person)
                                                    }
                                                    disabled={
                                                        savingId === person.id
                                                    }
                                                >
                                                    <Save size={16} />
                                                    {savingId === person.id
                                                        ? "Saving..."
                                                        : "Save"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="staff-attendance-footer">
                    <span>
                        Showing {visibleStaff.length} of {staff.length} staff
                        members
                    </span>
                    <span>
                        <Clock size={15} />
                        Daily attendance · {selectedDate}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default StaffAttendance;