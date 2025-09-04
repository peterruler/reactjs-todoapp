import { useState } from 'react'
import { issueAPI } from '../services/api'
import type { Issue } from '../services/api'
import plusCircleIcon from '../assets/plus-circle-icon.svg'

interface CreateIssueProps {
  selectedProjects: string[]
  onIssueCreated: (issue: Issue) => void
  onError: (error: string) => void
}

function CreateIssue({ selectedProjects, onIssueCreated, onError }: CreateIssueProps) {
  const [newIssue, setNewIssue] = useState({
    title: '',
    priority: '',
    dueDate: ''
  })
  const [isCreating, setIsCreating] = useState(false)

  const handleAddIssue = async () => {
    if (!newIssue.title.trim() || selectedProjects.length === 0) return

    setIsCreating(true)
    try {
      const issue = await issueAPI.createIssue({
        title: newIssue.title.trim(),
        priority: newIssue.priority,
        dueDate: newIssue.dueDate,
        done: false,
        projectId: selectedProjects[0]
      })
      
      if (issue) {
        onIssueCreated(issue)
        setNewIssue({ title: '', priority: '', dueDate: '' })
      } else {
        onError('Fehler beim Erstellen des Issues')
      }
    } catch (err) {
      console.error('Error creating issue:', err)
      onError('Fehler beim Erstellen des Issues')
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleAddIssue()
    }
  }

  const updateIssue = (field: string, value: string) => {
    setNewIssue(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = newIssue.title.trim() && selectedProjects.length > 0

  return (
    <div className="card bg-dark border-secondary mb-4">
      <div className="card-header bg-secondary text-light">
        <h5 className="card-title mb-0 d-flex align-items-center">
          <img src={plusCircleIcon} alt="Plus" className="me-2" style={{ width: '20px', height: '20px', filter: 'invert(1)' }} />
          Neues Issue erstellen
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
            <label htmlFor="priority" className="form-label text-light fw-semibold">
              Priorität:
            </label>
            <select 
              name="priority" 
              id="priority" 
              className="form-select bg-dark text-light border-secondary"
              value={newIssue.priority}
              onChange={(e) => updateIssue('priority', e.target.value)}
              disabled={isCreating}
            >
              <option value="">Priorität wählen...</option>
              <option value="1" className="text-danger">🔴 Hoch (1)</option>
              <option value="2" className="text-warning">🟡 Mittel (2)</option>
              <option value="3" className="text-success">🟢 Niedrig (3)</option>
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="datepicker" className="form-label text-light fw-semibold">
              Fälligkeitsdatum:
            </label>
            <input 
              name="dueDate" 
              type="date" 
              className="form-control bg-dark text-light border-secondary"
              id="datepicker"
              value={newIssue.dueDate}
              onChange={(e) => updateIssue('dueDate', e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="new-issue" className="form-label text-light fw-semibold">
              Issue Titel:
            </label>
            <div className="input-group">
              <input 
                type="text" 
                id="new-issue"
                className="form-control bg-dark text-light border-secondary" 
                aria-label="Issue Name"
                placeholder="Issue beschreiben..."
                value={newIssue.title}
                onChange={(e) => updateIssue('title', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isCreating}
              />
              <button 
                className="btn btn-outline-light border-2" 
                type="button"
                onClick={handleAddIssue}
                disabled={!isFormValid || isCreating}
                title={selectedProjects.length === 0 ? "Bitte wählen Sie zuerst ein Projekt aus" : ""}
              >
                {isCreating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Erstelle...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-1"></i>Erstellen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateIssue
