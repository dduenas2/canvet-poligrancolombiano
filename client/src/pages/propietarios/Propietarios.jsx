import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propietarioService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Paginacion from '../../components/common/Paginacion';
import Modal from '../../components/common/Modal';
import Alerta from '../../components/common/Alerta';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const FormPropietario = ({ propietario, onGuardar, onCerrar }) => {
  const [form, setForm] = useState(
    propietario || { nombre: '', documento: '', telefono: '', email: '', direccion: '' }
  );
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError(''); setCargando(true);
    try {
      if (propietario) await propietarioService.update(propietario._id, form);
      else await propietarioService.create(form);
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar');
    } finally { setCargando(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="alert-error"><span>✕</span><span>{error}</span></div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Nombre completo *</label>
          <input type="text" name="nombre" value={form.nombre} onChange={handle}
            required className="input" placeholder="Nombre del propietario" />
        </div>
        <div>
          <label className="label">Cédula *</label>
          <input type="text" name="documento" value={form.documento} onChange={handle}
            required className="input" placeholder="Número de documento" />
        </div>
        <div>
          <label className="label">Teléfono *</label>
          <input type="tel" name="telefono" value={form.telefono} onChange={handle}
            required className="input" placeholder="300 000 0000" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" name="email" value={form.email} onChange={handle}
            className="input" placeholder="correo@ejemplo.com" />
        </div>
        <div>
          <label className="label">Dirección</label>
          <input type="text" name="direccion" value={form.direccion} onChange={handle}
            className="input" placeholder="Dirección de residencia" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={cargando} className="btn-primary flex-1">
          {cargando ? 'Guardando…' : propietario ? 'Actualizar' : 'Registrar propietario'}
        </button>
        <button type="button" onClick={onCerrar} className="btn-outline">Cancelar</button>
      </div>
    </form>
  );
};

const Propietarios = () => {
  const { tieneRol } = useAuth();
  const [propietarios, setPropietarios] = useState([]);
  const [total, setTotal]               = useState(0);
  const [paginas, setPaginas]           = useState(1);
  const [pagina, setPagina]             = useState(1);
  const [busqueda, setBusqueda]         = useState('');
  const [cargando, setCargando]         = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [propActual, setPropActual]     = useState(null);
  const [eliminar, setEliminar]         = useState(null);
  const [exito, setExito]               = useState('');

  const cargar = async (q = busqueda) => {
    setCargando(true);
    try {
      const { data } = await propietarioService.getAll({ busqueda: q, pagina, limite: 10 });
      setPropietarios(data.propietarios); setTotal(data.total); setPaginas(data.paginas);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [pagina]);

  const handleBuscar = (e) => { e.preventDefault(); setPagina(1); cargar(busqueda); };

  const handleEliminar = async () => {
    await propietarioService.delete(eliminar);
    setExito('Propietario eliminado'); cargar();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Propietarios</h1>
          <p className="page-subtitle">{total} propietario{total !== 1 ? 's' : ''}</p>
        </div>
        {tieneRol('admin', 'recepcionista') && (
          <button onClick={() => { setPropActual(null); setModalAbierto(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo propietario
          </button>
        )}
      </div>

      <Alerta tipo="exito" mensaje={exito} onClose={() => setExito('')} />

      {/* Buscador */}
      <form onSubmit={handleBuscar} className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, cédula o teléfono…"
            className="input pl-9" />
        </div>
        <button type="submit" className="btn-primary px-5">Buscar</button>
        {busqueda && (
          <button type="button" onClick={() => { setBusqueda(''); cargar(''); }} className="btn-outline">
            Limpiar
          </button>
        )}
      </form>

      {cargando ? <Spinner /> : propietarios.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">👤</div>
          <div className="empty-state-text">No se encontraron propietarios</div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead className="thead">
                <tr>
                  <th className="th">Nombre</th>
                  <th className="th">Cédula</th>
                  <th className="th hidden sm:table-cell">Teléfono</th>
                  <th className="th hidden md:table-cell">Email</th>
                  <th className="th">Acciones</th>
                </tr>
              </thead>
              <tbody className="tbody">
                {propietarios.map(p => (
                  <tr key={p._id}>
                    <td className="td-bold">{p.nombre}</td>
                    <td className="td font-mono text-sm">{p.documento}</td>
                    <td className="td-muted hidden sm:table-cell">{p.telefono}</td>
                    <td className="td-muted hidden md:table-cell">{p.email || '—'}</td>
                    <td className="td">
                      <div className="flex gap-1.5">
                        <Link to={`/pacientes?propietario=${p._id}`}
                          className="btn-ghost btn-sm text-brand-600">
                          Caninos
                        </Link>
                        {tieneRol('admin', 'recepcionista') && (
                          <button onClick={() => { setPropActual(p); setModalAbierto(true); }}
                            className="btn-ghost btn-sm text-slate-600">
                            Editar
                          </button>
                        )}
                        {tieneRol('admin') && (
                          <button onClick={() => setEliminar(p._id)}
                            className="btn-ghost btn-sm text-red-500">
                            Eliminar
                          </button>
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

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)}
        titulo={propActual ? 'Editar Propietario' : 'Nuevo Propietario'}>
        <FormPropietario propietario={propActual}
          onGuardar={() => { setModalAbierto(false); setExito('Propietario guardado'); cargar(); }}
          onCerrar={() => setModalAbierto(false)} />
      </Modal>

      <ConfirmDialog abierto={!!eliminar} onCerrar={() => setEliminar(null)}
        onConfirmar={handleEliminar} titulo="Eliminar Propietario"
        mensaje="¿Está seguro de eliminar este propietario? Esta acción no se puede deshacer."
        textoConfirmar="Eliminar" />
    </div>
  );
};

export default Propietarios;
