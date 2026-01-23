import { render, screen } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import React from 'react';

function TestComponent() {
  return (
    <AuthContext.Consumer>
      {({ isAuthenticated }) => (
        <span>{isAuthenticated ? 'Logged In' : 'Logged Out'}</span>
      )}
    </AuthContext.Consumer>
  );
}

test('AuthProvider defaults to logged out', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  expect(screen.getByText('Logged Out')).toBeInTheDocument();
});
