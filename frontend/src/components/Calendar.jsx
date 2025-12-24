// frontend/src/components/Calendar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import LessonModal from './LessonModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Конфігурація кольорів подій
const EVENT_COLORS = {
  planned: '#4F46E5',   // Індиго (заплановано)
  completed: '#10B981', // Смарагдовий (проведено)
  cancelled: '#EF4444', // Червоний (скасовано)
  default: '#6B7280'    // Сірий (інше)
};

export default function Calendar() {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null); // Для показу помилок в UI

  const calendarRef = useRef(null);

  // 1. Завантаження студентів
  useEffect(() => {
    const controller = new AbortController();

    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/students/`, {
          signal: controller.signal
        });
        setStudents(res.data);
      } catch (e) {
        if (!axios.isCancel(e)) {
          console.error("Не вдалося завантажити студентів", e);
          setErrorMsg("Не вдалося завантажити список студентів.");
        }
      }
    };

    fetchStudents();

    return () => controller.abort();
  }, []);

  // 2. Функція-джерело подій для FullCalendar
  // FullCalendar викликає її автоматично при зміні дат/вигляду
  const fetchEventsSource = useCallback(async (fetchInfo, successCallback, failureCallback) => {
    try {
      const response = await axios.get(`${API_URL}/lessons/`, {
        params: { 
          start: fetchInfo.startStr, 
          end: fetchInfo.endStr 
        }
      });

      const formattedEvents = response.data.map(lesson => ({
        id: lesson.id,
        title: lesson.topic || 'Заняття',
        start: lesson.start_time,
        end: lesson.end_time,
        backgroundColor: EVENT_COLORS[lesson.status] || EVENT_COLORS.default,
        extendedProps: { ...lesson } // Зберігаємо оригінальні дані, якщо знадобляться при кліку
      }));

      successCallback(formattedEvents);
      setErrorMsg(null); // Очищаємо помилки при успіху
    } catch (error) {
      console.error("Помилка завантаження уроків:", error);
      failureCallback(error);
      setErrorMsg("Помилка завантаження розкладу.");
    }
  }, []);

  // 3. Обробка виділення часу мишкою
  const handleDateSelect = (selectInfo) => {
    setSelectedRange(selectInfo);
    setIsModalOpen(true);
  };

  // 4. Закриття модального вікна (скидання виділення)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Знімаємо візуальне виділення в календарі, якщо скасували створення
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.unselect();
  };

  // 5. Створення уроку
  const handleCreateLesson = async ({ student_id, topic }) => {
    if (!student_id) return;

    const newLesson = {
      student_id,
      topic,
      price: 0, 
      start_time: selectedRange.startStr,
      end_time: selectedRange.endStr,
      status: 'planned'
    };

    try {
      await axios.post(`${API_URL}/lessons/`, newLesson);
      
      handleCloseModal();
      
      // Оновлюємо події, щоб новий урок з'явився миттєво
      calendarRef.current?.getApi().refetchEvents(); 
    } catch (error) {
      console.error(error);
      alert("Помилка створення уроку"); // В ідеалі краще замінити на Toast/Notification
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 h-full relative transition-colors duration-300 flex flex-col pt-6">
      
      {/* Блок з помилкою */}
      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{errorMsg}</p>
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        
        // Локалізація та формат
        locale="uk"
        firstDay={1}
        dayHeaderFormat={{ weekday: 'short', day: 'numeric', omitCommas: true }}
        slotMinTime="08:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        nowIndicator={true}
        
        // Прив'язка даних (Найважливіша частина)
        events={fetchEventsSource} 
        
        // Взаємодія
        selectable={true}
        selectMirror={true}
        select={handleDateSelect}
        editable={true} // Дозволяє перетягувати (потрібна реалізація eventDrop)
        
        // UI макет
        expandRows={true}
        stickyHeaderDates={true}
      />

      <LessonModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateLesson}
        students={students}
      />
    </div>
  );
}