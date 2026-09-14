import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './theme-provider';
import { ThemeToggle } from './theme-toggle';

function TestConsumer() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="active-theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button type="button" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button type="button" onClick={() => setTheme('system')}>
        Set System
      </button>
    </div>
  );
}

describe('Theme Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('throws error when useTheme is called outside ThemeProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useTheme must be used within a ThemeProvider');
    spy.mockRestore();
  });

  it('initializes with default theme and sets root attributes', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('active-theme').textContent).toBe('light');
    expect(screen.getByTestId('resolved-theme').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('switches to dark theme, updates attributes and persists in localStorage', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText('Set Dark'));

    expect(screen.getByTestId('active-theme').textContent).toBe('dark');
    expect(screen.getByTestId('resolved-theme').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('sthanori-theme')).toBe('dark');
  });

  it('resolves system theme based on matchMedia', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider defaultTheme="system">
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('active-theme').textContent).toBe('system');
    expect(screen.getByTestId('resolved-theme').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('renders accessible ThemeToggle and switches themes on interaction', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggleBtn = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggleBtn).toBeDefined();

    // Click cycles light -> dark
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Click cycles dark -> system
    fireEvent.click(toggleBtn);
    expect(localStorage.getItem('sthanori-theme')).toBe('system');
  });
});
