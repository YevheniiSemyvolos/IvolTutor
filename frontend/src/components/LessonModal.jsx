import React, { useState, useEffect } from 'react';
import './LessonModal.css'; // Стилі залишаються тими ж

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

  // ТУТ ЗМІНА: Ми просто повертаємо div, без createPortal
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
          Новий урок
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Студент</label>
            <select 
              className="form-select"
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

          <div className="form-group">
            <label className="form-label">Тема</label>
            <input 
              type="text" 
              className="form-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Наприклад: Тригонометрія"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Скасувати
            </button>
            <button type="submit" className="btn btn-save">
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}