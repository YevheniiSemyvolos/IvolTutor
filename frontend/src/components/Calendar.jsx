import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

import './Calendar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Calendar() {
  const [events, setEvents] = useState([]);

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
        // Використовуємо кольори з макета (Синій, Зелений, Сірий)
        backgroundColor: lesson.status === 'planned' ? '#4F46E5' : (lesson.status === 'completed' ? '#10B981' : '#6B7280'),
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Помилка завантаження уроків:", error);
    }
  };

  return (
    <div className="bg-white h-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        
        // Налаштування шапки як на макеті (мінімалістичне)
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek' // Прибрали зайві кнопки
        }}

        // ВАЖЛИВО: Формат заголовків днів (MON 15, TUE 16)
        dayHeaderFormat={{ weekday: 'short', day: 'numeric', omitCommas: true }}

        firstDay={1}
        locale="uk" // Можна змінити на 'en' якщо хочете англійські назви днів (MON, TUE)
        slotMinTime="08:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        nowIndicator={true} // Червона лінія поточного часу
        
        events={events}
        datesSet={fetchLessons}
        editable={true}
        height="auto"
        contentHeight="auto"
        expandRows={true}
        stickyHeaderDates={true}
      />
    </div>
  );
}