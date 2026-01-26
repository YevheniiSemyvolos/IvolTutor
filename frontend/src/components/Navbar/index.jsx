import { useState } from 'react';
import styles from './Navbar.module.css';
import { useAuth } from '../../contexts/AuthContext';

import ThemeToggle from './ThemeToggle';
import HamburgerButton from './HamburgerButton';
import SidebarMenu from './SidebarMenu';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const { user, logout } = useAuth();
  
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    setShowAccountMenu(false);
  };

  const getInitial = () => {
    if (!user?.name) return 'A';
    return user.name.charAt(0).toUpperCase();
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
          <div className={styles.accountContainer}>
            <button
              type="button"
              className={styles.account_button}
              aria-label="Account menu"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            >
              <span className={styles.account_initial}>{getInitial()}</span>
            </button>
            
            {showAccountMenu && (
              <div className={styles.accountMenu}>
                <div className={styles.accountMenuHeader}>
                  {user?.name && <div className={styles.userName}>{user.name}</div>}
                  {user?.email && <div className={styles.userEmail}>{user.email}</div>}
                </div>
                <button
                  className={styles.logoutButton}
                  onClick={handleLogout}
                >
                  Вихід
                </button>
              </div>
            )}
          </div>
        </div>

        <SidebarMenu isOpen={isMenuOpen} onClose={closeMenu}/>
      </header>
    </>
  );
}