import type { Project } from '../services/api'

interface ListProjectsProps {
  projects: Project[]
  selectedProjects: string[]
  onProjectSelectionChange: (selectedProjects: string[]) => void
}

function ListProjects({ projects, selectedProjects, onProjectSelectionChange }: ListProjectsProps) {
  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value)
    onProjectSelectionChange(selectedValues)
  }

  return (
    <div className="col-md-4 mb-3">
      <label htmlFor="projectSelect" className="form-label text-light fw-semibold">
        Projekte auswählen:
      </label>
      <select 
        multiple 
        id="projectSelect" 
        className="form-select bg-dark text-light border-secondary" 
        aria-label="select"
        value={selectedProjects}
        onChange={handleSelectionChange}
        style={{ height: '120px' }}
      >
        {projects.map(project => (
          <option key={project.id} value={project.id} className="bg-dark text-light">
            {project.name}
          </option>
        ))}
      </select>
      {projects.length === 0 && (
        <div className="form-text text-white mt-2">
          <i className="fas fa-info-circle me-1 text-white"></i>
          Noch keine Projekte vorhanden. Erstellen Sie zuerst ein Projekt.
        </div>
      )}
      {selectedProjects.length > 0 && (
        <div className="form-text text-light mt-2">
          <i className="fas fa-check-circle me-1 text-success"></i>
          {selectedProjects.length} Projekt{selectedProjects.length !== 1 ? 'e' : ''} ausgewählt
        </div>
      )}
    </div>
  )
}

export default ListProjects
