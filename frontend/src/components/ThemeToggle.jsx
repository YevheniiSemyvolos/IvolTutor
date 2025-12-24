// frontend/src/components/ThemeToggle.jsx
import React, { useState } from 'react';
import useTheme from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Налаштування опцій
  const options = [
    { value: 'light', icon: '☀️', label: 'Світла' },
    { value: 'dark', icon: '🌙', label: 'Темна' },
    { value: 'system', icon: '💻', label: 'Системна' },
  ];

  // Знаходимо активну опцію, щоб показати її на головній кнопці
  const currentOption = options.find(opt => opt.value === theme) || options[2];

  return (
    <div className="relative">
      {/* 1. Головна кнопка (Тіло випадаючого списку) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span>{currentOption.icon}</span>
        <span>{currentOption.label}</span>
        {/* Маленька стрілочка вниз (SVG) */}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 2. Прозорий фон-перехоплювач (щоб закрити меню кліком поза ним) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. Саме випадаюче меню */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <ul className="py-1">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false); // Закриваємо меню після вибору
                  }}
                  className={`
                    w-full text-left px-4 py-2 text-sm flex items-center gap-3
                    ${theme === opt.value 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}