import { useState, useEffect } from 'react';
import styles from './LessonModal.module.css';
import Select from './Select';

export default function LessonModal({ isOpen, onClose, onSubmit, students }) {
  // --- СТАНИ (STATES) ---
  const [studentId, setStudentId] = useState('');
  const [grade, setGrade] = useState(''); // Клас
  const [date, setDate] = useState(''); // Дата заняття
  const [startTime, setStartTime] = useState(''); // Час початку
  const [endTime, setEndTime] = useState(''); // Час кінця
  const [frequency, setFrequency] = useState('once'); // Частота (за замовчуванням "одноразово")

  //опції для студентів
  const studentOptions = students.map(s => ({
    value: s.id,
    label: s.full_name
  }));

  // опції для частоти
  const frequencyOptions = [
    { value: 'once', label: 'Одноразове заняття' },
    { value: 'weekly', label: 'Щотижня' },
    { value: 'biweekly', label: 'Раз на два тижні' }
  ];
  
  // Скидання форми при відкритті/закритті
  useEffect(() => {
    if (isOpen) {
      setStudentId('');
      setGrade('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setFrequency('once');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Збираємо об'єкт з усіма даними
    onSubmit({
      student_id: studentId,
      grade,
      date,
      start_time: startTime,
      end_time: endTime,
      frequency,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        <h2 className={styles.form_title}>Новий урок</h2>
        
        <form onSubmit={handleSubmit}>
          {/* --- СТУДЕНТ --- */}
          <div className={styles.form_group}>
            <label className={styles.form_label}>Студент</label>
            <Select 
              options={studentOptions}
              value={studentId}
              onChange={(val) => setStudentId(val)}
              placeholder="Оберіть студента..."
            />
          </div>

          {/* --- КЛАС --- */}
          <div className={styles.form_group}>
            <label className={styles.form_label}>Клас</label>
            <input 
              type="number" 
              min="1" 
              max="12"
              className={styles.form_input}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Наприклад: 9"
            />
          </div>

          {/* --- ДАТА --- */}
          <div className={styles.form_group}>
            <label className={styles.form_label}>Дата заняття</label>
            <input 
              type="date" 
              className={styles.form_input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* --- ЧАС (Початок і Кінець) --- */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.form_group} style={{ flex: 1 }}>
              <label className={styles.form_label}>Початок</label>
              <input 
                type="time" 
                className={styles.form_input}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className={styles.form_group} style={{ flex: 1 }}>
              <label className={styles.form_label}>Кінець</label>
              <input 
                type="time" 
                className={styles.form_input}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* --- ЧАСТОТА ЗАНЯТЬ --- */}
          <div className={styles.form_group}>
            <label className={styles.form_label}>Частота занять</label>
            <Select 
              options={frequencyOptions}
              value={frequency}
              onChange={(val) => setFrequency(val)}
              placeholder="Оберіть частоту"
            />
          </div>

          {/* --- КНОПКИ --- */}
          <div className={styles.btns}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btn_cancel}`}>
              Скасувати
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btn_save}`}>
              Створити
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}