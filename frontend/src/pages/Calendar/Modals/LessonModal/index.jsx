import React, { useState, useEffect } from 'react';
import Select from './Select'; 
import styles from './LessonModal.module.css';

export default function LessonModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onStatusChange, 
  onOpenResultModal,
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
  const [repeatUntil, setRepeatUntil] = useState('');
  const [frequencyError, setFrequencyError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false); 

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
        setRepeatUntil('');
        setFrequencyError('');

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

  // Функція для автоматичного розрахунку часу кінця (+1 година від початку)
  const handleStartTimeChange = (value) => {
    setStartTime(value);
    
    if (value) {
      // Розбираємо час (HH:MM)
      const [hours, minutes] = value.split(':').map(Number);
      
      // Додаємо 1 годину
      let newHours = hours + 1;
      let newMinutes = minutes;
      
      // Обробка переходу через північ
      if (newHours >= 24) {
        newHours = newHours - 24;
      }
      
      // Форматуємо назад у HH:MM
      const formattedEndTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      setEndTime(formattedEndTime);
    }
  };

  // Функція для підрахунку кількості занять
  const calculateLessonsCount = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = end.getTime() - start.getTime();
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
    return diffWeeks + 1; // +1 бо включаємо перше заняття
  };

  // Валідація при зміні дати repeatUntil
  const handleRepeatUntilChange = (value) => {
    setRepeatUntil(value);
    if (frequency === 'weekly' && value && date) {
      const count = calculateLessonsCount(date, value);
      if (count > 40) {
        setFrequencyError(`Забагато занять (${count}). Максимум 40 занять за раз.`);
      } else if (count <= 0) {
        setFrequencyError('Дата закінчення повинна бути після дати початку.');
      } else {
        setFrequencyError('');
      }
    } else {
      setFrequencyError('');
    }
  };

  // --- SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Перевірка для щотижневих занять
    if (frequency === 'weekly' && !lessonToEdit) {
      if (!repeatUntil) {
        setFrequencyError('Вкажіть дату закінчення для щотижневих занять.');
        return;
      }
      const count = calculateLessonsCount(date, repeatUntil);
      if (count > 40) {
        setFrequencyError(`Забагато занять (${count}). Максимум 40 занять за раз.`);
        return;
      }
      if (count <= 0) {
        setFrequencyError('Дата закінчення повинна бути після дати початку.');
        return;
      }
    }
    
    // Формуємо ISO рядки
    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    onSubmit({
      student_id: studentId,
      start_time: startDateTime,
      end_time: endDateTime,
      topic: topic,
      status: lessonToEdit ? lessonToEdit.status : 'planned',
      frequency: frequency,
      repeatUntil: repeatUntil
    });
  };

  // Опції
  const studentOptions = students.map(s => ({
    value: s.id,
    label: `${s.full_name} ${s.grade || '-'} клас`
  }));

  const frequencyOptions = [
    { value: 'once', label: 'Одноразове заняття' },
    { value: 'weekly', label: 'Щотижня' }, 
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        <h2 className={styles.form_title}>
          {lessonToEdit ? 'Редагувати урок' : 'Новий урок'}
        </h2>
        
        {/* Статус (Тільки при редагуванні) */}
          {lessonToEdit && (
           <div className={styles.status_row}>
             Статус: <span className={styles.status_bold}>{
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
            {lessonToEdit ? (
              // При редагуванні - показуємо ім'я студента як текст
              <div className={styles.form_value}>
                {(() => {
                  const student = students.find(s => s.id === studentId);
                  return student 
                    ? `${student.full_name} ${student.grade || '-'} клас`
                    : 'Невідомий студент';
                })()}
              </div>
            ) : (
              // При створенні - вибір студента зі списку
              <Select 
                options={studentOptions}
                value={studentId}
                onChange={setStudentId}
                placeholder="Оберіть студента..."
                required
              />
            )}
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
          <div className={styles.row}>
            <div className={`${styles.form_group} ${styles.flex1}`}>
              <label className={styles.form_label}>Початок</label>
              <input 
                type="time" 
                className={styles.form_input}
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                required
              />
            </div>
            <div className={`${styles.form_group} ${styles.flex1}`}>
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
            <>
              <div className={styles.form_group}>
                  <label className={styles.form_label}>Частота занять</label>
                  <Select 
                      options={frequencyOptions}
                      value={frequency}
                      onChange={(val) => {
                        setFrequency(val);
                        if (val === 'once') {
                          setRepeatUntil('');
                          setFrequencyError('');
                        }
                      }}
                      placeholder="Частота"
                  />
              </div>
              
              {/* Дата закінчення для щотижневих занять */}
              {frequency === 'weekly' && (
                <div className={styles.form_group}>
                  <label className={styles.form_label}>Заповнити календар до</label>
                  <input 
                    type="date" 
                    className={styles.form_input}
                    value={repeatUntil}
                    onChange={(e) => handleRepeatUntilChange(e.target.value)}
                    min={date}
                    required
                  />
                  {repeatUntil && date && !frequencyError && (
                    <div className={styles.info_text}>
                      Буде створено {calculateLessonsCount(date, repeatUntil)} занять
                    </div>
                  )}
                  {frequencyError && (
                    <div className={styles.error_text}>
                      {frequencyError}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* --- КНОПКИ --- */}
          <div className={styles.btns}>
            <button 
              type="button" 
              onClick={onClose} 
              className={`${styles.btn} ${styles.btn_close}`}
            >
              {lessonToEdit ? 'Закрити' : 'Скасувати'}
            </button>

            {/* Додаткові кнопки для зміни статусу (тільки редагування, і тільки якщо не проведено) */}
             {lessonToEdit && lessonToEdit.status !== 'completed' && (
              <>
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btn_cancel}`}
                  onClick={() => setShowCancelConfirm(true)}
                  title="Скасувати урок"
                >
                  Скасувати
                </button>
                
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btn_complete}`}
                  onClick={() => {
                    onOpenResultModal(lessonToEdit);
                    onClose();
                  }}
                  title="Фіксація результатів уроку"
                >
                  Проведено
                </button>
              </>
            )}
            
            {/* Кнопка Зберегти/Створити (приховується якщо урок проведено) */}
            {!lessonToEdit || lessonToEdit.status !== 'completed' ? (
              <button type="submit" className={`${styles.btn} ${styles.btn_save}`}>
                {lessonToEdit ? 'Зберегти' : 'Створити'}
              </button>
            ) : null}
          </div>
        </form>

        {/* Confirmation Modal for Cancel */}
        {showCancelConfirm && (
          <div className={styles.confirm_overlay} onClick={() => setShowCancelConfirm(false)}>
            <div className={styles.confirm_content} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.confirm_title}>Вибір дії для скасування</h3>
              <p className={styles.confirm_text}>Виберіть причину скасування:</p>
              
              <div className={styles.confirm_btns}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btn_close}`}
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Закрити
                </button>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btn_noshow}`}
                  onClick={() => {
                    onStatusChange('no_show');
                    setShowCancelConfirm(false);
                  }}
                >
                  Не прийшов
                </button>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btn_cancel}`}
                  onClick={() => {
                    onStatusChange('cancelled');
                    setShowCancelConfirm(false);
                  }}
                >
                  Скасувати
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}