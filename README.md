# CanVet — Sistema Web de Gestión de Servicios de Atención Canina

> Proyecto académico — Gerencia de Proyectos Informáticos
> Politécnico Grancolombiano · 2026

## Descripción

**CanVet** es una aplicación web full-stack para la gestión integral de servicios de atención canina en clínicas veterinarias. Cubre 5 categorías de servicios: salud preventiva y correctiva, estética y relajación, nutrición, guardería y servicios funerarios.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Base de datos | MongoDB + Mongoose |
| Autenticación | JWT + bcrypt |
| Gráficos | Recharts |
| PDF | jsPDF + jsPDF-AutoTable |
| Despliegue | Render.com + MongoDB Atlas |

## Módulos del Sistema

1. **Autenticación y Roles** — 4 roles: Admin, Veterinario, Recepcionista, Cliente
2. **Gestión de Propietarios y Pacientes** — CRUD completo con búsqueda avanzada
3. **Servicios Clínicos** — Catálogo con 5 categorías y 20+ servicios
4. **Historial Clínico** — Registro cronológico por canino
5. **Agendamiento de Citas** — Con verificación de disponibilidad en tiempo real
6. **Facturación** — Generación de facturas con PDF descargable
7. **Reportes** — 3 tipos de reportes con gráficos interactivos

## Instalación y Desarrollo Local

### Prerrequisitos
- Node.js >= 18
- MongoDB (local o Atlas)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd canvet

# 2. Instalar todas las dependencias
npm run install:all

# 3. Configurar variables de entorno
cp .env.example server/.env
# Editar server/.env con tus datos
```

**Variables de entorno (`server/.env`):**
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/canvet
JWT_SECRET=canvet_secret_key_2026
PORT=5000
NODE_ENV=development
```

```bash
# 4. Cargar datos de ejemplo
npm run seed

# 5. Iniciar en modo desarrollo (frontend + backend)
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@canvet.com | admin123 |
| Veterinario | vet1@canvet.com | vet123 |
| Veterinario | vet2@canvet.com | vet123 |
| Recepcionista | recep@canvet.com | recep123 |
| Cliente | cliente@canvet.com | cliente123 |

## Despliegue en Render.com

### MongoDB Atlas

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito (M0)
3. Crear usuario de base de datos
4. Agregar IP `0.0.0.0/0` en Network Access
5. Copiar la cadena de conexión

### Render.com

1. Crear cuenta en [Render.com](https://render.com)
2. Nuevo **Web Service** → conectar repositorio Git
3. Configurar:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. Agregar variables de entorno:
   ```
   MONGODB_URI=<tu-cadena-atlas>
   JWT_SECRET=canvet_secret_key_2026
   NODE_ENV=production
   ```
5. Desplegar

> En producción, el backend de Express sirve el frontend React como archivos estáticos.

## Estructura del Proyecto

```
canvet/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   │   ├── common/   # Spinner, Modal, Alerta, etc.
│   │   │   └── layout/   # Navbar, Sidebar, Layout
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Páginas por módulo
│   │   ├── services/      # Llamadas API (axios)
│   │   └── utils/         # Formato, PDF
│   └── package.json
├── server/                 # Backend Express
│   ├── config/            # Conexión MongoDB
│   ├── controllers/       # Lógica de negocio
│   ├── middleware/        # Auth JWT
│   ├── models/            # Esquemas Mongoose
│   ├── routes/            # Rutas API REST
│   ├── seeds/             # Script de datos ejemplo
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## API REST — Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/registro` | Registro cliente |
| GET | `/api/caninos` | Listar pacientes |
| POST | `/api/caninos` | Crear paciente |
| GET | `/api/historial/:caninoId` | Historial clínico |
| POST | `/api/citas` | Agendar cita |
| GET | `/api/citas/disponibilidad` | Verificar horario |
| POST | `/api/facturas` | Crear factura |
| GET | `/api/reportes/dashboard` | Estadísticas |

## Funcionalidades Destacadas

- **Dashboard dinámico** según rol del usuario
- **Búsqueda en tiempo real** de pacientes y propietarios
- **Verificación de disponibilidad** del veterinario al agendar
- **Generación de PDF** de facturas con diseño profesional
- **Gráficos interactivos** en reportes (Recharts)
- **Diseño responsivo** desde 320px (móvil)
- **Paginación** en todos los listados
- **Protección de rutas** según rol
- **Datos formateados** en COP y fechas en español

## Licencia

Proyecto académico — Politécnico Grancolombiano 2026
