
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'

import DeleteConfirmModal from '../components/DeleteConfirmModal'

const API_URL = 'http://localhost:5165/api'

const AVATAR_COLORS = [
  'avatar-peach',
  'avatar-blue',
  'avatar-purple',
  'avatar-green',
  'avatar-pink',
]

const EMPTY_PARENT = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
}

function Parents() {
  const navigate = useNavigate()

  const [parents, setParents] = useState([])
  const [parentChildren, setParentChildren] = useState([])
  const [editingParent, setEditingParent] = useState(null)
  const [selectedParent, setSelectedParent] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const parentsPerPage = 5

  // Fetch parents and parent-child relationships.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parentsResponse, relationshipsResponse] =
          await Promise.all([
            fetch(`${API_URL}/Parent`),
            fetch(`${API_URL}/ParentChildren`),
          ])

        if (!parentsResponse.ok) {
          throw new Error('Failed to fetch parents.')
        }

        if (!relationshipsResponse.ok) {
          throw new Error('Failed to fetch parent-child information.')
        }

        const [parentsData, relationshipsData] = await Promise.all([
          parentsResponse.json(),
          relationshipsResponse.json(),
        ])

        setParents(parentsData)
        setParentChildren(relationshipsData)
      } catch (err) {
        setError(err.message || 'An unexpected error occurred.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Return the number of children linked to a parent.
  const getChildCount = (parentId) =>
    parentChildren.filter(
      (relationship) => relationship.parentId === parentId
    ).length

  // Return the children linked to a parent.
  const getChildrenForParent = (parentId) =>
    parentChildren
      .filter((relationship) => relationship.parentId === parentId)
      .map((relationship) => relationship.child)
      .filter(Boolean)

  // Filter parents by search term and child relationship.
  const filteredParents = parents.filter((parent) => {
    const search = searchTerm.trim().toLowerCase()

    const fullName =
      `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.toLowerCase()

    const phoneNumber = String(parent.phoneNumber ?? '').toLowerCase()
    const email = String(parent.email ?? '').toLowerCase()

    const matchesSearch =
      fullName.includes(search) ||
      phoneNumber.includes(search) ||
      email.includes(search)

    const childCount = getChildCount(parent.id)

    const matchesFilter =
      filter === 'withChildren'
        ? childCount > 0
        : filter === 'withoutChildren'
          ? childCount === 0
          : true

    return matchesSearch && matchesFilter
  })

  // Keep the current page within the available range.
  const totalPages = Math.ceil(filteredParents.length / parentsPerPage)
  const safePage = Math.min(currentPage, Math.max(totalPages, 1))
  const startIndex = (safePage - 1) * parentsPerPage

  const currentParents = filteredParents.slice(
    startIndex,
    startIndex + parentsPerPage
  )

  // Edit parent.
  const handleEdit = (parent) => {
    setEditingParent({ ...parent })
  }

  // Save parent changes.
  const handleSave = async () => {
    if (!editingParent) return

    try {
      setError('')

      const response = await fetch(
        `${API_URL}/Parent/${editingParent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingParent.id,
            firstName: editingParent.firstName,
            lastName: editingParent.lastName,
            phoneNumber: editingParent.phoneNumber,
            email: editingParent.email,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update parent.')
      }

      setParents((previousParents) =>
        previousParents.map((parent) =>
          parent.id === editingParent.id ? editingParent : parent
        )
      )

      if (selectedParent?.id === editingParent.id) {
        setSelectedParent(editingParent)
      }

      setEditingParent(null)
    } catch (err) {
      setError(err.message || 'Failed to update parent.')
    }
  }

  // Delete parent.
  const handleDelete = async () => {
    if (deleteId === null) return

    try {
      setError('')

      const response = await fetch(
        `${API_URL}/Parent/${deleteId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to delete parent. They may still be linked to children.'
        )
      }

      setParents((previousParents) =>
        previousParents.filter((parent) => parent.id !== deleteId)
      )

      setParentChildren((previousRelationships) =>
        previousRelationships.filter(
          (relationship) => relationship.parentId !== deleteId
        )
      )

      if (selectedParent?.id === deleteId) {
        setSelectedParent(null)
      }

      setDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete parent.')
      setDeleteId(null)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilter = (value) => {
    setFilter(value)
    setCurrentPage(1)
  }

  const getInitials = (parent) =>
    `${parent.firstName?.charAt(0) ?? ''}${parent.lastName?.charAt(0) ?? ''}`

  const getAvatarColor = (index) =>
    AVATAR_COLORS[index % AVATAR_COLORS.length]

  if (loading) {
    return (
      <div className="parents-page">
        <div className="loading-state">Loading parents...</div>
      </div>
    )
  }

  if (error && parents.length === 0) {
    return (
      <div className="parents-page">
        <div className="error-state">{error}</div>
      </div>
    )
  }

  return (
    <div className="parents-page">
      <div className="registration-header">
        <div>
          <h1>Parents &amp; guardians</h1>
          <p>Manage family contacts and linked children.</p>
        </div>
      </div>

      {error && (
        <div className="error-state" role="alert">
          {error}
          <button onClick={() => setError('')} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search, filter, and add parent */}
      <div className="parents-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search parents by name, phone or email..."
              value={searchTerm}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </div>

          <div className="filter-box">
            <select
              value={filter}
              onChange={(event) => handleFilter(event.target.value)}
            >
              <option value="all">All records</option>
              <option value="withChildren">With children</option>
              <option value="withoutChildren">Without children</option>
            </select>
            <ChevronDown size={17} />
          </div>
        </div>

        <button
          className="add-parent-button"
          onClick={() => navigate('/dashboard/admin-users')}
        >
          <Plus size={20} />
          Add parent
        </button>
      </div>

      {/* Parents table */}
      <div className="parents-card">
        <div className="parents-card-header">
          <div className="parents-title">
            <h2>All parents</h2>
            <span className="contact-count">
              {parents.length} contacts
            </span>
          </div>
        </div>

        <div className="parents-table-wrapper">
          <table className="parents-table">
            <thead>
              <tr>
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
                  <td colSpan={5} className="empty-state">
                    No parents found
                  </td>
                </tr>
              ) : (
                currentParents.map((parent, index) => {
                  const childCount = getChildCount(parent.id)

                  return (
                    <tr key={parent.id}>
                      <td>
                        <div className="parent-name">
                          <div
                            className={`parent-avatar ${getAvatarColor(index)}`}
                          >
                            {getInitials(parent)}
                          </div>
                          <span>
                            {parent.firstName} {parent.lastName}
                          </span>
                        </div>
                      </td>

                      <td className="contact-text">
                        {parent.phoneNumber || '—'}
                      </td>

                      <td className="contact-text">
                        {parent.email || '—'}
                      </td>

                      <td>
                        <button
                          className={`children-badge ${getAvatarColor(index)}`}
                          onClick={() => setSelectedParent(parent)}
                        >
                          {childCount}{' '}
                          {childCount === 1 ? 'child' : 'children'}
                          <ChevronRight size={16} />
                        </button>
                      </td>

                      <td>
                        <div className="parent-actions">
                          <button
                            className="icon-action"
                            title="View parent"
                            aria-label={`View ${parent.firstName} ${parent.lastName}`}
                            onClick={() => setSelectedParent(parent)}
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            className="icon-action"
                            title="Edit parent"
                            aria-label={`Edit ${parent.firstName} ${parent.lastName}`}
                            onClick={() => handleEdit(parent)}
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            className="icon-action delete-action"
                            title="Delete parent"
                            aria-label={`Delete ${parent.firstName} ${parent.lastName}`}
                            onClick={() => setDeleteId(parent.id)}
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

        {/* Pagination */}
        <div className="parents-card-footer">
          <span>
            Showing{' '}
            {filteredParents.length === 0 ? 0 : startIndex + 1}
            –
            {Math.min(startIndex + parentsPerPage, filteredParents.length)}{' '}
            of {filteredParents.length}
          </span>

          <div className="pagination">
            <button
              disabled={safePage === 1 || totalPages === 0}
              onClick={() => setCurrentPage(safePage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(0, 4)
              .map((page) => (
                <button
                  key={page}
                  className={safePage === page ? 'active-page' : ''}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

            <button
              disabled={safePage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage(safePage + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit parent modal */}
      {editingParent && (
        <div className="modal-overlay">
          <div className="parent-modal">
            <div className="modal-header">
              <div>
                <h2>Edit parent</h2>
                <p>Update parent information</p>
              </div>

              <button
                onClick={() => setEditingParent(null)}
                aria-label="Close edit modal"
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
                    value={editingParent.firstName ?? ''}
                    onChange={(event) =>
                      setEditingParent({
                        ...editingParent,
                        firstName: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Last name</label>
                  <input
                    type="text"
                    value={editingParent.lastName ?? ''}
                    onChange={(event) =>
                      setEditingParent({
                        ...editingParent,
                        lastName: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Phone number</label>
                <input
                  type="tel"
                  value={editingParent.phoneNumber ?? ''}
                  onChange={(event) =>
                    setEditingParent({
                      ...editingParent,
                      phoneNumber: event.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={editingParent.email ?? ''}
                  onChange={(event) =>
                    setEditingParent({
                      ...editingParent,
                      email: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setEditingParent(null)}
              >
                Cancel
              </button>

              <button className="modal-save" onClick={handleSave}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View parent modal */}
      {selectedParent && (
        <div className="modal-overlay">
          <div className="parent-modal view-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {selectedParent.firstName} {selectedParent.lastName}
                </h2>
                <p>Parent information</p>
              </div>

              <button
                onClick={() => setSelectedParent(null)}
                aria-label="Close parent details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="parent-details">
              <div className="detail-item">
                <span>Phone</span>
                <strong>{selectedParent.phoneNumber || '—'}</strong>
              </div>

              <div className="detail-item">
                <span>Email</span>
                <strong>{selectedParent.email || '—'}</strong>
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
                    getChildrenForParent(selectedParent.id).map((child) => (
                      <div className="child-item" key={child.id}>
                        <div className="child-avatar">
                          {child.firstName?.charAt(0) || '?'}
                        </div>

                        <div className="child-info">
                          <strong>
                            {child.firstName} {child.lastName}
                          </strong>
                          <span>
                            {child.gender || 'Gender not specified'}
                            {child.age != null ? ` · Age ${child.age}` : ''}
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
                onClick={() => setSelectedParent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <DeleteConfirmModal
        show={deleteId !== null}
        title="Delete parent?"
        message="Are you sure you want to delete this parent? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

export default Parents
