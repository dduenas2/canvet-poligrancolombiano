import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROL_INFO = {
  admin: {
    label: 'Administrador',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    descripcion: 'Acceso completo al sistema. Gestiona usuarios, configura servicios y supervisa todas las operaciones.',
    puede: [
      'Gestionar todos los usuarios del sistema',
      'CRUD completo de pacientes y propietarios',
      'Crear, registrar pagos y anular facturas',
      'Ver todos los reportes financieros y operativos',
      'Configurar servicios y categorías',
      'Ver y gestionar todas las citas',
    ],
    noPuede: [],
  },
  recepcionista: {
    label: 'Recepcionista',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    descripcion: 'Gestión operativa del día a día: citas, registros de pacientes y facturación.',
    puede: [
      'Registrar, actualizar y cancelar citas',
      'Crear y editar pacientes y propietarios',
      'Crear facturas y registrar pagos',
      'Ver reportes operativos',
      'Ver catálogo de servicios',
    ],
    noPuede: [
      'Gestionar cuentas de usuario del sistema',
      'Anular facturas (exclusivo del admin)',
      'Eliminar pacientes o propietarios',
      'Crear o modificar servicios y categorías',
    ],
  },
  veterinario: {
    label: 'Veterinario',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    descripcion: 'Enfoque 100% clínico: atención de pacientes y registro de historiales médicos.',
    puede: [
      'Ver y gestionar sus propias citas',
      'Registrar y editar historiales clínicos',
      'Ver pacientes y sus datos clínicos',
      'Ver catálogo de servicios',
    ],
    noPuede: [
      'Acceder a facturación y pagos',
      'Gestionar propietarios',
      'Ver reportes financieros',
      'Gestionar usuarios del sistema',
      'Eliminar ni crear pacientes',
    ],
  },
  cliente: {
    label: 'Cliente / Propietario',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    descripcion: 'Portal de autoservicio para gestionar tus mascotas y citas personales.',
    puede: [
      'Ver tus mascotas e historiales clínicos',
      'Agendar y cancelar tus citas',
      'Consultar el catálogo de servicios',
      'Ver tus facturas',
    ],
    noPuede: [
      'Acceder a información de otros clientes',
      'Ver reportes o estadísticas',
      'Gestionar propietarios o usuarios',
      'Crear, editar o eliminar pacientes',
    ],
  },
};

const SinAcceso = ({ rolRequerido = [] }) => {
  const { usuario } = useAuth();
  const info = ROL_INFO[usuario?.rol];

  const rolesNombres = rolRequerido.map(r => ROL_INFO[r]?.label || r).join(', ');

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Bloque principal */}
      <div className="card p-8 text-center mb-6">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
          🔒
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Sin acceso a esta sección</h1>
        <p className="text-slate-500 text-sm mb-4">
          Tu rol de <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-0.5 ${info?.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${info?.dot}`} />
            {info?.label}
          </span> no tiene permiso para ver esta sección.
        </p>
        {rolRequerido.length > 0 && (
          <p className="text-xs text-slate-400 mb-6">
            Requiere: <span className="font-medium text-slate-600">{rolesNombres}</span>
          </p>
        )}
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Volver al inicio
        </Link>
      </div>

      {/* Capacidades del rol */}
      {info && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-1">
            ¿Qué puede hacer un {info.label}?
          </h2>
          <p className="text-sm text-slate-500 mb-5">{info.descripcion}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Puede */}
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">✓ Tiene acceso a</p>
              <ul className="space-y-1.5">
                {info.puede.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* No puede */}
            {info.noPuede.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">✗ Sin acceso a</p>
                <ul className="space-y-1.5">
                  {info.noPuede.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <svg className="w-4 h-4 text-red-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SinAcceso;
