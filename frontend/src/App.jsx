import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Navbar from './components/Navbar';
import Calendar from './pages/Calendar';
import Help from './pages/Help';
import Welcome from './pages/Welcome';

import StudentsPage from './pages/Students';
import StudentProfile from './pages/Students/Profile';

function RequireAuth() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function AppLayout() {
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
        <Outlet />
      </main>
    </>
  );
}

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

  return (
    <Routes>
      {/* Публічний маршрут авторизації */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/calendar" replace /> : <Welcome />}
      />

      {/* Захищені маршрути */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/help" element={<Help />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:slug" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* Фолбек */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/calendar' : '/'} replace />}
      />
    </Routes>
  );
}

export default App;