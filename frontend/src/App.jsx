import Calendar from './components/Calendar';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <main style={{ paddingTop: 'var(--navbar-height)' }} className="min-h-screen w-full max-w-full overflow-x-hidden">
        <Calendar />
      </main>
    </div>
  );
}

export default App;