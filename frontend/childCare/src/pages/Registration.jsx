import { useEffect, useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Check,
  ChevronDown,
  UserRound,
  Calendar
} from 'lucide-react'

function Registration() {
  const [parents, setParents] = useState([])
  const [parentMode, setParentMode] = useState('existing')
  const [parentSearch, setParentSearch] = useState('')
  const [selectedParent, setSelectedParent] = useState(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    childFirstName: '',
    childLastName: '',
    dateOfBirth: '',
    gender: '',

    existingParentId: null,

    parentFirstName: '',
    parentLastName: '',
    parentPhoneNumber: '',
    parentEmail: '',

    relation: ''
  })

  // =========================
  // GET EXISTING PARENTS
  // =========================

  useEffect(() => {
    fetch('http://localhost:5165/api/Parent')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load parents')
        }

        return response.json()
      })
      .then(data => {
        setParents(data)
      })
      .catch(error => {
        setError(error.message)
      })
  }, [])

  // =========================
  // HANDLE INPUT CHANGES
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value
    })
  }

  // =========================
  // CHANGE PARENT MODE
  // =========================

  const handleParentMode = (mode) => {
    setParentMode(mode)

    setSelectedParent(null)
    setParentSearch('')

    setForm({
      ...form,

      existingParentId: null,

      parentFirstName: '',
      parentLastName: '',
      parentPhoneNumber: '',
      parentEmail: ''
    })
  }

  // =========================
  // SELECT EXISTING PARENT
  // =========================

  const handleSelectParent = (parent) => {
    setSelectedParent(parent)

    setForm({
      ...form,
      existingParentId: parent.id
    })

    setParentSearch('')
  }

  // =========================
  // SUBMIT REGISTRATION
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    // Make sure an existing parent was selected
    if (
      parentMode === 'existing' &&
      !form.existingParentId
    ) {
      setError('Please select an existing parent.')
      setLoading(false)
      return
    }

    try {
      const requestData = {
        childFirstName: form.childFirstName,
        childLastName: form.childLastName,

        // IMPORTANT:
        // Your backend expects ChildDateOfBirth
        childDateOfBirth: form.dateOfBirth,

        gender: form.gender,

        // Existing parent
        existingParentId:
          parentMode === 'existing'
            ? form.existingParentId
            : null,

        // New parent
        parentFirstName:
          parentMode === 'new'
            ? form.parentFirstName
            : '',

        parentLastName:
          parentMode === 'new'
            ? form.parentLastName
            : '',

        parentPhoneNumber:
          parentMode === 'new'
            ? form.parentPhoneNumber
            : '',

        parentEmail:
          parentMode === 'new'
            ? form.parentEmail
            : '',

        // 0 = Parent
        // 1 = Guardian
        relation: Number(form.relation)
      }

      const response = await fetch(
        'http://localhost:5165/api/Registration',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(requestData)
        }
      )

      if (!response.ok) {
        const errorText = await response.text()

        throw new Error(
          errorText || 'Failed to register child'
        )
      }

      const result = await response.json()

      console.log('Registration result:', result)

      setMessage(
        'Child registered successfully!'
      )

      // =========================
      // RESET FORM
      // =========================

      setForm({
        childFirstName: '',
        childLastName: '',
        dateOfBirth: '',
        gender: '',

        existingParentId: null,

        parentFirstName: '',
        parentLastName: '',
        parentPhoneNumber: '',
        parentEmail: '',

        relation: ''
      })

      setSelectedParent(null)
      setParentSearch('')

      // Keep existing parent as default
      setParentMode('existing')

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // FILTER PARENTS
  // =========================

  const filteredParents = parents.filter(parent => {
    const fullName =
      `${parent.firstName} ${parent.lastName}`.toLowerCase()

    const phone =
      parent.phoneNumber?.toLowerCase() || ''

    const search =
      parentSearch.toLowerCase()

    return (
      fullName.includes(search) ||
      phone.includes(search)
    )
  })

  return (
    <div className="registration-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="registration-header">

        <div>
          <h1>Register child</h1>

          <p>
            Add a child and connect them with a family contact.
          </p>
        </div>

      </div>


      <form onSubmit={handleSubmit}>

        {/* =========================
            SECTION 1
        ========================= */}

        <div className="registration-card">

          <div className="section-header">

            <div className="section-number">
              1
            </div>

            <div>
              <h2>Child information</h2>

              <p>
                Enter the child's basic information.
              </p>
            </div>

          </div>

          <div className="section-line"></div>


          <div className="form-grid">

            {/* FIRST NAME */}

            <div className="form-group">

              <label>
                First name
              </label>

              <div className="input-with-icon">

                <UserRound size={18} />

                <input
                  type="text"
                  name="childFirstName"
                  value={form.childFirstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />

              </div>

            </div>


            {/* LAST NAME */}

            <div className="form-group">

              <label>
                Last name
              </label>

              <div className="input-with-icon">

                <UserRound size={18} />

                <input
                  type="text"
                  name="childLastName"
                  value={form.childLastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />

              </div>

            </div>


            {/* DATE OF BIRTH */}

            <div className="form-group">

              <label>
                Date of birth
              </label>

              <div className="input-with-icon">

                <Calendar size={18} />

                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* GENDER */}

            <div className="form-group">

              <label>
                Gender
              </label>

              <div className="select-wrapper">

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select gender
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Male">
                    Male
                  </option>

                </select>

                <ChevronDown size={18} />

              </div>

            </div>

          </div>

        </div>


        {/* =========================
            SECTION 2
        ========================= */}

        <div className="registration-card">

          <div className="section-header">

            <div className="section-number">
              2
            </div>

            <div>

              <h2>
                Family contact
              </h2>

              <p>
                Connect this child with a parent or guardian.
              </p>

            </div>

          </div>

          <div className="section-line"></div>


          {/* =========================
              PARENT OPTIONS
          ========================= */}

          <div className="parent-mode">

            {/* EXISTING PARENT */}

            <button
              type="button"
              className={
                parentMode === 'existing'
                  ? 'parent-option active'
                  : 'parent-option'
              }
              onClick={() =>
                handleParentMode('existing')
              }
            >

              <Users size={23} />

              <div>

                <strong>
                  Existing parent
                </strong>

                <span>
                  Link someone already registered
                </span>

              </div>

              {parentMode === 'existing' && (

                <div className="selected-check">

                  <Check size={15} />

                </div>

              )}

            </button>


            {/* NEW PARENT */}

            <button
              type="button"
              className={
                parentMode === 'new'
                  ? 'parent-option active'
                  : 'parent-option'
              }
              onClick={() =>
                handleParentMode('new')
              }
            >

              <Plus size={23} />

              <div>

                <strong>
                  New parent
                </strong>

                <span>
                  Create a new family contact
                </span>

              </div>

              {parentMode === 'new' && (

                <div className="selected-check">

                  <Check size={15} />

                </div>

              )}

            </button>

          </div>


          {/* =========================
              EXISTING PARENT
          ========================= */}

          {parentMode === 'existing' && (

            <div className="existing-parent-section">

              <label>
                Select existing parent
              </label>

              <div className="parent-search">

                <Search size={19} />

                <input
                  type="text"
                  placeholder="Search parent name or phone..."
                  value={parentSearch}
                  onChange={(e) =>
                    setParentSearch(e.target.value)
                  }
                />

              </div>

              <small>
                Search by parent name or phone number
              </small>


              {/* SEARCH RESULTS */}

              {parentSearch && (

                <div className="parent-results">

                  {filteredParents.length === 0 ? (

                    <p className="no-parents">
                      No parents found
                    </p>

                  ) : (

                    filteredParents.map(parent => (

                      <button
                        type="button"
                        key={parent.id}
                        className={
                          selectedParent?.id === parent.id
                            ? 'parent-result selected'
                            : 'parent-result'
                        }
                        onClick={() =>
                          handleSelectParent(parent)
                        }
                      >

                        <div className="parent-avatar">

                          {parent.firstName?.[0]}
                          {parent.lastName?.[0]}

                        </div>


                        <div>

                          <strong>

                            {parent.firstName}{' '}
                            {parent.lastName}

                          </strong>

                          <span>
                            {parent.phoneNumber}
                          </span>

                        </div>


                        {selectedParent?.id === parent.id && (

                          <Check size={18} />

                        )}

                      </button>

                    ))

                  )}

                </div>

              )}


              {/* SELECTED PARENT */}

              {selectedParent && (

                <div className="selected-parent">

                  <div className="parent-avatar">

                    {selectedParent.firstName?.[0]}
                    {selectedParent.lastName?.[0]}

                  </div>


                  <div>

                    <strong>

                      {selectedParent.firstName}{' '}
                      {selectedParent.lastName}

                    </strong>

                    <span>
                      {selectedParent.phoneNumber}
                    </span>

                  </div>


                  <Check size={19} />

                </div>

              )}

            </div>

          )}


          {/* =========================
              NEW PARENT
          ========================= */}

          {parentMode === 'new' && (

            <div className="form-grid new-parent-form">

              {/* FIRST NAME */}

              <div className="form-group">

                <label>
                  First name
                </label>

                <input
                  type="text"
                  name="parentFirstName"
                  value={form.parentFirstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />

              </div>


              {/* LAST NAME */}

              <div className="form-group">

                <label>
                  Last name
                </label>

                <input
                  type="text"
                  name="parentLastName"
                  value={form.parentLastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />

              </div>


              {/* PHONE */}

              <div className="form-group">

                <label>
                  Phone number
                </label>

                <input
                  type="text"
                  name="parentPhoneNumber"
                  value={form.parentPhoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="parentEmail"
                  value={form.parentEmail}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />

              </div>

            </div>

          )}

        </div>


        {/* =========================
            SECTION 3
        ========================= */}

        <div className="registration-card">

          <div className="section-header">

            <div className="section-number">
              3
            </div>

            <div>

              <h2>
                Relationship
              </h2>

              <p>
                How is this person related to the child?
              </p>

            </div>

          </div>

          <div className="section-line"></div>


          <div className="form-group relationship-field">

            <label>
              Relationship to child
            </label>

            <div className="select-wrapper">

              <select
                name="relation"
                value={form.relation}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select relationship
                </option>

                <option value="0">
                  Parent
                </option>

                <option value="1">
                  Guardian
                </option>

              </select>

              <ChevronDown size={18} />

            </div>

          </div>

        </div>


        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {message && (

          <div className="success-message">

            <Check size={18} />

            {message}

          </div>

        )}


        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        {/* =========================
            ACTION BUTTONS
        ========================= */}

        <div className="registration-actions">

          <button
            type="button"
            className="cancel-registration"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >

            <Check size={18} />

            {loading
              ? 'Registering...'
              : 'Register child'
            }

          </button>

        </div>

      </form>

    </div>
  )
}

export default Registration