import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Profile.module.css';
import StudentModal from '../Modals/StudentModal';
import PaymentModal from '../Modals/PaymentModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STATUS_CONFIG = {
  completed: { label: 'Проведено', style: 'statusCompleted' },
  cancelled: { label: 'Скасовано', style: 'statusCancelled' },
  no_show: { label: 'Не прийшов', style: 'statusNoshow' },
  planned: { label: 'Заплановано', style: 'statusPlanned' }
};

// Розрахунок списаної ціни
const getChargedPrice = (lesson) => {
  if (lesson.status === 'completed') return lesson.price;
  if (lesson.status === 'no_show') return lesson.price * 0.5;
  return 0;
};

export default function StudentProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { apiClient } = useAuth();
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMorePayments, setLoadingMorePayments] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [paymentOffset, setPaymentOffset] = useState(0);
  const [hasMorePayments, setHasMorePayments] = useState(true);

  // Функція завантаження даних
  const fetchData = async (newOffset = 0) => {
    const isInitialLoad = newOffset === 0;
    if (isInitialLoad) setLoading(true);
    else setLoadingMore(true);

    try {
      const resStudent = await apiClient.get(`/students/${slug}`);
      if (isInitialLoad) setStudent(resStudent.data);

      const resLessons = await apiClient.get('/lessons/', {
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
        
        // Завантажуємо платежі тільки при першому завантаженні
        const resPayments = await apiClient.get(`/payments/student/${resStudent.data.id}`, {
          params: {
            skip: 0,
            limit: 3
          }
        });
        setPayments(resPayments.data);
        setHasMorePayments(resPayments.data.length === 3);
        setPaymentOffset(3);
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

  // Функція завантаження ще платежів
  const fetchMorePayments = async () => {
    setLoadingMorePayments(true);
    try {
      const resPayments = await apiClient.get(`/payments/student/${student.id}`, {
        params: {
          skip: paymentOffset,
          limit: 3
        }
      });
      setPayments(prev => [...prev, ...resPayments.data]);
      setHasMorePayments(resPayments.data.length === 3);
      setPaymentOffset(paymentOffset + 3);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoadingMorePayments(false);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, [slug, apiClient]);

  // Функція для завантаження ще 5 занять
  const handleLoadMore = () => {
    fetchData(offset);
  };

  // Обробка збереження змін
  const handleUpdateStudent = async (formData) => {
    try {
      await apiClient.patch(`/students/${student.id}`, formData);
      setIsEditModalOpen(false);
      fetchData(); // Оновлюємо дані на сторінці
    } catch (e) {
      alert("Не вдалося оновити дані");
      console.error(e);
    }
  };

  // Обробка успішного внесення платежу
  const handlePaymentSuccess = async () => {
    // Оновлюємо студента для актуального балансу
    const resStudent = await apiClient.get(`/students/${slug}`);
    setStudent(resStudent.data);
    
    // Перезавантажуємо платежі з пагінацією (останні 3)
    const resPayments = await apiClient.get(`/payments/student/${resStudent.data.id}`, {
      params: {
        skip: 0,
        limit: 3
      }
    });
    setPayments(resPayments.data);
    setHasMorePayments(resPayments.data.length === 3);
    setPaymentOffset(3);
    
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
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.studentName}>{student.full_name}</h1>
              <p className={styles.parentName}>
                {student.parent_name ? `Батьки: ${student.parent_name}` : 'Батьки не вказані'}
              </p>
            </div>
            
            {/* Кнопка редагування (олівець) */}
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className={styles.editBtn}
              title="Редагувати профіль"
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
            <span className={styles.detailLabel}>ТГ контакт</span>
            {student.telegram_contact ? (
              <a 
                href={`https://t.me/${student.telegram_contact.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.detailValue} ${styles.tg_link}`}
              >
                {student.telegram_contact}
              </a>
            ) : (
              <span className={styles.detailValue}>-</span>
            )}
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Тариф</span>
            <span className={styles.detailValue}>{student.default_price} грн</span>
          </div>
        </div>

        {/* Коментар окремим блоком знизу */}
        <div className={styles.commentSection}>
          <span className={styles.detailLabel}>Коментар</span>
          <div className={styles.commentValue}>
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
                  <th className={styles.th}>Матеріал</th>
                  <th className={styles.th}>Домашнє завдання</th>
                  <th className={styles.th}>Статус</th>
                  <th className={styles.th}>Ціна</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map(lesson => (
                  <tr key={lesson.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.dateMain}>{new Date(lesson.start_time).toLocaleDateString('uk-UA')}</div>
                      <div className={styles.dateTime}>
                        {new Date(lesson.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className={styles.td}>{lesson.topic || 'Без теми'}</td>
                    <td className={styles.td}>
                      {lesson.material_url ? (
                        <a 
                          href={`${API_URL}${lesson.material_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.fileLink}
                        >
                          Переглянути
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={styles.td}>
                      {lesson.homework_url ? (
                        <a 
                          href={`${API_URL}${lesson.homework_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.fileLink}
                        >
                          Переглянути
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${styles[STATUS_CONFIG[lesson.status]?.style || 'statusPlanned']}`}>
                        {STATUS_CONFIG[lesson.status]?.label || lesson.status}
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
          <div className={styles.loadMoreWrapper}>
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

      {/* Архів платежів */}
      <h2 className={styles.sectionTitle}>Архів платежів</h2>
      <div className={styles.tableCard}>
        {payments.length === 0 ? (
          <div className={styles.emptyState}>Платежів немає</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Дата</th>
                  <th className={styles.th}>Час</th>
                  <th className={styles.th}>Сума</th>
                  <th className={styles.th}>Коментар</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.dateMain}>{new Date(payment.date).toLocaleDateString('uk-UA')}</div>
                    </td>
                    <td className={styles.td}>
                      {payment.payment_time || new Date(payment.date).toLocaleTimeString('uk-UA', {hour: '2-digit', minute:'2-digit', hour12: false})}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.paymentAmount}>+{payment.amount} грн</span>
                    </td>
                    <td className={styles.td}>{payment.comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {hasMorePayments && (
          <div className={styles.loadMoreWrapper}>
            <button 
              onClick={fetchMorePayments}
              className={styles.loadMoreBtn}
              disabled={loadingMorePayments}
            >
              {loadingMorePayments ? 'Завантаження...' : 'Ще...'}
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