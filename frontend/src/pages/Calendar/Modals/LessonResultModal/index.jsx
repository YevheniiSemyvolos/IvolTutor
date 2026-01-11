import React, { useState } from 'react';
import axios from 'axios';
import styles from './LessonResultModal.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LessonResultModal({ isOpen, onClose, onSuccess, lessonId, studentTelegram }) {
  const [materialFile, setMaterialFile] = useState(null);
  const [homeworkFile, setHomeworkFile] = useState(null);
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

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
        const formData = new FormData();
        if (materialFile) formData.append('files', materialFile);
        if (homeworkFile) formData.append('files', homeworkFile);

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
    <div className={styles.overlay}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.form_title}>Фіксація результатів уроку</h2>

        {errorMsg && (
          <div className={styles.error}>
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
              className={`${styles.detailValue} ${styles.tg_link}`}
            >
              {studentTelegram}
            </a>
          ) : (
            <span className={styles.detailValue}>-</span>
          )}
        </div>

        <div className={styles.form_group}>
          <label className={styles.form_label}>Тема уроку</label>
          <input
            type="text"
            className={styles.form_input}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Наприклад: Тригонометрія"
          />
        </div>

        <div className={styles.form_group}>
          <label className={styles.form_label}>Матеріали до уроку</label>
          <input
            type="file"
            className={styles.form_input}
            onChange={handleMaterialChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
          />
          {materialFile && (
            <p className={styles.file_name}>✓ {materialFile.name}</p>
          )}
        </div>

        <div className={styles.form_group}>
          <label className={styles.form_label}>Домашнє завдання</label>
          <input
            type="file"
            className={styles.form_input}
            onChange={handleHomeworkChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
          />
          {homeworkFile && (
            <p className={styles.file_name}>✓ {homeworkFile.name}</p>
          )}
        </div>

        <div className={styles.btns}>
          <button
            type="button"
            onClick={onClose}
            className={`${styles.btn} ${styles.btn_cancel}`}
            disabled={isLoading}
          >
            Закрити
          </button>
          <button
            type="button"
            onClick={uploadFiles}
            className={`${styles.btn} ${styles.btn_save}`}
            disabled={isLoading}
          >
            {isLoading ? 'Завантаження...' : 'Підтвердити'}
          </button>
        </div>
      </div>
    </div>
  );
}
