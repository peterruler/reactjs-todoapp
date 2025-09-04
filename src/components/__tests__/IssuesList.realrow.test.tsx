import { render, screen } from '@testing-library/react'
import IssuesList from '../IssuesList'
import type { Issue, Project } from '../../services/api'

describe('IssuesList with real IssueRow', () => {
  const projects: Project[] = [
    { id: '1', name: 'Project 1' }
  ]

  test('renders fallback when issue has no due date', () => {
    const issues: Issue[] = [
      { id: '10', title: 'No Date', priority: '', dueDate: '', done: false, projectId: '1' }
    ]

    render(
      <IssuesList 
        issues={issues}
        projects={projects}
        selectedProjects={['1']}
        onToggleIssue={() => {}}
        onDeleteIssue={() => {}}
      />
    )

    expect(screen.getByText('Kein Datum')).toBeInTheDocument()
  })

  test('formats due date using de-DE locale', () => {
    const issues: Issue[] = [
      { id: '11', title: 'With Date', priority: '2', dueDate: '2024-12-31', done: false, projectId: '1' }
    ]

    render(
      <IssuesList
        issues={issues}
        projects={projects}
        selectedProjects={['1']}
        onToggleIssue={() => {}}
        onDeleteIssue={() => {}}
      />
    )

    expect(screen.getByText('31.12.2024')).toBeInTheDocument()
  })
})
