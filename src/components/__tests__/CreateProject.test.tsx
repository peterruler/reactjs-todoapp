import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateProject from '../CreateProject';
import { projectAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
  projectAPI: {
    createProject: jest.fn()
  }
}));

const mockProjectAPI = projectAPI as jest.Mocked<typeof projectAPI>;

describe('CreateProject Component', () => {
  const mockOnProjectCreated = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form elements correctly', () => {
    render(<CreateProject onProjectCreated={mockOnProjectCreated} onError={mockOnError} />);
    
    expect(screen.getByLabelText('Neues Projekt hinzufügen:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Projektname eingeben...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hinzufügen/i })).toBeInTheDocument();
  });

  test('input field accepts text input', async () => {
    const user = userEvent.setup();
    render(<CreateProject onProjectCreated={mockOnProjectCreated} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText('Projektname eingeben...');
    await user.type(input, 'Test Project');
    
    expect(input).toHaveValue('Test Project');
  });

  test('button is disabled when input is empty', () => {
    render(<CreateProject onProjectCreated={mockOnProjectCreated} onError={mockOnError} />);
    
    const button = screen.getByRole('button', { name: /hinzufügen/i });
    expect(button).toBeDisabled();
  });

  test('button is enabled when input has text', async () => {
    const user = userEvent.setup();
    render(<CreateProject onProjectCreated={mockOnProjectCreated} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText('Projektname eingeben...');
    const button = screen.getByRole('button', { name: /hinzufügen/i });
    
    await user.type(input, 'Test Project');
    expect(button).toBeEnabled();
  });

  test('creates project successfully', async () => {
    const mockProject = { id: '1', name: 'Test Project' };
    mockProjectAPI.createProject.mockResolvedValue(mockProject);
    
    const user = userEvent.setup();
    render(<CreateProject onProjectCreated={mockOnProjectCreated} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText('Projektname eingeben...');
    const button = screen.getByRole('button', { name: /hinzufügen/i });
    
    await user.type(input, 'Test Project');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockProjectAPI.createProject).toHaveBeenCalledWith({ name: 'Test Project' });
      expect(mockOnProjectCreated).toHaveBeenCalledWith(mockProject);
    });
    
    expect(input).toHaveValue('');
  });

  test('handles project creation error', async () => {
    mockProjectAPI.createProject.mockRejectedValue(new Error('API Error'));
    
    const user = userEvent.setup();
    render(<CreateProject onProjectCreated={mockOnProjectCreated} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText('Projektname eingeben...');
    const button = screen.getByRole('button', { name: /hinzufügen/i });
    
    await user.type(input, 'Test Project');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Fehler beim Erstellen des Projekts');
    });
  });

  test('shows loading state during creation', async () => {
    mockProjectAPI.createProject.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const user = userEvent.setup();
    render(<CreateProject onProjectCreated={mockOnProjectCreated} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText('Projektname eingeben...');
    const button = screen.getByRole('button', { name: /hinzufügen/i });
    
    await user.type(input, 'Test Project');
    await user.click(button);
    
    expect(screen.getByText('Erstelle...')).toBeInTheDocument();
    expect(document.querySelector('.spinner-border')).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  test('handles Enter key press', async () => {
    const mockProject = { id: '1', name: 'Test Project' };
    mockProjectAPI.createProject.mockResolvedValue(mockProject);
    
    const user = userEvent.setup();
    render(<CreateProject onProjectCreated={mockOnProjectCreated} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText('Projektname eingeben...');
    await user.type(input, 'Test Project');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(mockProjectAPI.createProject).toHaveBeenCalledWith({ name: 'Test Project' });
    });
  });

  test('trims whitespace from input', async () => {
    const mockProject = { id: '1', name: 'Test Project' };
    mockProjectAPI.createProject.mockResolvedValue(mockProject);
    
    const user = userEvent.setup();
    render(<CreateProject onProjectCreated={mockOnProjectCreated} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText('Projektname eingeben...');
    const button = screen.getByRole('button', { name: /hinzufügen/i });
    
    await user.type(input, '  Test Project  ');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockProjectAPI.createProject).toHaveBeenCalledWith({ name: 'Test Project' });
    });
  });
});
