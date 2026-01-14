import { Routes, Route, Link } from 'react-router-dom';
import TrainingsPage from './pages/TrainingsPage.js';
import TrainingDetailPage from './pages/TrainingDetailPage.js';
import AdminPage from './pages/AdminPage.js';

const App = () => {
  return (
    <div className="app">
      <header>
        <h1>Interactive Training Platform</h1>
        <nav>
          <Link to="/">Szkolenia</Link> | <Link to="/admin">Panel administratora</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<TrainingsPage />} />
          <Route path="/trainings/:id" element={<TrainingDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
