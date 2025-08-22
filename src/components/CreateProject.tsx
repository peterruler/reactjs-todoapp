import { useState } from 'react'
import { projectAPI } from '../services/api'
import type { Project } from '../services/api'

interface CreateProjectProps {
  onProjectCreated: (project: Project) => void
  onError: (error: string) => void
}

function CreateProject({ onProjectCreated, onError }: CreateProjectProps) {
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return

    setIsCreating(true)
    try {
      const newProject = await projectAPI.createProject({
        name: newProjectName.trim()
      })
      
      if (newProject) {
        onProjectCreated(newProject)
        setNewProjectName('')
      } else {
        onError('Fehler beim Erstellen des Projekts')
      }
    } catch (err) {
      console.error('Error creating project:', err)
      onError('Fehler beim Erstellen des Projekts')
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleAddProject()
    }
  }

  return (
    <div className="col-md-8 mb-3">
      <label htmlFor="new-project" className="form-label text-light fw-semibold">
        Neues Projekt hinzufügen:
      </label>
      <div className="input-group">
        <input 
          type="text" 
          id="new-project"
          className="form-control bg-dark text-light border-secondary" 
          aria-label="Project Name"
          placeholder="Projektname eingeben..."
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isCreating}
        />
        <button 
          className="btn btn-outline-light border-2" 
          type="button"
          onClick={handleAddProject}
          disabled={!newProjectName.trim() || isCreating}
        >
          {isCreating ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Erstelle...
            </>
          ) : (
            <>
              <i className="fas fa-plus me-1"></i>Hinzufügen
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default CreateProject
