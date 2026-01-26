import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StudentModal from './Modals/StudentModal';
import PaymentModal from './Modals/PaymentModal';
import styles from './Students.module.css';

export default function StudentsPage() {
  const { apiClient } = useAuth();
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [sortField, setSortField] = useState('full_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const res = await apiClient.get('/students/');
      setStudents(res.data);
    } catch (e) {
      console.error("Error loading students:", e);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [apiClient]);

  // Функція для сортування студентів
  const getSortedStudents = () => {
    const sorted = [...students].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Обробка null/undefined значень
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Сортування для чисел
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Сортування для рядків
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue, 'uk-UA')
          : bValue.localeCompare(aValue, 'uk-UA');
      }

      return 0;
    });
    return sorted;
  };

  // Функція для зміни сортування
  const handleSort = (field) => {
    if (sortField === field) {
      // Якщо натиснули на той же стовпець, то змінюємо напрямок
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Якщо натиснули на новий стовпець, то сортуємо по зростанню
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Функція для отримання індикатора сортування
  const getSortIndicator = (field) => {
    if (sortField !== field) return ' ▲';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  // Стиль для заголовків з зарезервованим місцем для стрілки
  const thStyle = {
    cursor: 'pointer',
    userSelect: 'none',
    minWidth: 'fit-content'
  };

  // Стиль для стрілки при неактивному заголовку
  const getIndicatorStyle = (field) => {
    return sortField === field ? {} : { opacity: 0 };
  };

  const handleCreateStudent = async (formData) => {
    try {
      await apiClient.post('/students/', formData);
      setIsModalOpen(false);
      fetchStudents();
    } catch (e) {
      alert("Не вдалося створити студента");
      console.error(e);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedStudentForPayment(null);
    fetchStudents(); // Refresh to show updated balance
  };

  const openAddModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
            <h1 className={styles.pageTitle}>Студенти</h1>
            <p className={styles.subTitle}>Керуйте списком учнів та їх балансами</p>
        </div>
        <button onClick={openAddModal} className={styles.addBtn}>
          <span>+</span> Новий студент
        </button>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
            <thead>
                <tr>
                  <th 
                    className={styles.th}
                    onClick={() => handleSort('full_name')}
                    style={thStyle}
                  >
                    Ім'я<span style={getIndicatorStyle('full_name')}>{getSortIndicator('full_name')}</span>
                  </th>
                  <th 
                    className={styles.th}
                    onClick={() => handleSort('grade')}
                    style={thStyle}
                  >
                    Клас<span style={getIndicatorStyle('grade')}>{getSortIndicator('grade')}</span>
                  </th>
                  <th 
                    className={styles.th}
                    onClick={() => handleSort('telegram_contact')}
                    style={thStyle}
                  >
                    Контакти<span style={getIndicatorStyle('telegram_contact')}>{getSortIndicator('telegram_contact')}</span>
                  </th>
                  <th 
                    className={styles.th}
                    onClick={() => handleSort('default_price')}
                    style={thStyle}
                  >
                    Тариф<span style={getIndicatorStyle('default_price')}>{getSortIndicator('default_price')}</span>
                  </th>
                  <th 
                    className={styles.th}
                    onClick={() => handleSort('balance')}
                    style={thStyle}
                  >
                    Баланс<span style={getIndicatorStyle('balance')}>{getSortIndicator('balance')}</span>
                  </th>
                </tr>
            </thead>
            <tbody>
                {getSortedStudents().map(s => (
                <tr 
                    key={s.id} 
                    className={styles.tr}
                    onClick={() => navigate(`/students/${s.slug}`)}
                >
                    <td className={styles.td}>
                        <div style={{fontWeight: 500, fontSize: '1rem'}}>{s.full_name}</div>
                        {s.parent_name && <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>Батьки: {s.parent_name}</div>}
                    </td>
                    <td className={styles.td}>{s.grade || '—'}</td>
                    <td className={styles.td}>{s.telegram_contact || '—'}</td>
                    <td className={styles.td}>{s.default_price} грн</td>
                    <td className={styles.td}>
                        <span className={s.balance < 0 ? styles.balanceNegative : styles.balancePositive}>
                            {s.balance} грн
                        </span>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        {students.length === 0 && (
            <div className={styles.emptyState}>
                Список порожній. Додайте першого студента!
            </div>
        )}
      </div>

      <StudentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStudent}
        studentToEdit={null} // Завжди null, бо тут тільки створення
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