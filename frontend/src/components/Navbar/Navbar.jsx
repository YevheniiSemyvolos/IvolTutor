import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import HelpPage from './HelpPage'; // !!! 1. Імпортуємо компонент (переконайтеся, що файл називається Help.jsx)
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false); // !!! 2. Стан для відображення вікна допомоги

  // Функція для відкриття допомоги та закриття меню
  const handleOpenHelp = () => {
    setShowHelp(true);
    setIsMenuOpen(false); // Закриваємо мобільне меню
  };

  return (
    <>
      <header className="navbar-container">
        {/* Ліва частина: гамбургер + назва */}
        <div className="navbar-left">
          <button
            type="button"
            className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <h1 className="navbar-title">
            <span className="navbar-title-gradient">Tutor</span> CRM
          </h1>
        </div>

        {/* Права частина */}
        <div className="navbar-right">
          <ThemeToggle />
          <button type="button" className="account-button" aria-label="Account menu">
            <span className="account-initial">A</span>
          </button>
        </div>

        {/* --- ВИПАДАЮЧЕ МЕНЮ --- */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-menu-nav">
            
            {/* ГРУПА 1: Основне меню */}
            <div className="menu-group-top">
              <div className="menu-item">
                <span className="menu-icon">📅</span> Календар
              </div>
              <div className="menu-item">
                <span className="menu-icon">📓</span> Журнал
              </div>
              <div className="menu-item">
                <span className="menu-icon">👥</span> Студенти
              </div>
            </div>

            {/* ГРУПА 2: Службове меню */}
            <div className="menu-group-bottom">
              <div className="menu-separator"></div>
              
              <div className="menu-item">
                <span className="menu-icon">⚙️</span> Налаштування
              </div>

              {/* !!! 3. Змінили <a> на div з onClick */}
              <div 
                className="menu-item" 
                onClick={handleOpenHelp}
                style={{ cursor: 'pointer' }}
              >
                <span className="menu-icon">❓</span> Допомога
              </div>

            </div>

          </nav>
        </div>
      </header>

      {/* !!! 4. Відображення компонента Help поверх сторінки */}
      {showHelp && (
        <div className="help-modal-overlay">
          {/* Кнопка закриття (хрестик) */}
          <button 
            className="close-help-button" 
            onClick={() => setShowHelp(false)}
          >
            ✕
          </button>
          
          {/* Сам компонент допомоги */}
          <div className="help-content-wrapper">
             <HelpPage />
          </div>
        </div>
      )}
    </>
  );
}