interface ErrorAlertProps {
  error: string
  onDismiss: () => void
}

function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  return (
    <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
      <i className="fas fa-exclamation-triangle me-2"></i>
      {error}
      <button 
        type="button" 
        className="btn-close" 
        onClick={onDismiss}
        aria-label="Close"
      ></button>
    </div>
  )
}

export default ErrorAlert
