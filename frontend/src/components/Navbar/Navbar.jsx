import { useState } from 'react';
import styles from './Navbar.module.css';

import ThemeToggle from './ThemeToggle';
import HamburgerButton from './HamburgerButton';
import SidebarMenu from './SidebarMenu';
import HelpPage from './HelpPage';

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
      <header className={styles.container}>
        {/* Ліва частина: гамбургер + назва */}
        <div className={styles.left}>
          <HamburgerButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />

          <h1 className={styles.title}>
            <span className={styles.title_gradient}>Tutor</span> CRM
          </h1>
        </div>

        {/* Права частина */}
        <div className={styles.right}>
          <ThemeToggle />
          <button type="button" className={styles.account_button} aria-label="Account menu">
            <span className={styles.account_initial}>A</span>
          </button>
        </div>

        <SidebarMenu isOpen={isMenuOpen} onOpenHelp={handleOpenHelp} />
      </header>

      {showHelp && (
        <div className={styles.help_modal_overlay}>
          {/* Кнопка закриття (хрестик) */}
          <button 
            className={styles.close_help_button} 
            onClick={() => setShowHelp(false)}
          >
            ✕
          </button>
          
          {/* Сам компонент допомоги */}
          <div className={styles.help_content_wrapper}>
             <HelpPage />
          </div>
        </div>
      )}
    </>
  );
}