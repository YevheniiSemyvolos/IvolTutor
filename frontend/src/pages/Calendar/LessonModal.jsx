import { useState, useEffect } from 'react';
import styles from './LessonModal.module.css';

export default function LessonModal({ isOpen, onClose, onSubmit, students }) {
  const [studentId, setStudentId] = useState('');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStudentId('');
      setTopic('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ student_id: studentId, topic });
  };

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
          Новий урок
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.form_group}>
            <label className={styles.form_label}>Студент</label>
            <select 
              className={styles.form_select}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            >
              <option value="">Оберіть студента...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div className={styles.form_group}>
            <label className={styles.form_label}>Тема</label>
            <input 
              type="text" 
              className={styles.form_input}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Наприклад: Тригонометрія"
            />
          </div>

          <div className={styles.modal_actions}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btn_cancel}`}>
              Скасувати
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btn_save}`}>
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}