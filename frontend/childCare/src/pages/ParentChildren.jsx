import { useEffect, useState } from 'react'

function ParentChildren() {
  const [parents, setParents] = useState([])
  const [children, setChildren] = useState([])
  const [parentChildren, setParentChildren] = useState([])

  const [newConnection, setNewConnection] = useState({
    parentId: '',
    childId: '',
    relation: 0
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get parents, children and existing connections
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5165/api/Parent'),
      fetch('http://localhost:5165/api/Children'),
      fetch('http://localhost:5165/api/ParentChildren')
    ])
      .then(async ([parentsResponse, childrenResponse, connectionsResponse]) => {

        if (
          !parentsResponse.ok ||
          !childrenResponse.ok ||
          !connectionsResponse.ok
        ) {
          throw new Error('Failed to fetch data')
        }

        const parentsData = await parentsResponse.json()
        const childrenData = await childrenResponse.json()
        const connectionsData = await connectionsResponse.json()

        setParents(parentsData)
        setChildren(childrenData)
        setParentChildren(connectionsData)
      })
      .catch(error => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Connect parent to child
  const handleConnect = async (e) => {
    e.preventDefault()

    if (!newConnection.parentId || !newConnection.childId) {
      setError('Please select a parent and a child')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:5165/api/ParentChildren',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            parentId: parseInt(newConnection.parentId),
            childId: parseInt(newConnection.childId),
            relation: parseInt(newConnection.relation)
          })
        }
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to connect parent and child')
      }

      const createdConnection = await response.json()

      setParentChildren([
        ...parentChildren,
        createdConnection
      ])

      setNewConnection({
        parentId: '',
        childId: '',
        relation: 0
      })

      setError('')

    } catch (error) {
      setError(error.message)
    }
  }

  // Delete connection
  const handleDelete = async (parentId, childId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5165/api/ParentChildren/${parentId}/${childId}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete connection')
      }

      setParentChildren(
        parentChildren.filter(connection =>
          !(
            connection.parentId === parentId &&
            connection.childId === childId
          )
        )
      )

    } catch (error) {
      setError(error.message)
    }
  }

  // Get parent name
  const getParentName = (parentId) => {
    const parent = parents.find(
      parent => parent.id === parentId
    )

    return parent
      ? `${parent.firstName} ${parent.lastName}`
      : 'Unknown Parent'
  }

  // Get child name
  const getChildName = (childId) => {
    const child = children.find(
      child => child.id === childId
    )

    return child
      ? `${child.firstName} ${child.lastName}`
      : 'Unknown Child'
  }

  // Convert relation enum number to text
  const getRelationName = (relation) => {
    return relation === 0 ? 'Parent' : 'Guardian'
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="parent-children-page">

      <div className="page-header">
        <div>
          <h1>Parent & Child</h1>
          <p>Connect parents with their children</p>
        </div>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* Connect Form */}

      <div className="edit-form">

        <h2>Connect Parent to Child</h2>

        <form onSubmit={handleConnect}>

          <div className="form-group">

            <label htmlFor="parent">
              Parent
            </label>

            <select
              id="parent"
              value={newConnection.parentId}
              onChange={(e) =>
                setNewConnection({
                  ...newConnection,
                  parentId: e.target.value
                })
              }
              required
            >

              <option value="">
                Select Parent
              </option>

              {parents.map(parent => (
                <option
                  key={parent.id}
                  value={parent.id}
                >
                  {parent.firstName} {parent.lastName}
                </option>
              ))}

            </select>

          </div>


          <div className="form-group">

            <label htmlFor="child">
              Child
            </label>

            <select
              id="child"
              value={newConnection.childId}
              onChange={(e) =>
                setNewConnection({
                  ...newConnection,
                  childId: e.target.value
                })
              }
              required
            >

              <option value="">
                Select Child
              </option>

              {children.map(child => (
                <option
                  key={child.id}
                  value={child.id}
                >
                  {child.firstName} {child.lastName}
                </option>
              ))}

            </select>

          </div>


          <div className="form-group">

            <label htmlFor="relation">
              Relationship
            </label>

            <select
              id="relation"
              value={newConnection.relation}
              onChange={(e) =>
                setNewConnection({
                  ...newConnection,
                  relation: e.target.value
                })
              }
            >

              <option value={0}>
                Parent
              </option>

              <option value={1}>
                Guardian
              </option>

            </select>

          </div>


          <button
            type="submit"
            className="save-button"
          >
            Connect
          </button>

        </form>

      </div>


      {/* Connections Table */}

      <div className="table-container">

        <h2>Parent-Child Relationships</h2>

        <table>

          <thead>

            <tr>
              <th>Parent</th>
              <th>Child</th>
              <th>Relationship</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {parentChildren.length === 0 ? (

              <tr>
                <td colSpan="4">
                  No parent-child relationships found.
                </td>
              </tr>

            ) : (

              parentChildren.map(connection => (

                <tr
                  key={`${connection.parentId}-${connection.childId}`}
                >

                  <td>
                    {getParentName(connection.parentId)}
                  </td>

                  <td>
                    {getChildName(connection.childId)}
                  </td>

                  <td>
                    {getRelationName(connection.relation)}
                  </td>

                  <td>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(
                          connection.parentId,
                          connection.childId
                        )
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default ParentChildren
