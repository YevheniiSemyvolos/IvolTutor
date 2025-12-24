import Calendar from './components/Calendar';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Шапка з перемикачем */}
      <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          Tutor CRM
        </h1>
        <ThemeToggle />
      </header>

      <main className="h-[calc(100vh-80px)]">
        <Calendar />
      </main>
    </div>
  );
}

export default App;