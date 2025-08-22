import { render, screen } from '@testing-library/react';
import ChooseProject from '../ChooseProject';

describe('ChooseProject Component', () => {
  test('renders the message when no projects are selected', () => {
    render(<ChooseProject selectedProjects={[]} />);
    
    expect(screen.getByText('Wählen Sie ein oder mehrere Projekte aus, um Issues anzuzeigen und zu erstellen.')).toBeInTheDocument();
  });

  test('has correct structure and styling when no projects selected', () => {
    render(<ChooseProject selectedProjects={[]} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert', 'alert-info');
    
    const row = alert.closest('.row');
    expect(row).toHaveClass('row', 'mb-4');
  });

  test('displays info icon when no projects selected', () => {
    render(<ChooseProject selectedProjects={[]} />);
    
    const icon = document.querySelector('.fas.fa-info-circle');
    expect(icon).toBeInTheDocument();
  });

  test('renders nothing when projects are selected', () => {
    const { container } = render(<ChooseProject selectedProjects={['project1']} />);
    
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when multiple projects are selected', () => {
    const { container } = render(<ChooseProject selectedProjects={['project1', 'project2']} />);
    
    expect(container.firstChild).toBeNull();
  });
});
