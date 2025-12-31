import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Profile.module.css'; // Імпорт

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resStudents = await axios.get(`${API_URL}/students/`);
        const foundStudent = resStudents.data.find(s => s.id === id);
        setStudent(foundStudent);

        const resLessons = await axios.get(`${API_URL}/lessons/`, {
            params: {
                start: '2023-01-01T00:00:00',
                end: '2028-01-01T00:00:00'
            }
        });
        
        const studentLessons = resLessons.data
            .filter(l => l.student_id === id)
            .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

        setLessons(studentLessons);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className={styles.emptyState}>Завантаження...</div>;
  if (!student) return <div className={styles.emptyState}>Студента не знайдено</div>;

  return (
    <div className={styles.container}>
      <button 
        onClick={() => navigate('/students')}
        className={styles.backBtn}
      >
        ← Назад до списку
      </button>

      {/* Картка студента */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
            <div>
                <h1 className={styles.studentName}>{student.full_name}</h1>
                <p className={styles.parentName}>{student.parent_name ? `Батьки: ${student.parent_name}` : 'Батьки не вказані'}</p>
            </div>
            <div className={`${styles.balanceBadge} ${student.balance < 0 ? styles.negative : styles.positive}`}>
                Баланс: {student.balance} грн
            </div>
        </div>
        
        <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Контакт</span>
                <span className={styles.detailValue}>{student.telegram_contact || '-'}</span>
            </div>
            <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Тариф</span>
                <span className={styles.detailValue}>{student.default_price} грн</span>
            </div>
            <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Коментар</span>
                <span className={styles.detailValue}>{student.comment || '-'}</span>
            </div>
        </div>
      </div>

      {/* Архів занять */}
      <h2 className={styles.sectionTitle}>Архів занять</h2>
      <div className={styles.tableCard}>
        {lessons.length === 0 ? (
            <div className={styles.emptyState}>Історія занять порожня</div>
        ) : (
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Дата</th>
                            <th className={styles.th}>Тема</th>
                            <th className={styles.th}>Статус</th>
                            <th className={styles.th}>Ціна</th>
                            <th className={styles.th}>Матеріали</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.map(lesson => (
                            <tr key={lesson.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div style={{fontWeight: 500}}>{new Date(lesson.start_time).toLocaleDateString('uk-UA')}</div>
                                    <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>
                                        {new Date(lesson.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </td>
                                <td className={styles.td}>{lesson.topic || 'Без теми'}</td>
                                <td className={styles.td}>
                                    <span className={`${styles.statusBadge} ${
                                        lesson.status === 'completed' ? styles.statusCompleted :
                                        lesson.status === 'cancelled' ? styles.statusCancelled :
                                        styles.statusPlanned
                                    }`}>
                                        {lesson.status === 'completed' ? 'Проведено' : 
                                         lesson.status === 'cancelled' ? 'Скасовано' : 'Заплановано'}
                                    </span>
                                </td>
                                <td className={styles.td}>{lesson.price} грн</td>
                                <td className={styles.td}>
                                    {lesson.homeworks && lesson.homeworks.length > 0 ? (
                                        <a href="#" style={{color: '#2563eb', textDecoration: 'none'}}>
                                            Матеріали ({lesson.homeworks.length})
                                        </a>
                                    ) : (
                                        <span style={{color: '#9ca3af'}}>—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}