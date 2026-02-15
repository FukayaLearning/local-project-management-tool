import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsPage } from './Settings';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import * as api from './api';

// Mock the API module
vi.mock('./api');

// Mock ResizeObserver which is used by Mantine but not available in jsdom
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

describe('SettingsPage', () => {
  const mockSettings = {
    basic: {
      task_statuses: [{ id: '1', name: 'Open', is_completed_state: false }],
      task_types: [{ id: '1', name: 'Bug' }],
      assignees: [{ id: '1', name: 'John', productivity_ratio: 1.0, commitment_ratio: 1.0 }],
      daily_work_hours: 8,
      holiday_definition: {
        holiday_csv_url: 'http://example.com/holidays.csv',
        weekend_days: [0, 6],
        extra_holidays: [],
        extra_workdays: [],
      },
    },
    project: {
      project_name: 'Test Project',
      basic_settings_override: null,
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (api.fetchSettings as any).mockResolvedValue(mockSettings);
  });

  it('renders correctly and fetches settings', async () => {
    renderWithMantine(<SettingsPage />);

    expect(api.fetchSettings).toHaveBeenCalledTimes(1);
    
    // Check if initial values are rendered
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Open')).toBeInTheDocument();
      expect(screen.getByDisplayValue('http://example.com/holidays.csv')).toBeInTheDocument();
    });
  });

  it('switches tabs correctly', async () => {
    renderWithMantine(<SettingsPage />);

    // Initially Basic Settings should be visible (conceptually, though Mantine tabs might keep both in DOM with hidden attribute)
    // We can check for existence of elements unique to each tab
    await waitFor(() => expect(screen.getByDisplayValue('Open')).toBeInTheDocument());

    const projectTab = screen.getByText('Project Settings');
    fireEvent.click(projectTab);

    await waitFor(() => expect(screen.getByText('Override Basic Settings')).toBeInTheDocument());
  });

  it('adds items to dynamic lists', async () => {
    renderWithMantine(<SettingsPage />);
    await waitFor(() => expect(screen.getByDisplayValue('Open')).toBeInTheDocument());

    const addTaskStatusBtn = screen.getByText('Add Task Status');
    fireEvent.click(addTaskStatusBtn);

    // Should have 2 items now (original + new empty one)
    // We can check by counting input fields or similar, but simplified check:
    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText('ID'); 
      expect(inputs.length).toBeGreaterThan(1); 
    });
  });

  it('enables override settings', async () => {
    renderWithMantine(<SettingsPage />);
    await waitFor(() => expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument());

    const projectTab = screen.getByText('Project Settings');
    fireEvent.click(projectTab);

    const overrideCheckbox = screen.getByLabelText('Override Basic Settings');
    fireEvent.click(overrideCheckbox);

    // When override is enabled, it copies basic settings. So we should see "Open" (from Task Status) again in the project tab context?
    // The previous implementation used the same ID/Names for inputs, so `getByDisplayValue` might return multiple or simply exist.
    // Let's verify that `setFieldValue` was triggered or the UI updates.
    // Since we are mocking `form`, we are testing the component interaction. 
    // The component clones basic settings.
    
    await waitFor(() => {
       expect(overrideCheckbox).toBeChecked();
    });
  });

  it('saves settings correctly', async () => {
    (api.saveSettings as any).mockResolvedValue(mockSettings);
    renderWithMantine(<SettingsPage />);
    
    await waitFor(() => expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument());

    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.saveSettings).toHaveBeenCalledTimes(1);
      expect(api.saveSettings).toHaveBeenCalledWith(expect.objectContaining({
          project: expect.objectContaining({ project_name: 'Test Project' })
      }));
    });
    
    await waitFor(() => expect(screen.getByText('Settings saved successfully')).toBeInTheDocument());
  });

  it('handles save error', async () => {
    (api.saveSettings as any).mockRejectedValue(new Error('Failed'));
    renderWithMantine(<SettingsPage />);
    
    await waitFor(() => expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument());

    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);

    await waitFor(() => expect(screen.getByText('Failed to save settings')).toBeInTheDocument());
  });
});
