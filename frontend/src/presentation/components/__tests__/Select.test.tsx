import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../Select';

describe('Select Component', () => {
    const options = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
    ];

    it('renders select with options', () => {
        render(<Select label="Choose" id="choose" options={options} />);
        const select = screen.getByLabelText(/choose/i);
        expect(select).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('handles change events', () => {
        const handleChange = vi.fn();
        render(<Select options={options} onChange={handleChange} aria-label="select-test" />);
        const select = screen.getByLabelText('select-test');
        fireEvent.change(select, { target: { value: 'opt2' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect((select as HTMLSelectElement).value).toBe('opt2');
    });

    it('displays error message', () => {
        render(<Select options={options} error="Selection required" />);
        const error = screen.getByText(/selection required/i);
        expect(error).toBeInTheDocument();
    });
});
