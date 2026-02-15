import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsPage } from './Settings';
import { describe, it, expect, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';

// Note: We are NOT mocking api.ts here, we want real network calls.

// Mock ResizeObserver
beforeEach(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const renderWithMantine = (component: React.ReactNode) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('SettingsPage Integration', () => {
    // Basic existence check to ensure environment is reachable
    it('can fetch settings from real backend', async () => {
        renderWithMantine(<SettingsPage />);
        
        // Wait for potential network error or success
        // If backend is not running, this will likely show the error notification
        // If backend is running, it should show content
        
        // We look for a known element that appears only after loading or defaults
        // Since initial state is empty arrays, we might verify that we DON'T see error
        await waitFor(() => {
            const errorNotification = screen.queryByText(/Failed to load settings/i);
            expect(errorNotification).not.toBeInTheDocument();
        }, { timeout: 5000 });
        
        // If we have default settings from backend, we might verify them here.
        // For now, just ensuring it doesn't crash or error immediately is a good start.
        expect(screen.getByText('Daily Work Hours')).toBeInTheDocument();
    });

    it('can save settings to real backend', async () => {
        renderWithMantine(<SettingsPage />);
        
        // Wait for load
        await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);

        await waitFor(() => {
             const successNotification = screen.queryByText(/Settings saved successfully/i);
             // If backend is down, we might see failure
             // If backend is up, success
             // We assert success for the "happy path integration test"
             expect(successNotification).toBeInTheDocument();
        }, { timeout: 5000 });
    });
});
