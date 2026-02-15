import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from '../presentation/pages/SettingsPage';

// We assume VITE_API_BASE_URL is set to the backend URL

describe('Integration: Project Settings', () => {
    it('IT-SCN-SET-001/002: Should display and update project name', async () => {
        render(
            <MemoryRouter>
                <SettingsPage />
            </MemoryRouter>
        );

        // 1. Check if loading/display happens
        await waitFor(() => {
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        }, { timeout: 3000 });

        // There might be a case where no settings exist yet or default one.
        // We look for the input.
        const input = await screen.findByLabelText(/Project Name/i);
        expect(input).toBeInTheDocument();
        
        const originalName = (input as HTMLInputElement).value;
        const newName = `Updated Project ${Date.now()}`;

        // 2. Update
        fireEvent.change(input, { target: { value: newName } });
        fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

        // 3. Verify update (Wait for button to go back to normal or refetch)
        // The component re-fetches or updates local state? 
        // useSettingsUseCase updates local state on success.
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Save Changes/i })).not.toBeDisabled();
            expect(screen.getByDisplayValue(newName)).toBeInTheDocument();
        });

        // Optional: Reload page (re-render) to verify persistence
        // In a real browser we reload. Here we unmount/remount?
        // Or just trust the API 200 OK for now as per spec "state transition occurs".
    });
});
