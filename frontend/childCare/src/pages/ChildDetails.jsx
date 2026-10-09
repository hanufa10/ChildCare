
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  CalendarDays,
  Clock,
  UserRound,
  Phone,
  HeartPulse,
  ClipboardList
} from 'lucide-react'
import '../components/styles/ChildDetails.css'

function ChildDetails() {
  const { id } = useParams()

  const [child, setChild] = useState(null)
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadChildDetails() {
      setLoading(true)
      setError('')

      try {
        const [childResponse, relationsResponse] = await Promise.all([
          fetch(`http://localhost:5165/api/Children/${id}`),
          fetch('http://localhost:5165/api/ParentChildren')
        ])

        if (!childResponse.ok) {
          throw new Error('Could not find this child.')
        }

        if (!relationsResponse.ok) {
          throw new Error('Could not load parent information.')
        }

        const childData = await childResponse.json()
        const relationsData = await relationsResponse.json()

        setChild(childData)
        setParents(
          relationsData.filter(
            relation => Number(relation.childId) === Number(id)
          )
        )
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    loadChildDetails()
  }, [id])

  if (loading) {
    return (
      <p className="daycare-child-profile-message">
        Loading child profile...
      </p>
    )
  }

  if (error || !child) {
    return (
      <div className="daycare-child-profile-message">
        <p>{error || 'Child not found.'}</p>
        <Link to="/children">Back to children</Link>
      </div>
    )
  }

  const calculateAge = () => {
    if (!child.dateOfBirth) return 'Not provided'

    const dob = new Date(child.dateOfBirth)
    const today = new Date()

    let years = today.getFullYear() - dob.getFullYear()

    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() &&
        today.getDate() < dob.getDate())
    ) {
      years--
    }

    return `${Math.max(0, years)} ${
      years === 1 ? 'year' : 'years'
    } old`
  }

  const formatDate = date => {
    if (!date) return 'Not provided'

    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const parentName = parent =>
    [parent?.firstName, parent?.lastName]
      .filter(Boolean)
      .join(' ')

  const primaryParent = parents.find(
    relation => relation.parent?.phoneNumber
  )?.parent

  return (
    <div className="daycare-child-profile-page">
      <Link
        to="/children"
        className="daycare-child-profile-back-link"
      >
        <ArrowLeft size={17} />
        Back to children
      </Link>

      {/* Child profile header */}
      <section className="daycare-child-profile-header">
        <div className="daycare-child-profile-avatar">
          {child.firstName?.charAt(0)}
          {child.lastName?.charAt(0)}
        </div>

        <div className="daycare-child-profile-heading">
          <span className="daycare-child-profile-status">
            <span>●</span> Enrolled
          </span>

          <h1>
            {child.firstName} {child.lastName}
          </h1>

          <p>Child profile and registration information</p>
        </div>

        <Link
          to={`/children?edit=${child.id}`}
          className="daycare-child-profile-edit-button"
        >
          <Pencil size={17} />
          Edit profile
        </Link>
      </section>

      {/* Main content */}
      <div className="daycare-child-profile-layout">
        <div className="daycare-child-profile-main">

          {/* Child information */}
          <section className="daycare-child-profile-card">
            <div className="daycare-child-profile-card-heading">
              <h2>Child information</h2>
              <p>Personal and health details</p>
            </div>

            <div className="daycare-child-profile-info-grid">
              <div className="daycare-child-profile-info-item">
                <span className="daycare-child-profile-icon">
                  <CalendarDays />
                </span>
                <div>
                  <small>Date of birth</small>
                  <strong>{formatDate(child.dateOfBirth)}</strong>
                </div>
              </div>

              <div className="daycare-child-profile-info-item">
                <span className="daycare-child-profile-icon">
                  <Clock />
                </span>
                <div>
                  <small>Age</small>
                  <strong>{calculateAge()}</strong>
                </div>
              </div>

              <div className="daycare-child-profile-info-item">
                <span className="daycare-child-profile-icon">
                  <UserRound />
                </span>
                <div>
                  <small>Gender</small>
                  <strong>{child.gender || 'Not provided'}</strong>
                </div>
              </div>

              <div className="daycare-child-profile-info-item">
                <span className="daycare-child-profile-icon">
                  <HeartPulse />
                </span>
                <div>
                  <small>Allergies</small>
                  <strong>
                    {child.allergies?.trim() || 'None recorded'}
                  </strong>
                </div>
              </div>

              <div className="daycare-child-profile-info-item">
                <span className="daycare-child-profile-icon">
                  <ClipboardList />
                </span>
                <div>
                  <small>Health conditions</small>
                  <strong>
                    {child.healthCondition?.trim() || 'None recorded'}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* Parent / guardian information */}
          <section className="daycare-child-profile-card">
            <div className="daycare-child-profile-card-heading">
              <h2>Parent / guardian</h2>
              <p>Registered family contacts</p>
            </div>

            {parents.length > 0 ? (
              <div className="daycare-child-profile-parent-list">
                {parents.map((relation, index) => {
                  const parent = relation.parent
                  const name = parentName(parent)

                  return (
                    <div
                      className="daycare-child-profile-parent-item"
                      key={`${relation.parentId}-${index}`}
                    >
                      <span className="daycare-child-profile-parent-avatar">
                        {parent?.firstName?.charAt(0) || 'P'}
                        {parent?.lastName?.charAt(0) || ''}
                      </span>

                      <div className="daycare-child-profile-parent-info">
                        <strong>
                          {name || 'Parent / Guardian'}
                        </strong>
                        <small>Parent or guardian</small>
                        <span>
                          {parent?.phoneNumber || 'No phone number'}
                        </span>
                      </div>

                      {parent?.phoneNumber && (
                        <a
                          className="daycare-child-profile-parent-call"
                          href={`tel:${parent.phoneNumber}`}
                          aria-label={`Call ${
                            name || 'parent or guardian'
                          }`}
                        >
                          <Phone size={16} />
                          Call
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="daycare-child-profile-empty">
                No parent or guardian is linked to this child yet.
              </p>
            )}
          </section>
        </div>

        {/* Registration and emergency contact sidebar */}
        <section className="daycare-child-profile-sidebar">
          <section className="daycare-child-profile-card">
            <div className="daycare-child-profile-card-heading">
              <h2>Registration details</h2>
            </div>

            <div className="daycare-child-profile-registration">
              <div>
                <span>Child ID</span>
                <strong>
                  #{String(child.id).padStart(4, '0')}
                </strong>
              </div>

              <div>
                <span>Registration status</span>
                <strong>Enrolled</strong>
              </div>

              <div>
                <span>Relationship</span>
                <strong>
                  {parents.length ? 'Parent / Guardian' : 'Not linked'}
                </strong>
              </div>
            </div>

            <div className="daycare-child-profile-emergency">
              <h3>Emergency contact</h3>

              <p>
                {primaryParent
                  ? parentName(primaryParent)
                  : 'No primary contact available'}
              </p>

              {primaryParent?.phoneNumber ? (
                <a
                  className="daycare-child-profile-emergency-call"
                  href={`tel:${primaryParent.phoneNumber}`}
                >
                  <Phone size={17} />
                  Call primary contact
                </a>
              ) : (
                <p className="daycare-child-profile-empty">
                  Add a parent or guardian phone number to enable calling.
                </p>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}

export default ChildDetails