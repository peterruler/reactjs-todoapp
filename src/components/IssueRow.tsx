import type { Issue } from '../services/api'

interface IssueRowProps {
  issue: Issue
  getProjectName: (projectId: string) => string
  formatDate: (dateString: string) => string
  maxProjectNameLength: number
  maxPriorityBadgeLength: number
  maxDueDateBadgeLength: number
  onToggleIssue: (id: string) => void
  onDeleteIssue: (id: string) => void
}

function IssueRow({ 
  issue, 
  getProjectName, 
  formatDate, 
  maxProjectNameLength, 
  maxPriorityBadgeLength, 
  maxDueDateBadgeLength,
  onToggleIssue, 
  onDeleteIssue 
}: IssueRowProps) {
  return (
    <tr className={issue.done ? 'table-success bg-opacity-25' : ''}>
      <td className="text-center">
        <div className="form-check d-flex justify-content-center">
          <input 
            className="form-check-input" 
            type="checkbox" 
            checked={issue.done}
            onChange={() => onToggleIssue(issue.id)}
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
          onClick={() => onDeleteIssue(issue.id)}
          title="Issue löschen"
        >
          <i className="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  )
}

export default IssueRow
