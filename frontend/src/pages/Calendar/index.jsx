// Головний компонент
import { useState, useRef } from 'react';
import { useStudents, useLessonActions, useCalendarEvents } from './hooks';
import { CalendarView, ErrorBanner } from './components';
import LessonModal from './Modals/LessonModal';
import LessonResultModal from './Modals/LessonResultModal';
import SeriesEditModal from './Modals/SeriesEditModal';
import PaymentModal from '../Students/Modals/PaymentModal';

export default function Calendar() {
  const { students, error: studentsError } = useStudents();
  const [errorMsg, setErrorMsg] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [lessonForResult, setLessonForResult] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);

  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const calendarRef = useRef(null);

  const {
    updateLessonTime,
    updateSingleLesson,
    updateSeriesLessons,
    updateLesson,
    createLesson,
    changeStatus,
    refetchEvents
  } = useLessonActions({ calendarRef, setErrorMsg });

  const { fetchEventsSource } = useCalendarEvents({ students, setErrorMsg });

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
  };

  const handleSingleEdit = async () => {
    if (!pendingFormData || !editingLesson) return;
    try {
      await updateSingleLesson(editingLesson.id, pendingFormData);
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
      await updateSeriesLessons(editingLesson.id, pendingFormData);
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
        await updateLesson(editingLesson.id, formData);
      } else {
        await createLesson(formData);
      }
      handleCloseModal();
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
      await changeStatus(editingLesson.id, newStatus);
      handleCloseModal();
    } catch (error) {
      alert('Помилка зміни статусу');
    }
  };

  const handleResultSuccess = () => {
    setIsResultModalOpen(false);
    setLessonForResult(null);
    handleCloseModal();
    refetchEvents();
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
      <ErrorBanner message={studentsError || errorMsg} />

      <CalendarView
        calendarRef={calendarRef}
        eventsSource={fetchEventsSource}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        onEventDrop={updateLessonTime}
        onEventResize={updateLessonTime}
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