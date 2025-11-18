# Sistema SAMPS - Prototipo MINEDUC

Sistema de check-in para talleres educativos del Ministerio de Educación de Chile.

## Tecnologías

- **Frontend:** React + Vite
- **Backend:** json-server (mock)
- **Base de datos:** JSON file

## Instalación

```bash
# Instalar dependencias backend
cd backend
npm install

# Instalar dependencias frontend
cd ../frontend
npm install
```

## Ejecución

### Opción 1: Script automático
```bash
start.bat
```

### Opción 2: Manual
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

## Funcionalidades

- ✅ Check-in con QR y código
- ✅ Dashboard por roles
- ✅ Gestión de asistencias
- ✅ Validación de RUT chileno

## Roles

- **Admin:** Gestión completa
- **Entidad:** Gestión de talleres
- **Monitor:** Check-in y asistencias
- **Gestor:** Supervisión