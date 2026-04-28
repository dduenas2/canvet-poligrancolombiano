import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { citaService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Paginacion from '../../components/common/Paginacion';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import Alerta from '../../components/common/Alerta';
import { formatearFecha } from '../../utils/formato';

const ESTADOS = ['pendiente','confirmada','atendida','cancelada'];

const BadgeEstado = ({ estado }) => <span className={`badge-${estado}`}>{estado}</span>;

const Citas = () => {
  const { tieneRol } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [citas, setCitas]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [paginas, setPaginas]   = useState(1);
  const [pagina, setPagina]     = useState(1);
  const [filtros, setFiltros]   = useState({ fecha:'', estado:'' });
  const [cargando, setCargando] = useState(true);
  const [cancelar, setCancelar] = useState(null);
  const [editEstado, setEditEstado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [exito, setExito]       = useState(location.state?.exito || '');

  // Selección para factura conjunta
  const [seleccionadas, setSeleccionadas] = useState(new Set()); // Set de _id
  const puedeFacturar = tieneRol('admin','recepcionista');

  const cargar = async () => {
    setCargando(true);
    setSeleccionadas(new Set());
    try {
      const { data } = await citaService.getAll({ ...filtros, pagina, limite: 15 });
      setCitas(data.citas); setTotal(data.total); setPaginas(data.paginas);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [pagina, filtros]);

  const handleCancelar = async () => {
    await citaService.cancelar(cancelar);
    setExito('Cita cancelada correctamente'); cargar();
  };

  const handleCambiarEstado = async () => {
    await citaService.update(editEstado.id, { estado: nuevoEstado });
    setExito('Estado actualizado'); setEditEstado(null); cargar();
  };

  const abrirEstado = (id, estadoActual) => {
    setEditEstado({ id, estadoActual }); setNuevoEstado(estadoActual);
  };

  const estadosSiguientes = {
    pendiente:  ['confirmada','cancelada'],
    confirmada: ['atendida','cancelada'],
    atendida:   [],
    cancelada:  [],
  };

  // Manejo de checkboxes
  const toggleSeleccion = (cita) => {
    setSeleccionadas(prev => {
      const next = new Set(prev);
      if (next.has(cita._id)) next.delete(cita._id);
      else next.add(cita._id);
      return next;
    });
  };

  // Datos de las citas seleccionadas
  const citasSeleccionadas = citas.filter(c => seleccionadas.has(c._id));

  // Validar que todas pertenezcan al mismo propietario
  const propietariosUnicos = [...new Set(
    citasSeleccionadas.map(c => c.canino?.propietario?._id).filter(Boolean)
  )];
  const propietarioDiferente = propietariosUnicos.length > 1;
  const propietarioNombre = citasSeleccionadas[0]?.canino?.propietario?.nombre || '';

  const handleFacturarSeleccionadas = () => {
    navigate('/facturacion/nueva', { state: { citas: citasSeleccionadas } });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Citas</h1>
          <p className="page-subtitle">{total} cita{total !== 1 ? 's' : ''}</p>
        </div>
        {tieneRol('admin','recepcionista','cliente','veterinario') && (
          <Link to="/citas/nueva" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Nueva cita
          </Link>
        )}
      </div>

      <Alerta tipo="exito" mensaje={exito} onClose={() => setExito('')} />

      {/* Filtros */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label text-xs">Fecha</label>
            <input type="date" value={filtros.fecha}
              onChange={e => setFiltros({ ...filtros, fecha: e.target.value })}
              className="input w-44" />
          </div>
          <div>
            <label className="label text-xs">Estado</label>
            <select value={filtros.estado}
              onChange={e => setFiltros({ ...filtros, estado: e.target.value })}
              className="select w-44">
              <option value="">Todos los estados</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase()+e.slice(1)}</option>)}
            </select>
          </div>
          {(filtros.fecha || filtros.estado) && (
            <button onClick={() => setFiltros({ fecha:'', estado:'' })} className="btn-outline btn-sm self-end">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {cargando ? <Spinner /> : citas.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-text">No se encontraron citas con esos filtros</div>
        </div>
      ) : (
        <>
          {puedeFacturar && citas.some(c => c.estado === 'atendida') && (
            <p className="text-xs text-slate-400 mb-2 ml-1">
              Marca las citas <span className="font-medium text-slate-600">atendidas</span> del mismo propietario para generar una factura conjunta.
            </p>
          )}
          <div className="table-wrapper">
            <table className="table">
              <thead className="thead">
                <tr>
                  {puedeFacturar && <th className="th w-8" />}
                  <th className="th">Fecha / Hora</th>
                  <th className="th">Paciente</th>
                  <th className="th">Servicio</th>
                  <th className="th hidden md:table-cell">Veterinario</th>
                  <th className="th">Estado</th>
                  <th className="th">Acciones</th>
                </tr>
              </thead>
              <tbody className="tbody">
                {citas.map(c => {
                  const checked = seleccionadas.has(c._id);
                  const esMismoGrupo = seleccionadas.size === 0
                    || propietariosUnicos[0] === c.canino?.propietario?._id;
                  const puedeSeleccionar = c.estado === 'atendida' && !c.facturada;

                  return (
                    <tr key={c._id} className={checked ? 'bg-emerald-50/60' : ''}>
                      {puedeFacturar && (
                        <td className="td">
                          {puedeSeleccionar && (
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSeleccion(c)}
                              title={!esMismoGrupo && !checked ? 'Pertenece a otro propietario' : ''}
                              className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                            />
                          )}
                        </td>
                      )}
                      <td className="td">
                        <div className="font-medium text-slate-900 text-sm">{formatearFecha(c.fecha)}</div>
                        <div className="text-brand-600 font-semibold text-sm">{c.hora}</div>
                      </td>
                      <td className="td">
                        <div className="font-medium text-slate-900">{c.canino?.nombre}</div>
                        <div className="text-xs text-slate-400">{c.canino?.raza}</div>
                      </td>
                      <td className="td-bold">
                        <div>{c.servicio?.nombre}</div>
                        {c.serviciosExtra?.length > 0 && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            +{c.serviciosExtra.map(s => s.nombre).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="td hidden md:table-cell">
                        <span className="text-slate-600">Dr(a). {c.veterinario?.nombre}</span>
                      </td>
                      <td className="td">
                      <BadgeEstado estado={c.estado} />
                      {c.facturada && (
                        <span className="ml-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                          facturada
                        </span>
                      )}
                    </td>
                      <td className="td">
                        <div className="flex gap-2">
                          {tieneRol('admin','recepcionista','veterinario') && estadosSiguientes[c.estado]?.length > 0 && (
                            <button onClick={() => abrirEstado(c._id, c.estado)}
                              className="btn-ghost btn-sm text-blue-600 hover:bg-blue-50">
                              Actualizar
                            </button>
                          )}
                          {c.estado !== 'cancelada' && c.estado !== 'atendida' && (
                            <button onClick={() => setCancelar(c._id)}
                              className="btn-ghost btn-sm text-red-500 hover:bg-red-50">
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Paginacion pagina={pagina} totalPaginas={paginas} total={total} limite={15} onCambiar={setPagina} />
        </>
      )}

      {/* Barra flotante de facturación conjunta */}
      {seleccionadas.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
          <div className={`rounded-2xl shadow-2xl border px-5 py-4 flex items-center gap-4
            ${propietarioDiferente
              ? 'bg-amber-50 border-amber-300'
              : 'bg-white border-emerald-300'}`}>
            <div className="flex-1 min-w-0">
              {propietarioDiferente ? (
                <p className="text-sm font-medium text-amber-700">
                  Las citas seleccionadas pertenecen a propietarios distintos.
                  Selecciona solo citas del mismo propietario.
                </p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-900">
                    {seleccionadas.size} cita{seleccionadas.size !== 1 ? 's' : ''} seleccionada{seleccionadas.size !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-slate-500 truncate">Propietario: <span className="font-medium">{propietarioNombre}</span></p>
                </>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setSeleccionadas(new Set())}
                className="btn-outline btn-sm">
                Limpiar
              </button>
              {!propietarioDiferente && (
                <button onClick={handleFacturarSeleccionadas}
                  className="btn-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 font-medium transition-colors flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Generar factura
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal cambio de estado */}
      <Modal abierto={!!editEstado} onCerrar={() => setEditEstado(null)} titulo="Actualizar Estado de Cita" tamaño="sm">
        <p className="text-sm text-slate-500 mb-4">Selecciona el nuevo estado para esta cita:</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {editEstado && estadosSiguientes[editEstado.estadoActual]?.map(est => (
            <button key={est}
              onClick={() => setNuevoEstado(est)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                ${nuevoEstado === est ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {est.charAt(0).toUpperCase()+est.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={handleCambiarEstado} className="btn-primary flex-1">Guardar cambio</button>
          <button onClick={() => setEditEstado(null)} className="btn-outline">Cancelar</button>
        </div>
      </Modal>

      <ConfirmDialog abierto={!!cancelar} onCerrar={() => setCancelar(null)}
        onConfirmar={handleCancelar} titulo="Cancelar Cita"
        mensaje="¿Seguro que deseas cancelar esta cita? El paciente deberá reagendar."
        textoConfirmar="Sí, cancelar" />
    </div>
  );
};

export default Citas;
