import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { facturaService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Paginacion from '../../components/common/Paginacion';
import Modal from '../../components/common/Modal';
import Alerta from '../../components/common/Alerta';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatearMoneda, formatearFecha } from '../../utils/formato';
import { generarPDFFactura } from '../../utils/pdf';

const METODOS = [
  { val: 'efectivo',         label: 'Efectivo',      icon: '💵' },
  { val: 'tarjeta_debito',   label: 'Débito',         icon: '💳' },
  { val: 'tarjeta_credito',  label: 'Crédito',        icon: '💳' },
  { val: 'transferencia',    label: 'Transferencia',  icon: '🏦' },
  { val: 'otro',             label: 'Otro',           icon: '•••' },
];

const BADGE = {
  emitida:  'bg-amber-100 text-amber-800 border-amber-200',
  parcial:  'bg-blue-100 text-blue-800 border-blue-200',
  pagada:   'bg-emerald-100 text-emerald-800 border-emerald-200',
  anulada:  'bg-slate-100 text-slate-500 border-slate-200',
};

const BadgeFac = ({ estado }) => (
  <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${BADGE[estado] || ''}`}>
    {estado}
  </span>
);

// ── Modal de pago ─────────────────────────────────────────────────────────────
const ModalPago = ({ factura, onPagado, onCerrar }) => {
  const [metodo,    setMetodo]    = useState('efectivo');
  const [monto,     setMonto]     = useState('');
  const [recibido,  setRecibido]  = useState('');   // solo para efectivo
  const [referencia, setReferencia] = useState('');
  const [error,     setError]     = useState('');
  const [cargando,  setCargando]  = useState(false);

  const saldo = factura?.saldoPendiente ?? 0;

  const montoNum    = parseFloat(monto)    || 0;
  const recibidoNum = parseFloat(recibido) || 0;
  const cambio      = metodo === 'efectivo' && recibidoNum >= montoNum ? recibidoNum - montoNum : null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (montoNum <= 0)       return setError('El monto debe ser mayor a cero');
    if (montoNum > saldo + 0.01) return setError(`El monto no puede superar el saldo pendiente (${formatearMoneda(saldo)})`);
    if (metodo === 'efectivo' && recibidoNum > 0 && recibidoNum < montoNum)
      return setError('El monto recibido es menor al monto a pagar');
    setCargando(true);
    try {
      const pago = await facturaService.registrarPago(factura._id, {
        monto: montoNum,
        metodoPago: metodo,
        referencia: referencia || undefined,
      });
      onPagado(pago.data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar el pago');
    } finally { setCargando(false); }
  };

  return (
    <Modal abierto titulo="Registrar Pago" tamaño="sm" onCerrar={onCerrar}>
      <form onSubmit={submit} className="space-y-5">
        {/* Saldo */}
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-0.5">Saldo pendiente</p>
          <p className="text-2xl font-bold text-slate-900">{formatearMoneda(saldo)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{factura?.numero} · {factura?.propietario?.nombre}</p>
        </div>

        {/* Método */}
        <div>
          <label className="label text-xs mb-2">Método de pago</label>
          <div className="grid grid-cols-5 gap-1.5">
            {METODOS.map(m => (
              <button key={m.val} type="button"
                onClick={() => setMetodo(m.val)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all
                  ${metodo === m.val
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'}`}>
                <span className="text-base">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Monto a aplicar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label text-xs">Monto a aplicar</label>
            <button type="button" onClick={() => setMonto(String(saldo))}
              className="text-xs text-brand-600 hover:underline">Pagar total</button>
          </div>
          <input type="number" min="0.01" step="0.01" max={saldo}
            value={monto} onChange={e => setMonto(e.target.value)}
            placeholder={formatearMoneda(saldo)}
            className="input text-right font-semibold text-lg" required />
        </div>

        {/* Recibido (solo efectivo) */}
        {metodo === 'efectivo' && (
          <div>
            <label className="label text-xs">Monto recibido (opcional)</label>
            <input type="number" min="0" step="0.01"
              value={recibido} onChange={e => setRecibido(e.target.value)}
              placeholder="Ej: 50000"
              className="input text-right" />
            {cambio !== null && (
              <div className="mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <span className="text-sm text-emerald-700 font-medium">Cambio a entregar</span>
                <span className="text-sm font-bold text-emerald-800">{formatearMoneda(cambio)}</span>
              </div>
            )}
          </div>
        )}

        {/* Referencia (transferencia / tarjeta) */}
        {(metodo === 'transferencia' || metodo === 'tarjeta_debito' || metodo === 'tarjeta_credito') && (
          <div>
            <label className="label text-xs">N° de referencia / aprobación</label>
            <input type="text" value={referencia} onChange={e => setReferencia(e.target.value)}
              placeholder="Ej: TXN-00123456"
              className="input" />
          </div>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={cargando || !monto}
            className="btn-primary flex-1 py-2.5">
            {cargando ? 'Registrando…' : 'Confirmar pago'}
          </button>
          <button type="button" onClick={onCerrar} className="btn-outline px-5">Cancelar</button>
        </div>
      </form>
    </Modal>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const Facturacion = () => {
  const { tieneRol } = useAuth();
  const location = useLocation();
  const [facturas, setFacturas]   = useState([]);
  const [total,    setTotal]      = useState(0);
  const [paginas,  setPaginas]    = useState(1);
  const [pagina,   setPagina]     = useState(1);
  const [estado,   setEstado]     = useState('');
  const [cargando, setCargando]   = useState(true);
  const [verFac,   setVerFac]     = useState(null);
  const [loadFac,  setLoadFac]    = useState(false);
  const [pagarFac, setPagarFac]   = useState(null);   // factura abierta en modal pago
  const [confirmar, setConfirmar] = useState(null);
  const [exito,    setExito]      = useState(location.state?.exito || '');

  const cargar = async () => {
    setCargando(true);
    try {
      const { data } = await facturaService.getAll({ estado, pagina, limite: 10 });
      setFacturas(data.facturas); setTotal(data.total); setPaginas(data.paginas);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [pagina, estado]);

  const verDetalle = async (id) => {
    setLoadFac(true);
    try { const { data } = await facturaService.getById(id); setVerFac(data); }
    catch (e) { console.error(e); }
    finally { setLoadFac(false); }
  };

  const handlePagado = (facturaActualizada) => {
    setPagarFac(null);
    setExito(`Pago registrado — saldo pendiente: ${formatearMoneda(facturaActualizada.saldoPendiente)}`);
    // Actualizar en la lista y en el detalle si está abierto
    setFacturas(prev => prev.map(f => f._id === facturaActualizada._id ? { ...f, ...facturaActualizada } : f));
    if (verFac?._id === facturaActualizada._id) setVerFac(facturaActualizada);
  };

  const anular = async (id) => {
    try {
      await facturaService.update(id, { estado: 'anulada' });
      setExito('Factura anulada');
      if (verFac?._id === id) setVerFac(f => ({ ...f, estado: 'anulada' }));
      cargar();
    } catch (e) { console.error(e); }
  };

  const TABS = [
    { val: '',        label: 'Todas'    },
    { val: 'emitida', label: 'Emitidas' },
    { val: 'parcial', label: 'Parciales'},
    { val: 'pagada',  label: 'Pagadas'  },
    { val: 'anulada', label: 'Anuladas' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Facturación</h1>
          <p className="page-subtitle">{total} factura{total !== 1 ? 's' : ''}</p>
        </div>
        {tieneRol('admin','recepcionista') && (
          <Link to="/facturacion/nueva" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Nueva factura
          </Link>
        )}
      </div>

      <Alerta tipo="exito" mensaje={exito} onClose={() => setExito('')} />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white rounded-xl border border-slate-100 shadow-card w-fit mb-5">
        {TABS.map(t => (
          <button key={t.val} onClick={() => { setEstado(t.val); setPagina(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${estado === t.val ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {cargando ? <Spinner /> : facturas.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🧾</div>
          <div className="empty-state-text">No hay facturas en esta categoría</div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead className="thead">
                <tr>
                  <th className="th">N° Factura</th>
                  <th className="th">Fecha</th>
                  <th className="th">Cliente</th>
                  <th className="th hidden sm:table-cell">Ítems</th>
                  <th className="th-right">Total</th>
                  <th className="th-right hidden md:table-cell">Saldo</th>
                  <th className="th">Estado</th>
                  <th className="th">Acciones</th>
                </tr>
              </thead>
              <tbody className="tbody">
                {facturas.map(f => (
                  <tr key={f._id}>
                    <td className="td font-mono font-semibold text-brand-700">{f.numero}</td>
                    <td className="td-muted">{formatearFecha(f.fecha)}</td>
                    <td className="td-bold">{f.propietario?.nombre}</td>
                    <td className="td hidden sm:table-cell text-slate-400 text-xs">
                      {f.detalles?.length} ítem{f.detalles?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="td text-right font-bold text-slate-900">{formatearMoneda(f.total)}</td>
                    <td className="td text-right hidden md:table-cell">
                      {f.estado === 'pagada'
                        ? <span className="text-emerald-600 font-semibold text-sm">$0</span>
                        : <span className={`font-semibold text-sm ${f.estado === 'anulada' ? 'text-slate-400 line-through' : 'text-amber-600'}`}>
                            {formatearMoneda(f.saldoPendiente)}
                          </span>
                      }
                    </td>
                    <td className="td"><BadgeFac estado={f.estado} /></td>
                    <td className="td">
                      <div className="flex gap-1.5">
                        <button onClick={() => verDetalle(f._id)}
                          className="btn-ghost btn-sm text-slate-600">Ver</button>
                        <button onClick={() => generarPDFFactura(f)}
                          className="btn-ghost btn-sm text-brand-600">PDF</button>
                        {tieneRol('admin','recepcionista') && (f.estado === 'emitida' || f.estado === 'parcial') && (
                          <button onClick={() => setPagarFac(f)}
                            className="btn-ghost btn-sm text-emerald-600 font-semibold">
                            Registrar pago
                          </button>
                        )}
                        {tieneRol('admin') && f.estado !== 'anulada' && (
                          <button onClick={() => setConfirmar(f._id)}
                            className="btn-ghost btn-sm text-red-500">Anular</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion pagina={pagina} totalPaginas={paginas} total={total} limite={10} onCambiar={setPagina} />
        </>
      )}

      {/* Modal detalle factura */}
      <Modal abierto={!!verFac} onCerrar={() => setVerFac(null)} titulo={`Factura ${verFac?.numero}`} tamaño="lg">
        {loadFac ? <Spinner /> : verFac && (
          <div>
            {/* Cabecera */}
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Cliente</div>
                <div className="font-bold text-slate-900 text-base">{verFac.propietario?.nombre}</div>
                <div className="text-sm text-slate-500">{verFac.propietario?.documento}</div>
                {verFac.propietario?.telefono && <div className="text-sm text-slate-400">{verFac.propietario.telefono}</div>}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Fecha</div>
                <div className="font-medium text-slate-900">{formatearFecha(verFac.fecha)}</div>
                <BadgeFac estado={verFac.estado} />
              </div>
            </div>

            {/* Servicios */}
            <table className="table w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-left text-xs text-slate-400 font-medium">Servicio</th>
                  <th className="pb-2 text-center text-xs text-slate-400 font-medium w-16">Cant.</th>
                  <th className="pb-2 text-right text-xs text-slate-400 font-medium w-28">Precio</th>
                  <th className="pb-2 text-right text-xs text-slate-400 font-medium w-28">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {verFac.detalles?.map((d, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-900">{d.nombreServicio || d.servicio?.nombre}</td>
                    <td className="py-2.5 text-center text-slate-500">{d.cantidad}</td>
                    <td className="py-2.5 text-right text-slate-500">{formatearMoneda(d.precioUnitario)}</td>
                    <td className="py-2.5 text-right font-medium text-slate-900">{formatearMoneda(d.subtotalLinea)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totales */}
            <div className="ml-auto w-64 space-y-1.5 text-sm mb-5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span><span>{formatearMoneda(verFac.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA (19%)</span><span>{formatearMoneda(verFac.iva)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-brand-700">{formatearMoneda(verFac.total)}</span>
              </div>
              {verFac.estado !== 'pagada' && verFac.estado !== 'anulada' && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-amber-700 font-semibold">Saldo pendiente</span>
                  <span className="text-amber-700 font-bold">{formatearMoneda(verFac.saldoPendiente)}</span>
                </div>
              )}
            </div>

            {/* Historial de pagos */}
            {verFac.pagos?.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Historial de pagos</h3>
                <div className="space-y-2">
                  {verFac.pagos.map((p, i) => {
                    const metodoLabel = METODOS.find(m => m.val === p.metodoPago)?.label || p.metodoPago;
                    return (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium text-slate-800">{metodoLabel}</span>
                          {p.referencia && <span className="ml-2 text-slate-400 font-mono text-xs">{p.referencia}</span>}
                          <span className="ml-2 text-xs text-slate-400">
                            {new Date(p.fecha).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </span>
                          {p.procesadoPor?.nombre && (
                            <span className="ml-2 text-xs text-slate-400">— {p.procesadoPor.nombre}</span>
                          )}
                        </div>
                        <span className="font-bold text-emerald-700">{formatearMoneda(p.monto)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => generarPDFFactura(verFac)} className="btn-primary flex-1">
                📄 Descargar PDF
              </button>
              {tieneRol('admin','recepcionista') && (verFac.estado === 'emitida' || verFac.estado === 'parcial') && (
                <button onClick={() => { setPagarFac(verFac); setVerFac(null); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 font-medium text-sm transition-colors">
                  Registrar pago
                </button>
              )}
              <button onClick={() => setVerFac(null)} className="btn-outline">Cerrar</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal registrar pago */}
      {pagarFac && (
        <ModalPago
          factura={pagarFac}
          onPagado={handlePagado}
          onCerrar={() => setPagarFac(null)}
        />
      )}

      <ConfirmDialog abierto={!!confirmar} onCerrar={() => setConfirmar(null)}
        onConfirmar={() => { anular(confirmar); setConfirmar(null); }}
        titulo="Anular Factura" textoConfirmar="Sí, anular"
        mensaje="¿Seguro que deseas anular esta factura? Las citas vinculadas quedarán disponibles para facturarse nuevamente." />
    </div>
  );
};

export default Facturacion;
