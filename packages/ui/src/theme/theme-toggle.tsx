import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getLabel = () => {
    if (theme === 'system') return `System Theme (${resolvedTheme})`;
    return `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`;
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label="Toggle theme"
      title={`Current: ${getLabel()}. Click to cycle.`}
      className={`relative inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-w-[44px] min-h-[44px] text-slate-700 dark:text-slate-200 cursor-pointer ${className}`}
    >
      {theme === 'system' ? (
        <Laptop className="h-5 w-5 text-emerald-500" aria-hidden="true" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="h-5 w-5 text-emerald-400" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5 text-emerald-600" aria-hidden="true" />
      )}
      <span className="sr-only">Toggle theme, currently {getLabel()}</span>
    </button>
  );
}
