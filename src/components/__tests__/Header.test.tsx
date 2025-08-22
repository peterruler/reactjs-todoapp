import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header Component', () => {
  test('renders the header title', () => {
    render(<Header />);
    
    expect(screen.getByText('Issue Tracker')).toBeInTheDocument();
  });

  test('has correct navbar structure', () => {
    render(<Header />);
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('navbar', 'navbar-dark', 'bg-dark');
    
    const container = navbar.querySelector('.container-fluid');
    expect(container).toBeInTheDocument();
  });

  test('displays the bug icon', () => {
    render(<Header />);
    
    const icon = screen.getByAltText('Bug Tracker');
    expect(icon).toBeInTheDocument();
  });

  test('has correct brand link structure', () => {
    render(<Header />);
    
    const brandLink = screen.getByText('Issue Tracker').closest('a');
    expect(brandLink).toHaveClass('navbar-brand');
    expect(brandLink).toHaveAttribute('href', '#');
  });
});
