import { useEffect, useState} from 'react';
function Parents() {
    const [parents,setParents] = useState([])
    const [editingParent,setEditingParent] = useState(null)
    const [showAddForm, setShowAddForm] = useState(null)
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState('')
    const [newParent, setNewParent] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
    })

    useEffect(() => {
        fetch("http://localhost:5165/api/Parent")
        .then(response => {
            if(!response.ok){
                throw new Error('Failed to fetch parents');
            }
            return response.json();
        })
        .then(data =>{
            setParents(data)
        })
        .catch(error => {
            setError(error.message)
        })
        .finally(() => {
            setLoading(false)
        })
    }, [])
    if(loading){
        return <p>Loading Parents ...</p>
    }
    if(error){
       return <p>{error}</p>
    }
    const handleAdd = async () => {
        try {
            const response = await fetch('http://localhost:5165/api/Parent',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify(newParent)
                }
            )
            if(!response.ok){
                throw new Error("Failed to add parent");
            }
            const addedParent = await response.json()
            setParents([...Parents, addedParent])
            setNewParent({
                firstName:'',
                lastName:'',
                phoneNumber:'',
                email:''
            })
            setShowAddForm(false)
        }
        catch(error){
            setError(error.message)
        }
    }
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
  const handleEdit = (parent) => {
    setEditingParent(parent)
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
        `http://localhost:5165/api/Parent/${id}`,
        {
            method: 'DELETE'
        }
        )

        if (!response.ok) {
        throw new Error('Failed to delete parent data')
        }

        setParents(parents.filter(parent => parent.id !== id))
    } catch (error) {
        setError(error.message)
    }
    }
  return (
    <div className='parents-page'>
        <div className='page-header'>
            <div>
                <h1>Parents</h1>
                <p>Manage registered parents</p>
            </div>
            <button
                className='add-button'
                onClick={() => setShowAddForm(true)}
            >
                + Add Parent
            </button>
        </div>
        
        {showAddForm && (
            <div className='edit-form'>
                <h2>Add Parent</h2>
                    <input
                    type="text"
                    value={newParent.firstName}
                    onChange={(e) =>
                        setNewParent({
                        ...newParent,
                        firstName: e.target.value
                        })
                    }
                    placeholder="First Name"
                    />

                    <input
                    type="text"
                    value={newParent.lastName}
                    onChange={(e) =>
                        setNewParent({
                        ...newParent,
                        lastName: e.target.value
                        })
                    }
                    placeholder="Last Name"
                    />

                    <input
                    type='tel'
                    value={newParent.phoneNumber}
                    onChange={(e) =>
                        setNewParent({
                        ...newParent,
                        phoneNumber: e.target.value
                        })
                    }
                    placeholder='Phone Number'
                    />
                    
                    <input
                    type="email"
                    value={newParent.email}
                    onChange={(e) =>
                        setNewParent({
                        ...newParent,
                        email: e.target.value
                        })
                    }
                    />

                    <button
                    className="save-button"
                    onClick={handleAdd}
                    >
                    Add Parent
                    </button>

                    <button
                    className="cancel-button"
                    onClick={() => setShowAddForm(false)}
                    >
                    Cancel
                    </button>
            </div>
        )}
        {editingParent && (
        <div className="edit-form">
            <h2>Edit Parent</h2>

            <input
            type="text"
            value={editingParent.firstName}
            onChange={(e) =>
                setEditingParent({
                ...editingParent,
                firstName: e.target.value
                })
            }
            placeholder="First Name"
            />

            <input
            type="text"
            value={editingParent.lastName}
            onChange={(e) =>
                setEditingParent({
                ...editingParent,
                lastName: e.target.value
                })
            }
            placeholder="Last Name"
            />
            <input
            type='tel'
            value={editingParent.phoneNumber}
            onChange={(e) =>
                setEditingParent({
                ...editingParent,
                phoneNumber: e.target.value
                })
            }
            />
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

            <button className="save-button" onClick={handleSave}>
            Save
            </button>

            <button
            className="cancel-button"
            onClick={() => setEditingParent(null)}
            >
            Cancel
            </button>
        </div>
        )}
        <div className='table-container'>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {parents.map(parent => (
                    <tr key={parent.id}>
                        <td>{parent.id}</td>
                        <td>{parent.firstName}</td>
                        <td>{parent.lastName}</td>
                        <td>{parent.phoneNumber}</td>
                        <td>{parent.email}</td>
                        <td className='actions'>
                            <button className='edit-button'
                            onClick={() => handleEdit(parent)}>
                                Edit
                            </button>
                            <button className='delete-button'
                                onClick={() => handleDelete(parent.id)}>
                                Delete
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}
export default Parents;