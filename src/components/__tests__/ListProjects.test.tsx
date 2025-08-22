import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListProjects from '../ListProjects';
import type { Project } from '../../services/api';

describe('ListProjects Component', () => {
  const mockOnProjectSelectionChange = jest.fn();
  const mockProjects: Project[] = [
    { id: '1', name: 'Project 1' },
    { id: '2', name: 'Project 2' },
    { id: '3', name: 'Project 3' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders project selection label and select element', () => {
    render(
      <ListProjects 
        projects={mockProjects} 
        selectedProjects={[]} 
        onProjectSelectionChange={mockOnProjectSelectionChange} 
      />
    );
    
    expect(screen.getByLabelText('Projekte auswählen:')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('renders all projects as options', () => {
    render(
      <ListProjects 
        projects={mockProjects} 
        selectedProjects={[]} 
        onProjectSelectionChange={mockOnProjectSelectionChange} 
      />
    );
    
    expect(screen.getByRole('option', { name: 'Project 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Project 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Project 3' })).toBeInTheDocument();
  });

  test('shows selected projects', () => {
    render(
      <ListProjects 
        projects={mockProjects} 
        selectedProjects={['1', '3']} 
        onProjectSelectionChange={mockOnProjectSelectionChange} 
      />
    );
    
    const option1 = screen.getByRole('option', { name: 'Project 1' }) as HTMLOptionElement;
    const option2 = screen.getByRole('option', { name: 'Project 2' }) as HTMLOptionElement;
    const option3 = screen.getByRole('option', { name: 'Project 3' }) as HTMLOptionElement;
    
    expect(option1.selected).toBe(true);
    expect(option2.selected).toBe(false);
    expect(option3.selected).toBe(true);
  });

  test('calls onProjectSelectionChange when selection changes', async () => {
    const user = userEvent.setup();
    render(
      <ListProjects 
        projects={mockProjects} 
        selectedProjects={[]} 
        onProjectSelectionChange={mockOnProjectSelectionChange} 
      />
    );
    
    const selectElement = screen.getByRole('listbox');
    const option1 = screen.getByRole('option', { name: 'Project 1' });
    
    await user.selectOptions(selectElement, option1);
    
    expect(mockOnProjectSelectionChange).toHaveBeenCalledWith(['1']);
  });

  test('handles multiple project selection', async () => {
    render(
      <ListProjects 
        projects={mockProjects} 
        selectedProjects={[]} 
        onProjectSelectionChange={mockOnProjectSelectionChange} 
      />
    );
    
    const selectElement = screen.getByRole('listbox') as HTMLSelectElement;
    
    // Manually set the value to simulate multiple selection
    selectElement.value = '';
    
    // Create a fake event with multiple selected options
    const option1 = screen.getByRole('option', { name: 'Project 1' });
    const option3 = screen.getByRole('option', { name: 'Project 3' });
    
    // Set the selected property directly
    (option1 as HTMLOptionElement).selected = true;
    (option3 as HTMLOptionElement).selected = true;
    
    // Fire the change event
    fireEvent.change(selectElement);
    
    // Check that the callback was called
    expect(mockOnProjectSelectionChange).toHaveBeenCalled();
  });

  test('renders empty list when no projects provided', () => {
    render(
      <ListProjects 
        projects={[]} 
        selectedProjects={[]} 
        onProjectSelectionChange={mockOnProjectSelectionChange} 
      />
    );
    
    const selectElement = screen.getByRole('listbox');
    expect(selectElement.children).toHaveLength(0);
  });

  test('has correct styling classes', () => {
    render(
      <ListProjects 
        projects={mockProjects} 
        selectedProjects={[]} 
        onProjectSelectionChange={mockOnProjectSelectionChange} 
      />
    );
    
    const selectElement = screen.getByRole('listbox');
    expect(selectElement).toHaveClass('form-select', 'bg-dark', 'text-light', 'border-secondary');
    expect(selectElement).toHaveAttribute('multiple');
    expect(selectElement).toHaveStyle({ height: '120px' });
  });

  test('displays selection count information', () => {
    render(
      <ListProjects 
        projects={mockProjects} 
        selectedProjects={['1', '2']} 
        onProjectSelectionChange={mockOnProjectSelectionChange} 
      />
    );
    
    expect(screen.getByText('2 Projekte ausgewählt')).toBeInTheDocument();
  });
});
