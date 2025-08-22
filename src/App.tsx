import { useState, useEffect, useMemo } from 'react'
import './App.css'
import bugIcon from './assets/bug-white-32.svg'
import folderIcon from './assets/folder-icon.svg'
import clipboardIcon from './assets/clipboard-icon.svg'
import listIcon from './assets/list-icon.svg'
import { projectAPI, issueAPI } from './services/api'
import type { Project, Issue } from './services/api'
import CreateProject from './components/CreateProject'
import CreateIssue from './components/CreateIssue'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const [projectsData, issuesData] = await Promise.all([
          projectAPI.getProjects(),
          issueAPI.getIssues()
        ])
        
        setProjects(projectsData)
        setIssues(issuesData)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Fehler beim Laden der Daten. Bitte stellen Sie sicher, dass der JSON-Server läuft.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleProjectCreated = (newProject: Project) => {
    setProjects([...projects, newProject])
  }

  const handleProjectCreationError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleIssueCreated = (newIssue: Issue) => {
    setIssues([...issues, newIssue])
  }

  const handleIssueCreationError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleDeleteIssue = async (id: string) => {
    try {
      const success = await issueAPI.deleteIssue(id)
      
      if (success) {
        setIssues(issues.filter(issue => issue.id !== id))
      } else {
        setError('Fehler beim Löschen des Issues')
      }
    } catch (err) {
      console.error('Error deleting issue:', err)
      setError('Fehler beim Löschen des Issues')
    }
  }

  const handleToggleIssue = async (id: string) => {
    const issue = issues.find(i => i.id === id)
    if (!issue) {
      console.error('Issue not found with id:', id)
      return
    }

    console.log('Toggling issue:', id, 'from done:', issue.done, 'to done:', !issue.done)

    // Optimistic update - update UI immediately
    const newDoneState = !issue.done
    const optimisticUpdate = issues.map(i => 
      i.id === id ? { ...i, done: newDoneState } : i
    )
    setIssues(optimisticUpdate)

    try {
      const updatedIssue = await issueAPI.updateIssue(id, { done: newDoneState })
      
      if (!updatedIssue) {
        console.error('API returned null for updated issue')
        // Keep the optimistic update since the user expects immediate feedback
        console.log('Keeping optimistic update due to API failure')
      } else {
        console.log('Issue successfully updated:', updatedIssue)
        // Update with the actual response from server
        setIssues(prevIssues => prevIssues.map(i => 
          i.id === id ? updatedIssue : i
        ))
      }
    } catch (err) {
      console.error('Error updating issue:', err)
      console.log('JSON-Server might not be running. Keeping local change.')
      // Keep the optimistic update for better UX when server is offline
      // setIssues(issues) // Don't revert - let user continue working
      setError('Warnung: Änderung nur lokal gespeichert. JSON-Server nicht erreichbar.')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE')
  }

  // Filter issues based on selected project
  const filteredIssues = selectedProjects.length > 0 
    ? issues.filter(issue => selectedProjects.includes(issue.projectId))
    : issues

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project ? project.name : 'Kein Projekt'
  }

  // Calculate dynamic width for project badges
  const maxProjectNameLength = useMemo(() => {
    if (projects.length === 0) return 84; // fallback width (70% of 120)
    const allNames = [...projects.map(p => p.name), 'Kein Projekt'];
    const longestName = allNames.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    );
    // Approximate 8px per character + padding + icon width, reduced to 70%
    const fullWidth = Math.max(120, longestName.length * 8 + 60);
    return Math.round(fullWidth * 0.7);
  }, [projects]);

  // Calculate dynamic width for priority badges
  const maxPriorityBadgeLength = useMemo(() => {
    const priorityTexts = ['🔴 Hoch', '🟡 Mittel', '🟢 Niedrig', '-'];
    const longestText = priorityTexts.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    );
    // Approximate 8px per character + padding
    return Math.max(80, longestText.length * 8 + 20);
  }, []);

  // Calculate dynamic width for due date badges
  const maxDueDateBadgeLength = useMemo(() => {
    // Consider typical German date format "DD.MM.YYYY" plus icon and "Kein Datum"
    const dateTexts = ['📅 31.12.2025', 'Kein Datum'];
    const longestText = dateTexts.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    );
    // Approximate 8px per character + padding + icon width
    return Math.max(120, longestText.length * 8 + 30);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-dark text-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Lade...</span>
          </div>
          <h4>Lade Daten...</h4>
          <p className="text-muted">Stelle sicher, dass der JSON-Server läuft (http://localhost:3001)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark text-light" style={{ minHeight: '100vh' }}>
      <h1 style={{ display: 'none' }}>Peter Strössler</h1>
      
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {/* Header */}
      <header style={{ paddingBottom: '20px' }}>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-light">
          <div className="container-fluid container">
            <a className="navbar-brand text-white d-flex align-items-center" href="#">
              <img src={bugIcon} alt="Bug Tracker" className="me-2" style={{ width: '32px', height: '32px' }} />
              <span className="title fw-bold">Issue Tracker</span>
            </a>
            <button 
              className="navbar-toggler border-white" 
              type="button" 
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavDropdown" 
              aria-controls="navbarNavDropdown" 
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="navbar-collapse collapse" id="navbarNavDropdown">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link active text-white fw-bold" aria-current="page" href="#">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-light" href="#about">
                    Über
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-light" href="mailto:peter.stroessler@bluewin.ch?subject=todoapp">
                    Kontakt
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="min-vh-100 bg-dark text-light" style={{ 
        minWidth: '768px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        paddingLeft: '15px', 
        paddingRight: '15px',
        width: '100%'
      }}>
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="row align-items-center mb-4">
              <div className="col-12">
                <h2 className="text-white mb-3 fw-bold border-bottom border-white pb-2 d-flex align-items-center" style={{ fontSize: '24px' }}>
                  <img src={folderIcon} alt="Projekte" className="me-2" style={{ width: '24px', height: '24px', filter: 'invert(1)' }} />
                  Projekte
                </h2>
              </div>
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
                  onChange={(e) => setSelectedProjects(Array.from(e.target.selectedOptions, option => option.value))}
                  style={{ height: '120px' }}
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id} className="bg-dark text-light">
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <CreateProject 
                onProjectCreated={handleProjectCreated}
                onError={handleProjectCreationError}
              />
            </div>

        <div className="row mb-4">
          <div className="col-12">
            <h2 className="text-white mb-3 fw-bold border-bottom border-white pb-2 d-flex align-items-center" style={{ fontSize: '24px' }}>
              <img src={clipboardIcon} alt="Issues" className="me-2" style={{ width: '24px', height: '24px', filter: 'invert(1)' }} />
              Issues
            </h2>
            {selectedProjects.length === 0 && (
              <div className="alert alert-info" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                Wählen Sie ein oder mehrere Projekte aus, um Issues anzuzeigen und zu erstellen.
              </div>
            )}
          </div>
        </div>

        {/* New Issue Form */}
        <CreateIssue 
          selectedProjects={selectedProjects}
          onIssueCreated={handleIssueCreated}
          onError={handleIssueCreationError}
        />

        {/* Issues Table */}
        <div className="card bg-dark border-secondary">
          <div className="card-header bg-secondary text-light">
            <h5 className="card-title mb-0 d-flex align-items-center">
              <img src={listIcon} alt="Liste" className="me-2" style={{ width: '20px', height: '20px', filter: 'invert(1)' }} />
              Issue Übersicht ({filteredIssues.length} Issues)
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead className="table-secondary">
                  <tr>
                    <th scope="col" className="text-center">
                      <i className="fas fa-check-circle text-success"></i>
                    </th>
                    <th scope="col">
                      <i className="fas fa-file-alt me-1"></i>Issue Name
                    </th>
                    <th scope="col" className="text-center">
                      <i className="fas fa-folder me-1"></i>Projekt
                    </th>
                    <th scope="col" className="text-center">
                      <i className="fas fa-exclamation-triangle me-1"></i>Priorität
                    </th>
                    <th scope="col" className="text-center">
                      <i className="fas fa-calendar me-1"></i>Fällig am
                    </th>
                    <th scope="col" className="text-center">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-white py-4">
                        <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                        {selectedProjects.length > 0 
                          ? 'Keine Issues für das ausgewählte Projekt vorhanden.' 
                          : 'Noch keine Issues vorhanden. Erstelle dein erstes Issue!'}
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map(issue => (
                      <tr key={issue.id} className={issue.done ? 'table-success bg-opacity-25' : ''}>
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              checked={issue.done}
                              onChange={() => handleToggleIssue(issue.id)}
                            />
                          </div>
                        </td>
                        <td className={issue.done ? 'text-decoration-line-through text-white' : 'text-light'}>
                          <strong>{issue.title}</strong>
                        </td>
                        <td className="text-center text-light">
                          <span 
                            className="badge bg-info text-dark project-badge"
                            style={{ 
                              minWidth: `${maxProjectNameLength}px`,
                              maxWidth: `${maxProjectNameLength}px`
                            }}
                          >
                            <i className="fas fa-folder me-1"></i>
                            {getProjectName(issue.projectId)}
                          </span>
                        </td>
                        <td className="text-center">
                          {issue.priority === '1' && (
                            <span 
                              className="badge bg-danger priority-badge"
                              style={{ minWidth: `${maxPriorityBadgeLength}px` }}
                            >
                              🔴 Hoch
                            </span>
                          )}
                          {issue.priority === '2' && (
                            <span 
                              className="badge bg-warning priority-badge"
                              style={{ minWidth: `${maxPriorityBadgeLength}px` }}
                            >
                              🟡 Mittel
                            </span>
                          )}
                          {issue.priority === '3' && (
                            <span 
                              className="badge bg-success priority-badge"
                              style={{ minWidth: `${maxPriorityBadgeLength}px` }}
                            >
                              🟢 Niedrig
                            </span>
                          )}
                          {!issue.priority && (
                            <span 
                              className="badge bg-secondary priority-badge"
                              style={{ minWidth: `${maxPriorityBadgeLength}px` }}
                            >
                              -
                            </span>
                          )}
                        </td>
                        <td className="text-center text-light">
                          {issue.dueDate ? (
                            <span 
                              className="badge border border-white text-white due-date-badge"
                              style={{ minWidth: `${maxDueDateBadgeLength}px` }}
                            >
                              <i className="fas fa-calendar-day me-1"></i>
                              {formatDate(issue.dueDate)}
                            </span>
                          ) : (
                            <span 
                              className="badge bg-secondary due-date-badge"
                              style={{ minWidth: `${maxDueDateBadgeLength}px` }}
                            >
                              Kein Datum
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <button 
                            type="button" 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteIssue(issue.id)}
                            title="Issue löschen"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer id="about" className="mt-5 pt-4">
          <div className="text-center">
            <p className="text-white mb-2">
              <i className="fas fa-code me-1"></i>
              Built with React & Bootstrap
            </p>
            <p className="text-light">
              <a href="https://peterruler.github.io/" className="text-white text-decoration-none fw-bold">
                Made with <i className="fas fa-heart text-danger"></i> by Peter © 2025
              </a>
            </p>
          </div>
        </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
