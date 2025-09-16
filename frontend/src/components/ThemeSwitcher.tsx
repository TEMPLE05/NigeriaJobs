import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';

interface ThemeSwitcherProps {
  theme: 'light' | 'dark' | 'system';
  setLightTheme: () => void;
  setDarkTheme: () => void;
  setSystemTheme: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme,
  setLightTheme,
  setDarkTheme,
  setSystemTheme
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.theme-switcher')) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleThemeSelect = (themeSetter: () => void) => {
    themeSetter();
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-2 right-2 z-50 theme-switcher">
      {/* Expanded Theme Options */}
      <div
        className={`absolute bottom-5 right-0 flex flex-col gap-1 transition-all duration-300 ease-out ${
          isExpanded
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        {/* Light Theme */}
        <button
          onClick={() => handleThemeSelect(setLightTheme)}
          className={`p-1 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            theme === 'light'
              ? 'bg-yellow-500 text-white shadow-yellow-500/50'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-700'
          }`}
          title="Light mode"
          aria-label="Switch to light mode"
        >
          <Sun className="w-2 h-2" />
        </button>

        {/* Dark Theme */}
        <button
          onClick={() => handleThemeSelect(setDarkTheme)}
          className={`p-1 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            theme === 'dark'
              ? 'bg-blue-600 text-white shadow-blue-600/50'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
          }`}
          title="Dark mode"
          aria-label="Switch to dark mode"
        >
          <Moon className="w-2 h-2" />
        </button>

        {/* System Theme */}
        <button
          onClick={() => handleThemeSelect(setSystemTheme)}
          className={`p-1 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            theme === 'system'
              ? 'bg-purple-600 text-white shadow-purple-600/50'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
          }`}
          title="System preference"
          aria-label="Use system theme preference"
        >
          <Monitor className="w-2 h-2" />
        </button>
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-1 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isExpanded
            ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rotate-45'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
        }`}
        title={isExpanded ? "Close theme menu" : "Change theme"}
        aria-label={isExpanded ? "Close theme menu" : "Open theme menu"}
        aria-expanded={isExpanded}
      >
        <Palette className="w-2 h-2" />
      </button>
    </div>
  );
};