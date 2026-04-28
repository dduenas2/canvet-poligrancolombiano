import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicioService, categoriaService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Alerta from '../../components/common/Alerta';
import { formatearMoneda } from '../../utils/formato';

/* ── Formulario crear/editar servicio ────────────────────────── */
const FormServicio = ({ servicio, categorias, onGuardar, onCerrar }) => {
  const [form, setForm] = useState(
    servicio
      ? { nombre: servicio.nombre, categoria: servicio.categoria?._id || servicio.categoria,
          precio: servicio.precio, duracionMin: servicio.duracionMin || 30, descripcion: servicio.descripcion || '' }
      : { nombre: '', categoria: '', precio: '', duracionMin: 30, descripcion: '' }
  );
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setCargando(true);
    try {
      if (servicio) await servicioService.update(servicio._id, form);
      else await servicioService.create(form);
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar');
    } finally { setCargando(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="alert-error"><span>✕</span><span>{error}</span></div>}
      <div>
        <label className="label">Nombre del servicio *</label>
        <input type="text" name="nombre" value={form.nombre} onChange={handle}
          required className="input" autoFocus />
      </div>
      <div>
        <label className="label">Categoría *</label>
        <select name="categoria" value={form.categoria} onChange={handle} required className="select">
          <option value="">Seleccionar categoría…</option>
          {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Precio (COP) *</label>
          <input type="number" name="precio" value={form.precio} onChange={handle}
            required min="0" className="input" placeholder="50000" />
        </div>
        <div>
          <label className="label">Duración (min)</label>
          <input type="number" name="duracionMin" value={form.duracionMin} onChange={handle}
            min="0" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Descripción</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handle}
          rows={3} className="input resize-none" placeholder="Descripción del servicio…" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={cargando} className="btn-primary flex-1">
          {cargando ? 'Guardando…' : servicio ? 'Actualizar' : 'Crear servicio'}
        </button>
        <button type="button" onClick={onCerrar} className="btn-outline">Cancelar</button>
      </div>
    </form>
  );
};

/* ── Configuración visual de categorías ──────────────────────── */
const CAT_CONFIG = {
  'Salud Preventiva y Correctiva': { emoji: '💊', color: 'blue',   bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  'Estética y Relajación':         { emoji: '✂️', color: 'pink',   bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-700',   badge: 'bg-pink-100 text-pink-700' },
  'Nutrición y Alimentación':      { emoji: '🥗', color: 'green',  bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
  'Guardería':                     { emoji: '🏠', color: 'amber',  bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
  'Servicios Funerarios':          { emoji: '🕊️', color: 'slate',  bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-700',  badge: 'bg-slate-100 text-slate-600' },
};
const catConf = (nombre) => CAT_CONFIG[nombre] || { emoji: '🐾', bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', badge: 'bg-brand-100 text-brand-700' };

/* ── Componente principal ─────────────────────────────────────── */
const Servicios = () => {
  const navigate = useNavigate();
  const { esAdmin } = useAuth();
  const [servicios, setServicios]       = useState([]);
  const [categorias, setCategorias]     = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [catFiltro, setCatFiltro]       = useState('');
  const [busqueda, setBusqueda]         = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servActual, setServActual]     = useState(null);
  const [exito, setExito]               = useState('');

  const cargar = async () => {
    try {
      const params = {};
      if (catFiltro) params.categoria = catFiltro;
      if (!esAdmin()) params.soloActivos = 'true';
      const [servRes, catRes] = await Promise.all([
        servicioService.getAll(params),
        categoriaService.getAll()
      ]);
      setServicios(servRes.data); setCategorias(catRes.data);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [catFiltro]);

  /* Filtrado por búsqueda en cliente */
  const serviciosFiltrados = busqueda.trim()
    ? servicios.filter(s =>
        s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.categoria?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : servicios;

  /* Agrupar por categoría */
  const porCategoria = serviciosFiltrados.reduce((acc, s) => {
    const cat = s.categoria?.nombre || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const totalActivos = servicios.filter(s => s.activo).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo de Servicios</h1>
          <p className="page-subtitle">{totalActivos} servicio{totalActivos !== 1 ? 's' : ''} disponible{totalActivos !== 1 ? 's' : ''}</p>
        </div>
        {esAdmin() && (
          <button onClick={() => { setServActual(null); setModalAbierto(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo servicio
          </button>
        )}
      </div>

      <Alerta tipo="exito" mensaje={exito} onClose={() => setExito('')} />

      {/* Barra de búsqueda + filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Buscador */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar servicio por nombre o descripción…"
            className="input pl-10" />
          {busqueda && (
            <button onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              ×
            </button>
          )}
        </div>

        {/* Filtro por categoría */}
        <div className="flex gap-1 p-1 bg-white rounded-xl border border-slate-100 shadow-card shrink-0">
          <button onClick={() => setCatFiltro('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${!catFiltro ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            Todos
          </button>
          {categorias.map(c => (
            <button key={c._id} onClick={() => setCatFiltro(c._id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${catFiltro === c._id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              {catConf(c.nombre).emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Indicador de búsqueda activa */}
      {busqueda && (
        <div className="text-sm text-slate-500 mb-4">
          {serviciosFiltrados.length} resultado{serviciosFiltrados.length !== 1 ? 's' : ''} para <strong>"{busqueda}"</strong>
        </div>
      )}

      {cargando ? <Spinner /> : (
        <div className="space-y-6">
          {Object.entries(porCategoria).map(([cat, items]) => {
            const cfg = catConf(cat);
            return (
              <div key={cat}>
                {/* Cabecera de categoría */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-3 ${cfg.bg} border ${cfg.border}`}>
                  <span className="text-2xl">{cfg.emoji}</span>
                  <h2 className={`font-bold ${cfg.text}`}>{cat}</h2>
                  <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    {items.length} servicio{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Grid de tarjetas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(s => (
                    <div key={s._id}
                      className={`bg-white rounded-2xl border shadow-card transition-all duration-200 overflow-hidden
                        ${s.activo ? 'hover:shadow-card-hover hover:-translate-y-0.5 border-slate-100' : 'opacity-50 border-red-100'}`}>

                      {/* Banda de color superior */}
                      <div className={`h-1.5 ${cfg.bg} ${!s.activo ? 'bg-red-100' : ''}`} />

                      <div className="p-4">
                        {/* Nombre + precio */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900 leading-snug">{s.nombre}</h3>
                          <div className={`shrink-0 font-bold text-sm ${cfg.text} ${cfg.badge} rounded-lg px-2.5 py-1`}>
                            {formatearMoneda(s.precio)}
                          </div>
                        </div>

                        {/* Descripción */}
                        {s.descripcion && (
                          <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{s.descripcion}</p>
                        )}

                        {/* Duración + estado */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0"/>
                            </svg>
                            {s.duracionMin} min
                          </span>
                          {!s.activo && (
                            <span className="text-xs text-red-500 font-medium">● Inactivo</span>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                          {s.activo && (
                            <button
                              onClick={() => navigate('/citas/nueva', { state: { servicioId: s._id } })}
                              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors ${cfg.bg} ${cfg.text} hover:opacity-80`}>
                              Reservar cita
                            </button>
                          )}
                          {esAdmin() && (
                            <>
                              <button onClick={() => { setServActual(s); setModalAbierto(true); }}
                                className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                Editar
                              </button>
                              {s.activo && (
                                <button onClick={async () => {
                                  await servicioService.delete(s._id);
                                  setExito('Servicio desactivado'); cargar();
                                }} className="px-3 py-2 text-xs font-medium rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                  Desactivar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(porCategoria).length === 0 && (
            <div className="card empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-text">
                {busqueda ? `No hay servicios que coincidan con "${busqueda}"` : 'No hay servicios disponibles'}
              </div>
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="btn-outline btn-sm mt-3">
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)}
        titulo={servActual ? 'Editar Servicio' : 'Nuevo Servicio'}>
        <FormServicio servicio={servActual} categorias={categorias}
          onGuardar={() => { setModalAbierto(false); setExito('Servicio guardado'); cargar(); }}
          onCerrar={() => setModalAbierto(false)} />
      </Modal>
    </div>
  );
};

export default Servicios;
