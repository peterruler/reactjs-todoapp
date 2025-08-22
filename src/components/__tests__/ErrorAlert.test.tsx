import { render, screen, fireEvent } from '@testing-library/react';
import ErrorAlert from '../ErrorAlert';

describe('ErrorAlert Component', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  test('renders error message', () => {
    const errorMessage = 'Test error message';
    render(<ErrorAlert error={errorMessage} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('has correct bootstrap classes', () => {
    const errorMessage = 'Test error';
    render(<ErrorAlert error={errorMessage} onDismiss={mockOnDismiss} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert', 'alert-danger', 'alert-dismissible', 'fade', 'show');
  });

  test('calls onDismiss when close button is clicked', () => {
    const errorMessage = 'Test error';
    render(<ErrorAlert error={errorMessage} onDismiss={mockOnDismiss} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  test('displays error icon', () => {
    const errorMessage = 'Test error';
    render(<ErrorAlert error={errorMessage} onDismiss={mockOnDismiss} />);
    
    const icon = document.querySelector('.fas.fa-exclamation-triangle');
    expect(icon).toBeInTheDocument();
  });
});
