import { useEffect, useState } from 'react'
import { data } from 'react-router-dom'

function Children() {
  const [children, setChildren] = useState([])
  const [editingChild, setEditingChild] = useState(null)
  const [showAddForm, setShowAddForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newChild, setNewChild] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: ''
  }) 

  useEffect(() => {
    fetch('http://localhost:5165/api/Children')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch children')
        }

        return response.json()
      })
      .then(data => {
        setChildren(data)
      })
      .catch(error => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p>Loading children...</p>
  }

  if (error) {
    return <p>{error}</p>
  }
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
  const handleEdit = (child) => {
    setEditingChild(child)
  }
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

        setChildren(children.filter(child => child.id !== id))
    } catch (error) {
        setError(error.message)
    }
    }
  return (
    <div className="children-page">
      <div className="page-header">
        <div>
          <h1>Children</h1>
          <p>Manage registered children</p>
        </div>

        <button 
            className="add-button"   
            onClick={() => setShowAddForm(true)}
        >
          + Add Child
        </button>
      </div>
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

            <button className="save-button" onClick={handleSave}>
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
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {children.map(child => (
              <tr key={child.id}>
                <td>{child.id}</td>
                <td>{child.firstName}</td>
                <td>{child.lastName}</td>
                <td>{child.gender}</td>
                <td>{child.dateOfBirth}</td>
                <td>{child.age}</td>
                <td className="actions">
                  <button className="edit-button" onClick={() => handleEdit(child)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(child.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Children