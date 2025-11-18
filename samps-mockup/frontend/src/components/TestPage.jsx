import { useParams } from 'react-router-dom';
import { useErrorHandler } from '../hooks/useErrorHandler';

const TestPage = () => {
  const { sesionId } = useParams();
  const { loading, error } = useErrorHandler();
  
  return (
    <div className="dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="header">
        <h1>Página de Prueba</h1>
      </div>
      <div className="card">
        <h2>Test de Routing</h2>
        <p><strong>Sesión ID capturada:</strong> {sesionId || 'No capturada'}</p>
        <p><strong>URL actual:</strong> {window.location.href}</p>
        <p><strong>Pathname:</strong> {window.location.pathname}</p>
      </div>
    </div>
  );
};

export default TestPage;