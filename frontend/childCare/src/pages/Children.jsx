import { useEffect, useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Plus
} from 'lucide-react'
import {Link} from 'react-router-dom'

function Children() {
  const [children, setChildren] = useState([])
  const [parentChildren, setParentChildren] = useState([])
  const [editingChild, setEditingChild] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All records')
  const [currentPage, setCurrentPage] = useState(1)

  const childrenPerPage = 5

  const [newChild, setNewChild] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: ''
  })

  // Get children
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5165/api/Children')
      .then(response => response.json()),
      fetch('http://localhost:5165/api/ParentChildren')
      .then(response => response.json())
    ])
    .then(([childrenData, relationshipsData]) => {
      setChildren(childrenData)
      setParentChildren(relationshipsData)
    })
    .catch(error => {
      setError(error.message)
    })
    .finally(() => {
      setLoading(false)
    })
}, [])

  // Search + filter
  const filteredChildren = children.filter(child => {
    const fullName =
      `${child.firstName} ${child.lastName}`.toLowerCase()

    const matchesSearch = fullName.includes(search.toLowerCase())

    const matchesFilter =
      filter === 'All records' ||
      child.gender === filter

    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(
    filteredChildren.length / childrenPerPage
  )

  const startIndex =
    (currentPage - 1) * childrenPerPage

  const currentChildren = filteredChildren.slice(
    startIndex,
    startIndex + childrenPerPage
  )

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter])

  // Format date
  const formatDate = (date) => {
    if (!date) return '—'

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get initials
  const getInitials = (child) => {
    return `${child.firstName?.[0] || ''}${child.lastName?.[0] || ''}`
      .toUpperCase()
  }

  // Add child
  const handleAdd = async () => {
    try {
      const response = await fetch(
        'http://localhost:5165/api/Children',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newChild)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add child')
      }

      const addedChild = await response.json()

      setChildren([...children, addedChild])

      setNewChild({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: ''
      })

      setShowAddForm(false)

    } catch (error) {
      setError(error.message)
    }
  }

  // Edit child
  const handleEdit = (child) => {
    setEditingChild(child)
  }

  // Save child
  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5165/api/Children/${editingChild.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingChild.id,
            firstName: editingChild.firstName,
            lastName: editingChild.lastName,
            dateOfBirth: editingChild.dateOfBirth,
            gender: editingChild.gender
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update child')
      }

      setChildren(
        children.map(child =>
          child.id === editingChild.id
            ? editingChild
            : child
        )
      )

      setEditingChild(null)

    } catch (error) {
      setError(error.message)
    }
  }

  // Delete child
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this child?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5165/api/Children/${id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete child data')
      }

      setChildren(
        children.filter(child => child.id !== id)
      )

    } catch (error) {
      setError(error.message)
    }
  }

  if (loading) {
    return <p>Loading children...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="children-page">
      <div className="registration-header">

        <div>
          <h1>Children</h1>

          <p>
            Manage enrolled children
          </p>
        </div>

      </div>
      
      {/* TOP BAR */}
      <div className="children-toolbar">

        <div className="children-filters">

          {/* Search */}
          <div className="search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search children by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="filter-box">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All records</option>
              <option>Female</option>
              <option>Male</option>
            </select>

            <ChevronDown size={17} />
          </div>

        </div>

        {/* Register button */}
        <Link to="/registration" style={{textDecoration: "none"}}>
        <button
          className="register-child-button"
          
          >
          <Plus size={20} />

          Register child
        </button>
          </Link>

      </div>


      {/* ADD FORM */}
      {showAddForm && (
        <div className="edit-form">

          <h2>Add Child</h2>

          <input
            type="text"
            value={newChild.firstName}
            onChange={(e) =>
              setNewChild({
                ...newChild,
                firstName: e.target.value
              })
            }
            placeholder="First Name"
          />

          <input
            type="text"
            value={newChild.lastName}
            onChange={(e) =>
              setNewChild({
                ...newChild,
                lastName: e.target.value
              })
            }
            placeholder="Last Name"
          />

          <select
            value={newChild.gender}
            onChange={(e) =>
              setNewChild({
                ...newChild,
                gender: e.target.value
              })
            }
          >
            <option value="">Select Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>

          <input
            type="date"
            value={newChild.dateOfBirth}
            onChange={(e) =>
              setNewChild({
                ...newChild,
                dateOfBirth: e.target.value
              })
            }
          />

          <button
            className="save-button"
            onClick={handleAdd}
          >
            Add Child
          </button>

          <button
            className="cancel-button"
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </button>

        </div>
      )}


      {/* EDIT FORM */}
      {editingChild && (
        <div className="edit-form">

          <h2>Edit Child</h2>

          <input
            type="text"
            value={editingChild.firstName}
            onChange={(e) =>
              setEditingChild({
                ...editingChild,
                firstName: e.target.value
              })
            }
            placeholder="First Name"
          />

          <input
            type="text"
            value={editingChild.lastName}
            onChange={(e) =>
              setEditingChild({
                ...editingChild,
                lastName: e.target.value
              })
            }
            placeholder="Last Name"
          />

          <select
            value={editingChild.gender}
            onChange={(e) =>
              setEditingChild({
                ...editingChild,
                gender: e.target.value
              })
            }
          >
            <option value="">Select Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>

          <input
            type="date"
            value={editingChild.dateOfBirth}
            onChange={(e) =>
              setEditingChild({
                ...editingChild,
                dateOfBirth: e.target.value
              })
            }
          />

          <button
            className="save-button"
            onClick={handleSave}
          >
            Save
          </button>

          <button
            className="cancel-button"
            onClick={() => setEditingChild(null)}
          >
            Cancel
          </button>

        </div>
      )}


      {/* TABLE CARD */}
      <div className="children-table-card">

        {/* TABLE HEADER */}
        <div className="table-title">

          <div>
            <h2>All children</h2>

            <span>
              {filteredChildren.length} children
            </span>
          </div>

        </div>


        {/* TABLE */}
        <div className="table-wrapper">

          <table className="children-table">

            <thead>
              <tr>
                <th>NAME</th>
                <th>AGE</th>
                <th>DATE OF BIRTH</th>
                <th>GENDER</th>
                <th>PARENT / GUARDIAN</th>
                <th>REGISTERED DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {currentChildren.map(child => (

                <tr key={child.id}>

                  {/* NAME */}
                  <td>
                    <div className="child-name">

                      <div className="child-avatar">
                        {getInitials(child)}
                      </div>

                      <strong>
                        {child.firstName} {child.lastName}
                      </strong>

                    </div>
                  </td>

                  {/* AGE */}
                  <td>
                    {child.age} years
                  </td>

                  {/* DATE */}
                  <td>
                    {formatDate(child.dateOfBirth)}
                  </td>

                  {/* GENDER */}
                  <td>
                    <span
                      className={
                        child.gender === 'Female'
                          ? 'gender-badge female'
                          : 'gender-badge male'
                      }
                    >
                      {child.gender}
                    </span>
                  </td>

                  {/* PARENT */}
                  <td>
                    {parentChildren
                      .filter(pc => pc.childId === child.id)
                      .map(pc =>
                        `${pc.parent.firstName} ${pc.parent.lastName}`
                      )
                      .join(', ') || '—'
                    }
                  </td>
                    {/*REGISTRATION DATE*/}
                    <td>{child.createdDate}</td>
                  {/* ACTIONS */}
                  <td>

                    <div className="table-actions">

                      <button
                        className="icon-button"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        className="icon-button"
                        title="Edit"
                        onClick={() => handleEdit(child)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        className="icon-button delete"
                        title="Delete"
                        onClick={() => handleDelete(child.id)}
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}
        <div className="table-footer">

          <span>
            Showing {filteredChildren.length === 0 ? 0 : startIndex + 1}
            –
            {Math.min(
              startIndex + childrenPerPage,
              filteredChildren.length
            )}
            {' '}of {filteredChildren.length}
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
            ).map(page => (

              <button
                key={page}
                className={
                  currentPage === page
                    ? 'active'
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

    </div>
  )
}

export default Children