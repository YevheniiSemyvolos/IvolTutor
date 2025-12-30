import styles from './Help.module.css';

const HelpPage = () => {
  // useState видалено, бо ховер тепер у CSS
  
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Потрібна допомога?</h1>
        
        <p className={styles.paragraph}>
          Якщо у вас виникли питання, технічні проблеми або пропозиції, будь ласка, напишіть нам на пошту.
        </p>

        <a
          href="mailto:obukhivska.yuliia@ortweinschule.at"
          className={styles.email_link}
        >
          obukhivska.yuliia@ortweinschule.at
        </a>

        <p className={`${styles.paragraph} ${styles.footer_note}`}>
          Ми відповідаємо протягом 24 годин.
        </p>
      </div>
    </div>
  );
};

export default HelpPage;