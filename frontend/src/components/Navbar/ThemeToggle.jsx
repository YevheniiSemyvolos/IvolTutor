import React, { useState } from 'react';
import useTheme from '../../hooks/useTheme';
import './ThemeToggle.css';

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
    <div className="theme-toggle-container">
      {/* 1. Головна кнопка */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-toggle-button"
        aria-label="Theme selector"
        aria-expanded={isOpen}
      >
        <span className="theme-toggle-icon">{currentOption.icon}</span>
        <span className="theme-toggle-label">{currentOption.label}</span>
        {/* Стрілочка вниз */}
        <svg 
          className={`theme-toggle-arrow ${isOpen ? 'open' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 3. Випадаюче меню */}
      {isOpen && (
        <div className="theme-toggle-dropdown">
          <ul className="theme-toggle-menu-list">
            {options.map((opt) => (
              <li key={opt.value} className="theme-toggle-menu-item">
                <button
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`theme-toggle-menu-button ${theme === opt.value ? 'active' : ''}`}
                >
                  <span className="theme-toggle-menu-icon">{opt.icon}</span>
                  <span className="theme-toggle-menu-label">{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}