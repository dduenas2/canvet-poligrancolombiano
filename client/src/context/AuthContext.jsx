import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('canvet_usuario');
    const tokenGuardado = localStorage.getItem('canvet_token');
    if (usuarioGuardado && tokenGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('canvet_token', data.token);
    localStorage.setItem('canvet_usuario', JSON.stringify(data));
    setUsuario(data);
    return data;
  };

  const registro = async (nombre, email, password) => {
    const { data } = await api.post('/auth/registro', { nombre, email, password });
    localStorage.setItem('canvet_token', data.token);
    localStorage.setItem('canvet_usuario', JSON.stringify(data));
    setUsuario(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('canvet_token');
    localStorage.removeItem('canvet_usuario');
    setUsuario(null);
  };

  const esAdmin = () => usuario?.rol === 'admin';
  const esVeterinario = () => usuario?.rol === 'veterinario';
  const esRecepcionista = () => usuario?.rol === 'recepcionista';
  const esCliente = () => usuario?.rol === 'cliente';
  const tieneRol = (...roles) => roles.includes(usuario?.rol);

  return (
    <AuthContext.Provider value={{
      usuario, cargando, login, logout, registro,
      esAdmin, esVeterinario, esRecepcionista, esCliente, tieneRol
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
