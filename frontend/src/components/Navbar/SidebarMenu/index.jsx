import styles from './SidebarMenu.module.css';

export default function SidebarMenu({ isOpen, onOpenHelp }) {
  return (
    <div 
      className={styles.container} 
      data-open={isOpen}
    >
      <nav className={styles.nav}>
        {/* ГРУПА 1: Основне меню */}
        <div className={styles.top}>
          <MenuItem icon="📅" label="Календар" />
          <MenuItem icon="📓" label="Журнал" />
          <MenuItem icon="👥" label="Студенти" />
        </div>

        {/* ГРУПА 2: Службове меню */}
        <div className={styles.group_bottom}>
          <div className={styles.separator}></div>
          <MenuItem icon="⚙️" label="Налаштування" />
          <MenuItem icon="❓" label="Допомога" onClick={onOpenHelp}/>
        </div>
      </nav>
    </div>
  );
}

// Маленький допоміжний компонент для пункту меню
function MenuItem({ icon, label, onClick }) {
  return (
    <div className={styles.item} onClick={onClick}>
      <span className={styles.icon}>{icon}</span> {label}
    </div>
  );
}