import styles from './HamburgerButton.module.css';

export default function HamburgerButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.hamburger_menu} ${isOpen ? styles.active : ''}`}
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <span className={styles.hamburger_line}></span>
      <span className={styles.hamburger_line}></span>
      <span className={styles.hamburger_line}></span>
    </button>
  );
}