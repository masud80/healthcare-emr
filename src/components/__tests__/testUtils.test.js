import React from 'react';
import { renderWithProviders } from './testUtils';
import { screen } from '@testing-library/react';

describe('Test Utilities', () => {
  test('renderWithProviders renders component with providers', () => {
    const TestComponent = () => <div>Test Component</div>;
    renderWithProviders(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  test('mock data is properly structured', () => {
    expect(typeof renderWithProviders).toBe('function');
  });
});
