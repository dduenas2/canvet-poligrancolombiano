import api from './api';

// Servicios de autenticación
export const authService = {
  login: (data) => api.post('/auth/login', data),
  registro: (data) => api.post('/auth/registro', data),
  perfil: () => api.get('/auth/perfil')
};

// Servicios de usuarios
export const usuarioService = {
  getAll: (params) => api.get('/usuarios', { params }),
  getById: (id) => api.get(`/usuarios/${id}`),
  getVeterinarios: () => api.get('/usuarios/veterinarios'),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`)
};

// Servicios de propietarios
export const propietarioService = {
  getAll: (params) => api.get('/propietarios', { params }),
  getById: (id) => api.get(`/propietarios/${id}`),
  create: (data) => api.post('/propietarios', data),
  update: (id, data) => api.put(`/propietarios/${id}`, data),
  delete: (id) => api.delete(`/propietarios/${id}`)
};

// Servicios de caninos
export const caninoService = {
  getAll: (params) => api.get('/caninos', { params }),
  getById: (id) => api.get(`/caninos/${id}`),
  getMisCaninos: () => api.get('/caninos/mis-caninos'),
  create: (data) => api.post('/caninos', data),
  update: (id, data) => api.put(`/caninos/${id}`, data),
  delete: (id) => api.delete(`/caninos/${id}`)
};

// Servicios de categorías y servicios clínicos
export const categoriaService = {
  getAll: () => api.get('/categorias'),
  create: (data) => api.post('/categorias', data)
};

export const servicioService = {
  getAll: (params) => api.get('/servicios', { params }),
  getById: (id) => api.get(`/servicios/${id}`),
  create: (data) => api.post('/servicios', data),
  update: (id, data) => api.put(`/servicios/${id}`, data),
  delete: (id) => api.delete(`/servicios/${id}`)
};

// Servicios de historial clínico
export const historialService = {
  getByCanino: (caninoId, params) => api.get(`/historial/${caninoId}`, { params }),
  create: (data) => api.post('/historial', data),
  update: (id, data) => api.put(`/historial/${id}`, data)
};

// Servicios de citas
export const citaService = {
  getAll: (params) => api.get('/citas', { params }),
  getHoy: () => api.get('/citas/hoy'),
  verificarDisponibilidad: (params) => api.get('/citas/disponibilidad', { params }),
  getHorasOcupadas: (params) => api.get('/citas/horas-ocupadas', { params }),
  create: (data) => api.post('/citas', data),
  update: (id, data) => api.put(`/citas/${id}`, data),
  cancelar: (id) => api.delete(`/citas/${id}`)
};

// Servicios de facturación
export const facturaService = {
  getAll:        (params) => api.get('/facturas', { params }),
  getById:       (id)     => api.get(`/facturas/${id}`),
  create:        (data)   => api.post('/facturas', data),
  registrarPago: (id, data) => api.post(`/facturas/${id}/pago`, data),
  update:        (id, data) => api.put(`/facturas/${id}`, data)
};

// Servicios de reportes
export const reporteService = {
  dashboard: () => api.get('/reportes/dashboard'),
  serviciosPorPeriodo: (params) => api.get('/reportes/servicios', { params }),
  pacientesPorVeterinario: (params) => api.get('/reportes/veterinarios', { params }),
  ingresosPorCategoria: (params) => api.get('/reportes/ingresos-categoria', { params })
};
