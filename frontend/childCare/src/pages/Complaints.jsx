
import { useCallback, useEffect, useState } from "react";
import "../components/styles/Complaints.css";

const API_URL = "http://localhost:5165/api/Complaints";

const emptyMessage = "No complaints found.";

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetch(API_URL);

      if (!result.ok) {
        throw new Error(
          `Could not load complaints (${result.status}).`
        );
      }

      const data = await result.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the complaints API. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const filteredComplaints = complaints.filter((complaint) => {
    const subject = complaint.subject || "";
    const description = complaint.description || "";

    const matchesSearch =
      `${subject} ${description}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const updateComplaint = async (complaint, changes) => {
    const payload = {
      id: complaint.id,
      subject: complaint.subject,
      description: complaint.description,
      submittedByUserId: complaint.submittedByUserId,
      status: changes.status ?? complaint.status,
      adminResponse:
        changes.adminResponse ?? complaint.adminResponse ?? null,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt ?? null,
    };

    const result = await fetch(`${API_URL}/${complaint.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      const message = await result.text();

      throw new Error(
        message ||
          `Could not update complaint (${result.status}).`
      );
    }

    return payload;
  };

  const updateStatus = async (id, status) => {
    const complaint = complaints.find((item) => item.id === id);

    if (!complaint) return;

    setError("");
    setSuccess("");

    try {
      await updateComplaint(complaint, { status });

      setComplaints((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );

      setSelectedComplaint((current) =>
        current?.id === id ? { ...current, status } : current
      );

      setSuccess("Complaint status updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update complaint.");
    }
  };

  const saveResponse = async (event) => {
    event.preventDefault();

    if (!selectedComplaint || !response.trim()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateComplaint(selectedComplaint, {
        status: selectedComplaint.status,
        adminResponse: response.trim(),
      });

      setComplaints((current) =>
        current.map((item) =>
          item.id === selectedComplaint.id
            ? {
                ...item,
                status: updated.status,
                adminResponse: response.trim(),
              }
            : item
        )
      );

      setSelectedComplaint(null);
      setResponse("");
      setSuccess("Your response has been saved successfully.");
    } catch (err) {
      setError(err.message || "Could not save the response.");
    } finally {
      setSaving(false);
    }
  };

  const openComplaint = (complaint) => {
    setSelectedComplaint({ ...complaint });
    setResponse(complaint.adminResponse || "");
    setError("");
    setSuccess("");
  };

  const closeComplaint = () => {
    setSelectedComplaint(null);
    setResponse("");
    setError("");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString();
  };

  const getStatusClass = (status) =>
    (status || "Pending").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="complaints-page">
      <div className="complaints-page-header">
        <div>
          <h1>Complaints</h1>
          <p>Review parent concerns and manage responses.</p>
        </div>
      </div>

      {error && (
        <div className="announcement-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="complaint-success" role="status">
          {success}
        </div>
      )}

      <div className="complaints-stats">
        <div className="complaint-stat-card">
          <span>Total Complaints</span>
          <h2>{complaints.length}</h2>
        </div>

        <div className="complaint-stat-card">
          <span>Pending</span>
          <h2>
            {complaints.filter((c) => c.status === "Pending").length}
          </h2>
        </div>

        <div className="complaint-stat-card">
          <span>In Progress</span>
          <h2>
            {complaints.filter((c) => c.status === "In Progress").length}
          </h2>
        </div>

        <div className="complaint-stat-card">
          <span>Resolved</span>
          <h2>
            {complaints.filter((c) => c.status === "Resolved").length}
          </h2>
        </div>
      </div>

      <div className="complaints-list-card">
        <div className="complaints-list-header">
          <div>
            <h2>All Complaints</h2>
            <p>Track and respond to submitted concerns.</p>
          </div>

          <div className="complaints-filters">
            <input
              type="search"
              placeholder="Search complaints..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search complaints"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by complaint status"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="complaints-table-wrapper">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="complaint-empty">
                    Loading complaints...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="5" className="complaint-empty">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>
                      <strong>{complaint.subject}</strong>
                      <p className="complaint-description">
                        {complaint.description}
                      </p>
                    </td>

                    <td>
                      {complaint.submittedByUserId
                        ? "Parent"
                        : "Unknown"}
                    </td>

                    <td>{formatDate(complaint.createdAt)}</td>

                    <td>
                      <span
                        className={`complaint-status ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="complaint-view-btn"
                        onClick={() => openComplaint(complaint)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedComplaint && (
        <div
          className="complaint-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeComplaint();
            }
          }}
        >
          <div
            className="complaint-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="complaint-modal-title"
          >
            <div className="complaint-modal-header">
              <h2 id="complaint-modal-title">Review Complaint</h2>

              <button
                type="button"
                className="complaint-close-btn"
                onClick={closeComplaint}
                aria-label="Close"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <h3>{selectedComplaint.subject}</h3>

            <p>{selectedComplaint.description}</p>

            <div className="complaint-modal-meta">
              <span>
                <strong>Submitted:</strong>{" "}
                {formatDate(selectedComplaint.createdAt)}
              </span>
            </div>

            <label htmlFor="complaint-status">Status</label>

            <select
              id="complaint-status"
              value={selectedComplaint.status}
              disabled={saving}
              onChange={(event) => {
                const status = event.target.value;

                setSelectedComplaint((current) => ({
                  ...current,
                  status,
                }));

                updateStatus(selectedComplaint.id, status);
              }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <form onSubmit={saveResponse}>
              <label htmlFor="complaint-response">
                Admin Response
              </label>

              <textarea
                id="complaint-response"
                rows="5"
                value={response}
                disabled={saving}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="Write a response to the parent..."
                required
              />

              <div className="complaint-modal-actions">
                <button
                  type="button"
                  className="complaint-cancel-btn"
                  onClick={closeComplaint}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="complaint-primary-btn"
                  type="submit"
                  disabled={saving || !response.trim()}
                >
                  {saving ? "Saving..." : "Save Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Complaints;
