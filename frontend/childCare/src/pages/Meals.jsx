import { useEffect, useState } from 'react'

function Meals() {
  const [meals, setMeals] = useState([])
  const [editingMeal, setEditingMeal] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Get Monday of the current week
  const getMonday = () => {
    const today = new Date()
    const day = today.getDay()

    const monday = new Date(today)
    const difference = day === 0 ? -6 : 1 - day

    monday.setDate(today.getDate() + difference)

    return monday
  }

  const [monday, setMonday] = useState(getMonday())

  const [newMeal, setNewMeal] = useState({
    name: '',
    date: '',
    type: 0,
    description: ''
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get meals from API
  useEffect(() => {
    fetch('http://localhost:5165/api/Meal')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch meals')
        }

        return response.json()
      })
      .then(data => {
        setMeals(data)
      })
      .catch(error => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Get Saturday
  const saturday = new Date(monday)
  saturday.setDate(monday.getDate() + 5)

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  // Convert date to day name
  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long'
    })
  }

  // Create Monday-Saturday rows
  const weekDays = []

  for (let i = 0; i < 6; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)

    weekDays.push(date)
  }

  // Find meal for a particular date and type
  const getMeal = (date, type) => {
    const dateString = formatDate(date)

    const meal = meals.find(item => {
      const mealDate = item.date.slice(0, 10)

      return (
        mealDate === dateString &&
        item.type === type
      )
    })

    return meal ? meal.name : '-'
  }

  // Add meal
  const handleAdd = async () => {
    try {
      const response = await fetch(
        'http://localhost:5165/api/Meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newMeal)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add meal')
      }

      const createdMeal = await response.json()

      setMeals([...meals, createdMeal])

      setShowAddForm(false)

      setNewMeal({
        name: '',
        date: '',
        type: 0,
        description: ''
      })

    } catch (error) {
      setError(error.message)
    }
  }

  // Previous week
  const handlePreviousWeek = () => {
    const previousMonday = new Date(monday)

    previousMonday.setDate(
      monday.getDate() - 7
    )

    setMonday(previousMonday)
  }

  // Next week
  const handleNextWeek = () => {
    const nextMonday = new Date(monday)

    nextMonday.setDate(
      monday.getDate() + 7
    )

    setMonday(nextMonday)
  }

  if (loading) {
    return <p>Loading meals...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="meals-page">

      {/* Page Header */}

      <div className="page-header">

        <div>
          <h1>Meal Schedule</h1>
          <p>Weekly meal schedule</p>
        </div>

        <button
          className="add-button"
          onClick={() => setShowAddForm(true)}
        >
          + Add Meal
        </button>

      </div>


      {/* Week Filter */}

      <div className="week-filter">

        <button
          className="week-button previous"
          onClick={handlePreviousWeek}
        >
          ← Previous
        </button>

        <div className="current-week">

          <strong>This Week</strong>

          <span>
            {formatDate(monday)}
            <span className="space"> - </span>
            {formatDate(saturday)}
          </span>

        </div>

        <button
          className="week-button next"
          onClick={handleNextWeek}
        >
          Next →
        </button>

      </div>

      {/* Add Meal Form */}

      {showAddForm && (

        <div className="edit-form">
            
          <h2>Add Meal</h2>
            <div className='add-form'>
              <input
                type="text"
                id="name"
                value={newMeal.name}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    name: e.target.value
                  })
                }
                placeholder="Meal Name"
                required
              />

            {/* Date */}

              <input
                type="date"
                id="date"
                value={newMeal.date}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    date: e.target.value
                  })
                }
              />

            {/* Type */}

              <select
                id="type"
                value={newMeal.type}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    type: parseInt(e.target.value)
                  })
                }
              >

                <option value={0}>
                  Breakfast
                </option>

                <option value={1}>
                  Lunch
                </option>

                <option value={2}>
                  Snack
                </option>

              </select>

            {/* Description */}

              <textarea
                id="description"
                value={newMeal.description}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    description: e.target.value
                  })
                }
                placeholder="Description"
              />

            {/* Submit */}
                <div className="form-buttons">
            <button
              type="submit"
              className="save-button"
              onClick={handleAdd}
            >
              Add Meal
            </button>
            <button
              type="button"
              className="cancel-button"
                onClick={() => setShowAddForm(false)}
            >
                Cancel
            </button>
            </div>
            </div>
        </div>

      )}


      {/* Meal Table */}

      <div className="table-container">

        <table>

          <thead>

            <tr>
              <th>Day</th>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Snack</th>
            </tr>

          </thead>

          <tbody>

            {weekDays.map(date => (

              <tr key={formatDate(date)}>

                <td>
                  <strong>
                    {formatDay(date)}
                  </strong>
                </td>

                <td>
                  {getMeal(date, 0)}
                </td>

                <td>
                  {getMeal(date, 1)}
                </td>

                <td>
                  {getMeal(date, 2)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Meals
