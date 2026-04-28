const Spinner = ({ texto = 'Cargando...', full = false }) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${full ? 'min-h-screen' : 'py-16'}`}>
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
      <div className="absolute inset-0 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
    </div>
    <span className="text-sm text-slate-400 font-medium">{texto}</span>
  </div>
);

export default Spinner;
