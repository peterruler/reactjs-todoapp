import { useState, useEffect } from 'react'
import './App.css'
import folderIcon from './assets/folder-icon.svg'
import clipboardIcon from './assets/clipboard-icon.svg'
import { projectAPI, issueAPI } from './services/api'
import type { Project, Issue } from './services/api'
import CreateProject from './components/CreateProject'
import CreateIssue from './components/CreateIssue'
import ListProjects from './components/ListProjects'
import IssuesList from './components/IssuesList'
import Header from './components/Header'
import Footer from './components/Footer'
import Loading from './components/Loading'
import ErrorAlert from './components/ErrorAlert'
import ChooseProject from './components/ChooseProject'

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
        // Update with the actual response from server, preserving all fields
        setIssues(prevIssues => prevIssues.map(i => 
          i.id === id ? { 
            ...i, // Keep all original fields (especially projectId)
            ...updatedIssue, // Override with server response
            projectId: updatedIssue.projectId || i.projectId // Ensure projectId is preserved
          } : i
        ))
      }
    } catch (err) {
      console.error('Error updating issue:', err)
      console.log('JSON-Server might not be running. Keeping local change.')
      // Keep the optimistic update for better UX when server is offline
      // Issue will remain visible with the new done state
      setError('Warnung: Änderung nur lokal gespeichert. JSON-Server nicht erreichbar.')
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mt-5">
        <Header />
        <Loading />
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-dark text-light" style={{ minHeight: '100vh' }}>
      <h1 style={{ display: 'none' }}>Peter Strössler</h1>
      
      {/* Error Alert */}
        {error && (
          <ErrorAlert 
            error={error} 
            onDismiss={() => setError(null)} 
          />
        )}      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="min-vh-100 bg-dark text-light main-content-container" style={{ 
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
          <ChooseProject selectedProjects={selectedProjects} />
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
        <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
