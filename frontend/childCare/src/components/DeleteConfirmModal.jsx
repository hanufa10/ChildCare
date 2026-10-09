function DeleteConfirmModal({
  show,
  title = 'Delete record?',
  message = 'Are you sure you want to delete this record?',
  onConfirm,
  onCancel
}) {
  if (!show) {
    return null
  }

  return (
    <div className="delete-modal-overlay">

      <div className="delete-modal">

        <div className="delete-modal-icon">
          !
        </div>

        <h2>{title}</h2>

        <p>{message}</p>

        <div className="delete-modal-actions">

          <button
            className="delete-cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="delete-confirm-button"
            onClick={onConfirm}
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  )
}

export default DeleteConfirmModal