import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { historialService, caninoService, servicioService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Paginacion from '../../components/common/Paginacion';
import Modal from '../../components/common/Modal';
import { formatearFechaHora, calcularEdad } from '../../utils/formato';

const FormRegistro = ({ caninoId, onGuardar, onCerrar }) => {
  const [form, setForm] = useState({ servicio: '', diagnostico: '', tratamiento: '', observaciones: '', fecha: '' });
  const [servicios, setServicios] = useState([]);
  const [error, setError]         = useState('');
  const [cargando, setCargando]   = useState(false);

  useEffect(() => {
    servicioService.getAll({ soloActivos: 'true' }).then(({ data }) => setServicios(data));
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setCargando(true);
    try {
      await historialService.create({ ...form, canino: caninoId });
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar registro');
    } finally { setCargando(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="alert-error"><span>✕</span><span>{error}</span></div>}
      <div>
        <label className="label">Servicio prestado *</label>
        <select name="servicio" value={form.servicio} onChange={handle} required className="select">
          <option value="">Seleccionar servicio…</option>
          {servicios.map(s => (
            <option key={s._id} value={s._id}>{s.nombre} — {s.categoria?.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Fecha / Hora</label>
        <input type="datetime-local" name="fecha" value={form.fecha} onChange={handle} className="input" />
      </div>
      <div>
        <label className="label">Diagnóstico *</label>
        <textarea name="diagnostico" value={form.diagnostico} onChange={handle}
          required rows={3} className="input resize-none" placeholder="Descripción del diagnóstico…" />
      </div>
      <div>
        <label className="label">Tratamiento</label>
        <textarea name="tratamiento" value={form.tratamiento} onChange={handle}
          rows={3} className="input resize-none" placeholder="Tratamiento indicado…" />
      </div>
      <div>
        <label className="label">Observaciones</label>
        <textarea name="observaciones" value={form.observaciones} onChange={handle}
          rows={2} className="input resize-none" placeholder="Observaciones adicionales…" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={cargando} className="btn-primary flex-1">
          {cargando ? 'Guardando…' : 'Guardar registro'}
        </button>
        <button type="button" onClick={onCerrar} className="btn-outline">Cancelar</button>
      </div>
    </form>
  );
};

const Historial = () => {
  const { caninoId } = useParams();
  const navigate = useNavigate();
  const { tieneRol } = useAuth();
  const [historial, setHistorial]   = useState([]);
  const [canino, setCanino]         = useState(null);
  const [total, setTotal]           = useState(0);
  const [paginas, setPaginas]       = useState(1);
  const [pagina, setPagina]         = useState(1);
  const [cargando, setCargando]     = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const [histRes, caninoRes] = await Promise.all([
        historialService.getByCanino(caninoId, { pagina, limite: 10 }),
        caninoService.getById(caninoId)
      ]);
      setHistorial(histRes.data.historial); setTotal(histRes.data.total);
      setPaginas(histRes.data.paginas); setCanino(caninoRes.data);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [caninoId, pagina]);

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
        </svg>
        Volver a pacientes
      </button>

      {/* Tarjeta canino */}
      {canino && (
        <div className="card mb-5">
          <div className="flex items-center gap-4">
            {canino.fotoUrl ? (
              <img src={canino.fotoUrl} alt={canino.nombre}
                className="w-18 h-18 rounded-2xl object-cover border border-slate-100"
                onError={e => e.target.style.display = 'none'} />
            ) : (
              <div className="w-16 h-16 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center text-3xl">
                🐕
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900">{canino.nombre}</h1>
              <p className="text-slate-500 text-sm">
                {canino.raza} · {canino.sexo === 'M' ? 'Macho' : 'Hembra'}
                {canino.fechaNacimiento ? ` · ${calcularEdad(canino.fechaNacimiento)}` : ''}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Propietario: {canino.propietario?.nombre}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header historial */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Historial Clínico</h2>
          <p className="page-subtitle">{total} registro{total !== 1 ? 's' : ''}</p>
        </div>
        {tieneRol('admin', 'veterinario') && (
          <button onClick={() => setModalAbierto(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo registro
          </button>
        )}
      </div>

      {cargando ? <Spinner /> : historial.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No hay registros clínicos aún</div>
        </div>
      ) : (
        <div className="space-y-4">
          {historial.map((reg, idx) => (
            <div key={reg._id} className="card border-l-4 border-l-brand-500 hover:shadow-md transition-shadow">
              {/* Header del registro */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-semibold text-slate-900">{reg.servicio?.nombre}</div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      {formatearFechaHora(reg.fecha)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Dr(a). {reg.veterinario?.nombre}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-300 font-mono shrink-0">#{total - idx}</div>
              </div>

              {/* Contenido */}
              <div className="grid gap-2.5">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Diagnóstico</div>
                  <p className="text-slate-800 text-sm leading-relaxed">{reg.diagnostico}</p>
                </div>
                {reg.tratamiento && (
                  <div className="p-3 bg-brand-50/50 rounded-lg">
                    <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Tratamiento</div>
                    <p className="text-slate-800 text-sm leading-relaxed">{reg.tratamiento}</p>
                  </div>
                )}
                {reg.observaciones && (
                  <div className="p-3 bg-amber-50/50 rounded-lg">
                    <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Observaciones</div>
                    <p className="text-slate-700 text-sm leading-relaxed">{reg.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Paginacion pagina={pagina} totalPaginas={paginas} total={total} limite={10} onCambiar={setPagina} />

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)}
        titulo="Nuevo Registro Clínico" tamaño="lg">
        <FormRegistro caninoId={caninoId}
          onGuardar={() => { setModalAbierto(false); cargar(); }}
          onCerrar={() => setModalAbierto(false)} />
      </Modal>
    </div>
  );
};

export default Historial;
