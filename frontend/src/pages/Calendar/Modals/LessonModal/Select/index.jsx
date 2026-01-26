import { useState, useRef, useEffect } from 'react';
import styles from './Select.module.css';

export default function Select({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Знаходимо обрану опцію, щоб показати її назву
  const selectedOption = options.find(opt => opt.value === value);

  // Логіка "Клік поза елементом" (Click Outside)
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Поле (Trigger) */}
      <div 
        className={`${styles.trigger} ${isOpen ? styles.open : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!selectedOption ? styles.placeholder : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {/* SVG Стрілка */}
        <svg 
          className={styles.arrow} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Випадаючий список */}
      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <div 
              key={option.value} 
              className={`${styles.option} ${option.value === value ? styles.selected : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
          {/* Якщо список порожній */}
           {options.length === 0 && (
             <div className={`${styles.option} ${styles.empty}`}>
               Список порожній
             </div>
           )}
        </div>
      )}
    </div>
  );
}