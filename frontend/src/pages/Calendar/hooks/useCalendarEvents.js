// Форматування подій для календаря
import { useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const EVENT_COLORS = {
  planned: '#4F46E5',
  completed: '#10B981',
  cancelled: '#EF4444',
  no_show: '#F59E0B',
  default: '#6B7280'
};

export function useCalendarEvents({ students, setErrorMsg }) {
  const fetchEventsSource = useCallback(
    async (fetchInfo, successCallback, failureCallback) => {
      try {
        const response = await axios.get(`${API_URL}/lessons/`, {
          params: {
            start: fetchInfo.startStr,
            end: fetchInfo.endStr,
            status: 'planned,completed'
          }
        });

        const formattedEvents = response.data.map((lesson) => {
          const student = students.find((s) => s.id === lesson.student_id);
          const studentName = student?.full_name || 'Студент';
          const grade = student?.grade || '-';
          const telegramContact = student?.telegram_contact || null;
          const studentSlug = student?.slug || null;

          const startTime = new Date(lesson.start_time).toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          const endTime = new Date(lesson.end_time).toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          return {
            id: lesson.id,
            title: `${studentName} ${grade} клас`,
            start: lesson.start_time,
            end: lesson.end_time,
            backgroundColor: EVENT_COLORS[lesson.status] || EVENT_COLORS.default,
            borderColor: 'transparent',
            editable: lesson.status !== 'completed',
            className: lesson.status === 'completed' ? 'event-completed' : '',
            extendedProps: {
              ...lesson,
              telegram_contact: telegramContact,
              student_slug: studentSlug,
              displayTime: `${startTime} - ${endTime}`
            }
          };
        });

        successCallback(formattedEvents);
        setErrorMsg(null);
      } catch (error) {
        console.error('Помилка завантаження уроків:', error);
        failureCallback(error);
        setErrorMsg('Помилка завантаження розкладу.');
      }
    },
    [students, setErrorMsg]
  );

  return { fetchEventsSource };
}
