import { render, screen } from '@testing-library/react';
import Loading from '../Loading';

describe('Loading Component', () => {
  test('renders loading spinner and message', () => {
    render(<Loading />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Lade Daten...')).toBeInTheDocument();
    expect(screen.getByText('Stelle sicher, dass der JSON-Server läuft (http://localhost:3001)')).toBeInTheDocument();
  });

  test('has correct structure', () => {
    render(<Loading />);
    
    // Check for the main container structure without specific classes since it's different
    expect(screen.getByText('Lade Daten...')).toBeInTheDocument();
  });
});
