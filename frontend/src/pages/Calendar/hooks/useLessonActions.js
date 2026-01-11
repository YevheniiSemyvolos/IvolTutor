// CRUD операції з уроками
import { useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function formatLocalISO(date) {
  if (!date) return null;
  const offsetMs = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().slice(0, -1);
}

export function useLessonActions({ calendarRef, setErrorMsg }) {
  const refetchEvents = useCallback(() => {
    calendarRef.current?.getApi().refetchEvents();
  }, [calendarRef]);

  const updateLessonTime = useCallback(async (info) => {
    const lessonId = info.event.id;
    const newStart = formatLocalISO(info.event.start);
    const newEnd = formatLocalISO(info.event.end);

    try {
      await axios.patch(`${API_URL}/lessons/${lessonId}`, {
        start_time: newStart,
        end_time: newEnd
      });
      refetchEvents();
    } catch (error) {
      console.error('Помилка оновлення часу:', error);
      info.revert();
    }
  }, [refetchEvents]);

  const updateSingleLesson = useCallback(async (lessonId, formData) => {
    const updateData = {
      student_id: formData.student_id,
      start_time: formData.start_time,
      end_time: formData.end_time,
      topic: formData.topic,
      status: formData.status,
      series_id: null
    };
    await axios.patch(`${API_URL}/lessons/${lessonId}`, updateData);
    refetchEvents();
  }, [refetchEvents]);

  const updateSeriesLessons = useCallback(async (lessonId, formData) => {
    const updateData = {
      student_id: formData.student_id,
      start_time: formData.start_time,
      end_time: formData.end_time,
      topic: formData.topic
    };
    await axios.patch(`${API_URL}/lessons/series/${lessonId}`, updateData);
    refetchEvents();
  }, [refetchEvents]);

  const updateLesson = useCallback(async (lessonId, formData) => {
    const updateData = {
      student_id: formData.student_id,
      start_time: formData.start_time,
      end_time: formData.end_time,
      topic: formData.topic,
      status: formData.status
    };
    await axios.patch(`${API_URL}/lessons/${lessonId}`, updateData);
    refetchEvents();
  }, [refetchEvents]);

  const createLesson = useCallback(async (formData) => {
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
    refetchEvents();
  }, [refetchEvents]);

  const changeStatus = useCallback(async (lessonId, newStatus) => {
    await axios.patch(`${API_URL}/lessons/${lessonId}`, { status: newStatus });
    refetchEvents();
  }, [refetchEvents]);

  return {
    refetchEvents,
    updateLessonTime,
    updateSingleLesson,
    updateSeriesLessons,
    updateLesson,
    createLesson,
    changeStatus
  };
}
