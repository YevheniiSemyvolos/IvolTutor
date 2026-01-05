import React, { useState, useEffect } from 'react';
import Select from './Select'; 
import styles from './LessonModal.module.css';

export default function LessonModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onStatusChange, 
  students, 
  lessonToEdit, 
  initialDateRange 
}) {
  // --- STATES ---
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [topic, setTopic] = useState('');
  const [frequency, setFrequency] = useState('once'); 

  // --- USE EFFECT: Заповнення даних ---
  useEffect(() => {
    if (isOpen) {
      if (lessonToEdit) {
        // РЕДАГУВАННЯ: Заповнюємо даними з існуючого уроку
        const startObj = new Date(lessonToEdit.start_time);
        const endObj = new Date(lessonToEdit.end_time);

        setStudentId(lessonToEdit.student_id);
        setDate(startObj.toISOString().split('T')[0]); 
        setStartTime(startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        setEndTime(endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        setTopic(lessonToEdit.topic || '');
        setFrequency('once');
      } else {
        // СТВОРЕННЯ: Очищаємо або беремо дані з календаря (initialDateRange)
        setStudentId('');
        setTopic('');
        setFrequency('once');

        if (initialDateRange) {
            // Якщо клікнули в календарі, беремо ці дату і час
            const startObj = new Date(initialDateRange.startStr);
            const endObj = new Date(initialDateRange.endStr);
            
            setDate(startObj.toISOString().split('T')[0]);
            setStartTime(startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
            setEndTime(endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        } else {
            // Якщо просто відкрили кнопку "Новий урок" без виділення часу
            setDate('');
            setStartTime('');
            setEndTime('');
        }
      }
    }
  }, [isOpen, lessonToEdit, initialDateRange]);

  if (!isOpen) return null;

  // --- SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Формуємо ISO рядки
    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    onSubmit({
      student_id: studentId,
      start_time: startDateTime,
      end_time: endDateTime,
      topic: topic,
      status: lessonToEdit ? lessonToEdit.status : 'planned'
    });
  };

  // Опції
  const studentOptions = students.map(s => ({
    value: s.id,
    label: s.full_name
  }));

  const frequencyOptions = [
    { value: 'once', label: 'Одноразове заняття' },
    { value: 'weekly', label: 'Щотижня (тільки цей)' }, 
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        <h2 className={styles.form_title}>
          {lessonToEdit ? 'Редагувати урок' : 'Новий урок'}
        </h2>
        
        {/* Статус (Тільки при редагуванні) */}
        {lessonToEdit && (
          <div style={{marginBottom: '1rem', fontSize: '0.9rem', color: '#374151'}}>
             Статус: <span style={{fontWeight: 'bold'}}>{
                lessonToEdit.status === 'completed' ? '✅ Проведено' :
                lessonToEdit.status === 'cancelled' ? '❌ Скасовано' :
                lessonToEdit.status === 'no_show' ? '😡 Не прийшов' :
                '📅 Заплановано'
             }</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Студент */}
          <div className={styles.form_group}>
            <label className={styles.form_label}>Студент</label>
            <Select 
              options={studentOptions}
              value={studentId}
              onChange={setStudentId}
              placeholder="Оберіть студента..."
              required
            />
          </div>

          {/* Дата */}
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

          {/* Час */}
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

          {/* Частота */}
          {!lessonToEdit && (
            <div className={styles.form_group}>
                <label className={styles.form_label}>Частота занять</label>
                <Select 
                    options={frequencyOptions}
                    value={frequency}
                    onChange={setFrequency}
                    placeholder="Частота"
                />
            </div>
          )}

          {/* Тема (Нове поле) */}
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

          {/* --- КНОПКИ --- */}
          <div className={styles.btns}>
            <button 
              type="button" 
              onClick={onClose} 
              className={`${styles.btn} ${styles.btn_close}`}
            >
              {lessonToEdit ? 'Закрити' : 'Скасувати'}
            </button>

            {/* Додаткові кнопки для зміни статусу (тільки редагування) */}
             {lessonToEdit && (
              <>
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btn_cancel}`}
                  onClick={() => onStatusChange('cancelled')}
                  title="Скасувати урок"
                >
                  Скасувати
                </button>

                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btn_noshow}`}
                  onClick={() => onStatusChange('no_show')}
                  title="Не прийшов"
                >
                  Не прийшов
                </button>
              </>
            )}
            
            <button type="submit" className={`${styles.btn} ${styles.btn_save}`}>
              {lessonToEdit ? 'Зберегти' : 'Створити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}