import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/dashboard',    icon: '▦',  label: 'Dashboard',     roles: ['admin','veterinario','recepcionista','cliente'] },
  { path: '/pacientes',    icon: '🐕', label: 'Pacientes',     roles: ['admin','veterinario','recepcionista'] },
  { path: '/propietarios', icon: '👥', label: 'Propietarios',  roles: ['admin','recepcionista'] },
  { path: '/servicios',    icon: '🏥', label: 'Servicios',     roles: ['admin','veterinario','recepcionista','cliente'] },
  { path: '/citas',        icon: '📅', label: 'Citas',         roles: ['admin','veterinario','recepcionista','cliente'] },
  { path: '/facturacion',  icon: '💳', label: 'Facturación',   roles: ['admin','recepcionista','cliente'] },
  { path: '/reportes',     icon: '📊', label: 'Reportes',      roles: ['admin','recepcionista'] },
  { path: '/usuarios',     icon: '👤', label: 'Usuarios',      roles: ['admin'] },
];

const Sidebar = ({ open, collapsed, onClose }) => {
  const { usuario } = useAuth();
  const items = menuItems.filter(i => i.roles.includes(usuario?.rol));

  const rolLabel = {
    admin: 'Administrador', veterinario: 'Veterinario',
    recepcionista: 'Recepcionista', cliente: 'Cliente'
  };

  return (
    <>
      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 bg-sidebar flex flex-col
        transition-all duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'lg:w-16' : 'w-64'}
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            CV
          </div>
          {!collapsed && (
            <div>
              <div className="text-white font-bold text-base leading-tight">CanVet</div>
              <div className="text-white/40 text-xs">Sistema Veterinario</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {!collapsed && (
            <div className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-2">
              Menú principal
            </div>
          )}
          <div className="space-y-0.5">
            {items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={collapsed ? item.label : ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                  ${isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                  }
                  ${collapsed ? 'justify-center' : ''}`
                }
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Usuario info */}
        {!collapsed && (
          <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg bg-white/5">
              <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">{usuario?.nombre}</div>
                <div className="text-white/40 text-xs">{rolLabel[usuario?.rol]}</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
