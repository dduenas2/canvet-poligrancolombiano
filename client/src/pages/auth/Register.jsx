import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [form, setForm]       = useState({ nombre:'', email:'', password:'', confirmar:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden');
    if (form.password.length < 6) return setError('Mínimo 6 caracteres');
    setLoading(true);
    try {
      await registro(form.nombre, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold">CV</div>
            <span className="font-bold text-slate-900 text-xl">CanVet</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Crear cuenta de cliente</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona las citas de tus mascotas</p>
        </div>

        <div className="card">
          {error && <div className="alert-error mb-4"><span>✕</span><span>{error}</span></div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handle}
                required className="input" placeholder="Tu nombre completo" />
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input type="email" name="email" value={form.email} onChange={handle}
                required className="input" placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input type="password" name="password" value={form.password} onChange={handle}
                required minLength={6} className="input" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="label">Confirmar contraseña</label>
              <input type="password" name="confirmar" value={form.confirmar} onChange={handle}
                required className="input" placeholder="Repite la contraseña" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
