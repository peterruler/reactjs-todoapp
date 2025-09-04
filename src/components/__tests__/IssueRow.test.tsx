import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IssueRow from '../IssueRow';
import type { Issue } from '../../services/api';

describe('IssueRow Component', () => {
  const mockOnToggleIssue = jest.fn();
  const mockOnDeleteIssue = jest.fn();
  const mockGetProjectName = jest.fn();
  const mockFormatDate = jest.fn();

  const mockIssue: Issue = {
    id: '1',
    title: 'Test Issue',
    priority: '1', // Numeric string for high priority
    dueDate: '2024-12-31',
    done: false,
    projectId: 'project1'
  };

  const defaultProps = {
    issue: mockIssue,
    getProjectName: mockGetProjectName,
    formatDate: mockFormatDate,
    maxProjectNameLength: 100,
    maxPriorityBadgeLength: 80,
    maxDueDateBadgeLength: 120,
    onToggleIssue: mockOnToggleIssue,
    onDeleteIssue: mockOnDeleteIssue
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProjectName.mockReturnValue('Test Project');
    mockFormatDate.mockReturnValue('31.12.2024');
  });

  test('renders issue information correctly', () => {
    render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} />
        </tbody>
      </table>
    );
    
    expect(screen.getByText('Test Issue')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('🔴 Hoch')).toBeInTheDocument();
    expect(screen.getByText('31.12.2024')).toBeInTheDocument();
  });

  test('checkbox reflects done status', () => {
    const doneIssue = { ...mockIssue, done: true };
    
    render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} issue={doneIssue} />
        </tbody>
      </table>
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('checkbox calls onToggleIssue when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} />
        </tbody>
      </table>
    );
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockOnToggleIssue).toHaveBeenCalledWith('1');
  });

  test('delete button calls onDeleteIssue when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} />
        </tbody>
      </table>
    );
    
    const deleteButton = screen.getByRole('button', { name: /löschen/i });
    await user.click(deleteButton);
    
    expect(mockOnDeleteIssue).toHaveBeenCalledWith('1');
  });

  test('applies success styling for completed issues', () => {
    const doneIssue = { ...mockIssue, done: true };
    
    const { container } = render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} issue={doneIssue} />
        </tbody>
      </table>
    );
    
    const row = container.querySelector('tr');
    expect(row).toHaveClass('table-success', 'bg-opacity-25');
  });

  test('does not apply success styling for incomplete issues', () => {
    const { container } = render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} />
        </tbody>
      </table>
    );
    
    const row = container.querySelector('tr');
    expect(row).not.toHaveClass('table-success', 'bg-opacity-25');
  });

  test('displays correct priority badge color', () => {
    render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} />
        </tbody>
      </table>
    );
    
    const priorityBadge = screen.getByText('🔴 Hoch');
    expect(priorityBadge).toHaveClass('badge', 'bg-danger');
  });

  test('handles different priority levels', () => {
    const lowPriorityIssue = { ...mockIssue, priority: '3' }; // Low priority
    
    const { rerender } = render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} issue={lowPriorityIssue} />
        </tbody>
      </table>
    );
    
    expect(screen.getByText('🟢 Niedrig')).toHaveClass('badge', 'bg-success');
    
    const mediumPriorityIssue = { ...mockIssue, priority: '2' }; // Medium priority
    rerender(
      <table>
        <tbody>
          <IssueRow {...defaultProps} issue={mediumPriorityIssue} />
        </tbody>
      </table>
    );
    
    expect(screen.getByText('🟡 Mittel')).toHaveClass('badge', 'bg-warning');
  });

  test('calls getProjectName with correct projectId', () => {
    render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} />
        </tbody>
      </table>
    );
    
    expect(mockGetProjectName).toHaveBeenCalledWith('project1');
  });

  test('calls formatDate with correct date', () => {
    render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} />
        </tbody>
      </table>
    );
    
    expect(mockFormatDate).toHaveBeenCalledWith('2024-12-31');
  });

  test('applies correct badge widths', () => {
    render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} />
        </tbody>
      </table>
    );
    
    const projectBadge = screen.getByText('Test Project');
    const priorityBadge = screen.getByText('🔴 Hoch');
    const dueDateBadge = screen.getByText('31.12.2024');
    
    expect(projectBadge).toHaveStyle({ minWidth: '100px' });
    expect(priorityBadge).toHaveStyle({ minWidth: '80px' });
    expect(dueDateBadge).toHaveStyle({ minWidth: '120px' });
  });

  test('renders fallback when no due date', () => {
    const issueNoDate = { ...mockIssue, dueDate: '' };
    
    render(
      <table>
        <tbody>
          <IssueRow {...defaultProps} issue={issueNoDate} />
        </tbody>
      </table>
    );
    
    expect(screen.getByText('Kein Datum')).toBeInTheDocument();
  });
});
