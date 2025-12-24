import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="navbar-container">
      {/* Ліва частина: гамбургер + назва */}
      <div className="navbar-left">
        {/* Кнопка гамбургер-меню */}
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

        {/* Назва */}
        <h1 className="navbar-title">
          <span className="navbar-title-gradient">Tutor</span> CRM
        </h1>
      </div>

      {/* Права частина: перемикач теми + акаунт */}
      <div className="navbar-right">
        <ThemeToggle />

        {/* Кнопка акаунта */}
        <button
          type="button"
          className="account-button"
          aria-label="Account menu"
        >
          <span className="account-initial">A</span>
        </button>
      </div>
    </header>
  );
}


