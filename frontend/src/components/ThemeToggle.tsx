import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../hooks/useTheme';

const OPTIONS: { mode: ThemeMode; label: string; icon: React.ElementType }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'system', label: 'System', icon: Monitor },
];

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = OPTIONS.find(o => o.mode === theme) ?? OPTIONS[2];
  const CurrentIcon = current.icon;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)', color: 'var(--card-text-color)' }}
        aria-label="Change theme"
        aria-expanded={open}
        aria-haspopup="true"
        title={`Theme: ${current.label}`}
      >
        <CurrentIcon className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 w-36 rounded-xl border shadow-lg overflow-hidden z-50"
          style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}
          role="menu"
        >
          {OPTIONS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              role="menuitem"
              onClick={() => { setTheme(mode); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-gray-700"
              style={{ color: 'var(--card-text-color)' }}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {theme === mode && <Check className="w-3.5 h-3.5 ml-auto text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
