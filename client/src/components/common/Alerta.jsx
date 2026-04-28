const iconos = {
  error:      '✕',
  exito:      '✓',
  info:       'ℹ',
  advertencia:'⚠',
};

const Alerta = ({ tipo = 'error', mensaje, onClose }) => {
  if (!mensaje) return null;
  const clases = {
    error:       'alert-error',
    exito:       'alert-success',
    info:        'alert-info',
    advertencia: 'alert-warning',
  };
  return (
    <div className={clases[tipo]}>
      <span className="text-base leading-none mt-0.5 flex-shrink-0">{iconos[tipo]}</span>
      <span className="flex-1">{mensaje}</span>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity text-base leading-none">
          ✕
        </button>
      )}
    </div>
  );
};

export default Alerta;
