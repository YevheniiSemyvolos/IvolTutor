import React, { useState } from 'react';
import axios from 'axios';
import styles from './PaymentModal.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function PaymentModal({ isOpen, onClose, onSuccess, preselectedStudentId, students }) {
  const [studentId, setStudentId] = useState(preselectedStudentId || '');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentId) {
      setErrorMsg('Виберіть студента');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Введіть суму більше за 0');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await axios.post(`${API_URL}/payments/`, {
        student_id: studentId,
        amount: parseFloat(amount),
        comment: comment || null
      });

      setAmount('');
      setComment('');
      if (!preselectedStudentId) {
        setStudentId('');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Помилка:', error);
      setErrorMsg(error.response?.data?.detail || 'Помилка створення платежу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Внесення платежу</h2>

        {errorMsg && (
          <div className={styles.error}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Студент */}
          {!preselectedStudentId && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Студент</label>
              <select
                className={styles.input}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">Оберіть студента...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Сума */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Сума (грн)</label>
            <input
              type="number"
              step="0.01"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Коментар */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Коментар (опціонально)</label>
            <textarea
              className={styles.textarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Наприклад: оплата за 5 занять"
              rows="3"
            />
          </div>

          {/* Кнопки */}
          <div className={styles.buttons}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.btn} ${styles.btnCancel}`}
              disabled={isLoading}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnSave}`}
              disabled={isLoading}
            >
              {isLoading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
