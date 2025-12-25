import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
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
          
          {/* ГРУПА 1: Основне меню (Зверху) */}
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

          {/* ГРУПА 2: Службове меню (Внизу) */}
          <div className="menu-group-bottom">
            <div className="menu-separator"></div>
            
            <div className="menu-item">
              <span className="menu-icon">⚙️</span> Налаштування
            </div>

            {/* Посилання на Допомогу (відкриває нову вкладку) */}
            <a 
              href="/help.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="menu-item"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="menu-icon">❓</span> Допомога
            </a>

          </div>

        </nav>
      </div>

    </header>
  );
}