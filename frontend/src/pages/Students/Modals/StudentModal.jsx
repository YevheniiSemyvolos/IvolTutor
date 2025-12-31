import React, { useState, useEffect } from 'react';
import styles from './StudentModal.module.css'; // Імпорт стилів

export default function StudentModal({ isOpen, onClose, onSubmit, studentToEdit }) {
  const [formData, setFormData] = useState({
    full_name: '',
    parent_name: '',
    telegram_contact: '',
    default_price: '',
    comment: ''
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        full_name: studentToEdit.full_name || '',
        parent_name: studentToEdit.parent_name || '',
        telegram_contact: studentToEdit.telegram_contact || '',
        default_price: studentToEdit.default_price || 0,
        comment: studentToEdit.comment || ''
      });
    } else {
      setFormData({
        full_name: '',
        parent_name: '',
        telegram_contact: '',
        default_price: '',
        comment: ''
      });
    }
  }, [isOpen, studentToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>
          {studentToEdit ? 'Редагувати студента' : 'Новий студент'}
        </h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>ПІБ Учня</label>
            <input 
              type="text" 
              className={styles.input}
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
              placeholder="Іванов Іван"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ім'я батьків</label>
            <input 
              type="text" 
              className={styles.input}
              value={formData.parent_name}
              onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
              placeholder="Марія Іванівна"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Контакт (Telegram)</label>
            <input 
              type="text" 
              className={styles.input}
              value={formData.telegram_contact}
              onChange={(e) => setFormData({...formData, telegram_contact: e.target.value})}
              placeholder="@username"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Тариф (грн)</label>
            <input 
              type="number" 
              className={styles.input}
              value={formData.default_price}
              onChange={(e) => setFormData({...formData, default_price: Number(e.target.value)})}
              required
            />
            {studentToEdit && (
                <p className={styles.hint}>
                    Зміна вплине лише на нові уроки.
                </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Коментар</label>
            <textarea 
              className={styles.textarea}
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
              Скасувати
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnSave}`}>
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}