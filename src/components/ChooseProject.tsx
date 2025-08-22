interface ChooseProjectProps {
  selectedProjects: string[]
}

function ChooseProject({ selectedProjects }: ChooseProjectProps) {
  if (selectedProjects.length === 0) {
    return (
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-info" role="alert">
            <i className="fas fa-info-circle me-2"></i>
            Wählen Sie ein oder mehrere Projekte aus, um Issues anzuzeigen und zu erstellen.
          </div>
        </div>
      </div>
    )
  }
  
  return null
}

export default ChooseProject
