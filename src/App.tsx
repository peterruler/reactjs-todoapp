import { useState, useEffect } from 'react'
import './App.css'
import bugIcon from './assets/bug-white-32.svg'
import folderIcon from './assets/folder-icon.svg'
import clipboardIcon from './assets/clipboard-icon.svg'
import { projectAPI, issueAPI } from './services/api'
import type { Project, Issue } from './services/api'
import CreateProject from './components/CreateProject'
import CreateIssue from './components/CreateIssue'
import ListProjects from './components/ListProjects'
import IssuesList from './components/IssuesList'

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

  const handleProjectSelectionChange = (newSelectedProjects: string[]) => {
    setSelectedProjects(newSelectedProjects)
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
              <ListProjects 
                projects={projects}
                selectedProjects={selectedProjects}
                onProjectSelectionChange={handleProjectSelectionChange}
              />
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
        <IssuesList 
          issues={issues}
          projects={projects}
          selectedProjects={selectedProjects}
          onToggleIssue={handleToggleIssue}
          onDeleteIssue={handleDeleteIssue}
        />

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
