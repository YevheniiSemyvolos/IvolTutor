import React, { useState, useEffect } from 'react';
import axios from 'axios';
import shared from '../shared/Modal.module.css';
import styles from './LessonResultModal.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LessonResultModal({ isOpen, onClose, onSuccess, lessonId, studentTelegram, studentSlug, lessonDate }) {
  const [materialFile, setMaterialFile] = useState(null);
  const [homeworkFile, setHomeworkFile] = useState(null);
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Обробник вставки з clipboard
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Перевіряємо чи це зображення
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();
          
          // Створюємо File об'єкт з blob
          const file = new File([blob], `homework-${Date.now()}.png`, { type: blob.type });
          setHomeworkFile(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMaterialChange = (e) => {
    setMaterialFile(e.target.files[0]);
  };

  const handleHomeworkChange = (e) => {
    setHomeworkFile(e.target.files[0]);
  };

  const uploadFiles = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let materialUrl = null;
      let homeworkUrl = null;

      // Завантажити файли, якщо вони є
      if (materialFile || homeworkFile) {
        // Форматуємо дату у форматі YYYY-MM-DD
        const lessonDateObj = new Date(lessonDate);
        const formattedDate = lessonDateObj.toISOString().split('T')[0];
        
        const formData = new FormData();
        if (materialFile) formData.append('files', materialFile);
        if (homeworkFile) formData.append('files', homeworkFile);
        formData.append('student_slug', studentSlug);
        formData.append('lesson_date', formattedDate);

        const uploadRes = await axios.post(`${API_URL}/upload/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // uploadRes.data очікується як { files: ["path1", "path2"] } або { urls: ["url1", "url2"] }
        const fileUrls = uploadRes.data.files || uploadRes.data.urls || [];
        
        materialUrl = materialFile ? fileUrls[0] : null;
        homeworkUrl = homeworkFile ? fileUrls[fileUrls.length - 1] : null;
      }

      // Оновити урок
      const lessonData = {
        status: 'completed',
        topic: topic,
        material_url: materialUrl,
        homework_url: homeworkUrl
      };

      await axios.patch(`${API_URL}/lessons/${lessonId}`, lessonData);

      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Помилка:', error);
      let errorText = 'Помилка завантаження';
      if (error.response?.data?.detail) {
        // Handle both string and object error messages
        if (typeof error.response.data.detail === 'string') {
          errorText = error.response.data.detail;
        } else if (error.response.data.detail[0]?.msg) {
          errorText = error.response.data.detail[0].msg;
        }
      }
      setErrorMsg(errorText);
      setIsLoading(false);
    }
  };

  return (
    <div className={shared.overlay}>
      <div className={shared.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={shared.title}>Фіксація результатів уроку</h2>

        {errorMsg && (
          <div className={shared.error}>
            {errorMsg}
          </div>
        )}

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>ТГ контакт</span>
          {studentTelegram ? (
            <a 
              href={`https://t.me/${studentTelegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.detailValue} ${styles.tgLink}`}
            >
              {studentTelegram}
            </a>
          ) : (
            <span className={styles.detailValue}>-</span>
          )}
        </div>

        <div className={shared.formGroup}>
          <label className={shared.label}>Тема уроку</label>
          <input
            type="text"
            className={shared.input}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Наприклад: Тригонометрія"
          />
        </div>

        <div className={shared.formGroup}>
          <label className={shared.label}>Матеріали до уроку</label>
          <input
            type="file"
            className={shared.input}
            onChange={handleMaterialChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
          />
          {materialFile && (
            <p className={styles.fileName}>✓ {materialFile.name}</p>
          )}
        </div>

        <div className={shared.formGroup}>
          <label className={shared.label}>Домашнє завдання</label>
          <input
            type="file"
            className={shared.input}
            onChange={handleHomeworkChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
          />
          {homeworkFile && (
            <p className={styles.fileName}>✓ {homeworkFile.name}</p>
          )}
          <p className={styles.pasteHint}>Або натисніть Ctrl+V для вставки фото з буфера обміну</p>
        </div>

        <div className={shared.actions}>
          <button
            type="button"
            onClick={onClose}
            className={shared.btnSecondary}
            disabled={isLoading}
          >
            Закрити
          </button>
          <button
            type="button"
            onClick={uploadFiles}
            className={shared.btnPrimary}
            disabled={isLoading}
          >
            {isLoading ? 'Завантаження...' : 'Підтвердити'}
          </button>
        </div>
      </div>
    </div>
  );
}
