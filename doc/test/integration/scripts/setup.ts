import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Global setup for integration tests
beforeAll(() => {
    // Setup specific for integration tests if needed
});

afterEach(() => {
    cleanup();
});

afterAll(() => {
    // Cleanup
});
