@echo off
echo ========================================
echo    Sistema SAMPS - Prototipo MINEDUC
echo ========================================
echo.
echo Iniciando servicios...
echo.

echo [1/2] Iniciando Backend (json-server)...
cd backend
start "SAMPS Backend" cmd /k "npm start"
cd ..

echo [2/2] Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo Iniciando Frontend (React)...
cd frontend
start "SAMPS Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo   Servicios iniciados correctamente
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul