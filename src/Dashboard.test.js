import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { AuthProvider } from './AuthContext';
import React from 'react';

test('Dashboard renders without crashing', () => {
  render(
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});
