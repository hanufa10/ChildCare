import { useEffect, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

function Meals() {
  const [meals, setMeals] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)

  // Get Monday of current week
  const getMonday = () => {
    const today = new Date()
    const day = today.getDay()

    const monday = new Date(today)
    const difference = day === 0 ? -6 : 1 - day

    monday.setDate(today.getDate() + difference)
    monday.setHours(0, 0, 0, 0)

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
  const [deleteId,setDeleteId] = useState(null)

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

  // Create Monday-Saturday
  const weekDays = []

  for (let i = 0; i < 6; i++) {
    const date = new Date(monday)

    date.setDate(monday.getDate() + i)

    weekDays.push(date)
  }

  const saturday = weekDays[5]

  // Format YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  // Day name
  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long'
    })
  }

  // Short date
  const getDayNumber = (date) => {
    return date.getDate()
  }

  // Month + year
  const getMonthYear = () => {
    const startMonth = monday.toLocaleDateString('en-US', {
      month: 'long'
    })

    const endMonth = saturday.toLocaleDateString('en-US', {
      month: 'long'
    })

    const year = saturday.getFullYear()

    if (startMonth === endMonth) {
      return `${startMonth}, ${year}`
    }

    return `${startMonth} – ${endMonth}, ${year}`
  }

  // Check if this is current week
  const isCurrentWeek = () => {
    const currentMonday = getMonday()

    return formatDate(currentMonday) === formatDate(monday)
  }

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date()

    return formatDate(today) === formatDate(date)
  }

  // Get meal for a particular day and type
  const getMeal = (date, type) => {
    const dateString = formatDate(date)

    return meals.find(item => {
      if (!item.date) return false

      const mealDate = item.date.slice(0, 10)

      return (
        mealDate === dateString &&
        item.type === type
      )
    })
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

  // Meal row information
  const mealRows = [
    {
      type: 0,
      name: 'Breakfast',
      icon: '☀',
      className: 'breakfast-icon'
    },
    {
      type: 1,
      name: 'Lunch',
      icon: '♨',
      className: 'lunch-icon'
    },
    {
      type: 2,
      name: 'Snack',
      icon: '♧',
      className: 'snack-icon'
    }
  ]

  if (loading) {
    return <p>Loading meals...</p>
  }

  if (error) {
    return <p>{error}</p>
  }
  // Edit meal
const handleEdit = async () => {
  try {
    const response = await fetch(
      `http://localhost:5165/api/Meal/${editingMeal.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingMeal.id,
          name: editingMeal.name,
          date: editingMeal.date,
          type: editingMeal.type,
          description: editingMeal.description
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update meal')
    }

    // Do NOT use response.json()
    // PUT endpoint is returning no JSON response

    setMeals(
      meals.map(meal =>
        meal.id === editingMeal.id
          ? editingMeal
          : meal
      )
    )

    setEditingMeal(null)
    setOpenMenu(null)

  } catch (error) {
    setError(error.message)
  }
}
// Delete meal
const handleDelete = async () => {
  try {
    const response = await fetch(
      `http://localhost:5165/api/Meal/${deleteId}`,
      {
        method: 'DELETE'
      }
    )

    if (!response.ok) {
      throw new Error('Failed to delete meal')
    }

    setMeals(
      meals.filter(meal => meal.id !== deleteId)
    )

    setOpenMenu(null)

  } catch (error) {
    setError(error.message)
  }
}
const openEditMeal = (meal) => {
  setEditingMeal({
    ...meal,
    date: meal.date
      ? meal.date.slice(0, 10)
      : ''
  })

  setOpenMenu(null)
}
  return (
    <div className="meals-page">

      <div className='meal-top-actions'>
        <div className='registration-header'>
          <div>
        <h2>Weekly meal schedule</h2>
        <p>Plan balanced, nourishing meals for every day.</p>
          </div>
        </div>

      {/* Add Meal Button */}

      <div>
        <button
          className="add-button"
          onClick={() => setShowAddForm(true)}
          >
          + Add Meal
        </button>
      </div>
      </div>

      {/* Week Navigation */}

      <div className="meal-week-navigation">

        <button
          className="week-navigation-button"
          onClick={handlePreviousWeek}
        >
          <span>‹</span>
          Previous week
        </button>

        <div className="week-title">

          <span className="calendar-icon">
            ▣
          </span>

          <strong>
            {monday.getDate()}–
            {saturday.getDate()} {getMonthYear()}
          </strong>

          {isCurrentWeek() && (
            <span className="current-week-badge">
              Current week
            </span>
          )}

        </div>

        <button
          className="week-navigation-button"
          onClick={handleNextWeek}
        >
          Next week
          <span>›</span>
        </button>

      </div>

      {/* Add Meal Form */}

      {showAddForm && (
  <div className="meal-modal-overlay">

    <div className="meal-modal">

      {/* Modal Header */}
      <div className="meal-modal-header">

        <div>
          <h2>Add Meal</h2>
          <p>Add a meal to the weekly schedule</p>
        </div>

        <button
          className="meal-modal-close"
          onClick={() => setShowAddForm(false)}
        >
          ×
        </button>

      </div>

      {/* Form */}
      <div className="meal-modal-form">

        <div className="meal-form-field">

          <label>Meal Name</label>

          <input
            type="text"
            value={newMeal.name}
            onChange={(e) =>
              setNewMeal({
                ...newMeal,
                name: e.target.value
              })
            }
            placeholder="e.g. Berry oatmeal"
          />

        </div>

        <div className="meal-form-field">

          <label>Date</label>

          <input
            type="date"
            value={newMeal.date}
            onChange={(e) =>
              setNewMeal({
                ...newMeal,
                date: e.target.value
              })
            }
          />

        </div>

        <div className="meal-form-field">

          <label>Meal Type</label>

          <select
            value={newMeal.type}
            onChange={(e) =>
              setNewMeal({
                ...newMeal,
                type: Number(e.target.value)
              })
            }
          >
            <option value={0}>Breakfast</option>
            <option value={1}>Lunch</option>
            <option value={2}>Snack</option>
          </select>

        </div>

        <div className="meal-form-field">

          <label>Description</label>

          <textarea
            value={newMeal.description}
            onChange={(e) =>
              setNewMeal({
                ...newMeal,
                description: e.target.value
              })
            }
            placeholder="e.g. With fresh fruit"
            rows="4"
          />

        </div>

      </div>

      {/* Modal Footer */}
      <div className="meal-modal-footer">

        <button
          className="cancel-button"
          onClick={() => setShowAddForm(false)}
        >
          Cancel
        </button>

        <button
          className="save-button"
          onClick={handleAdd}
        >
          Add Meal
        </button>

      </div>

    </div>

  </div>
)}
  {/* Edit Meal Popup */}

{editingMeal && (
  <div className="meal-modal-overlay">

    <div className="meal-modal">

      {/* Header */}

      <div className="meal-modal-header">

        <div>
          <h2>Edit Meal</h2>
          <p>Update the meal information</p>
        </div>

        <button
          className="meal-modal-close"
          onClick={() => setEditingMeal(null)}
        >
          ×
        </button>

      </div>

      {/* Form */}

      <div className="meal-modal-form">

        <div className="meal-form-field">

          <label>Meal Name</label>

          <input
            type="text"
            value={editingMeal.name}
            onChange={(e) =>
              setEditingMeal({
                ...editingMeal,
                name: e.target.value
              })
            }
            placeholder="Meal Name"
          />

        </div>

        <div className="meal-form-field">

          <label>Date</label>

          <input
            type="date"
            value={editingMeal.date}
            onChange={(e) =>
              setEditingMeal({
                ...editingMeal,
                date: e.target.value
              })
            }
          />

        </div>

        <div className="meal-form-field">

          <label>Meal Type</label>

          <select
            value={editingMeal.type}
            onChange={(e) =>
              setEditingMeal({
                ...editingMeal,
                type: Number(e.target.value)
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

        </div>

        <div className="meal-form-field">

          <label>Description</label>

          <textarea
            value={editingMeal.description || ''}
            onChange={(e) =>
              setEditingMeal({
                ...editingMeal,
                description: e.target.value
              })
            }
            placeholder="Description"
            rows="4"
          />

        </div>

      </div>

      {/* Footer */}

      <div className="meal-modal-footer">

        <button
          className="cancel-button"
          onClick={() => setEditingMeal(null)}
        >
          Cancel
        </button>

        <button
          className="save-button"
          onClick={handleEdit}
        >
          Save Changes
        </button>

      </div>

    </div>

  </div>
)}
      {/* Meal Schedule */}

      <div className="meal-schedule">

        {/* Header */}

        <div className="meal-grid-header">

          <div className="meal-label-header">
            MEAL
          </div>

          {weekDays.map(date => (
            <div
              className={`day-header ${
                isToday(date) ? 'today-header' : ''
              }`}
              key={formatDate(date)}
            >

              <span className="day-name">
                {formatDay(date)}
              </span>

              <strong className="day-number">
                {getDayNumber(date)}
              </strong>

              {isToday(date) && (
                <span className="today-label">
                  TODAY
                </span>
              )}

            </div>
          ))}

        </div>

        {/* Meal Rows */}

        {mealRows.map(mealRow => (

          <div
            className="meal-grid-row"
            key={mealRow.type}
          >

            {/* Meal Type */}

            <div className="meal-type">

              <div
                className={`meal-type-icon ${mealRow.className}`}
              >
                {mealRow.icon}
              </div>

              <strong>
                {mealRow.name}
              </strong>

            </div>

            {/* Days */}

            {weekDays.map(date => {

              const meal = getMeal(
                date,
                mealRow.type
              )

              return (
                <div
                  className="meal-cell"
                  key={formatDate(date)}
                >

                  {meal ? (
                    <>
                      <div className="meal-name">
                        {meal.name}
                      </div>

                      <div className="meal-description">
                        {meal.description ||
                          'Fresh & wholesome'}
                      </div>

<div className="meal-menu-container">

  <button
    className="meal-menu"
    onClick={() =>
      setOpenMenu(
        openMenu === meal.id
          ? null
          : meal.id
      )
    }
  >
    •••
  </button>

  {openMenu === meal.id && (
    <div className="meal-action-menu">

      <button
        onClick={() => openEditMeal(meal)}
      >
        Edit
      </button>

      <button
        className="delete-menu-item"
        onClick={() => setDeleteId(meal.id)}
      >
        Delete
      </button>

    </div>
  )}

</div>
                    </>
                  ) : (
                    <div className="empty-meal">
                      No meal
                    </div>
                  )}

                </div>
              )
            })}

          </div>
        ))}

      </div>

      {/* Dietary Notice */}

      <div className="dietary-notice">

        <div className="dietary-icon">
          ♡
        </div>

        <div className="dietary-text">

          <strong>
            Allergy-aware planning
          </strong>

          <p>
            Meals are reviewed against each child’s
            dietary profile. Always check individual
            requirements before serving.
          </p>

        </div>

        <button className="dietary-button">
          View dietary needs
        </button>

      </div>
        <DeleteConfirmModal
          show={deleteId !== null}
          title="Delete meal?"
          message="Are you sure you want to remove this meal from the schedule?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
    </div>
  )
}

export default Meals