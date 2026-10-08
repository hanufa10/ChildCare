import { useEffect, useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X
} from 'lucide-react'

function Parents() {
  const [parents, setParents] = useState([])
  const [parentChildren, setParentChildren] = useState([])

  const [editingParent, setEditingParent] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedParent, setSelectedParent] = useState(null)

  const parentsPerPage = 5

  const [newParent, setNewParent] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: ''
  })

  // Fetch parents and parent-child relationships
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5165/api/Parent'),
      fetch('http://localhost:5165/api/ParentChildren')
    ])
      .then(async ([parentsResponse, parentChildrenResponse]) => {
        if (!parentsResponse.ok) {
          throw new Error('Failed to fetch parents')
        }

        if (!parentChildrenResponse.ok) {
          throw new Error('Failed to fetch parent information')
        }

        const parentsData = await parentsResponse.json()
        const parentChildrenData = await parentChildrenResponse.json()

        setParents(parentsData)
        setParentChildren(parentChildrenData)
      })
      .catch(error => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Get number of children for a parent
  const getChildCount = (parentId) => {
    return parentChildren.filter(
      pc => pc.parentId === parentId
    ).length
  }
  const getChildrenForParent = (parentId) => {
    return parentChildren
        .filter(pc => pc.parentId === parentId)
        .map(pc => pc.child)
        .filter(child => child)
    }
  // Search and filter
  const filteredParents = parents.filter(parent => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      `${parent.firstName} ${parent.lastName}`
        .toLowerCase()
        .includes(search) ||
      parent.phoneNumber
        .toLowerCase()
        .includes(search) ||
      parent.email
        .toLowerCase()
        .includes(search)

    const childCount = getChildCount(parent.id)
    

    let matchesFilter = true

    if (filter === 'withChildren') {
      matchesFilter = childCount > 0
    }

    if (filter === 'withoutChildren') {
      matchesFilter = childCount === 0
    }

    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(
    filteredParents.length / parentsPerPage
  )

  const startIndex = (currentPage - 1) * parentsPerPage

  const currentParents = filteredParents.slice(
    startIndex,
    startIndex + parentsPerPage
  )

  // Add parent
  const handleAdd = async () => {
    try {
      const response = await fetch(
        'http://localhost:5165/api/Parent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newParent)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add parent')
      }

      const addedParent = await response.json()

      setParents([...parents, addedParent])

      setNewParent({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: ''
      })

      setShowAddForm(false)
    } catch (error) {
      setError(error.message)
    }
  }

  // Edit parent
  const handleEdit = (parent) => {
    setEditingParent({ ...parent })
  }

  // Save edited parent
  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5165/api/Parent/${editingParent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingParent.id,
            firstName: editingParent.firstName,
            lastName: editingParent.lastName,
            phoneNumber: editingParent.phoneNumber,
            email: editingParent.email
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update parent')
      }

      setParents(
        parents.map(parent =>
          parent.id === editingParent.id
            ? editingParent
            : parent
        )
      )

      setEditingParent(null)
    } catch (error) {
      setError(error.message)
    }
  }

  // Delete parent
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this parent?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5165/api/Parent/${id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete parent')
      }

      setParents(
        parents.filter(parent => parent.id !== id)
      )

      if (selectedParent?.id === id) {
        setSelectedParent(null)
      }
    } catch (error) {
      setError(error.message)
    }
  }

  // Search reset
  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Filter reset
  const handleFilter = (value) => {
    setFilter(value)
    setCurrentPage(1)
  }

  // Initials
  const getInitials = (parent) => {
    return `${parent.firstName?.charAt(0) || ''}${parent.lastName?.charAt(0) || ''}`
  }

  // Different pastel avatar colors
  const avatarColors = [
    'avatar-peach',
    'avatar-blue',
    'avatar-purple',
    'avatar-green',
    'avatar-pink'
  ]

  const getAvatarColor = (index) => {
    return avatarColors[index % avatarColors.length]
  }

  if (loading) {
    return (
      <div className="parents-page">
        <div className="loading-state">
          Loading parents...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="parents-page">
        <div className="error-state">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="parents-page">
        <div className="registration-header">

        <div>
          <h1>Parents & guardians</h1>

          <p>
            Manage family contacts and linked children.
          </p>
        </div>

      </div>
      {/* Top controls */}
      <div className="parents-toolbar">

        <div className="toolbar-left">

          <div className="search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search parents by name, phone or email..."
              value={searchTerm}
              onChange={(e) =>
                handleSearch(e.target.value)
              }
            />
          </div>

          <div className="filter-box">
            <select
              value={filter}
              onChange={(e) =>
                handleFilter(e.target.value)
              }
            >
              <option value="all">
                All records
              </option>

              <option value="withChildren">
                With children
              </option>

              <option value="withoutChildren">
                Without children
              </option>
            </select>

            <ChevronDown size={17} />
          </div>

        </div>

        <button
          className="add-parent-button"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={20} />
          Add parent
        </button>

      </div>

      {/* Main card */}
      <div className="parents-card">

        {/* Card header */}
        <div className="parents-card-header">

          <div className="parents-title">
            <h2>All parents</h2>

            <span className="contact-count">
              {parents.length} contacts
            </span>
          </div>

        </div>

        {/* Table */}
        <div className="parents-table-wrapper">

          <table className="parents-table">

            <thead>
              <tr>
                {/* <th>ID</th> */}
                <th>NAME</th>
                <th>PHONE</th>
                <th>EMAIL</th>
                <th>CHILDREN</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {currentParents.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="empty-state"
                  >
                    No parents found
                  </td>
                </tr>

              ) : (

                currentParents.map((parent, index) => {

                  const childCount =
                    getChildCount(parent.id)

                  return (
                    <tr key={parent.id}>

                      {/* ID */}
                      {/* <td>
                        <span className="id-badge">
                          {parent.id}
                        </span>
                      </td> */}

                      {/* Name */}
                      <td>

                        <div className="parent-name">

                          <div
                            className={`parent-avatar ${getAvatarColor(index)}`}
                          >
                            {getInitials(parent)}
                          </div>

                          <span>
                            {parent.firstName}{' '}
                            {parent.lastName}
                          </span>

                        </div>

                      </td>

                      {/* Phone */}
                      <td className="contact-text">
                        {parent.phoneNumber}
                      </td>

                      {/* Email */}
                      <td className="contact-text">
                        {parent.email}
                      </td>

                      {/* Children */}
                      <td>

                        <button
                          className={`children-badge ${getAvatarColor(index)}`}
                          onClick={() =>
                            setSelectedParent(parent)
                          }
                        >

                          {childCount}{' '}

                          {childCount === 1
                            ? 'child'
                            : 'children'}

                          <ChevronRight size={16} />

                        </button>

                      </td>

                      {/* Actions */}
                      <td>

                        <div className="parent-actions">

                          <button
                            className="icon-action"
                            title="View"
                            onClick={() =>
                              setSelectedParent(parent)
                            }
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            className="icon-action"
                            title="Edit"
                            onClick={() =>
                              handleEdit(parent)
                            }
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            className="icon-action delete-action"
                            title="Delete"
                            onClick={() =>
                              handleDelete(parent.id)
                            }
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                })

              )}

            </tbody>

          </table>

        </div>

        {/* Footer */}
        <div className="parents-card-footer">

          <span>
            Showing{' '}
            {filteredParents.length === 0
              ? 0
              : startIndex + 1}
            –
            {Math.min(
              startIndex + parentsPerPage,
              filteredParents.length
            )}{' '}
            of {filteredParents.length}
          </span>

          <div className="pagination">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(currentPage - 1)
              }
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(0, 4)
              .map(page => (
                <button
                  key={page}
                  className={
                    currentPage === page
                      ? 'active-page'
                      : ''
                  }
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>
              ))}

            <button
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage(currentPage + 1)
              }
            >
              <ChevronRight size={18} />
            </button>

          </div>

        </div>

      </div>

      {/* Add parent modal */}
      {showAddForm && (

        <div className="modal-overlay">

          <div className="parent-modal">

            <div className="modal-header">

              <div>
                <h2>Add parent</h2>
                <p>Add a new parent or guardian</p>
              </div>

              <button
                onClick={() =>
                  setShowAddForm(false)
                }
              >
                <X size={21} />
              </button>

            </div>

            <div className="modal-form">

              <div className="form-row">

                <div className="form-field">
                  <label>First name</label>

                  <input
                    type="text"
                    value={newParent.firstName}
                    onChange={(e) =>
                      setNewParent({
                        ...newParent,
                        firstName: e.target.value
                      })
                    }
                    placeholder="First name"
                  />
                </div>

                <div className="form-field">
                  <label>Last name</label>

                  <input
                    type="text"
                    value={newParent.lastName}
                    onChange={(e) =>
                      setNewParent({
                        ...newParent,
                        lastName: e.target.value
                      })
                    }
                    placeholder="Last name"
                  />
                </div>

              </div>

              <div className="form-field">
                <label>Phone number</label>

                <input
                  type="tel"
                  value={newParent.phoneNumber}
                  onChange={(e) =>
                    setNewParent({
                      ...newParent,
                      phoneNumber: e.target.value
                    })
                  }
                  placeholder="Phone number"
                />
              </div>

              <div className="form-field">
                <label>Email</label>

                <input
                  type="email"
                  value={newParent.email}
                  onChange={(e) =>
                    setNewParent({
                      ...newParent,
                      email: e.target.value
                    })
                  }
                  placeholder="Email address"
                />
              </div>

            </div>

            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={() =>
                  setShowAddForm(false)
                }
              >
                Cancel
              </button>

              <button
                className="modal-save"
                onClick={handleAdd}
              >
                Add parent
              </button>

            </div>

          </div>

        </div>

      )}

      {/* Edit modal */}
      {editingParent && (

        <div className="modal-overlay">

          <div className="parent-modal">

            <div className="modal-header">

              <div>
                <h2>Edit parent</h2>
                <p>Update parent information</p>
              </div>

              <button
                onClick={() =>
                  setEditingParent(null)
                }
              >
                <X size={21} />
              </button>

            </div>

            <div className="modal-form">

              <div className="form-row">

                <div className="form-field">
                  <label>First name</label>

                  <input
                    type="text"
                    value={editingParent.firstName}
                    onChange={(e) =>
                      setEditingParent({
                        ...editingParent,
                        firstName: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Last name</label>

                  <input
                    type="text"
                    value={editingParent.lastName}
                    onChange={(e) =>
                      setEditingParent({
                        ...editingParent,
                        lastName: e.target.value
                      })
                    }
                  />
                </div>

              </div>

              <div className="form-field">
                <label>Phone number</label>

                <input
                  type="tel"
                  value={editingParent.phoneNumber}
                  onChange={(e) =>
                    setEditingParent({
                      ...editingParent,
                      phoneNumber: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Email</label>

                <input
                  type="email"
                  value={editingParent.email}
                  onChange={(e) =>
                    setEditingParent({
                      ...editingParent,
                      email: e.target.value
                    })
                  }
                />
              </div>

            </div>

            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={() =>
                  setEditingParent(null)
                }
              >
                Cancel
              </button>

              <button
                className="modal-save"
                onClick={handleSave}
              >
                Save changes
              </button>

            </div>

          </div>

        </div>

      )}

      {/* View parent */}
      {selectedParent && (

        <div className="modal-overlay">

          <div className="parent-modal view-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {selectedParent.firstName}{' '}
                  {selectedParent.lastName}
                </h2>

                <p>Parent information</p>
              </div>

              <button
                onClick={() =>
                  setSelectedParent(null)
                }
              >
                <X size={21} />
              </button>

            </div>
<div className="parent-details">

  <div className="detail-item">
    <span>Phone</span>
    <strong>
      {selectedParent.phoneNumber}
    </strong>
  </div>

  <div className="detail-item">
    <span>Email</span>
    <strong>
      {selectedParent.email}
    </strong>
  </div>

  <div className="children-section">

    <div className="children-section-title">
      <span>Children</span>

      <span className="children-count">
        {getChildCount(selectedParent.id)}
      </span>
    </div>

    <div className="children-list">

      {getChildrenForParent(selectedParent.id).length === 0 ? (

        <p className="no-children">
          No children registered
        </p>

      ) : (

        getChildrenForParent(selectedParent.id).map(child => (

          <div
            className="child-item"
            key={child.id}
          >

            <div className="child-avatar">
              {child.firstName?.charAt(0)}
            </div>

            <div className="child-info">

              <strong>
                {child.firstName} {child.lastName}
              </strong>

              <span>
                {child.gender} · Age {child.age}
              </span>

            </div>

          </div>

        ))

      )}

    </div>

  </div>

</div>

            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={() =>
                  setSelectedParent(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default Parents