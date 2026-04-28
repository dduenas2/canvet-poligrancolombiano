import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { facturaService, propietarioService, servicioService } from '../../services';
import { formatearMoneda } from '../../utils/formato';

const NuevaFactura = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Acepta una sola cita (legacy) o un array de citas
  const citasPresel = location.state?.citas || (location.state?.cita ? [location.state.cita] : []);

  const [propietario, setPropietario]   = useState('');
  const [propietarios, setPropietarios] = useState([]);
  const [servicios, setServicios]       = useState([]);
  const [detalles, setDetalles]         = useState([{ servicio: '', cantidad: 1, precioUnitario: 0, subtotalLinea: 0 }]);
  const [notas, setNotas]               = useState('');
  const [error, setError]               = useState('');
  const [cargando, setCargando]         = useState(false);
  const [iniciando, setIniciando]       = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [propRes, servRes] = await Promise.all([
          propietarioService.getAll({ limite: 200 }),
          servicioService.getAll({ soloActivos: 'true' })
        ]);
        setPropietarios(propRes.data.propietarios);
        setServicios(servRes.data);

        // Pre-fill from one or more appointments
        if (citasPresel.length > 0) {
          const propId = citasPresel[0].canino?.propietario?._id;
          if (propId) setPropietario(propId);

          // Recopilar todos los servicios de todas las citas
          const lineas = citasPresel.flatMap(cita => {
            const todos = [cita.servicio, ...(cita.serviciosExtra || [])].filter(Boolean);
            return todos.map(s => ({
              servicio: s._id,
              cantidad: 1,
              precioUnitario: s.precio || 0,
              subtotalLinea: s.precio || 0,
            }));
          });

          if (lineas.length > 0) setDetalles(lineas);

          // Notas combinadas de todas las citas
          const notasCombinadas = citasPresel
            .map(c => c.notas).filter(Boolean).join(' | ');
          if (notasCombinadas) setNotas(notasCombinadas);
        }
      } catch { setError('Error al cargar datos'); }
      finally { setIniciando(false); }
    };
    cargar();
  }, []);

  const cambiarDetalle = (idx, campo, valor) => {
    const nuevos = [...detalles];
    nuevos[idx] = { ...nuevos[idx], [campo]: valor };
    if (campo === 'servicio') {
      const s = servicios.find(s => s._id === valor);
      if (s) { nuevos[idx].precioUnitario = s.precio; nuevos[idx].nombreServicio = s.nombre; }
    }
    nuevos[idx].subtotalLinea = (nuevos[idx].precioUnitario || 0) * (nuevos[idx].cantidad || 0);
    setDetalles(nuevos);
  };

  const agregar = () => setDetalles([...detalles, { servicio: '', cantidad: 1, precioUnitario: 0, subtotalLinea: 0 }]);
  const quitar  = (idx) => setDetalles(detalles.filter((_, i) => i !== idx));

  const subtotal = detalles.reduce((s, d) => s + (d.subtotalLinea || 0), 0);
  const iva      = Math.round(subtotal * 0.19);
  const total    = subtotal + iva;

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!propietario) return setError('Seleccione un propietario');
    if (detalles.some(d => !d.servicio)) return setError('Todos los servicios deben estar seleccionados');
    if (subtotal === 0) return setError('La factura debe tener al menos un servicio con valor');
    setCargando(true);
    try {
      const citasIds = citasPresel.map(c => c._id).filter(Boolean);
      await facturaService.create({ propietario, detalles, notas, citasIds });
      navigate('/facturacion', { state: { exito: 'Factura generada correctamente' } });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear factura');
    } finally { setCargando(false); }
  };

  if (iniciando) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back + Title */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Volver a facturación
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Nueva Factura</h1>
        <p className="text-slate-500 text-sm mt-0.5">Genera una nueva factura para un cliente</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {citasPresel.length > 0 && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="font-medium">
                {citasPresel.length === 1
                  ? <>Datos cargados desde la cita de <strong>{citasPresel[0].canino?.nombre}</strong>.</>
                  : <>{citasPresel.length} citas agrupadas en una sola factura — {citasPresel.map(c => c.canino?.nombre).join(', ')}.</>
                }
              </p>
              <p className="text-emerald-700 mt-0.5">Verifica los servicios y precios antes de generar.</p>
            </div>
          </div>
        )}
        {error && <div className="alert-error"><span>✕</span><span>{error}</span></div>}

        {/* Cliente */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">
            Datos del cliente
          </h2>
          <div>
            <label className="label">Propietario *</label>
            <select value={propietario} onChange={e => setPropietario(e.target.value)}
              required className="select">
              <option value="">Seleccionar propietario…</option>
              {propietarios.map(p => (
                <option key={p._id} value={p._id}>{p.nombre} — {p.documento}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Servicios */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="font-semibold text-slate-800">Servicios</h2>
            <button type="button" onClick={agregar}
              className="btn-outline btn-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Agregar línea
            </button>
          </div>

          {/* Cabecera de columnas */}
          <div className="grid grid-cols-12 gap-3 mb-2 px-1">
            <div className="col-span-5 text-xs text-slate-400 font-medium">Servicio</div>
            <div className="col-span-2 text-xs text-slate-400 font-medium text-center">Cant.</div>
            <div className="col-span-2 text-xs text-slate-400 font-medium text-right">Precio</div>
            <div className="col-span-2 text-xs text-slate-400 font-medium text-right">Subtotal</div>
            <div className="col-span-1" />
          </div>

          <div className="space-y-2.5">
            {detalles.map((det, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center bg-slate-50 rounded-xl p-3">
                <div className="col-span-5">
                  <select value={det.servicio}
                    onChange={e => cambiarDetalle(i, 'servicio', e.target.value)}
                    className="select text-sm">
                    <option value="">Seleccionar…</option>
                    {servicios.map(s => (
                      <option key={s._id} value={s._id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input type="number" min="1" value={det.cantidad}
                    onChange={e => cambiarDetalle(i, 'cantidad', parseInt(e.target.value) || 1)}
                    className="input text-sm text-center" />
                </div>
                <div className="col-span-2">
                  <input type="number" min="0" value={det.precioUnitario}
                    onChange={e => cambiarDetalle(i, 'precioUnitario', parseFloat(e.target.value) || 0)}
                    className="input text-sm text-right" />
                </div>
                <div className="col-span-2 text-right font-semibold text-slate-900 text-sm">
                  {formatearMoneda(det.subtotalLinea)}
                </div>
                <div className="col-span-1 flex justify-center">
                  {detalles.length > 1 && (
                    <button type="button" onClick={() => quitar(i)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="ml-auto w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium text-slate-700">{formatearMoneda(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA (19%)</span>
                <span className="font-medium text-slate-700">{formatearMoneda(iva)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-base pt-2 border-t border-slate-200">
                <span className="text-slate-900">Total</span>
                <span className="text-xl text-brand-700">{formatearMoneda(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">Notas (opcional)</h2>
          <textarea value={notas} onChange={e => setNotas(e.target.value)}
            rows={3} className="input resize-none"
            placeholder="Observaciones sobre la factura…" />
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button type="submit" disabled={cargando || subtotal === 0} className="btn-primary flex-1 py-3">
            {cargando ? 'Generando…' : 'Generar factura'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-outline px-6">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaFactura;
