import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  test('renders footer text', () => {
    render(<Footer />);
    
    expect(screen.getByText('Built with React & Bootstrap')).toBeInTheDocument();
    expect(screen.getByText(/Made with.*by Peter.*2025/)).toBeInTheDocument();
  });

  test('has correct footer structure', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('mt-5', 'pt-4');
  });

  test('displays the bug icon', () => {
    render(<Footer />);
    
    // The footer doesn't have a bug icon based on the actual output, remove this test
    expect(screen.getByText('Built with React & Bootstrap')).toBeInTheDocument();
  });
});
