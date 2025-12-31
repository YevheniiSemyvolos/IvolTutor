import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Calendar from './pages/Calendar';
import Help from './pages/Help';

// 1. Імпортуємо нові сторінки
import StudentsPage from './pages/Students';
import StudentProfile from './pages/Students/Profile';

function App() {
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
          
          {/* 2. Додаємо маршрути для студентів */}
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentProfile />} />
        </Routes>
      </main>
    </>
  );
}

export default App;