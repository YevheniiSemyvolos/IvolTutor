// frontend/src/components/Calendar.jsx
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

// Імпортуємо наше нове модальне вікно
import LessonModal from './LessonModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]); // Список студентів для форми
  
  // Стани для модального вікна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null); // Час, який ми виділили мишкою
  
  // Ref для доступу до FullCalendar API
  const calendarRef = useRef(null);

  // 1. Завантажуємо студентів при запуску (щоб було кого вибирати)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/students/`);
        setStudents(res.data);
      } catch (e) {
        console.error("Не вдалося завантажити студентів");
      }
    };
    fetchStudents();
  }, []);

  const fetchLessons = async (info) => {
    try {
      const response = await axios.get(`${API_URL}/lessons/`, {
        params: { start: info.startStr, end: info.endStr }
      });
      
      const calendarEvents = response.data.map(lesson => ({
        id: lesson.id,
        title: lesson.topic || 'Заняття',
        start: lesson.start_time,
        end: lesson.end_time,
        backgroundColor: lesson.status === 'planned' ? '#4F46E5' : (lesson.status === 'completed' ? '#10B981' : '#6B7280'),
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Помилка завантаження уроків:", error);
    }
  };

  // 2. Коли користувач виділив час мишкою
  const handleDateSelect = (selectInfo) => {
    setSelectedRange(selectInfo); // Запам'ятовуємо час (start, end)
    setIsModalOpen(true);         // Відкриваємо вікно
  };

  // 3. Коли натиснули "Зберегти" у модальному вікні
  const handleCreateLesson = async ({ student_id, topic }) => {
    if (!student_id) return;

    const newLesson = {
      student_id: student_id,
      topic: topic,
      price: 0, // Поки ставимо 0, пізніше зробимо авто-ціну
      start_time: selectedRange.startStr,
      end_time: selectedRange.endStr,
      status: 'planned'
    };

    try {
      await axios.post(`${API_URL}/lessons/`, newLesson);
      
      // Закриваємо вікно
      setIsModalOpen(false);
      // Оновлюємо події на календарі
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    } catch (error) {
      alert("Помилка створення уроку");
      console.error(error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 h-full relative transition-colors duration-300">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek'
        }}
        dayHeaderFormat={{ weekday: 'short', day: 'numeric', omitCommas: true }}
        firstDay={1}
        locale="uk"
        slotMinTime="08:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        nowIndicator={true}
        events={events}
        datesSet={fetchLessons}
        editable={true}
        height="auto"
        contentHeight="auto"
        expandRows={true}
        stickyHeaderDates={true}
        
        // --- ВАЖЛИВО: Додаємо можливість виділення ---
        selectable={true}       // Дозволити виділяти час мишкою
        selectMirror={true}     // Показувати "привид" події під час тягнення
        select={handleDateSelect} // Яку функцію запускати при виділенні
      />

      {/* Саме Модальне вікно */}
      <LessonModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLesson}
        students={students}
      />
    </div>
  );
}