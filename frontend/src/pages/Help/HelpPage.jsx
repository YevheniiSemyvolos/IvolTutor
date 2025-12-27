import React, { useState } from 'react';

const HelpPage = () => {
  // Стан для обробки ховеру (наведення) на кнопку
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    help_container: {
      background: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      margin: 0,
      color: '#1f2937',
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
     
      textAlign: 'center',
      maxWidth: '400px',
      width: '90%',
    },
    heading: {
      marginTop: 0,
      color: '#2563EB',
    },
    paragraph: {
      lineHeight: 1.6,
      color: '#4b5563',
    },
    emailLink: {
      display: 'inline-block',
      marginTop: '20px',
      padding: '12px 24px',
      backgroundColor: isHovered ? '#dbeafe' : '#eff6ff', // Зміна кольору при наведенні
      color: '#2563EB',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold',
      transition: 'background 0.2s',
      cursor: 'pointer',
    },
    footerNote: {
      marginTop: '30px',
      fontSize: '0.9em',
    },
  };

  return (
    <div style={styles.help_container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Потрібна допомога?</h1>
        <p style={styles.paragraph}>
          Якщо у вас виникли питання, технічні проблеми або пропозиції, будь ласка, напишіть нам на пошту.
        </p>

        <a
          href="mailto:obukhivska.yuliia@ortweinschule.at"
          style={styles.emailLink}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          obukhivska.yuliia@ortweinschule.at
        </a>

        <p style={{ ...styles.paragraph, ...styles.footerNote }}>
          Ми відповідаємо протягом 24 годин.
        </p>
      </div>
    </div>
  );
};

export default HelpPage;