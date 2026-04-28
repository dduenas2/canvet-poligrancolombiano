import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { citaService, caninoService, servicioService, usuarioService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatearMoneda } from '../../utils/formato';

const HORAS = [
  '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00',
];

const NuevaCita = () => {
  const { esCliente, esVeterinario, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const servicioPresel = location.state?.servicioId || '';

  const [form, setForm] = useState({
    canino: '', veterinario: '', fecha: '', hora: '', notas: ''
  });
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState(
    servicioPresel ? [servicioPresel] : []
  );
  const [caninos, setCaninos]           = useState([]);
  const [servicios, setServicios]       = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [verificando, setVerificando]   = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [iniciando, setIniciando]       = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const init = async () => {
      try {
        const [vRes, sRes] = await Promise.all([
          usuarioService.getVeterinarios(),
          servicioService.getAll({ soloActivos: 'true' }),
        ]);
        setVeterinarios(vRes.data);
        setServicios(sRes.data);
        const cRes = esCliente()
          ? await caninoService.getMisCaninos()
          : await caninoService.getAll({ limite: 200 });
        setCaninos(cRes.data.caninos || []);
        // Si es veterinario, pre-asignar su propio ID
        if (esVeterinario()) {
          setForm(f => ({ ...f, veterinario: usuario._id }));
        }
      } catch {
        setError('Error al cargar datos del formulario.');
      } finally {
        setIniciando(false);
      }
    };
    init();
  }, []);

  // Cargar horas ocupadas cuando cambia vet o fecha
  const cargarHorasOcupadas = useCallback(async (vet, fecha) => {
    if (!vet || !fecha) { setHorasOcupadas([]); return; }
    setVerificando(true);
    try {
      const { data } = await citaService.getHorasOcupadas({ veterinario: vet, fecha });
      setHorasOcupadas(data.horasOcupadas || []);
    } catch {
      setHorasOcupadas([]);
    } finally {
      setVerificando(false);
    }
  }, []);

  const setField = (campo, valor) => {
    const nuevo = { ...form, [campo]: valor };
    setForm(nuevo);
    if (campo === 'veterinario') cargarHorasOcupadas(valor, nuevo.fecha);
    if (campo === 'fecha') {
      setForm(f => ({ ...f, hora: '' })); // reset hora al cambiar fecha
      cargarHorasOcupadas(nuevo.veterinario, valor);
    }
    if (campo === 'hora') setForm(nuevo); // ya seteado arriba
  };

  // Toggle servicio
  const toggleServicio = (id) => {
    setServiciosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Servicios seleccionados detalle
  const serviciosDetalle = servicios.filter(s => serviciosSeleccionados.includes(s._id));
  const totalPrecio    = serviciosDetalle.reduce((sum, s) => sum + s.precio, 0);
  const totalDuracion  = serviciosDetalle.reduce((sum, s) => sum + s.duracionMin, 0);

  // Agrupar servicios por categoría para el selector
  const serviciosPorCat = servicios.reduce((acc, s) => {
    const cat = s.categoria?.nombre || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const validar = () => {
    if (!form.canino)                       return 'Selecciona un paciente';
    if (serviciosSeleccionados.length === 0) return 'Selecciona al menos un servicio';
    if (!form.veterinario)                  return 'Selecciona un veterinario';
    if (!form.fecha)                        return 'Selecciona una fecha';
    if (!form.hora)                         return 'Selecciona una hora';
    if (horasOcupadas.includes(form.hora))  return 'Ese horario ya está ocupado';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validar();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      const [servicioP, ...extra] = serviciosSeleccionados;
      await citaService.create({
        ...form,
        servicio: servicioP,
        serviciosExtra: extra,
      });
      navigate('/citas', { state: { exito: 'Cita agendada correctamente' } });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al agendar la cita.');
    } finally {
      setLoading(false);
    }
  };

  const hoyStr = new Date().toISOString().split('T')[0];

  if (iniciando) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Agendar Nueva Cita</h1>
        <p className="text-slate-500 text-sm mt-0.5">Completa todos los campos para confirmar</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {error && (
          <div className="alert-error">
            <span>✕</span><span>{error}</span>
            <button type="button" onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {/* ── PACIENTE ───────────────────────────────────────── */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            Paciente
          </h2>
          <select value={form.canino} onChange={e => setField('canino', e.target.value)}
            required className="select">
            <option value="">— Selecciona un paciente —</option>
            {caninos.map(c => (
              <option key={c._id} value={c._id}>
                {c.nombre} · {c.raza}{c.propietario?.nombre ? ` (${c.propietario.nombre})` : ''}
              </option>
            ))}
          </select>
          {caninos.length === 0 && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              No hay pacientes. <a href="/pacientes/nuevo" className="underline font-medium">Registrar paciente</a>
            </p>
          )}
        </div>

        {/* ── SERVICIOS ──────────────────────────────────────── */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            Servicios
            <span className="ml-auto text-xs text-slate-400 font-normal">Puedes seleccionar varios</span>
          </h2>

          {Object.entries(serviciosPorCat).map(([cat, items]) => (
            <div key={cat}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{cat}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map(s => {
                  const sel = serviciosSeleccionados.includes(s._id);
                  return (
                    <button key={s._id} type="button" onClick={() => toggleServicio(s._id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all
                        ${sel
                          ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                          : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/40'
                        }`}>
                      {/* Checkbox visual */}
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                        ${sel ? 'border-brand-500 bg-brand-500' : 'border-slate-300'}`}>
                        {sel && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${sel ? 'text-brand-800' : 'text-slate-800'}`}>{s.nombre}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-semibold ${sel ? 'text-brand-600' : 'text-slate-500'}`}>
                            {formatearMoneda(s.precio)}
                          </span>
                          <span className="text-xs text-slate-400">· {s.duracionMin} min</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Resumen de seleccionados */}
          {serviciosSeleccionados.length > 0 && (
            <div className="mt-2 p-3 bg-brand-50 border border-brand-200 rounded-xl">
              <div className="text-xs font-semibold text-brand-700 mb-1.5">
                {serviciosSeleccionados.length} servicio{serviciosSeleccionados.length !== 1 ? 's' : ''} seleccionado{serviciosSeleccionados.length !== 1 ? 's' : ''}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {serviciosDetalle.map(s => (
                  <span key={s._id} className="inline-flex items-center gap-1 bg-brand-100 text-brand-800 text-xs rounded-full px-2.5 py-1">
                    {s.nombre}
                    <button type="button" onClick={() => toggleServicio(s._id)}
                      className="text-brand-500 hover:text-brand-700 ml-0.5">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-4 text-xs text-brand-700 font-medium pt-2 border-t border-brand-200">
                <span>Total: <strong>{formatearMoneda(totalPrecio)}</strong></span>
                <span>Duración estimada: <strong>{totalDuracion} min</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* ── FECHA, HORA Y VETERINARIO ──────────────────────── */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            Fecha, hora y veterinario
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Veterinario *</label>
              {esVeterinario() ? (
                <div className="input bg-slate-50 text-slate-700 flex items-center gap-2 cursor-default">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Dr(a). {usuario.nombre}
                </div>
              ) : (
                <select value={form.veterinario} onChange={e => setField('veterinario', e.target.value)}
                  required className="select">
                  <option value="">— Selecciona —</option>
                  {veterinarios.map(v => (
                    <option key={v._id} value={v._id}>Dr(a). {v.nombre}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="label">Fecha *</label>
              <input type="date" value={form.fecha} min={hoyStr}
                onChange={e => setField('fecha', e.target.value)} required className="input" />
            </div>
          </div>

          {/* Grid de horas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Hora *</label>
              {verificando && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Verificando disponibilidad…
                </span>
              )}
            </div>

            {/* Leyenda */}
            {(form.veterinario && form.fecha) && (
              <div className="flex gap-4 mb-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-brand-500" /> Seleccionada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Ocupada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-white border border-slate-200" /> Disponible
                </span>
              </div>
            )}

            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
              {HORAS.map(h => {
                const ocupada   = horasOcupadas.includes(h);
                const seleccion = form.hora === h;
                return (
                  <button type="button" key={h}
                    disabled={ocupada}
                    onClick={() => !ocupada && setForm(f => ({ ...f, hora: h }))}
                    title={ocupada ? 'Horario ocupado' : `Seleccionar ${h}`}
                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-all border relative
                      ${seleccion
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : ocupada
                          ? 'bg-red-50 text-red-300 border-red-200 cursor-not-allowed line-through'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                      }`}>
                    {h}
                    {ocupada && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {form.hora && !horasOcupadas.includes(form.hora) && (
              <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                Horario disponible — {form.hora}
              </div>
            )}
          </div>
        </div>

        {/* ── NOTAS ─────────────────────────────────────────── */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            Notas adicionales <span className="text-slate-400 font-normal text-xs">(opcional)</span>
          </h2>
          <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            rows={3} className="input resize-none"
            placeholder="Motivo de la consulta, síntomas, indicaciones previas…" />
        </div>

        {/* ── BOTONES ───────────────────────────────────────── */}
        <div className="flex gap-3 pb-4">
          <button type="submit"
            disabled={loading || (form.hora && horasOcupadas.includes(form.hora))}
            className="btn-primary flex-1 py-3">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Agendando…</>
              : '📅 Confirmar cita'
            }
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-outline px-6">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaCita;
