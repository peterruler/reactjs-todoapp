import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IssuesList from '../IssuesList';
import type { Issue, Project } from '../../services/api';

// Mock IssueRow component
jest.mock('../IssueRow', () => {
  return function MockIssueRow({ issue, onToggleIssue, onDeleteIssue }: { 
    issue: { id: string; title: string }; 
    onToggleIssue: (id: string) => void; 
    onDeleteIssue: (id: string) => void; 
  }) {
    return (
      <tr data-testid={`issue-row-${issue.id}`}>
        <td>{issue.title}</td>
        <td>
          <button onClick={() => onToggleIssue(issue.id)}>Toggle</button>
          <button onClick={() => onDeleteIssue(issue.id)}>Delete</button>
        </td>
      </tr>
    );
  };
});

describe('IssuesList Component', () => {
  const mockOnToggleIssue = jest.fn();
  const mockOnDeleteIssue = jest.fn();

  const mockProjects: Project[] = [
    { id: '1', name: 'Project 1' },
    { id: '2', name: 'Project 2' }
  ];

  const mockIssues: Issue[] = [
    {
      id: '1',
      title: 'Issue 1',
      priority: 'Hoch',
      dueDate: '2024-12-31',
      done: false,
      projectId: '1'
    },
    {
      id: '2',
      title: 'Issue 2',
      priority: 'Niedrig',
      dueDate: '2024-12-25',
      done: true,
      projectId: '2'
    },
    {
      id: '3',
      title: 'Issue 3',
      priority: 'Mittel',
      dueDate: '2024-12-20',
      done: false,
      projectId: '1'
    }
  ];

  const defaultProps = {
    issues: mockIssues,
    projects: mockProjects,
    selectedProjects: ['1'],
    onToggleIssue: mockOnToggleIssue,
    onDeleteIssue: mockOnDeleteIssue
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders table headers correctly', () => {
    render(<IssuesList {...defaultProps} />);
    
    expect(screen.getByText('Issue Name')).toBeInTheDocument();
    expect(screen.getByText('Projekt')).toBeInTheDocument();
    expect(screen.getByText('Priorität')).toBeInTheDocument();
    expect(screen.getByText('Fällig am')).toBeInTheDocument();
    expect(screen.getByText('Aktionen')).toBeInTheDocument();
  });

  test('filters issues by selected projects', () => {
    render(<IssuesList {...defaultProps} />);
    
    // Should show issues 1 and 3 (both belong to project 1)
    expect(screen.getByTestId('issue-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('issue-row-3')).toBeInTheDocument();
    // Should not show issue 2 (belongs to project 2)
    expect(screen.queryByTestId('issue-row-2')).not.toBeInTheDocument();
  });

  test('shows all issues when multiple projects selected', () => {
    render(<IssuesList {...defaultProps} selectedProjects={['1', '2']} />);
    
    expect(screen.getByTestId('issue-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('issue-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('issue-row-3')).toBeInTheDocument();
  });

  test('shows no issues when no projects selected', () => {
    render(<IssuesList {...defaultProps} selectedProjects={[]} />);
    
    expect(screen.queryByTestId('issue-row-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('issue-row-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('issue-row-3')).not.toBeInTheDocument();

    // Prompt to choose projects is shown
    expect(screen.getByText('Wählen Sie ein Projekt aus, um Issues anzuzeigen.')).toBeInTheDocument();
  });

  // Note: Due date fallback is covered in a separate test that uses the real IssueRow

  test('displays issue count for filtered results', () => {
    render(<IssuesList {...defaultProps} />);
    
    expect(screen.getByText(/Issue Übersicht \(2 Issues\)/)).toBeInTheDocument();
  });

  test('displays correct count when all issues shown', () => {
    render(<IssuesList {...defaultProps} selectedProjects={['1', '2']} />);
    
    expect(screen.getByText(/Issue Übersicht \(3 Issues\)/)).toBeInTheDocument();
  });

  test('displays zero count when no issues match filter', () => {
    render(<IssuesList {...defaultProps} selectedProjects={['nonexistent']} />);
    
    expect(screen.getByText(/Issue Übersicht \(0 Issues\)/)).toBeInTheDocument();
  });

  test('passes correct props to IssueRow components', async () => {
    const user = userEvent.setup();
    render(<IssuesList {...defaultProps} />);
    
    // Test toggle functionality
    const toggleButton = screen.getAllByText('Toggle')[0];
    await user.click(toggleButton);
    
    expect(mockOnToggleIssue).toHaveBeenCalledWith('1');
    
    // Test delete functionality
    const deleteButton = screen.getAllByText('Delete')[0];
    await user.click(deleteButton);
    
    expect(mockOnDeleteIssue).toHaveBeenCalledWith('1');
  });

  test('renders empty table when no issues provided', () => {
    render(<IssuesList {...defaultProps} issues={[]} />);
    
    expect(screen.getByText(/Issue Übersicht \(0 Issues\)/)).toBeInTheDocument();
    expect(screen.queryByTestId(/issue-row/)).not.toBeInTheDocument();
  });

  test('has correct table structure and styling', () => {
    render(<IssuesList {...defaultProps} />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveClass('table', 'table-dark', 'table-hover');
  });

  test('displays list icon in header', () => {
    render(<IssuesList {...defaultProps} />);
    
    const icon = screen.getByAltText('Liste');
    expect(icon).toBeInTheDocument();
  });

  test('handles empty projects list', () => {
    render(<IssuesList {...defaultProps} projects={[]} />);
    
    expect(screen.getByText(/Issue Übersicht \(2 Issues\)/)).toBeInTheDocument();
    // Should still render filtered issues
    expect(screen.getByTestId('issue-row-1')).toBeInTheDocument();
  });
});
