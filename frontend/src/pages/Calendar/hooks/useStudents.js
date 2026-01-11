// Завантаження студентів
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/students/`, { signal: controller.signal });
        setStudents(res.data);
      } catch (e) {
        if (!axios.isCancel(e)) {
          console.error('Не вдалося завантажити студентів', e);
          setError('Не вдалося завантажити список студентів.');
        }
      }
    };
    fetchStudents();
    return () => controller.abort();
  }, []);

  return { students, error };
}
