import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Spinner from './components/common/Spinner';
import SinAcceso from './pages/SinAcceso';

// Páginas
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Pacientes from './pages/pacientes/Pacientes';
import FormPaciente from './pages/pacientes/FormPaciente';
import Propietarios from './pages/propietarios/Propietarios';
import Servicios from './pages/servicios/Servicios';
import Historial from './pages/historial/Historial';
import Citas from './pages/citas/Citas';
import NuevaCita from './pages/citas/NuevaCita';
import Facturacion from './pages/facturacion/Facturacion';
import NuevaFactura from './pages/facturacion/NuevaFactura';
import Reportes from './pages/reportes/Reportes';
import Usuarios from './pages/usuarios/Usuarios';

// Componente para rutas protegidas
const RutaProtegida = ({ children, roles }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) return <Spinner />;

  if (!usuario) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(usuario.rol)) {
    return <Layout><SinAcceso rolRequerido={roles} /></Layout>;
  }

  return <Layout>{children}</Layout>;
};

// Componente para redirigir si ya está logueado
const RutaPublica = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) return <Spinner />;

  if (usuario) return <Navigate to="/dashboard" replace />;

  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Rutas públicas */}
    <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
    <Route path="/register" element={<RutaPublica><Register /></RutaPublica>} />

    {/* Rutas protegidas - todos los roles */}
    <Route path="/dashboard" element={
      <RutaProtegida>
        <Dashboard />
      </RutaProtegida>
    } />

    <Route path="/pacientes" element={
      <RutaProtegida roles={['admin', 'veterinario', 'recepcionista']}>
        <Pacientes />
      </RutaProtegida>
    } />
    <Route path="/pacientes/nuevo" element={
      <RutaProtegida roles={['admin', 'veterinario', 'recepcionista']}>
        <FormPaciente />
      </RutaProtegida>
    } />
    <Route path="/pacientes/:id" element={
      <RutaProtegida roles={['admin', 'veterinario', 'recepcionista']}>
        <FormPaciente />
      </RutaProtegida>
    } />

    <Route path="/propietarios" element={
      <RutaProtegida roles={['admin', 'recepcionista']}>
        <Propietarios />
      </RutaProtegida>
    } />

    <Route path="/servicios" element={
      <RutaProtegida>
        <Servicios />
      </RutaProtegida>
    } />

    <Route path="/historial/:caninoId" element={
      <RutaProtegida>
        <Historial />
      </RutaProtegida>
    } />

    <Route path="/citas" element={
      <RutaProtegida>
        <Citas />
      </RutaProtegida>
    } />
    <Route path="/citas/nueva" element={
      <RutaProtegida>
        <NuevaCita />
      </RutaProtegida>
    } />

    <Route path="/facturacion" element={
      <RutaProtegida roles={['admin', 'recepcionista', 'cliente']}>
        <Facturacion />
      </RutaProtegida>
    } />
    <Route path="/facturacion/nueva" element={
      <RutaProtegida roles={['admin', 'recepcionista']}>
        <NuevaFactura />
      </RutaProtegida>
    } />

    <Route path="/reportes" element={
      <RutaProtegida roles={['admin', 'recepcionista']}>
        <Reportes />
      </RutaProtegida>
    } />

    <Route path="/usuarios" element={
      <RutaProtegida roles={['admin']}>
        <Usuarios />
      </RutaProtegida>
    } />

    {/* Redirecciones */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
