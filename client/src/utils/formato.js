// Formatear montos en pesos colombianos
export const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

// Formatear fecha en español (dd/mm/aaaa)
export const formatearFecha = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Formatear fecha con hora
export const formatearFechaHora = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calcular edad del canino en años y meses
export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 'Desconocida';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  const años = Math.floor((hoy - nacimiento) / (365.25 * 24 * 60 * 60 * 1000));
  if (años < 1) {
    const meses = Math.floor((hoy - nacimiento) / (30.44 * 24 * 60 * 60 * 1000));
    return `${meses} mes${meses !== 1 ? 'es' : ''}`;
  }
  return `${años} año${años !== 1 ? 's' : ''}`;
};
