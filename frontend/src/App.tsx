import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VehicleFormPage from './pages/VehicleFormPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🚗 Taller Autos
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link to="/nuevo-vehiculo" className="nav-link btn-primary">
                  + Nuevo Ingreso
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nuevo-vehiculo" element={<VehicleFormPage />} />
            <Route path="/vehiculo/:id" element={<VehicleDetailPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2024 Taller Autos - Sistema de Gestión con Detección de Daños por IA</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

