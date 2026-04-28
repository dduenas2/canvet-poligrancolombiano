import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reporteService, citaService } from '../../services';
import { formatearMoneda } from '../../utils/formato';

/* ── Tarjeta de estadística con gradiente ─────────────────────── */
const StatCard = ({ label, value, sub, gradient, icon }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient} shadow-lg`}>
    {/* Círculo decorativo de fondo */}
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -right-2 -bottom-6 w-32 h-32 rounded-full bg-white/5" />
    <div className="relative z-10">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-3xl font-extrabold leading-none">{value ?? '—'}</div>
      <div className="text-sm font-medium mt-1 text-white/80">{label}</div>
      {sub && <div className="text-xs mt-0.5 text-white/60">{sub}</div>}
    </div>
  </div>
);

/* ── Acceso rápido ────────────────────────────────────────────── */
const AccesoRapido = ({ to, icon, label, desc, color }) => {
  const colors = {
    emerald: 'hover:bg-emerald-50 hover:border-emerald-200 group-hover:text-emerald-600',
    blue:    'hover:bg-blue-50    hover:border-blue-200    group-hover:text-blue-600',
    violet:  'hover:bg-violet-50  hover:border-violet-200  group-hover:text-violet-600',
    amber:   'hover:bg-amber-50   hover:border-amber-200   group-hover:text-amber-600',
    rose:    'hover:bg-rose-50    hover:border-rose-200    group-hover:text-rose-600',
    slate:   'hover:bg-slate-50   hover:border-slate-200   group-hover:text-slate-700',
  };
  const iconColors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue:    'bg-blue-100    text-blue-600',
    violet:  'bg-violet-100  text-violet-600',
    amber:   'bg-amber-100   text-amber-600',
    rose:    'bg-rose-100    text-rose-600',
    slate:   'bg-slate-100   text-slate-600',
  };
  return (
    <Link to={to}
      className={`group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-card
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${colors[color]}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${iconColors[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`font-semibold text-slate-900 text-sm transition-colors ${colors[color]}`}>{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
      </div>
      <svg className="w-4 h-4 text-slate-300 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
      </svg>
    </Link>
  );
};

/* ── Badge de estado ──────────────────────────────────────────── */
const EstadoBadge = ({ estado }) => {
  const cfg = {
    pendiente:  { label: 'Pendiente',  cls: 'bg-amber-100   text-amber-700' },
    confirmada: { label: 'Confirmada', cls: 'bg-blue-100    text-blue-700' },
    atendida:   { label: 'Atendida',   cls: 'bg-emerald-100 text-emerald-700' },
    cancelada:  { label: 'Cancelada',  cls: 'bg-slate-100   text-slate-500' },
  }[estado] || { label: estado, cls: 'bg-slate-100 text-slate-500' };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

/* ── Componente principal ─────────────────────────────────────── */
const Dashboard = () => {
  const { usuario, esAdmin, esVeterinario, esRecepcionista, esCliente } = useAuth();
  const [stats, setStats]     = useState({});
  const [citas, setCitas]     = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([reporteService.dashboard(), citaService.getHoy()])
      .then(([s, c]) => { setStats(s.data); setCitas(c.data); })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const ahora = new Date();
  const hora  = ahora.getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const hoy = ahora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const nombre = usuario?.nombre?.split(' ')[0] || '';

  /* Stats según rol */
  const statsCards = esAdmin()
    ? [
        { label: 'Pacientes registrados', value: stats.totalCaninos,               icon: '🐕', gradient: 'bg-gradient-to-br from-brand-500 to-brand-700' },
        { label: 'Citas hoy',             value: stats.citasHoy,                   icon: '📅', gradient: 'bg-gradient-to-br from-blue-500 to-blue-700' },
        { label: 'Ingresos del mes',      value: formatearMoneda(stats.ingresosMes), icon: '💰', gradient: 'bg-gradient-to-br from-violet-500 to-violet-700' },
        { label: 'Usuarios activos',      value: stats.totalUsuarios,              icon: '👥', gradient: 'bg-gradient-to-br from-amber-500 to-orange-600' },
      ]
    : esVeterinario()
    ? [
        { label: 'Mis citas hoy',         value: stats.citasHoy,     icon: '📅', gradient: 'bg-gradient-to-br from-brand-500 to-brand-700' },
        { label: 'Pacientes atendidos hoy', value: stats.pacientesHoy, icon: '🐕', gradient: 'bg-gradient-to-br from-blue-500 to-blue-700' },
        { label: 'Atendidos este mes',    value: stats.pacientesMes, icon: '📊', gradient: 'bg-gradient-to-br from-violet-500 to-violet-700' },
      ]
    : esRecepcionista()
    ? [
        { label: 'Citas pendientes',      value: stats.citasPendientes, icon: '⏳', gradient: 'bg-gradient-to-br from-amber-500 to-orange-600' },
        { label: 'Citas hoy',             value: stats.citasHoy,        icon: '📅', gradient: 'bg-gradient-to-br from-brand-500 to-brand-700' },
        { label: 'Facturas emitidas hoy', value: stats.facturasHoy,     icon: '🧾', gradient: 'bg-gradient-to-br from-violet-500 to-violet-700' },
      ]
    : [
        { label: 'Mis caninos',           value: stats.misCaninos,    icon: '🐕', gradient: 'bg-gradient-to-br from-brand-500 to-brand-700' },
        { label: 'Próximas citas',        value: stats.proximasCitas, icon: '📅', gradient: 'bg-gradient-to-br from-blue-500 to-blue-700' },
      ];

  /* Accesos rápidos según rol */
  const accesos = [
    { to: '/citas/nueva',       icon: '📅', label: 'Agendar cita',    desc: 'Reserva una nueva cita', color: 'emerald', roles: ['admin','recepcionista','cliente','veterinario'] },
    { to: '/pacientes/nuevo',   icon: '🐕', label: 'Nuevo paciente',  desc: 'Registra un canino',     color: 'blue',    roles: ['admin','recepcionista','veterinario'] },
    { to: '/propietarios',      icon: '👥', label: 'Propietarios',    desc: 'Gestiona propietarios',  color: 'violet',  roles: ['admin','recepcionista'] },
    { to: '/facturacion/nueva', icon: '🧾', label: 'Nueva factura',   desc: 'Emite una factura',      color: 'amber',   roles: ['admin','recepcionista'] },
    { to: '/servicios',         icon: '🏥', label: 'Servicios',       desc: 'Catálogo de servicios',  color: 'rose',    roles: ['admin','veterinario','recepcionista','cliente'] },
    { to: '/reportes',          icon: '📊', label: 'Reportes',        desc: 'Estadísticas y análisis',color: 'slate',   roles: ['admin','recepcionista'] },
  ].filter(a => a.roles.includes(usuario?.rol));

  /* Colores de avatar de cita */
  const avatarColors = ['bg-brand-500','bg-blue-500','bg-violet-500','bg-amber-500','bg-rose-500','bg-emerald-500'];

  if (cargando) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── BANNER DE BIENVENIDA ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-7 text-white shadow-xl">
        {/* Imagen de fondo: perro */}
        <img
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&auto=format&q=70"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-15 mix-blend-luminosity"
          onError={e => e.target.style.display = 'none'}
        />
        {/* Degradado sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-slate-900/30" />
        {/* Decoración */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-500/10 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-brand-400/10 translate-y-1/2" />
        <div className="absolute top-4 right-28 w-12 h-12 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-brand-300 text-sm font-medium mb-1">{saludo} 👋</p>
            <h1 className="text-3xl font-extrabold tracking-tight">{nombre}</h1>
            <p className="text-slate-400 text-sm mt-1.5 capitalize">{hoy}</p>
          </div>

          {/* Píldora resumen */}
          <div className="hidden md:flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10 shrink-0">
            <div className="text-4xl font-extrabold text-white">{stats.citasHoy ?? 0}</div>
            <div className="text-xs text-slate-300 mt-1 font-medium">citas hoy</div>
            <Link to="/citas" className="mt-2 text-xs text-brand-300 hover:text-brand-200 font-medium">
              Ver agenda →
            </Link>
          </div>
        </div>

        {/* Rol badge */}
        <div className="relative z-10 mt-4">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-medium text-slate-200 capitalize">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            {usuario?.rol}
          </span>
        </div>
      </div>

      {/* ── ESTADÍSTICAS ──────────────────────────────────────── */}
      <div className={`grid gap-4 ${statsCards.length === 4 ? 'grid-cols-2 xl:grid-cols-4' : statsCards.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
        {statsCards.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* ── CITAS + ACCESOS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Citas del día — 3/5 */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900">Agenda de hoy</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {citas.length === 0 ? 'Sin citas programadas' : `${citas.length} cita${citas.length !== 1 ? 's' : ''} programada${citas.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Link to="/citas"
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold bg-brand-50 px-3 py-1.5 rounded-full transition-colors">
              Ver todas
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Lista */}
          <div className="divide-y divide-slate-50">
            {citas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mb-4">📅</div>
                <p className="font-medium text-slate-600">Todo tranquilo por hoy</p>
                <p className="text-sm text-slate-400 mt-1">No hay citas programadas</p>
                <Link to="/citas/nueva" className="mt-4 btn-primary btn-sm">
                  Agendar cita
                </Link>
              </div>
            ) : (
              citas.map((c, i) => (
                <div key={c._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/70 transition-colors">
                  {/* Hora */}
                  <div className="w-14 shrink-0 text-center">
                    <div className="text-sm font-bold text-brand-700">{c.hora}</div>
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                    {c.canino?.nombre?.charAt(0).toUpperCase() || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{c.canino?.nombre}</div>
                    <div className="text-xs text-slate-400 truncate">{c.servicio?.nombre}</div>
                  </div>

                  {/* Vet — solo en pantallas grandes */}
                  <div className="hidden sm:block text-right shrink-0">
                    <div className="text-xs text-slate-500 font-medium">Dr(a). {c.veterinario?.nombre?.split(' ')[0]}</div>
                  </div>

                  <EstadoBadge estado={c.estado} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Accesos rápidos — 2/5 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-bold text-slate-900">Accesos rápidos</h2>
          </div>
          <div className="space-y-2.5">
            {accesos.map(a => (
              <AccesoRapido key={a.to} {...a} />
            ))}
            {accesos.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No hay accesos disponibles</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
