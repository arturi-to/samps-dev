import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeApp, getEnvironmentInfo } from './utils/envValidator'

// Inicializar aplicación
const init = async () => {
  const envInfo = getEnvironmentInfo();
  console.log('🚀 Iniciando SAMPS v' + envInfo.version);
  console.log('🌍 Entorno:', envInfo.environment);
  console.log('🔗 API URL:', envInfo.apiUrl);
  
  const isReady = await initializeApp();
  
  if (!isReady && envInfo.isProduction) {
    document.getElementById('root').innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
        <h2>⚠️ Error de Configuración</h2>
        <p>La aplicación no puede iniciarse debido a problemas de configuración.</p>
        <p>Por favor, contacta al administrador del sistema.</p>
      </div>
    `;
    return;
  }
  
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

init();