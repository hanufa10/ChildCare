import { useEffect, useState } from 'react'
import { data } from 'react-router-dom'

function Staff() {
  const [staffs, setStaff] = useState([])
  const [editingStaff, setEditingStaff] = useState(null)
  const [showAddForm, setShowAddForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender:'',
    position:'',
    hireDate:''
  }) 

  useEffect(() => {
    fetch('http://localhost:5165/api/Staff')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch staff')
        }

        return response.json()
      })
      .then(data => {
        setStaff(data)
      })
      .catch(error => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p>Loading staffs...</p>
  }

  if (error) {
    return <p>{error}</p>
  }
  const handleAdd = async () => {
    try {
        const response = await fetch(
        'http://localhost:5165/api/Staff',
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(newStaff)
        }
        )

        if (!response.ok) {
        throw new Error('Failed to add staff')
        }

        const addedStaff = await response.json()

        setStaff([...staffs, addedStaff])

        setNewStaff({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender:'',
        position:'',
        hireDate:''
        })

        setShowAddForm(false)
    } catch (error) {
        setError(error.message)
    }
    }
  const handleSave = async () => {
  try {
    const response = await fetch(
      `http://localhost:5165/api/Staff/${editingStaff.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingStaff.id,
          firstName: editingStaff.firstName,
          lastName: editingStaff.lastName,
          email: editingStaff.email,
          phoneNumber: editingStaff.phoneNumber,
          gender:editingStaff.gender,
          position:editingStaff.position,
          hireDate:editingStaff.hireDate
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update staff')
    }

    setStaff(
      staffs.map(staff =>
        staff.id === editingStaff.id
          ? editingStaff
          : staff
      )
    )

    setEditingStaff(null)
  } catch (error) {
    setError(error.message)
  }
}
  const handleEdit = (staff) => {
    setEditingStaff(staff)
  }
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
        'Are you sure you want to delete this staff?'
    )

    if (!confirmed) {
        return
    }

    try {
        const response = await fetch(
        `http://localhost:5165/api/Staff/${id}`,
        {
            method: 'DELETE'
        }
        )

        if (!response.ok) {
        throw new Error('Failed to delete staff data')
        }

        setStaff(staffs.filter(staff => staff.id !== id))
    } catch (error) {
        setError(error.message)
    }
    }
  return (
    <div className="staff-page">
      <div className="page-header">
        <div>
          <h1>Staffs</h1>
          <p>Manage registered staffs</p>
        </div>

        <button 
            className="add-button"   
            onClick={() => setShowAddForm(true)}
        >
          + Add Staff
        </button>
      </div>
      {showAddForm && (
        <div className="edit-form">
            <h2>Add Staff</h2>

            <input
            type="text"
            value={newStaff.firstName}
            onChange={(e) =>
                setNewStaff({
                ...newStaff,
                firstName: e.target.value
                })
            }
            placeholder="First Name"
            />

            <input
            type="text"
            value={newStaff.lastName}
            onChange={(e) =>
                setNewStaff({
                ...newStaff,
                lastName: e.target.value
                })
            }
            placeholder="Last Name"
            />

            <select
            value={newStaff.gender}
            onChange={(e) =>
                setNewStaff({
                ...newStaff,
                gender: e.target.value
                })
            }
            >
            <option value="">Select Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            </select>

            <input
            type="email"
            value={newStaff.email}
            onChange={(e) =>
                setNewStaff({
                ...newStaff,
                email: e.target.value
                })
            }
            placeholder='Email'
            />
            <input
            type="tel"
            value={newStaff.phoneNumber}
            onChange={(e) =>
                setNewStaff({
                ...newStaff,
                phoneNumber: e.target.value
                })
            }
            placeholder='Phone Number'
            />
            <input
            type="text"
            value={newStaff.position}
            onChange={(e) =>
                setNewStaff({
                ...newStaff,
                position: e.target.value
                })
            }
            placeholder='Position'
            />
            <input
            type="date"
            value={newStaff.hireDate}
            onChange={(e) =>
                setNewStaff({
                ...newStaff,
                hireDate: e.target.value
                })
            }
            />

            <button
            className="save-button"
            onClick={handleAdd}
            >
            Add Staff
            </button>

            <button
            className="cancel-button"
            onClick={() => setShowAddForm(false)}
            >
            Cancel
            </button>
        </div>
        )}
        {editingStaff && (
        <div className="edit-form">
            <h2>Edit Staff</h2>

            <input
            type="text"
            value={editingStaff.firstName}
            onChange={(e) =>
                setEditingStaff({
                ...editingStaff,
                firstName: e.target.value
                })
            }
            placeholder="First Name"
            />

            <input
            type="text"
            value={editingStaff.lastName}
            onChange={(e) =>
                setEditingStaff({
                ...editingStaff,
                lastName: e.target.value
                })
            }
            placeholder="Last Name"
            />
            <select
            value={editingStaff.gender}
            onChange={(e) =>
                setEditingStaff({
                ...editingStaff,
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
            value={editingStaff.hireDate}
            onChange={(e) =>
                setEditingStaff({
                ...editingStaff,
                hireDate: e.target.value
                })
            }
            />

            <input
            type="email"
            value={editingStaff.email}
            onChange={(e) =>
                setEditingStaff({
                ...editingStaff,
                email: e.target.value
                })
            }
            placeholder='Email'
            />
            <input
            type="tel"
            value={editingStaff.phoneNumber}
            onChange={(e) =>
                setEditingStaff({
                ...editingStaff,
                phoneNumber: e.target.value
                })
            }
            placeholder='Phone Number'
            />
            <input
            type="text"
            value={editingStaff.position}
            onChange={(e) =>
                setEditingStaff({
                ...editingStaff,
                position: e.target.value
                })
            }
            placeholder='Position'
            />
            <button className="save-button" onClick={handleSave}>
            Save
            </button>

            <button
            className="cancel-button"
            onClick={() => setEditingStaff(null)}
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
              <th>Email</th>
              <th>Phone Number</th>
              <th>Position</th>
              <th>Gender</th>
              <th>Hire Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {staffs.map(staff => (
              <tr key={staff.id}>
                <td>{staff.id}</td>
                <td>{staff.firstName}</td>
                <td>{staff.lastName}</td>
                <td>{staff.email}</td>
                <td>{staff.phoneNumber}</td>
                <td>{staff.position}</td>
                <td>{staff.gender}</td>
                <td>{staff.hireDate}</td>
                <td className="actions">
                  <button className="edit-button" onClick={() => handleEdit(staff)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(staff.id)}>
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

export default Staff