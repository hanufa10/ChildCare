
import { useState, useEffect, useCallback } from "react";
import "../components/styles/Announcements.css";

const API_URL = "http://localhost:5165/api/Announcements";

function getHeaders() {
  const token = localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [parents, setParents] = useState([]);
  const [selectedParentIds, setSelectedParentIds] = useState([]);
  const [parentSearch, setParentSearch] = useState("");
  const [loadingParents, setLoadingParents] = useState(false);

  const [editingAnnouncementId, setEditingAnnouncementId] =
    useState(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "Everyone",
    status: "Published",
  });

  // Load announcements
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "You are not authorized. Please log in again or check your Admin role."
            : "Could not load announcements."
        );
      }

      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Load parent accounts for selected-parent announcements
  const fetchParents = useCallback(async () => {
    setLoadingParents(true);

    try {
      const response = await fetch(
        `${API_URL}/available-parents`,
        { headers: getHeaders() }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "You are not authorized to view parent accounts."
            : "Could not load parents."
        );
      }

      const data = await response.json();
      setParents(data);
    } catch (err) {
      setError(err.message || "Could not load parents.");
    } finally {
      setLoadingParents(false);
    }
  }, []);

  useEffect(() => {
    if (form.audience === "SelectedParents") {
      fetchParents();
    } else {
      setSelectedParentIds([]);
      setParentSearch("");
    }
  }, [form.audience, fetchParents]);

  // Form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetAnnouncementForm = () => {
    setForm({
      title: "",
      message: "",
      audience: "Everyone",
      status: "Published",
    });

    setSelectedParentIds([]);
    setParentSearch("");
    setEditingAnnouncementId(null);
    setShowForm(false);
    setError("");
  };

  // Create or update an announcement
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.message.trim()) {
      setError("Please enter both a title and a message.");
      return;
    }

    const recipientUserIds =
      form.audience === "SelectedParents"
        ? selectedParentIds
        : [];

    if (
      form.audience === "SelectedParents" &&
      recipientUserIds.length === 0
    ) {
      setError("Please select at least one parent.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      audience: form.audience,
      isPublished: form.status === "Published",
      recipientUserIds,
    };

    const isEditing = editingAnnouncementId !== null;

    const url = isEditing
      ? `${API_URL}/${editingAnnouncementId}`
      : API_URL;

    const method = isEditing ? "PUT" : "POST";

    setSaving(true);

    try {
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
         console.error("Update announcement failed:", {
    status: response.status,
    statusText: response.statusText,
    response: message,
  });

        throw new Error(
          message ||
            `Could not ${isEditing ? "update" : "create"} the announcement.`
        );
      }

      resetAnnouncementForm();
      await fetchAnnouncements();
    } catch (err) {
      setError(
        err.message || "Could not connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  // View announcement details
  const handleView = (announcement) => {
    setViewingAnnouncement(announcement);
  };

  // Load announcement into the form for editing
  const handleEdit = (announcement) => {
  setEditingAnnouncementId(announcement.id);

  setForm({
    title: announcement.title || "",
    message: announcement.message || "",
    audience: announcement.audience || "Everyone",
    status: isPublished(announcement) ? "Published" : "Draft",
  });

  // Restore the parents who were originally selected.
  setSelectedParentIds(announcement.recipientUserIds || []);
  setParentSearch("");
  setError("");
  setViewingAnnouncement(null);
  setShowForm(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  // Delete announcement
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Could not delete the announcement."
        );
      }

      if (viewingAnnouncement?.id === id) {
        setViewingAnnouncement(null);
      }

      await fetchAnnouncements();
    } catch (err) {
      setError(
        err.message || "Could not connect to the server."
      );
    }
  };

  const isPublished = (announcement) =>
    announcement.isPublished ??
    announcement.status?.toLowerCase() === "published";

  const getDate = (announcement) => {
    const date = announcement.createdAt || announcement.date;

    if (!date) return "—";

    return String(date).slice(0, 10);
  };

  const filteredAnnouncements = announcements.filter((announcement) =>
    `${announcement.title} ${announcement.message} ${announcement.audience}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredParents = parents.filter((parent) =>
    `${parent.fullName || `${parent.firstName || ""} ${parent.lastName || ""}`} ${parent.phoneNumber || ""}`
      .toLowerCase()
      .includes(parentSearch.toLowerCase())
  );

  return (
    <div className="announcements-page">
      {/* Page header */}
      <div className="announcement-page-header">
        <div>
          <h1>Announcements</h1>
          <p>Share important updates with parents and staff.</p>
        </div>

        <button
          type="button"
          className="announcement-primary-btn"
          onClick={() => {
            if (showForm) {
              resetAnnouncementForm();
            } else {
              setEditingAnnouncementId(null);
              setForm({
                title: "",
                message: "",
                audience: "Everyone",
                status: "Published",
              });
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Cancel" : "+ Create Announcement"}
        </button>
      </div>

      {error && (
        <p role="alert" className="announcement-error">
          {error}
        </p>
      )}

      {/* Statistics */}
      <div className="announcement-stats">
        <div className="announcement-stat-card">
          <span>Total Announcements</span>
          <h2>{announcements.length}</h2>
        </div>

        <div className="announcement-stat-card">
          <span>Published</span>
          <h2>
            {announcements.filter(isPublished).length}
          </h2>
        </div>

        <div className="announcement-stat-card">
          <span>Everyone</span>
          <h2>
            {
              announcements.filter(
                (announcement) =>
                  announcement.audience === "Everyone"
              ).length
            }
          </h2>
        </div>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <form
          className="announcement-form"
          onSubmit={handleSubmit}
        >
          <h2>
            {editingAnnouncementId
              ? "Edit Announcement"
              : "Create Announcement"}
          </h2>

          <label htmlFor="announcement-title">Title</label>
          <input
            id="announcement-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter announcement title"
            required
          />

          <label htmlFor="announcement-message">Message</label>
          <textarea
            id="announcement-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your announcement..."
            rows="5"
            required
          />

          <label htmlFor="announcement-audience">
            Send to
          </label>
          <select
            id="announcement-audience"
            name="audience"
            value={form.audience}
            onChange={handleChange}
          >
            <option value="Everyone">Everyone</option>
            <option value="Staff">All Staff</option>
            <option value="Parents">All Parents</option>
            <option value="SelectedParents">
              Selected Parents
            </option>
          </select>

          {/* Parent selection */}
          {form.audience === "SelectedParents" && (
            <div className="parent-selector">
              <label htmlFor="parent-search">
                Select Parents
              </label>

              <input
                id="parent-search"
                type="search"
                value={parentSearch}
                onChange={(event) =>
                  setParentSearch(event.target.value)
                }
                placeholder="Search by name or phone number..."
              />

              {loadingParents ? (
                <p>Loading parents...</p>
              ) : (
                <div className="parent-selector-list">
                  {filteredParents.map((parent) => {
                    const fullName =
                      parent.fullName ||
                      `${parent.firstName || ""} ${parent.lastName || ""}`.trim();

                    return (
                      <label
                        className="parent-selector-item"
                        key={parent.id}
                      >
                        <input
                          type="checkbox"
                          checked={selectedParentIds.includes(
                            parent.id
                          )}
                          onChange={(event) => {
                            setSelectedParentIds((previous) =>
                              event.target.checked
                                ? previous.includes(parent.id)
                                  ? previous
                                  : [...previous, parent.id]
                                : previous.filter(
                                    (id) => id !== parent.id
                                  )
                            );
                          }}
                        />

                        <span className="parent-selector-details">
                          <strong>
                            {fullName || "Unnamed parent"}
                          </strong>
                          <small>
                            {parent.phoneNumber ||
                              "No phone number"}
                          </small>
                        </span>
                      </label>
                    );
                  })}

                  {parents.length === 0 && (
                    <p>No parent accounts found.</p>
                  )}

                  {parents.length > 0 &&
                    filteredParents.length === 0 && (
                      <p>No parents match your search.</p>
                    )}
                </div>
              )}

              <small>
                {selectedParentIds.length} parent(s) selected
              </small>

              {editingAnnouncementId && (
                <small>
                  When editing a selected-parent announcement,
                  choose the recipients again if you want to
                  update its recipient list.
                </small>
              )}
            </div>
          )}

          <label htmlFor="announcement-status">Status</label>
          <select
            id="announcement-status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Published">Publish now</option>
            <option value="Draft">Save as draft</option>
          </select>

          <div className="announcement-form-actions">
            <button
              type="submit"
              className="announcement-primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingAnnouncementId
                  ? "Update Announcement"
                  : "Save Announcement"}
            </button>

            <button
              type="button"
              className="announcement-edit-btn"
              disabled={saving}
              onClick={resetAnnouncementForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Announcements table */}
      <div className="announcement-list-card">
        <div className="announcement-list-header">
          <div>
            <h2>All Announcements</h2>
            <p>View and manage your announcements.</p>
          </div>

          <input
            className="announcement-search"
            type="search"
            placeholder="Search announcements..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="announcement-table-wrapper">
          <table className="announcement-table">
            <thead>
              <tr>
                <th>Announcement</th>
                <th>Audience</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="announcement-empty"
                  >
                    Loading announcements...
                  </td>
                </tr>
              ) : filteredAnnouncements.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="announcement-empty"
                  >
                    No announcements found.
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td>
                      <strong>{announcement.title}</strong>
                      <p className="announcement-message-preview">
                        {announcement.message}
                      </p>
                    </td>

                    <td>
                      <span className="announcement-audience">
                        {announcement.audience}
                      </span>
                    </td>

                    <td>{getDate(announcement)}</td>

                    <td>
                      <span
                        className={`announcement-status ${
                          isPublished(announcement)
                            ? "published"
                            : "draft"
                        }`}
                      >
                        {isPublished(announcement)
                          ? "Published"
                          : "Draft"}
                      </span>
                    </td>

                    <td>
                      <div className="announcement-actions">
                        <button
                          type="button"
                          className="announcement-view-btn"
                          onClick={() =>
                            handleView(announcement)
                          }
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="announcement-edit-btn"
                          onClick={() =>
                            handleEdit(announcement)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="announcement-delete-btn"
                          onClick={() =>
                            handleDelete(announcement.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View details modal */}
      {viewingAnnouncement && (
        <div
          className="announcement-modal-overlay"
          onClick={() => setViewingAnnouncement(null)}
        >
          <div
            className="announcement-view-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-view-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="announcement-modal-header">
              <h2 id="announcement-view-title">
                Announcement Details
              </h2>

              <button
                type="button"
                className="announcement-modal-close"
                aria-label="Close announcement details"
                onClick={() => setViewingAnnouncement(null)}
              >
                ×
              </button>
            </div>

            <div className="announcement-modal-content">
              <h3>{viewingAnnouncement.title}</h3>

              <p className="announcement-modal-message">
                {viewingAnnouncement.message}
              </p>

              <div className="announcement-modal-info">
                <p>
                  <strong>Audience:</strong>{" "}
                  {viewingAnnouncement.audience}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {getDate(viewingAnnouncement)}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {isPublished(viewingAnnouncement)
                    ? "Published"
                    : "Draft"}
                </p>
              </div>
            </div>

            <div className="announcement-modal-footer">
              <button
                type="button"
                className="announcement-edit-btn"
                onClick={() => handleEdit(viewingAnnouncement)}
              >
                Edit Announcement
              </button>

              <button
                type="button"
                className="announcement-primary-btn"
                onClick={() => setViewingAnnouncement(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcements;
