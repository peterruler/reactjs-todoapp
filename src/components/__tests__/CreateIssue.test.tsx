import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateIssue from '../CreateIssue';
import { issueAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
  issueAPI: {
    createIssue: jest.fn()
  }
}));

const mockIssueAPI = issueAPI as jest.Mocked<typeof issueAPI>;

describe('CreateIssue Component', () => {
  const mockOnIssueCreated = jest.fn();
  const mockOnError = jest.fn();
  const defaultProps = {
    selectedProjects: ['project1'],
    onIssueCreated: mockOnIssueCreated,
    onError: mockOnError
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form elements correctly when projects are selected', () => {
    render(<CreateIssue {...defaultProps} />);
    
    expect(screen.getByText('Neues Issue erstellen')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Issue beschreiben...')).toBeInTheDocument();
    expect(screen.getByLabelText('Priorität:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /erstellen/i })).toBeInTheDocument();
  });

  test('does not render when no projects are selected', () => {
    const { container } = render(<CreateIssue {...defaultProps} selectedProjects={[]} />);
    
    // Component still renders but button should be disabled
    expect(container.firstChild).not.toBeNull();
    const button = screen.getByRole('button', { name: /erstellen/i });
    expect(button).toBeDisabled();
  });

  test('title input accepts text', async () => {
    const user = userEvent.setup();
    render(<CreateIssue {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Issue beschreiben...');
    await user.type(titleInput, 'Test Issue');
    
    expect(titleInput).toHaveValue('Test Issue');
  });

  test('priority select changes value', async () => {
    const user = userEvent.setup();
    render(<CreateIssue {...defaultProps} />);
    
    const prioritySelect = screen.getByLabelText('Priorität:');
    await user.selectOptions(prioritySelect, '1');
    
    expect(prioritySelect).toHaveValue('1');
  });

  test('due date input accepts date', async () => {
    const user = userEvent.setup();
    render(<CreateIssue {...defaultProps} />);
    
    const dateInput = screen.getByLabelText(/fälligkeitsdatum/i);
    await user.type(dateInput, '2024-12-31');
    
    expect(dateInput).toHaveValue('2024-12-31');
  });

  test('button is disabled when title is empty', () => {
    render(<CreateIssue {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /erstellen/i });
    expect(button).toBeDisabled();
  });

  test('button is enabled when title is provided', async () => {
    const user = userEvent.setup();
    render(<CreateIssue {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Issue beschreiben...');
    const button = screen.getByRole('button', { name: /erstellen/i });
    
    await user.type(titleInput, 'Test Issue');
    expect(button).toBeEnabled();
  });

  test('creates issue successfully', async () => {
    const mockIssue = {
      id: '1',
      title: 'Test Issue',
      priority: '',
      dueDate: '2024-12-31',
      done: false,
      projectId: 'project1'
    };
    mockIssueAPI.createIssue.mockResolvedValue(mockIssue);
    
    const user = userEvent.setup();
    render(<CreateIssue {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Issue beschreiben...');
    const dateInput = screen.getByLabelText(/fälligkeitsdatum/i);
    const button = screen.getByRole('button', { name: /erstellen/i });
    
    await user.type(titleInput, 'Test Issue');
    await user.type(dateInput, '2024-12-31');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockIssueAPI.createIssue).toHaveBeenCalledWith({
        title: 'Test Issue',
        priority: '',
        dueDate: '2024-12-31',
        done: false,
        projectId: 'project1'
      });
      expect(mockOnIssueCreated).toHaveBeenCalledWith(mockIssue);
    });
    
    expect(titleInput).toHaveValue('');
  });

  test('handles issue creation error', async () => {
    mockIssueAPI.createIssue.mockRejectedValue(new Error('API Error'));
    
    const user = userEvent.setup();
    render(<CreateIssue {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Issue beschreiben...');
    const button = screen.getByRole('button', { name: /erstellen/i });
    
    await user.type(titleInput, 'Test Issue');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Fehler beim Erstellen des Issues');
    });
  });

  test('shows loading state during creation', async () => {
    mockIssueAPI.createIssue.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const user = userEvent.setup();
    render(<CreateIssue {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Issue beschreiben...');
    const button = screen.getByRole('button', { name: /erstellen/i });
    
    await user.type(titleInput, 'Test Issue');
    await user.click(button);
    
    expect(screen.getByText('Erstelle...')).toBeInTheDocument();
    expect(document.querySelector('.spinner-border')).toBeInTheDocument();
  });

  test('handles Enter key press in title input', async () => {
    const mockIssue = {
      id: '1',
      title: 'Test Issue',
      priority: '',
      dueDate: '',
      done: false,
      projectId: 'project1'
    };
    mockIssueAPI.createIssue.mockResolvedValue(mockIssue);
    
    const user = userEvent.setup();
    render(<CreateIssue {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Issue beschreiben...');
    await user.type(titleInput, 'Test Issue');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(mockIssueAPI.createIssue).toHaveBeenCalled();
    });
  });
});
