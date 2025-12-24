import Calendar from './components/Calendar';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--navbar-height) + 12px)' }} className="min-h-screen w-full max-w-full overflow-x-hidden">
        <Calendar />
      </main>
    </div>
  );
}

export default App;