import axios from 'axios';

// Instancia de axios con configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('canvet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('canvet_token');
      localStorage.removeItem('canvet_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
