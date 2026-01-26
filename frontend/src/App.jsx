import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Navbar from './components/Navbar';
import Calendar from './pages/Calendar';
import Help from './pages/Help';
import Welcome from './pages/Welcome';

import StudentsPage from './pages/Students';
import StudentProfile from './pages/Students/Profile';

function App() {
  const { isAuthenticated, initializing } = useAuth();

  // Показуємо loading state під час ініціалізації
  if (initializing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--cal-bg)',
        color: 'var(--cal-text)'
      }}>
        <div>Завантаження...</div>
      </div>
    );
  }

  // Якщо не авторизований, показуємо Welcome page
  if (!isAuthenticated) {
    return <Welcome />;
  }

  // Якщо авторизований, показуємо основний додаток
  return (
    <>
      <Navbar />
      
      <main 
        style={{ paddingTop: 'calc(var(--navbar-height) + 12px)' }} 
        className="
          min-h-screen 
          w-full 
          overflow-x-hidden 
          transition-colors duration-300
          bg-white dark:bg-gray-900
        "
      >
        <Routes>
          <Route path="/" element={<Calendar />} />
          <Route path="/help" element={<Help />} />
          
          {/* Маршрути для студентів */}
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:slug" element={<StudentProfile />} />
        </Routes>
      </main>
    </>
  );
}

export default App;