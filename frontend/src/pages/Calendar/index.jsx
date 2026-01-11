import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import CalendarView from './components/CalendarView';
import LessonModal from './Modals/LessonModal';
import LessonResultModal from './Modals/LessonResultModal';
import SeriesEditModal from './Modals/SeriesEditModal';
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
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const calendarRef = useRef(null);

  // Завантаження студентів
  useEffect(() => {
    const controller = new AbortController();
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/students/`, { signal: controller.signal });
        setStudents(res.data);
      } catch (e) {
        if (!axios.isCancel(e)) {
          console.error('Не вдалося завантажити студентів', e);
          setErrorMsg('Не вдалося завантажити список студентів.');
        }
      }
    };
    fetchStudents();
    return () => controller.abort();
  }, []);

  // Форматування дати в локальний ISO
  const formatLocalISO = (date) => {
    if (!date) return null;
    const offsetMs = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offsetMs);
    return localDate.toISOString().slice(0, -1);
  };

  // Джерело подій для календаря
  const fetchEventsSource = useCallback(async (fetchInfo, successCallback, failureCallback) => {
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
  }, [students]);

  const handleDateSelect = (selectInfo) => {
    setSelectedRange(selectInfo);
    setEditingLesson(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const lesson = clickInfo.event.extendedProps;
    setEditingLesson(lesson);
    setSelectedRange(null);
    setIsModalOpen(true);
  };

  const handleEventUpdate = async (info) => {
    const lessonId = info.event.id;
    const newStart = formatLocalISO(info.event.start);
    const newEnd = formatLocalISO(info.event.end);

    try {
      await axios.patch(`${API_URL}/lessons/${lessonId}`, {
        start_time: newStart,
        end_time: newEnd
      });
      calendarRef.current?.getApi().refetchEvents();
    } catch (error) {
      console.error('Помилка оновлення часу:', error);
      info.revert();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
  };

  const handleSingleEdit = async () => {
    if (!pendingFormData || !editingLesson) return;

    try {
      const updateData = {
        student_id: pendingFormData.student_id,
        start_time: pendingFormData.start_time,
        end_time: pendingFormData.end_time,
        topic: pendingFormData.topic,
        status: pendingFormData.status,
        series_id: null
      };

      await axios.patch(`${API_URL}/lessons/${editingLesson.id}`, updateData);
      calendarRef.current?.getApi().refetchEvents();
    } catch (error) {
      console.error('Помилка оновлення заняття:', error);
      setErrorMsg('Не вдалося оновити заняття.');
    } finally {
      setIsSeriesModalOpen(false);
      setPendingFormData(null);
      setIsModalOpen(false);
      setEditingLesson(null);
    }
  };

  const handleSeriesEdit = async () => {
    if (!pendingFormData || !editingLesson) return;

    try {
      const updateData = {
        student_id: pendingFormData.student_id,
        start_time: pendingFormData.start_time,
        end_time: pendingFormData.end_time,
        topic: pendingFormData.topic
      };

      await axios.patch(`${API_URL}/lessons/series/${editingLesson.id}`, updateData);
      calendarRef.current?.getApi().refetchEvents();
    } catch (error) {
      console.error('Помилка оновлення серії:', error);
      setErrorMsg('Не вдалося оновити серію занять.');
    } finally {
      setIsSeriesModalOpen(false);
      setPendingFormData(null);
      setIsModalOpen(false);
      setEditingLesson(null);
    }
  };

  const handleSaveLesson = async (formData) => {
    try {
      if (editingLesson) {
        if (editingLesson.series_id) {
          setPendingFormData(formData);
          setIsSeriesModalOpen(true);
          return;
        }

        const updateData = {
          student_id: formData.student_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
          topic: formData.topic,
          status: formData.status
        };

        await axios.patch(`${API_URL}/lessons/${editingLesson.id}`, updateData);
      } else {
        if (formData.frequency === 'weekly' && formData.repeatUntil) {
          const startDate = new Date(formData.start_time);
          const endDate = new Date(formData.end_time);
          const repeatUntilDate = new Date(formData.repeatUntil);
          const seriesId = crypto.randomUUID();

          const lessons = [];
          let currentStart = new Date(startDate);
          let currentEnd = new Date(endDate);

          while (currentStart <= repeatUntilDate && lessons.length < 40) {
            lessons.push({
              student_id: formData.student_id,
              start_time: formatLocalISO(currentStart),
              end_time: formatLocalISO(currentEnd),
              topic: formData.topic,
              status: 'planned',
              series_id: seriesId
            });

            currentStart.setDate(currentStart.getDate() + 7);
            currentEnd.setDate(currentEnd.getDate() + 7);
          }

          await Promise.all(lessons.map((lesson) => axios.post(`${API_URL}/lessons/`, lesson)));
        } else {
          const newLesson = {
            student_id: formData.student_id,
            start_time: formData.start_time,
            end_time: formData.end_time,
            topic: formData.topic,
            status: 'planned'
          };
          await axios.post(`${API_URL}/lessons/`, newLesson);
        }
      }

      handleCloseModal();
      calendarRef.current?.getApi().refetchEvents();
    } catch (error) {
      console.error(error);
      alert('Помилка збереження');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!editingLesson) return;

    if (newStatus === 'no_show' && !window.confirm("Учень не з'явився? Це зарахується як проведене заняття?")) {
      return;
    }

    if (newStatus === 'completed') {
      setLessonForResult(editingLesson);
      setIsResultModalOpen(true);
      return;
    }

    try {
      await axios.patch(`${API_URL}/lessons/${editingLesson.id}`, { status: newStatus });
      handleCloseModal();
      calendarRef.current?.getApi().refetchEvents();
    } catch (error) {
      alert('Помилка зміни статусу');
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
    <>
      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-4 rounded" role="alert">
          <p>{errorMsg}</p>
        </div>
      )}

      <CalendarView
        calendarRef={calendarRef}
        eventsSource={fetchEventsSource}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        onEventDrop={handleEventUpdate}
        onEventResize={handleEventUpdate}
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
        studentTelegram={lessonForResult?.telegram_contact}
        studentSlug={lessonForResult?.student_slug}
        lessonDate={lessonForResult?.start_time}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        preselectedStudentId={selectedStudentForPayment}
        students={students}
      />

      <SeriesEditModal
        isOpen={isSeriesModalOpen}
        onClose={() => {
          setIsSeriesModalOpen(false);
          setPendingFormData(null);
        }}
        onSingleEdit={handleSingleEdit}
        onSeriesEdit={handleSeriesEdit}
      />
    </>
  );
}