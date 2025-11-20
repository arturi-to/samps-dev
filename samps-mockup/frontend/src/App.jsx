import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EntidadDashboard from './components/EntidadDashboard';
import MonitorDashboard from './components/MonitorDashboard';
import GestorDashboard from './components/GestorDashboard';
import CheckinPage from './components/CheckinPage';
import TestPage from './components/TestPage';
import AlumnosManager from './components/AlumnosManager';
import Navbar from './components/Navbar';
import NotificationSystem from './components/NotificationSystem';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <NotificationSystem />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin/home" element={<AdminDashboard />} />
          <Route path="/entidad/home" element={<EntidadDashboard />} />
          <Route path="/monitor/home" element={<MonitorDashboard />} />
          <Route path="/gestor/home" element={<GestorDashboard />} />
          <Route path="/admin/alumnos" element={<AlumnosManager />} />
          <Route path="/test/:sesionId" element={<TestPage />} />
          <Route path="/check/:sesionId" element={<CheckinPage />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;