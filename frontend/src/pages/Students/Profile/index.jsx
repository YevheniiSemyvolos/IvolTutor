import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Profile.module.css';
import StudentModal from '../Modals/StudentModal';
import PaymentModal from '../Modals/PaymentModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function StudentProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Функція завантаження даних
  const fetchData = async (newOffset = 0) => {
    const isInitialLoad = newOffset === 0;
    if (isInitialLoad) setLoading(true);
    else setLoadingMore(true);

    try {
      const resStudent = await axios.get(`${API_URL}/students/${slug}`);
      if (isInitialLoad) setStudent(resStudent.data);

      const resLessons = await axios.get(`${API_URL}/lessons/`, {
        params: {
          start: '2023-01-01T00:00:00',
          end: '2028-01-01T00:00:00',
          student_id: resStudent.data.id,
          status: 'completed,cancelled,no_show',
          skip: newOffset,
          limit: 5
        }
      });
      
      if (isInitialLoad) {
        setLessons(resLessons.data);
      } else {
        setLessons(prev => [...prev, ...resLessons.data]);
      }

      // Якщо отримано менше 5 занять, то більше немає
      setHasMore(resLessons.data.length === 5);
      setOffset(newOffset + 5);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      if (isInitialLoad) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, [slug]);

  // Функція для завантаження ще 5 занять
  const handleLoadMore = () => {
    fetchData(offset);
  };

  // Функція для розрахунку списаної ціни залежно від статусу
  const getChargedPrice = (lesson) => {
    if (lesson.status === 'completed') {
      return lesson.price; // 100% ціни
    } else if (lesson.status === 'no_show') {
      return lesson.price * 0.5; // 50% ціни
    } else {
      return 0; // cancelled, planned - не списано
    }
  };

  // Обробка збереження змін
  const handleUpdateStudent = async (formData) => {
    try {
      await axios.patch(`${API_URL}/students/${student.id}`, formData);
      setIsEditModalOpen(false);
      fetchData(); // Оновлюємо дані на сторінці
    } catch (e) {
      alert("Не вдалося оновити дані");
      console.error(e);
    }
  };

  // Обробка успішного внесення платежу
  const handlePaymentSuccess = () => {
    fetchData(); // Оновлюємо дані, включаючи баланс
    setIsPaymentModalOpen(false);
  };

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
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div>
              <h1 className={styles.studentName}>{student.full_name}</h1>
              <p className={styles.parentName}>
                {student.parent_name ? `Батьки: ${student.parent_name}` : 'Батьки не вказані'}
              </p>
            </div>
            
            {/* Кнопка редагування (олівець) */}
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className={styles.edit}
              title="Редагувати профіль"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>

          <div className={`${styles.balanceBadge} ${student.balance < 0 ? styles.negative : styles.positive}`}>
            Баланс: {student.balance} грн
          </div>
          
          <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className={styles.paymentBtn}
            title="Внесити платіж"
          >
            💳 Внесити платіж
          </button>
        </div>
        
        {/* Основна інформація: Клас, Контакт, Тариф */}
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Клас</span>
            <span className={styles.detailValue}>{student.grade || '-'}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Контакт</span>
            <span className={styles.detailValue}>{student.telegram_contact || '-'}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Тариф</span>
            <span className={styles.detailValue}>{student.default_price} грн</span>
          </div>
        </div>

        {/* Коментар окремим блоком знизу */}
        <div className={styles.commentSection}>
          <span className={styles.detailLabel}>Коментар</span>
          <div className={styles.detailValue} style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>
            {student.comment || '-'}
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
                        lesson.status === 'no_show' ? styles.statusNoshow :
                        styles.statusPlanned
                      }`}>
                        {lesson.status === 'completed' ? 'Проведено' : 
                         lesson.status === 'cancelled' ? 'Скасовано' :
                         lesson.status === 'no_show' ? 'Не прийшов' :
                         'Заплановано'}
                      </span>
                    </td>
                    <td className={styles.td}>{getChargedPrice(lesson)} грн</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {hasMore && (
          <div style={{display: 'flex', justifyContent: 'center', marginTop: '1.5rem'}}>
            <button 
              onClick={handleLoadMore}
              className={styles.loadMoreBtn}
              disabled={loadingMore}
            >
              {loadingMore ? 'Завантаження...' : 'Ще...'}
            </button>
          </div>
        )}
      </div>

      {/* Модальне вікно редагування */}
      <StudentModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateStudent}
        student={student} 
      />

      {/* Модальне вікно внесення платежу */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        preselectedStudentId={student?.id}
        students={[]}
      />
    </div>
  );
}