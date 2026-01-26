import { Link } from 'react-router-dom';

import styles from './SidebarMenu.module.css';

export default function SidebarMenu({ isOpen, onClose }) {
  return (
    <div 
      className={styles.container} 
      data-open={isOpen}
    >
      <nav className={styles.nav}>
        {/* ГРУПА 1: Основне меню */}
        <div className={styles.group_top}>
          <MenuItem icon="📅" label="Календар" link="/calendar" onClick={onClose}/>
          <MenuItem icon="📓" label="Журнал" link="/journal" onClick={onClose}/>
          <MenuItem icon="👥" label="Студенти" link="/students" onClick={onClose}/>
        </div>

        {/* ГРУПА 2: Службове меню */}
        <div className={styles.group_bottom}>
          <div className={styles.separator}></div>
          <MenuItem icon="⚙️" label="Налаштування" link="/setting" onClick={onClose}/>
          <MenuItem icon="❓" label="Допомога" link="/help" onClick={onClose}/>
          </div>
      </nav>
    </div>
  );
}

// Маленький допоміжний компонент для пункту меню
function MenuItem({ icon, label, link, onClick }) {
  return (
    <Link 
      to={link} 
      onClick={onClick}
      style={{ textDecoration: 'none' }}
    >
      <div className={styles.item}>
        <span className={styles.icon}>{icon}</span> {label}
      </div>
    </Link>
  );
}