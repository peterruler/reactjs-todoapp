import { useMemo } from 'react'
import type { Issue, Project } from '../services/api'
import IssueRow from './IssueRow'
import listIcon from '../assets/list-icon.svg'

interface IssuesListProps {
  issues: Issue[]
  projects: Project[]
  selectedProjects: string[]
  onToggleIssue: (id: string) => void
  onDeleteIssue: (id: string) => void
}

function IssuesList({ 
  issues, 
  projects, 
  selectedProjects, 
  onToggleIssue, 
  onDeleteIssue 
}: IssuesListProps) {
  
  // Filter issues based on selected project
  const filteredIssues = useMemo(() => {
    return selectedProjects.length > 0 
      ? issues.filter(issue => selectedProjects.includes(issue.projectId))
      : []
  }, [issues, selectedProjects])

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

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE')
  }

  return (
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
                      : 'Wählen Sie ein Projekt aus, um Issues anzuzeigen.'}
                  </td>
                </tr>
              ) : (
                filteredIssues.map(issue => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    getProjectName={getProjectName}
                    formatDate={formatDate}
                    maxProjectNameLength={maxProjectNameLength}
                    maxPriorityBadgeLength={maxPriorityBadgeLength}
                    maxDueDateBadgeLength={maxDueDateBadgeLength}
                    onToggleIssue={onToggleIssue}
                    onDeleteIssue={onDeleteIssue}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default IssuesList
