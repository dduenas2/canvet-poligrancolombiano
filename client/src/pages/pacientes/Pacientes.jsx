import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { caninoService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Paginacion from '../../components/common/Paginacion';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alerta from '../../components/common/Alerta';
import { calcularEdad } from '../../utils/formato';

/* ── Tarjeta de un canino ───────────────────────────────────── */
const TarjetaCanino = ({ c, tieneRol, onEliminar }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group">
    {/* Foto */}
    <div className="relative h-32 bg-gradient-to-br from-brand-50 to-slate-100 overflow-hidden">
      {c.fotoUrl ? (
        <img src={c.fotoUrl} alt={c.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.style.display = 'none'; }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🐕</div>
      )}
      <div className="absolute top-2 right-2">
        <span className={`badge text-xs ${c.sexo === 'M'
          ? 'bg-blue-100/90 text-blue-700 border-blue-200'
          : 'bg-pink-100/90 text-pink-700 border-pink-200'}`}>
          {c.sexo === 'M' ? '♂' : '♀'}
        </span>
      </div>
    </div>

    {/* Info */}
    <div className="p-3.5">
      <h3 className="font-semibold text-slate-900 truncate">{c.nombre}</h3>
      <p className="text-xs text-slate-400 truncate">{c.raza}</p>
      {(c.fechaNacimiento || c.peso) && (
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
          {c.fechaNacimiento && <span>🎂 {calcularEdad(c.fechaNacimiento)}</span>}
          {c.peso && <><span>·</span><span>⚖️ {c.peso} kg</span></>}
        </div>
      )}

      {/* Acciones */}
      <div className="mt-3 flex gap-1.5">
        <Link to={`/historial/${c._id}`}
          className="flex-1 text-center py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors">
          Historial
        </Link>
        {tieneRol('admin', 'recepcionista', 'veterinario') && (
          <Link to={`/pacientes/${c._id}`}
            className="flex-1 text-center py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            Editar
          </Link>
        )}
        {tieneRol('admin') && (
          <button onClick={() => onEliminar(c._id)}
            className="py-1.5 px-2.5 text-xs text-red-400 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
            🗑
          </button>
        )}
      </div>
    </div>
  </div>
);

/* ── Componente principal ───────────────────────────────────── */
const Pacientes = () => {
  const { tieneRol } = useAuth();
  const location = useLocation();
  const [caninos, setCaninos]     = useState([]);
  const [exito, setExito]         = useState(location.state?.exito || '');
  const [total, setTotal]         = useState(0);
  const [paginas, setPaginas]     = useState(1);
  const [pagina, setPagina]       = useState(1);
  const [busqueda, setBusqueda]   = useState('');
  const [query, setQuery]         = useState('');
  const [cargando, setCargando]   = useState(true);
  const [eliminar, setEliminar]   = useState(null);
  const [agrupar, setAgrupar]     = useState(true);

  const cargar = async (p = pagina, q = query) => {
    setCargando(true);
    try {
      const { data } = await caninoService.getAll({ busqueda: q, pagina: p, limite: 48 });
      setCaninos(data.caninos); setTotal(data.total); setPaginas(data.paginas);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(pagina, query); }, [pagina]);

  const buscar = (e) => {
    e.preventDefault();
    setQuery(busqueda); setPagina(1); cargar(1, busqueda);
  };

  const limpiar = () => { setBusqueda(''); setQuery(''); setPagina(1); cargar(1, ''); };

  const handleEliminar = async () => {
    await caninoService.delete(eliminar);
    cargar();
  };

  // Agrupar por propietario
  const grupos = caninos.reduce((acc, c) => {
    const key = c.propietario?._id || 'sin-propietario';
    const nombre = c.propietario?.nombre || 'Sin propietario';
    if (!acc[key]) acc[key] = { nombre, caninos: [] };
    acc[key].caninos.push(c);
    return acc;
  }, {});

  return (
    <div>
      <Alerta tipo="exito" mensaje={exito} onClose={() => setExito('')} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes Caninos</h1>
          <p className="page-subtitle">{total} paciente{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle agrupar */}
          <button onClick={() => setAgrupar(a => !a)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all
              ${agrupar ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {agrupar ? 'Por propietario' : 'Todos'}
          </button>

          {tieneRol('admin', 'recepcionista', 'veterinario') && (
            <Link to="/pacientes/nuevo" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Nuevo paciente
            </Link>
          )}
        </div>
      </div>

      {/* Buscador */}
      <form onSubmit={buscar} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, raza o propietario…"
            className="input pl-10" />
        </div>
        <button type="submit" className="btn-primary">Buscar</button>
        {query && <button type="button" onClick={limpiar} className="btn-outline">Limpiar</button>}
      </form>

      {cargando ? <Spinner /> : caninos.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🐕</div>
          <div className="empty-state-text">No se encontraron pacientes</div>
          {tieneRol('admin', 'recepcionista', 'veterinario') && (
            <Link to="/pacientes/nuevo" className="btn-primary btn-sm mt-4">Registrar primero</Link>
          )}
        </div>
      ) : agrupar ? (
        /* ── Vista agrupada por propietario ─────────────────── */
        <div className="space-y-7">
          {Object.entries(grupos).map(([key, grupo]) => (
            <div key={key}>
              {/* Cabecera del propietario */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {grupo.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{grupo.nombre}</h2>
                  <p className="text-xs text-slate-400">
                    {grupo.caninos.length} canino{grupo.caninos.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link to={`/propietarios`}
                  className="ml-auto text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                  Ver propietario
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              {/* Caninos del propietario */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pl-12">
                {grupo.caninos.map(c => (
                  <TarjetaCanino key={c._id} c={c} tieneRol={tieneRol} onEliminar={setEliminar} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Vista plana ─────────────────────────────────────── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {caninos.map(c => (
            <TarjetaCanino key={c._id} c={c} tieneRol={tieneRol} onEliminar={setEliminar} />
          ))}
        </div>
      )}

      <Paginacion pagina={pagina} totalPaginas={paginas} total={total} limite={48} onCambiar={p => setPagina(p)} />

      <ConfirmDialog abierto={!!eliminar} onCerrar={() => setEliminar(null)}
        onConfirmar={handleEliminar} titulo="Eliminar Paciente"
        mensaje="¿Seguro que deseas eliminar este paciente? Esta acción no se puede deshacer."
        textoConfirmar="Eliminar" />
    </div>
  );
};

export default Pacientes;
