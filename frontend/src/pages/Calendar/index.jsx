import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import LessonModal from './Modals/LessonModal';
import LessonResultModal from './Modals/LessonResultModal';
import PaymentModal from '../Students/Modals/PaymentModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const EVENT_COLORS = {
  planned: '#4F46E5',   
  completed: '#10B981', 
  cancelled: '#EF4444', 
  no_show: '#F59E0B',
  default: '#6B7280'    
};


export default function Calendar() {

  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [lessonForResult, setLessonForResult] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);

  const calendarRef = useRef(null);

  // Завантаження студентів один раз після рендерингу
  useEffect(() => {
    const controller = new AbortController();
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/students/`, { signal: controller.signal });
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

  // Джерело подій
  const fetchEventsSource = useCallback(async (fetchInfo, successCallback, failureCallback) => {
    try {
      const response = await axios.get(`${API_URL}/lessons/`, {
        params: { start: fetchInfo.startStr, end: fetchInfo.endStr }
      });

      //ФІЛЬТРАЦІЯ - приховуємо скасовані уроки і уроки "не прийшов"
      const activeLessons = response.data.filter(lesson => lesson.status !== 'cancelled' && lesson.status !== 'no_show');

      const formattedEvents = activeLessons.map(lesson => {
        return {
          id: lesson.id,
          title: lesson.topic || 'Заняття', 
          start: lesson.start_time,
          end: lesson.end_time,
          backgroundColor: EVENT_COLORS[lesson.status] || EVENT_COLORS.default,
          borderColor: 'transparent',
          editable: lesson.status !== 'completed', // Забороняємо редагування завершених уроків
          className: lesson.status === 'completed' ? 'event-completed' : '', // Клас для завершених уроків
          extendedProps: { ...lesson } 
        };
      });

      successCallback(formattedEvents);
      setErrorMsg(null);
    } catch (error) {
      console.error("Помилка завантаження уроків:", error);
      failureCallback(error);
      setErrorMsg("Помилка завантаження розкладу.");
    }
  }, []);

  // Обробка виділення часу
  const handleDateSelect = (selectInfo) => {
    setSelectedRange(selectInfo);
    setEditingLesson(null);   // Очищаємо редагування, бо це створення
    setIsModalOpen(true);
  };

  // Клік по існуючій події 
  const handleEventClick = (clickInfo) => {
    const lesson = clickInfo.event.extendedProps;
    setEditingLesson(lesson); // Записуємо дані уроку для модалки
    setSelectedRange(null);   // Очищаємо range, бо це не створення
    setIsModalOpen(true);
  };

  // Функція для форматування дати в локальний ISO рядок (без літери Z і без зміщення)
  const formatLocalISO = (date) => {
    if (!date) return null;
    
    const offsetMs = date.getTimezoneOffset() * 60000;     // Отримуємо зміщення часового поясу в хвилинах і переводимо в мілісекунди
    const localDate = new Date(date.getTime() - offsetMs); // Створюємо нову дату, віднявши зміщення, щоб компенсувати UTC конвертацію
    
    return localDate.toISOString().slice(0, -1);           // Повертаємо рядок і обрізаємо останній символ 'Z'
  };

  // Спільна функція для оновлення часу (Drag & Drop та Resize)
  const handleEventUpdate = async (info) => {
    const lessonId = info.event.id;
    const newStart = formatLocalISO(info.event.start);
    const newEnd = formatLocalISO(info.event.end);

    try {
        await axios.patch(`${API_URL}/lessons/${lessonId}`, {
            start_time: newStart,
            end_time: newEnd
        });
    } catch (error) {
        console.error("Помилка оновлення часу:", error);
        info.revert(); // Повертаємо подію назад у разі помилки
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
  };

  // Збереження (Створення або Редагування)
  const handleSaveLesson = async (formData) => {
    try {
      if (editingLesson) {
        // Логіка РЕДАГУВАННЯ (PATCH)
        // Формуємо об'єкт тільки зі змінними даними
        // (LessonModal вже має повертати готовий об'єкт, але для певності)
        const updateData = {
            ...formData,
            // Якщо ми редагуємо, дати приходять з форми модалки
            // А якщо створюємо - з selectedRange. 
            // LessonModal має це враховувати (див. код LessonModal вище)
        };
        
        await axios.patch(`${API_URL}/lessons/${editingLesson.id}`, updateData);

      } else {
        // Логіка СТВОРЕННЯ (POST)
        // Додаємо час з виділення, якщо він не прийшов з форми (хоча LessonModal тепер сам керує часом)
        // Для надійності:
        const newLesson = {
          ...formData,
          status: 'planned'
          // Ціну не передаємо - бекенд підтягне з профілю студента
        };
        await axios.post(`${API_URL}/lessons/`, newLesson);
      }
      
      handleCloseModal();
      calendarRef.current?.getApi().refetchEvents(); // Оновлюємо календар
    } catch (error) {
      console.error(error);
      alert("Помилка збереження");
    }
  };

  // Зміна статусу (з модалки)
  const handleStatusChange = async (newStatus) => {
    if (!editingLesson) return;

    if (newStatus === 'no_show' && !window.confirm("Учень не з'явився? Це зарахується як проведене заняття?")) {
        return;
    }

    // Якщо статус 'completed', то відкриємо LessonResultModal
    if (newStatus === 'completed') {
      setLessonForResult(editingLesson);
      setIsResultModalOpen(true);
      return;
    }

    try {
        await axios.patch(`${API_URL}/lessons/${editingLesson.id}`, {
            status: newStatus
        });
        handleCloseModal();
        calendarRef.current?.getApi().refetchEvents();
    } catch (error) {
        alert("Помилка зміни статусу");
    }
  };

  const handleResultSuccess = () => {
    setIsResultModalOpen(false);
    setLessonForResult(null);
    handleCloseModal();
    calendarRef.current?.getApi().refetchEvents();
  };

  const handleOpenResultModal = (lesson) => {
    setLessonForResult(lesson);
    setIsResultModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedStudentForPayment(null);
  };  

  return (
    <div className="bg-white dark:bg-gray-900 h-full relative transition-colors duration-300 flex flex-col pt-6">
      
      {/* calendar styles moved to Calendar.module.css */}

      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-4 rounded" role="alert">
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
        
        views={{
          dayGridMonth: {
            // Для місяця показуємо тільки назву дня (Пн, Вт...)
            dayHeaderFormat: { weekday: 'short' }
          },
          timeGridWeek: {
            // Для тижня: "Пн 12"
            dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true }
          },
          timeGridDay: {
            // Для дня: "Пн 12"
            dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true }
          }
        }}

        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator={true}
        
        // Прив'язка даних
        events={fetchEventsSource} 
        
        // Взаємодія
        selectable={true}
        selectMirror={true}
        select={handleDateSelect}
        
        // Обробники
        editable={true} 
        eventClick={handleEventClick} // Клік по події
        eventDrop={handleEventUpdate}   // Перетягування
        eventResize={handleEventUpdate} // Зміна тривалості (тягнути за край)
        
        // UI макет
        expandRows={true}
        stickyHeaderDates={true}
      />

      <LessonModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveLesson}
        onStatusChange={handleStatusChange}
        onOpenResultModal={handleOpenResultModal}
        students={students}
        lessonToEdit={editingLesson}
        initialDateRange={selectedRange}
      />

      <LessonResultModal 
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        onSuccess={handleResultSuccess}
        lessonId={lessonForResult?.id}
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        preselectedStudentId={selectedStudentForPayment}
        students={students}
      />
    </div>
  );
}