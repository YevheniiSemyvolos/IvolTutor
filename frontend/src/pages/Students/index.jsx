import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StudentModal from './Modals/StudentModal';
import PaymentModal from './Modals/PaymentModal';
import styles from './Students.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students/`);
      setStudents(res.data);
    } catch (e) {
      console.error("Error loading students:", e);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (formData) => {
    try {
      await axios.post(`${API_URL}/students/`, formData);
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
                  <th className={styles.th}>Ім'я</th>
                  <th className={styles.th}>Контакти</th>
                  <th className={styles.th}>Тариф</th>
                  <th className={styles.th}>Баланс</th>
                </tr>
            </thead>
            <tbody>
                {students.map(s => (
                <tr 
                    key={s.id} 
                    className={styles.tr}
                    onClick={() => navigate(`/students/${s.slug}`)}
                >
                    <td className={styles.td}>
                        <div style={{fontWeight: 500, fontSize: '1rem'}}>{s.full_name}</div>
                        {s.parent_name && <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>Батьки: {s.parent_name}</div>}
                    </td>
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