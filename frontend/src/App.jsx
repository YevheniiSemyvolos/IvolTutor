import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Calendar from './pages/Calendar';
import Help from './pages/Help';

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
          transition-colors duration-300  /* Перенесли сюди плавність */
          bg-white dark:bg-gray-900       /* Фон має бути тут або в body */
        "
      >
        <Routes>
          <Route path="/" element={<Calendar />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>
    </>
  );
}

export default App;