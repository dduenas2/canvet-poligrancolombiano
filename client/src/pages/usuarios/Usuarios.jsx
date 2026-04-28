import { useState, useEffect } from 'react';
import { usuarioService } from '../../services';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Alerta from '../../components/common/Alerta';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Paginacion from '../../components/common/Paginacion';
import { formatearFecha } from '../../utils/formato';

const FormUsuario = ({ usuario, onGuardar, onCerrar }) => {
  const [form, setForm] = useState(
    usuario
      ? { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, password: '' }
      : { nombre: '', email: '', rol: 'veterinario', password: '' }
  );
  const [error, setError]     = useState('');
  const [cargando, setCargando] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setCargando(true);
    try {
      const datos = { ...form };
      if (!datos.password) delete datos.password;
      if (usuario) {
        await usuarioService.update(usuario._id, datos);
      } else {
        if (!datos.password) return setError('La contraseña es requerida');
        await usuarioService.create(datos);
      }
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar usuario');
    } finally { setCargando(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="alert-error"><span>✕</span><span>{error}</span></div>}
      <div>
        <label className="label">Nombre completo *</label>
        <input type="text" name="nombre" value={form.nombre} onChange={handle}
          required className="input" placeholder="Nombre del usuario" />
      </div>
      <div>
        <label className="label">Email *</label>
        <input type="email" name="email" value={form.email} onChange={handle}
          required className="input" placeholder="correo@ejemplo.com" />
      </div>
      <div>
        <label className="label">Rol *</label>
        <select name="rol" value={form.rol} onChange={handle} required className="select">
          <option value="veterinario">Veterinario</option>
          <option value="recepcionista">Recepcionista</option>
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <div>
        <label className="label">
          {usuario ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
        </label>
        <input type="password" name="password" value={form.password} onChange={handle}
          required={!usuario} minLength={6} className="input"
          placeholder={usuario ? 'Dejar vacío para mantener' : 'Mínimo 6 caracteres'} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={cargando} className="btn-primary flex-1">
          {cargando ? 'Guardando…' : usuario ? 'Actualizar' : 'Crear usuario'}
        </button>
        <button type="button" onClick={onCerrar} className="btn-outline">Cancelar</button>
      </div>
    </form>
  );
};

const ROLES = ['', 'admin', 'veterinario', 'recepcionista', 'cliente'];

const Usuarios = () => {
  const [usuarios, setUsuarios]         = useState([]);
  const [total, setTotal]               = useState(0);
  const [paginas, setPaginas]           = useState(1);
  const [pagina, setPagina]             = useState(1);
  const [rolFiltro, setRolFiltro]       = useState('');
  const [cargando, setCargando]         = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuActual, setUsuActual]       = useState(null);
  const [desactivar, setDesactivar]     = useState(null);
  const [exito, setExito]               = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const { data } = await usuarioService.getAll({ rol: rolFiltro, pagina, limite: 10 });
      setUsuarios(data.usuarios); setTotal(data.total); setPaginas(data.paginas);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [pagina, rolFiltro]);

  const handleDesactivar = async () => {
    await usuarioService.delete(desactivar);
    setExito('Usuario desactivado correctamente'); cargar();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">{total} usuario{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setUsuActual(null); setModalAbierto(true); }} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo usuario
        </button>
      </div>

      <Alerta tipo="exito" mensaje={exito} onClose={() => setExito('')} />

      {/* Filtro por rol */}
      <div className="flex gap-1 p-1 bg-white rounded-xl border border-slate-100 shadow-card w-fit mb-5">
        {ROLES.map(rol => (
          <button key={rol}
            onClick={() => { setRolFiltro(rol); setPagina(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${rolFiltro === rol ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            {rol === '' ? 'Todos' : rol.charAt(0).toUpperCase() + rol.slice(1)}
          </button>
        ))}
      </div>

      {cargando ? <Spinner /> : usuarios.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-text">No hay usuarios con este rol</div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead className="thead">
                <tr>
                  <th className="th">Nombre</th>
                  <th className="th hidden sm:table-cell">Email</th>
                  <th className="th">Rol</th>
                  <th className="th hidden md:table-cell">Estado</th>
                  <th className="th hidden lg:table-cell">Creado</th>
                  <th className="th">Acciones</th>
                </tr>
              </thead>
              <tbody className="tbody">
                {usuarios.map(u => (
                  <tr key={u._id} className={!u.activo ? 'opacity-50' : ''}>
                    <td className="td-bold">{u.nombre}</td>
                    <td className="td-muted hidden sm:table-cell">{u.email}</td>
                    <td className="td">
                      <span className={`badge-${u.rol}`}>{u.rol}</span>
                    </td>
                    <td className="td hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium
                        ${u.activo ? 'text-emerald-600' : 'text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="td-muted hidden lg:table-cell">{formatearFecha(u.fechaCreacion)}</td>
                    <td className="td">
                      <div className="flex gap-1.5">
                        <button onClick={() => { setUsuActual(u); setModalAbierto(true); }}
                          className="btn-ghost btn-sm text-slate-600">
                          Editar
                        </button>
                        {u.activo && (
                          <button onClick={() => setDesactivar(u._id)}
                            className="btn-ghost btn-sm text-red-500">
                            Desactivar
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
        titulo={usuActual ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <FormUsuario usuario={usuActual}
          onGuardar={() => { setModalAbierto(false); setExito('Usuario guardado correctamente'); cargar(); }}
          onCerrar={() => setModalAbierto(false)} />
      </Modal>

      <ConfirmDialog abierto={!!desactivar} onCerrar={() => setDesactivar(null)}
        onConfirmar={handleDesactivar} titulo="Desactivar Usuario"
        mensaje="¿Está seguro de desactivar este usuario? No podrá acceder al sistema."
        textoConfirmar="Desactivar" />
    </div>
  );
};

export default Usuarios;
