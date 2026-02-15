import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
    it('renders primary button by default', () => {
        render(<Button>Click Me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-blue-600');
    });

    it('renders secondary button', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button', { name: /secondary/i });
        expect(button).toHaveClass('bg-gray-200');
    });

    it('renders danger button', () => {
        render(<Button variant="danger">Danger</Button>);
        const button = screen.getByRole('button', { name: /danger/i });
        expect(button).toHaveClass('bg-red-600');
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick} disabled>Disabled</Button>);
        const button = screen.getByRole('button', { name: /disabled/i });
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });
});
