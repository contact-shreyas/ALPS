import { useState } from 'react';
import { useTheme } from '@/lib/theme-context';
import { SunIcon, MoonIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'light', name: 'Light', icon: SunIcon },
    { id: 'dark', name: 'Dark', icon: MoonIcon },
    { id: 'satellite', name: 'Satellite', icon: GlobeAltIcon },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        {themes.map((t) => {
          const Icon = t.icon;
          if (t.id === theme) {
            return <Icon key={t.id} className="w-5 h-5 text-gray-700 dark:text-gray-300" />;
          }
          return null;
        })}
        <span className="text-gray-700 dark:text-gray-300">Theme</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id as any);
                    setIsOpen(false);
                  }}
                  className={`
                    ${theme === t.id ? 'bg-gray-100 dark:bg-gray-700' : ''}
                    flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-700 dark:text-gray-300 transition-colors duration-200
                  `}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}