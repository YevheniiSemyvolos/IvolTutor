import React, { useState } from 'react';
import useTheme from '../../../hooks/useTheme';
import styles from './ThemeToggle.module.css';

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
    <div className={styles.container}>
      {/* 1. Головна кнопка */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.button}
        aria-label="Theme selector"
        aria-expanded={isOpen}
      >
        <span className={styles.icon}>{currentOption.icon}</span>
        <span className={styles.label}>{currentOption.label}</span>
        {/* Стрілочка вниз */}
        <svg 
          className={`${styles.arrow} ${isOpen ? styles.open : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 3. Випадаюче меню */}
      {isOpen && (
        <div className={styles.dropdown}>
          <ul className={styles.menu_list}>
            {options.map((opt) => (
              <li key={opt.value} className={styles.menu_item}>
                <button
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`${styles.menu_button} ${theme === opt.value ? styles.active : ''}`}
                >
                  <span className={styles.menu_icon}>{opt.icon}</span>
                  <span className={styles.menu_label}>{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}