import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onToggle, sidebarCollapsed }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const rolLabel = {
    admin: 'Administrador', veterinario: 'Veterinario',
    recepcionista: 'Recepcionista', cliente: 'Cliente'
  };

  const rolColor = {
    admin: 'badge-admin', veterinario: 'badge-veterinario',
    recepcionista: 'badge-recepcionista', cliente: 'badge-cliente'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`
      fixed top-0 right-0 z-20 h-16 bg-white border-b border-slate-100 shadow-sm
      flex items-center px-4 gap-4 transition-all duration-300
      ${sidebarCollapsed ? 'left-16' : 'left-64'}
      max-lg:left-0
    `}>
      {/* Toggle sidebar */}
      <button
        onClick={onToggle}
        className="btn-ghost flex-shrink-0"
        title="Expandir/colapsar menú"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Breadcrumb / título de la app en móvil */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
          CV
        </div>
        <span className="font-bold text-slate-900 text-sm">CanVet</span>
      </div>

      <div className="flex-1" />

      {/* Acciones rápidas */}
      <Link to="/citas/nueva" className="btn-primary btn-sm hidden sm:inline-flex">
        + Nueva cita
      </Link>

      {/* Perfil */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-slate-900 leading-tight">{usuario?.nombre}</div>
            <div className="text-xs text-slate-400 leading-tight">{rolLabel[usuario?.rol]}</div>
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-modal border border-slate-100 py-1 z-50 animate-fade-in">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="font-semibold text-slate-900 text-sm">{usuario?.nombre}</div>
              <div className="text-xs text-slate-500 mt-0.5">{usuario?.email}</div>
              <span className={`mt-1.5 inline-block ${rolColor[usuario?.rol]}`}>
                {rolLabel[usuario?.rol]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
