import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const roles = [
    { id: 'admin', name: 'Admin Central (MINEDUC)', path: '/admin/home', icon: '👨‍💼', desc: 'Gestión de entidades y configuración del sistema' },
    { id: 'entidad', name: 'Entidad Ejecutora', path: '/entidad/home', icon: '🏢', desc: 'Administración de monitores y talleres' },
    { id: 'monitor', name: 'Monitor', path: '/monitor/home', icon: '👨‍🏫', desc: 'Gestión de sesiones y control de asistencia' },
    { id: 'gestor', name: 'Gestor Territorial', path: '/gestor/home', icon: '📋', desc: 'Supervisión y auditoría de talleres' },
    { id: 'alumno', name: 'Alumno (Check-in)', path: '/check/demo', icon: '🎓', desc: 'Registro de asistencia a talleres' }
  ];

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  return (
    <>
      <div className="header">
        <h1>Sistema SAMPS</h1>
        <p>Sistema de Asistencia y Monitoreo de Programas Sociales - MINEDUC</p>
      </div>
      
      <div className="login-container">
        <h2 style={{ marginBottom: '30px', color: '#2c3e50', fontSize: '1.8em' }}>Selecciona tu perfil de acceso</h2>
        
        <div className="role-buttons">
          {roles.map(role => (
            <button
              key={role.id}
              className="role-button"
              onClick={() => handleRoleSelect(role.path)}
              aria-label={`Ingresar como ${role.name}: ${role.desc}`}
            >
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>{role.icon}</div>
              <div style={{ fontSize: '1.1em', fontWeight: '700', marginBottom: '8px' }}>{role.name}</div>
              <div style={{ fontSize: '0.9em', opacity: '1', fontWeight: '400', color: 'rgba(255,255,255,0.95)' }}>{role.desc}</div>
            </button>
          ))}
        </div>
        
        <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
          <p style={{ margin: '0', color: '#495057', fontSize: '14px' }}>
            <strong>💡 Prototipo de Demostración:</strong> Selecciona cualquier rol para explorar las funcionalidades del sistema.
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;