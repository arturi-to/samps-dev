import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/') return null;

  const navItems = [
    { path: '/admin/home', label: '👨‍💼 Admin', icon: '🏛️' },
    { path: '/entidad/home', label: '🏢 Entidad', icon: '📋' },
    { path: '/monitor/home', label: '👨‍🏫 Monitor', icon: '✅' },
    { path: '/gestor/home', label: '📊 Gestor', icon: '🔍' }
  ];

  const currentItem = navItems.find(item => item.path === location.pathname);

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #003d7a, #0056b3)',
      padding: '12px 30px',
      boxShadow: '0 2px 8px rgba(0,61,122,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          {currentItem?.icon} SAMPS - {currentItem?.label || 'Sistema'}
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.5),',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                }
              }}
              onMouseOut={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {item.label}
            </button>
          ))}
          
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.3)' }} />
          
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🏠 Inicio
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;