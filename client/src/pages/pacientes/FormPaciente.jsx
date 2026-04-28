import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { caninoService, propietarioService } from '../../services';

/* ── Mini-modal para crear propietario rápido ─────────────────── */
const ModalPropietario = ({ onCreado, onCerrar }) => {
  const [form, setForm] = useState({ nombre: '', documento: '', telefono: '', email: '' });
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const { data } = await propietarioService.create(form);
      onCreado(data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear propietario');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCerrar} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <h3 className="font-bold text-slate-900 text-lg mb-4">Registrar propietario rápido</h3>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="alert-error text-sm"><span>✕</span><span>{error}</span></div>}
          <div>
            <label className="label">Nombre completo *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handle}
              required className="input" placeholder="Nombre completo" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Cédula *</label>
              <input type="text" name="documento" value={form.documento} onChange={handle}
                required className="input" placeholder="Número documento" />
            </div>
            <div>
              <label className="label">Teléfono *</label>
              <input type="tel" name="telefono" value={form.telefono} onChange={handle}
                required className="input" placeholder="300 000 0000" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" value={form.email} onChange={handle}
              className="input" placeholder="correo@ejemplo.com" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando…' : 'Crear propietario'}
            </button>
            <button type="button" onClick={onCerrar} className="btn-outline">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Selector buscable de propietario ─────────────────────────── */
const SelectorPropietario = ({ propietarios, value, onChange, onNuevo }) => {
  const [filtro, setFiltro]     = useState('');
  const [abierto, setAbierto]   = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const ref = useRef(null);

  // Nombre del propietario seleccionado
  const seleccionado = propietarios.find(p => p._id === value);

  const lista = propietarios.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.documento?.includes(filtro) ||
    p.telefono?.includes(filtro)
  );

  useEffect(() => {
    const cerrar = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, []);

  const seleccionar = (p) => {
    onChange(p._id); setFiltro(''); setAbierto(false);
  };

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') setHighlight(h => Math.min(h + 1, lista.length - 1));
    else if (e.key === 'ArrowUp') setHighlight(h => Math.max(h - 1, 0));
    else if (e.key === 'Enter' && highlight >= 0) { e.preventDefault(); seleccionar(lista[highlight]); }
    else if (e.key === 'Escape') setAbierto(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Input de búsqueda / display */}
      <div
        className={`input flex items-center gap-2 cursor-pointer ${abierto ? 'ring-2 ring-brand-500 border-brand-400' : ''}`}
        onClick={() => { setAbierto(true); }}
      >
        {seleccionado && !abierto ? (
          <>
            <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-xs font-bold text-brand-700 shrink-0">
              {seleccionado.nombre.charAt(0).toUpperCase()}
            </div>
            <span className="flex-1 text-slate-900 text-sm">{seleccionado.nombre}</span>
            <span className="text-xs text-slate-400">{seleccionado.documento}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="text-slate-400 hover:text-slate-600 text-lg leading-none ml-1">×</button>
          </>
        ) : (
          <input
            type="text"
            value={filtro}
            onChange={e => { setFiltro(e.target.value); setAbierto(true); setHighlight(-1); }}
            onFocus={() => setAbierto(true)}
            onKeyDown={handleKey}
            placeholder="Buscar por nombre, cédula o teléfono…"
            className="flex-1 outline-none bg-transparent text-sm placeholder-slate-400"
            autoFocus={abierto}
          />
        )}
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {lista.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-500 mb-2">No se encontró ningún propietario</p>
              <button type="button" onClick={() => { setAbierto(false); onNuevo(); }}
                className="btn-primary btn-sm w-full">
                + Crear propietario
              </button>
            </div>
          ) : (
            <>
              {lista.map((p, i) => (
                <button key={p._id} type="button"
                  onMouseDown={() => seleccionar(p)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors
                    ${highlight === i ? 'bg-brand-50' : ''}`}>
                  <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-xs font-bold text-brand-700 shrink-0">
                    {p.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{p.nombre}</div>
                    <div className="text-xs text-slate-400">{p.documento} · {p.telefono}</div>
                  </div>
                </button>
              ))}
              <div className="border-t border-slate-100 p-2">
                <button type="button" onClick={() => { setAbierto(false); onNuevo(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Crear nuevo propietario
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Componente principal ─────────────────────────────────────── */
const FormPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = !!id;

  const [form, setForm] = useState({
    nombre: '', raza: '', fechaNacimiento: '', peso: '', sexo: 'M', chip: '', fotoUrl: '', propietario: ''
  });
  const [propietarios, setPropietarios] = useState([]);
  const [error, setError]               = useState('');
  const [exito, setExito]               = useState('');
  const [cargando, setCargando]         = useState(false);
  const [iniciando, setIniciando]       = useState(true);
  const [modalProp, setModalProp]       = useState(false);

  const cargarPropietarios = async () => {
    const { data } = await propietarioService.getAll({ limite: 500 });
    setPropietarios(data.propietarios);
    return data.propietarios;
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        await cargarPropietarios();
        if (esEdicion) {
          const { data: canino } = await caninoService.getById(id);
          setForm({
            nombre: canino.nombre || '',
            raza: canino.raza || '',
            fechaNacimiento: canino.fechaNacimiento ? canino.fechaNacimiento.split('T')[0] : '',
            peso: canino.peso || '',
            sexo: canino.sexo || 'M',
            chip: canino.chip || '',
            fotoUrl: canino.fotoUrl || '',
            propietario: canino.propietario?._id || canino.propietario || ''
          });
        }
      } catch { setError('Error al cargar datos'); }
      finally { setIniciando(false); }
    };
    cargar();
  }, [id]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.propietario) return setError('Debes seleccionar un propietario');
    setCargando(true);
    try {
      const datos = { ...form };
      if (!datos.fechaNacimiento) delete datos.fechaNacimiento;
      if (!datos.peso) delete datos.peso;
      if (!datos.chip) delete datos.chip;
      if (!datos.fotoUrl) delete datos.fotoUrl;

      if (esEdicion) {
        await caninoService.update(id, datos);
        setExito('Paciente actualizado correctamente');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        await caninoService.create(datos);
        navigate('/pacientes', { state: { exito: 'Paciente registrado correctamente' } });
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar paciente');
    } finally { setCargando(false); }
  };

  const handlePropietarioCreado = async (nuevoProp) => {
    const lista = await cargarPropietarios();
    // Seleccionar automáticamente el recién creado
    const encontrado = lista.find(p => p._id === nuevoProp._id) || nuevoProp;
    setForm(f => ({ ...f, propietario: encontrado._id }));
    setModalProp(false);
  };

  if (iniciando) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      {modalProp && (
        <ModalPropietario
          onCreado={handlePropietarioCreado}
          onCerrar={() => setModalProp(false)}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {esEdicion ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {esEdicion ? 'Actualiza los datos del canino' : 'Registra un nuevo canino en el sistema'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {error && <div className="alert-error"><span>✕</span><span>{error}</span></div>}
          {exito && <div className="alert-success"><span>✓</span><span>{exito}</span></div>}

          {/* Propietario — primero para contexto */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-semibold text-slate-800">Propietario *</h2>
              <button type="button" onClick={() => setModalProp(true)}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Crear propietario
              </button>
            </div>
            <SelectorPropietario
              propietarios={propietarios}
              value={form.propietario}
              onChange={(val) => setForm(f => ({ ...f, propietario: val }))}
              onNuevo={() => setModalProp(true)}
            />
            {propietarios.length === 0 && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                No hay propietarios registrados — crea uno primero
              </p>
            )}
          </div>

          {/* Datos del canino */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">
              Datos del canino
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre *</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handle}
                  required className="input" placeholder="Nombre del canino" />
              </div>
              <div>
                <label className="label">Raza *</label>
                <input type="text" name="raza" value={form.raza} onChange={handle}
                  required className="input" placeholder="Ej: Labrador, Poodle…" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Sexo *</label>
                <div className="flex gap-2 mt-1">
                  {[['M','♂ Macho'],['H','♀ Hembra']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setForm(f => ({ ...f, sexo: val }))}
                      className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all
                        ${form.sexo === val
                          ? val === 'M' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-pink-50 border-pink-300 text-pink-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Peso (kg)</label>
                <input type="number" name="peso" value={form.peso} onChange={handle}
                  min="0" step="0.1" className="input" placeholder="12.5" />
              </div>
              <div>
                <label className="label">Fecha nacimiento</label>
                <input type="date" name="fechaNacimiento" value={form.fechaNacimiento}
                  onChange={handle} className="input" />
              </div>
            </div>

            <div>
              <label className="label">Número de chip</label>
              <input type="text" name="chip" value={form.chip} onChange={handle}
                className="input" placeholder="Código microchip (opcional)" />
            </div>
          </div>

          {/* Foto */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">
              Foto (opcional)
            </h2>
            <div>
              <label className="label">URL de la imagen</label>
              <input type="url" name="fotoUrl" value={form.fotoUrl} onChange={handle}
                className="input" placeholder="https://…" />
            </div>
            {form.fotoUrl && (
              <img src={form.fotoUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-100"
                onError={e => e.target.style.display = 'none'} />
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <button type="submit" disabled={cargando || !form.propietario} className="btn-primary flex-1 py-3">
              {cargando ? 'Guardando…' : esEdicion ? 'Actualizar paciente' : 'Registrar paciente'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-outline px-6">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default FormPaciente;
