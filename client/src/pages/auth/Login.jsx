import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Credenciales incorrectas');
    } finally { setLoading(false); }
  };

  const demo = (email, pwd) => setForm({ email, password: pwd });

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Panel izquierdo — imagen/marca */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold">
            CV
          </div>
          <span className="text-white font-bold text-xl">CanVet</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestión veterinaria<br />
            <span className="text-brand-400">inteligente y eficiente</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            Administra citas, historiales clínicos, facturación y más
            en una sola plataforma diseñada para clínicas veterinarias.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { icon: '🐕', label: 'Pacientes',   desc: 'Fichas clínicas completas' },
              { icon: '📅', label: 'Citas',        desc: 'Agenda inteligente' },
              { icon: '💳', label: 'Facturación',  desc: 'Facturas con PDF' },
              { icon: '📊', label: 'Reportes',     desc: 'Estadísticas en tiempo real' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <div className="text-white text-sm font-semibold">{f.label}</div>
                  <div className="text-white/40 text-xs">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/20 text-xs">
          Politécnico Grancolombiano · Gerencia de Proyectos Informáticos 2026
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">CV</div>
            <span className="font-bold text-slate-900 text-xl">CanVet</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Bienvenido de nuevo</h2>
          <p className="text-slate-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          {error && (
            <div className="alert-error mb-5">
              <span className="text-base">✕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input type="email" name="email" value={form.email} onChange={handle}
                required autoComplete="email" className="input"
                placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input type="password" name="password" value={form.password} onChange={handle}
                required autoComplete="current-password" className="input"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading
                ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Ingresando...</>
                : 'Ingresar al sistema'
              }
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            ¿Eres cliente nuevo?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              Crea tu cuenta gratis
            </Link>
          </p>

          {/* Accesos demo */}
          <div className="mt-8 p-4 bg-slate-100 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Accesos de demostración
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { rol: 'Admin',        email: 'admin@canvet.com',    pwd: 'admin123',   color: 'badge-admin' },
                { rol: 'Veterinario',  email: 'vet1@canvet.com',     pwd: 'vet123',     color: 'badge-veterinario' },
                { rol: 'Recepción',    email: 'recep@canvet.com',    pwd: 'recep123',   color: 'badge-recepcionista' },
                { rol: 'Cliente',      email: 'cliente@canvet.com',  pwd: 'cliente123', color: 'badge-cliente' },
              ].map(d => (
                <button key={d.rol} onClick={() => demo(d.email, d.pwd)}
                  className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-left group">
                  <span className={d.color}>{d.rol}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Haz clic en un rol para autocompletar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
