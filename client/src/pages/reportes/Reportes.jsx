import { useState, useEffect } from 'react';
import { reporteService, usuarioService } from '../../services';
import Spinner from '../../components/common/Spinner';
import { formatearMoneda } from '../../utils/formato';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const StatBox = ({ label, value, sub, color = 'brand' }) => {
  const colors = {
    brand:   'bg-brand-50 border-brand-100 text-brand-700',
    green:   'bg-emerald-50 border-emerald-100 text-emerald-700',
    blue:    'bg-blue-50 border-blue-100 text-blue-700',
    amber:   'bg-amber-50 border-amber-100 text-amber-700',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="font-medium mt-1">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
};

const Reportes = () => {
  const [tipo, setTipo]           = useState('servicios');
  const [filtros, setFiltros]     = useState({ fechaInicio: '', fechaFin: '', veterinario: '' });
  const [datos, setDatos]         = useState(null);
  const [veterinarios, setVets]   = useState([]);
  const [cargando, setCargando]   = useState(false);

  useEffect(() => {
    usuarioService.getVeterinarios().then(({ data }) => setVets(data));
  }, []);

  const generar = async () => {
    setCargando(true); setDatos(null);
    try {
      let res;
      if (tipo === 'servicios') {
        res = await reporteService.serviciosPorPeriodo(filtros);
        setDatos({ tipo: 'servicios', ...res.data });
      } else if (tipo === 'veterinarios') {
        res = await reporteService.pacientesPorVeterinario(filtros);
        setDatos({ tipo: 'veterinarios', reporte: res.data });
      } else if (tipo === 'ingresos') {
        res = await reporteService.ingresosPorCategoria(filtros);
        setDatos({ tipo: 'ingresos', ...res.data });
      }
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const TIPOS = [
    { val: 'servicios',    label: 'Servicios por período' },
    { val: 'veterinarios', label: 'Pacientes por veterinario' },
    { val: 'ingresos',     label: 'Ingresos por categoría' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes y Estadísticas</h1>
          <p className="page-subtitle">Análisis del rendimiento de la clínica</p>
        </div>
      </div>

      {/* Configuración */}
      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">Configurar reporte</h2>

        {/* Selector de tipo */}
        <div className="flex gap-1 p-1 bg-slate-50 rounded-xl w-fit mb-4">
          {TIPOS.map(t => (
            <button key={t.val} onClick={() => setTipo(t.val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${tipo === t.val ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Fecha inicio</label>
            <input type="date" value={filtros.fechaInicio}
              onChange={e => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="input" />
          </div>
          <div>
            <label className="label">Fecha fin</label>
            <input type="date" value={filtros.fechaFin}
              onChange={e => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className="input" />
          </div>
          {tipo === 'veterinarios' && (
            <div>
              <label className="label">Veterinario</label>
              <select value={filtros.veterinario}
                onChange={e => setFiltros({ ...filtros, veterinario: e.target.value })}
                className="select">
                <option value="">Todos</option>
                {veterinarios.map(v => <option key={v._id} value={v._id}>{v.nombre}</option>)}
              </select>
            </div>
          )}
        </div>

        <button onClick={generar} disabled={cargando} className="btn-primary px-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          Generar reporte
        </button>
      </div>

      {/* Resultados */}
      {cargando && <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        Generando reporte…
      </div>}

      {!cargando && datos && (
        <>
          {/* ── SERVICIOS ── */}
          {datos.tipo === 'servicios' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Servicios prestados" value={datos.totalCantidad} color="brand" />
                <StatBox label="Valor total" value={formatearMoneda(datos.totalValor)} color="green" />
              </div>

              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-4">Servicios más solicitados</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={datos.reporte?.slice(0, 10)} margin={{ top: 0, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#64748b' }}
                      angle={-25} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip formatter={(v, n) => [n === 'cantidad' ? v : formatearMoneda(v), n === 'cantidad' ? 'Cantidad' : 'Valor']} />
                    <Legend />
                    <Bar dataKey="cantidad" fill="#059669" name="Cantidad" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="table-wrapper">
                <table className="table">
                  <thead className="thead">
                    <tr>
                      <th className="th">Servicio</th>
                      <th className="th-right">Cantidad</th>
                      <th className="th-right hidden sm:table-cell">Precio unit.</th>
                      <th className="th-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {datos.reporte?.map(r => (
                      <tr key={r._id}>
                        <td className="td-bold">{r.nombre}</td>
                        <td className="td text-right">{r.cantidad}</td>
                        <td className="td text-right hidden sm:table-cell text-slate-500">{formatearMoneda(r.precio)}</td>
                        <td className="td text-right font-bold text-slate-900">{formatearMoneda(r.valorTotal)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                      <td className="td text-slate-900 uppercase text-xs tracking-wide">Total</td>
                      <td className="td text-right text-slate-900">{datos.totalCantidad}</td>
                      <td className="td hidden sm:table-cell" />
                      <td className="td text-right text-brand-700">{formatearMoneda(datos.totalValor)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── VETERINARIOS ── */}
          {datos.tipo === 'veterinarios' && (
            <div className="space-y-5">
              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-4">Pacientes atendidos por veterinario</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={datos.reporte} margin={{ top: 0, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pacientesAtendidos" fill="#3b82f6" name="Consultas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="caninosUnicos" fill="#059669" name="Caninos únicos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="table-wrapper">
                <table className="table">
                  <thead className="thead">
                    <tr>
                      <th className="th">Veterinario</th>
                      <th className="th-right">Consultas</th>
                      <th className="th-right">Caninos únicos</th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {datos.reporte?.map(r => (
                      <tr key={r._id}>
                        <td className="td-bold">Dr(a). {r.nombre}</td>
                        <td className="td text-right font-semibold text-slate-900">{r.pacientesAtendidos}</td>
                        <td className="td text-right text-slate-600">{r.caninosUnicos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INGRESOS ── */}
          {datos.tipo === 'ingresos' && (
            <div className="space-y-5">
              <StatBox label="Total ingresos" value={formatearMoneda(datos.totalIngresos)} color="green" />

              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-4">Ingresos por categoría</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={datos.reporte} margin={{ top: 0, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="categoria" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip formatter={v => formatearMoneda(v)} />
                    <Bar dataKey="totalIngresos" fill="#059669" name="Ingresos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="table-wrapper">
                <table className="table">
                  <thead className="thead">
                    <tr>
                      <th className="th">Categoría</th>
                      <th className="th-right">Servicios vendidos</th>
                      <th className="th-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {datos.reporte?.map(r => (
                      <tr key={r._id}>
                        <td className="td-bold">{r.categoria}</td>
                        <td className="td text-right text-slate-600">{r.cantidadServicios}</td>
                        <td className="td text-right font-bold text-brand-700">{formatearMoneda(r.totalIngresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!cargando && !datos && (
        <div className="card empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">Configura los filtros y genera un reporte para ver los resultados</div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
