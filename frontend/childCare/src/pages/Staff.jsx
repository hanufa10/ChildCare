import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

function Staff() {
  const navigate = useNavigate();

  const [staffs, setStaff] = useState([]);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteId, setDeleteId] = useState(null);

  const staffPerPage = 5;

  // =========================
  // FETCH STAFF
  // =========================

  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch("http://localhost:5165/api/Staff");

        if (!response.ok) {
          throw new Error("Failed to fetch staff.");
        }

        const data = await response.json();
        setStaff(data);
      } catch (error) {
        setError(error.message || "An error occurred while loading staff.");
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, []);

  // =========================
  // NAVIGATE TO USER REGISTRATION
  // =========================

 const handleAddStaff = () => {
  navigate("/dashboard/admin-users");
};

  // =========================
  // EDIT STAFF
  // =========================

  const handleEdit = (staff) => {
    setEditingStaff({ ...staff });
  };

  const handleSave = async () => {
    if (!editingStaff) return;

    try {
      const response = await fetch(
        `http://localhost:5165/api/Staff/${editingStaff.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editingStaff,
            hireDate: editingStaff.hireDate
              ? editingStaff.hireDate.slice(0, 10)
              : null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update staff.");
      }

      setStaff((previousStaff) =>
        previousStaff.map((staff) =>
          staff.id === editingStaff.id ? { ...editingStaff } : staff,
        ),
      );

      setEditingStaff(null);
      setError("");
    } catch (error) {
      setError(error.message || "An error occurred while updating staff.");
    }
  };

  // =========================
  // DELETE STAFF
  // =========================

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5165/api/Staff/${deleteId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete staff.");
      }

      setStaff((previousStaff) =>
        previousStaff.filter((staff) => staff.id !== deleteId),
      );

      setDeleteId(null);
      setError("");
    } catch (error) {
      setError(error.message || "An error occurred while deleting staff.");
    }
  };

  // =========================
  // SEARCH & FILTER
  // =========================

  const filteredStaff = staffs.filter((staff) => {
    const search = searchTerm.toLowerCase();

    const fullName =
      `${staff.firstName || ""} ${staff.lastName || ""}`.toLowerCase();

    const position = (staff.position || "").toLowerCase();

    const matchesSearch =
      fullName.includes(search) || position.includes(search);

    let matchesFilter = true;

    if (filter === "female") {
      matchesFilter = staff.gender === "Female";
    }

    if (filter === "male") {
      matchesFilter = staff.gender === "Male";
    }

    return matchesSearch && matchesFilter;
  });

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(filteredStaff.length / staffPerPage);

  const startIndex = (currentPage - 1) * staffPerPage;

  const currentStaff = filteredStaff.slice(
    startIndex,
    startIndex + staffPerPage,
  );

  // =========================
  // HELPERS
  // =========================

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilter = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const getInitials = (staff) => {
    return `${staff.firstName?.charAt(0) || ""}${staff.lastName?.charAt(0) || ""}`;
  };

  const formatHireDate = (date) => {
    if (!date) return "-";

    const dateObject = new Date(date);

    if (Number.isNaN(dateObject.getTime())) return "-";

    return dateObject.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const avatarColors = [
    "avatar-pink",
    "avatar-green",
    "avatar-blue",
    "avatar-purple",
    "avatar-peach",
  ];

  const getAvatarColor = (index) => {
    return avatarColors[index % avatarColors.length];
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="staff-page">
        <div className="loading-state">Loading staff...</div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && staffs.length === 0) {
    return (
      <div className="staff-page">
        <div className="error-state">
          {error}
          <button type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // STAFF PAGE
  // =========================

  return (
    <div className="staff-page">
      {/* PAGE HEADER */}

      <div className="registration-header">
        <div>
          <h1>Staff</h1>
          <p>Your caring team, all in one place.</p>
        </div>
      </div>

      {/* TOOLBAR */}

      <div className="staff-toolbar">
        <div className="staff-toolbar-left">
          <div className="staff-search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search staff by name or position..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="staff-filter-box">
            <select
              value={filter}
              onChange={(e) => handleFilter(e.target.value)}
            >
              <option value="all">All records</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>

            <ChevronDown size={17} />
          </div>
        </div>

        {/* OPENS USER REGISTRATION PAGE */}

        <button
          type="button"
          className="add-staff-button"
          onClick={handleAddStaff}
        >
          <Plus size={20} />
          Add staff member
        </button>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="error-state">
          {error}
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN CARD */}

      <div className="staff-card">
        {/* CARD HEADER */}

        <div className="staff-card-header">
          <div className="staff-title">
            <h2>All team members</h2>

            <span className="staff-count">{staffs.length} active staff</span>
          </div>
        </div>

        {/* STAFF TABLE */}

        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>GENDER</th>
                <th>PHONE NUMBER</th>
                <th>POSITION</th>
                <th>HIRE DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {currentStaff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="staff-empty">
                    No staff members found
                  </td>
                </tr>
              ) : (
                currentStaff.map((staff, index) => (
                  <tr key={staff.id}>
                    {/* NAME */}

                    <td>
                      <div className="staff-name">
                        <div
                          className={`staff-avatar ${getAvatarColor(index)}`}
                        >
                          {getInitials(staff)}
                        </div>

                        <span>
                          {staff.firstName} {staff.lastName}
                        </span>
                      </div>
                    </td>

                    {/* GENDER */}

                    <td className="staff-gender">{staff.gender || "-"}</td>

                    {/* PHONE NUMBER */}

                    <td className="staff-phoneNumber">
                      {staff.phoneNumber || "-"}
                    </td>

                    {/* POSITION */}

                    <td>
                      <span className="position-badge">
                        {staff.position || "-"}
                      </span>
                    </td>

                    {/* HIRE DATE */}

                    <td className="hire-date">
                      {formatHireDate(staff.hireDate)}
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="staff-actions">
                        <button
                          type="button"
                          className="staff-icon-button"
                          title="View"
                          onClick={() => setSelectedStaff(staff)}
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          className="staff-icon-button"
                          title="Edit"
                          onClick={() => handleEdit(staff)}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          className="staff-icon-button staff-delete-button"
                          title="Delete"
                          onClick={() => setDeleteId(staff.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="staff-card-footer">
          <span>
            Showing {filteredStaff.length === 0 ? 0 : startIndex + 1}
            {"–"}
            {Math.min(startIndex + staffPerPage, filteredStaff.length)} of{" "}
            {filteredStaff.length}
          </span>

          <div className="staff-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(0, 4)
              .map((page) => (
                <button
                  type="button"
                  key={page}
                  className={currentPage === page ? "staff-active-page" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

            <button
              type="button"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((page) => page + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT STAFF MODAL */}

      {editingStaff && (
        <div className="staff-modal-overlay">
          <div className="staff-modal">
            <div className="staff-modal-header">
              <div>
                <h2>Edit staff member</h2>
                <p>Update staff information</p>
              </div>

              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                aria-label="Close edit form"
              >
                <X size={21} />
              </button>
            </div>

            <div className="staff-modal-form">
              <div className="staff-form-row">
                <div className="staff-form-field">
                  <label>First name</label>

                  <input
                    type="text"
                    value={editingStaff.firstName || ""}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="staff-form-field">
                  <label>Last name</label>

                  <input
                    type="text"
                    value={editingStaff.lastName || ""}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="staff-form-row">
                <div className="staff-form-field">
                  <label>Gender</label>

                  <select
                    value={editingStaff.gender || ""}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        gender: e.target.value,
                      })
                    }
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div className="staff-form-field">
                  <label>Phone number</label>

                  <input
                    type="tel"
                    value={editingStaff.phoneNumber || ""}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="staff-form-field">
                <label>Position</label>

                <input
                  type="text"
                  value={editingStaff.position || ""}
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      position: e.target.value,
                    })
                  }
                />
              </div>

              <div className="staff-form-field">
                <label>Hire date</label>

                <input
                  type="date"
                  value={
                    editingStaff.hireDate
                      ? editingStaff.hireDate.slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      hireDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="staff-modal-actions">
              <button
                type="button"
                className="staff-modal-cancel"
                onClick={() => setEditingStaff(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="staff-modal-save"
                onClick={handleSave}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW STAFF MODAL */}

      {selectedStaff && (
        <div className="staff-modal-overlay">
          <div className="staff-modal staff-view-modal">
            <div className="staff-modal-header">
              <div>
                <h2>
                  {selectedStaff.firstName} {selectedStaff.lastName}
                </h2>

                <p>Staff member information</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                aria-label="Close staff details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="staff-details">
              <div className="staff-detail-item">
                <span>Gender</span>
                <strong>{selectedStaff.gender || "-"}</strong>
              </div>

              <div className="staff-detail-item">
                <span>Phone number</span>
                <strong>{selectedStaff.phoneNumber || "-"}</strong>
              </div>

              <div className="staff-detail-item">
                <span>Email</span>
                <strong>{selectedStaff.email || "-"}</strong>
              </div>

              <div className="staff-detail-item">
                <span>Position</span>
                <strong>{selectedStaff.position || "-"}</strong>
              </div>

              <div className="staff-detail-item">
                <span>Hire date</span>
                <strong>{formatHireDate(selectedStaff.hireDate)}</strong>
              </div>
            </div>

            <div className="staff-modal-actions">
              <button
                type="button"
                className="staff-modal-cancel"
                onClick={() => setSelectedStaff(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}

      <DeleteConfirmModal
        show={deleteId !== null}
        title="Delete staff member?"
        message="Are you sure you want to delete this staff member? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default Staff;
