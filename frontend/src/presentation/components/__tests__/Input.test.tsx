import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
    it('renders input with label', () => {
        render(<Input label="Username" id="username" />);
        const label = screen.getByLabelText(/username/i);
        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('id', 'username');
    });

    it('renders input without label', () => {
        render(<Input placeholder="No label" />);
        const input = screen.getByPlaceholderText(/no label/i);
        expect(input).toBeInTheDocument();
    });

    it('handles change events', () => {
        const handleChange = vi.fn();
        render(<Input onChange={handleChange} placeholder="Type here" />);
        const input = screen.getByPlaceholderText(/type here/i);
        fireEvent.change(input, { target: { value: 'test value' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('displays error message', () => {
        render(<Input error="Invalid input" />);
        const error = screen.getByText(/invalid input/i);
        expect(error).toBeInTheDocument();
        expect(error).toHaveClass('text-red-600');
    });

    it('applies error styles to input', () => {
        render(<Input error="Error" placeholder="Error Input" />);
        const input = screen.getByPlaceholderText(/error input/i);
        expect(input).toHaveClass('border-red-500');
    });
});
