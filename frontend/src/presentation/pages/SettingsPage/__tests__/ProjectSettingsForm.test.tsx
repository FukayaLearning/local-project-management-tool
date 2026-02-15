import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectSettingsForm } from '../ProjectSettingsForm';

describe('ProjectSettingsForm Component', () => {
    const mockSettings = {
        project_name: 'Test Project',
        basic_settings_override: null
    };

    const defaultProps = {
        settings: mockSettings,
        onSave: vi.fn(),
        isLoading: false
    };

    it('renders with initial settings', () => {
        render(<ProjectSettingsForm {...defaultProps} />);
        expect(screen.getByLabelText('Project Name')).toHaveValue('Test Project');
    });

    it('calls onSave with updated values', async () => {
        render(<ProjectSettingsForm {...defaultProps} />);
        
        fireEvent.change(screen.getByLabelText('Project Name'), { target: { value: 'New Name' } });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        
        expect(defaultProps.onSave).toHaveBeenCalledWith({ project_name: 'New Name' });
    });

    it('disables button when loading', () => {
        render(<ProjectSettingsForm {...defaultProps} isLoading={true} />);
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

     it('disables button when project name is empty', () => {
        render(<ProjectSettingsForm {...defaultProps} />);
        fireEvent.change(screen.getByLabelText('Project Name'), { target: { value: '   ' } });
        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });
});
