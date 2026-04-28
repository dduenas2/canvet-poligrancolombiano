const Paginacion = ({ pagina, totalPaginas, total, limite, onCambiar }) => {
  if (totalPaginas <= 1) return null;
  const inicio = (pagina - 1) * (limite || 10) + 1;
  const fin = Math.min(pagina * (limite || 10), total || 0);

  const rango = () => {
    const delta = 2;
    const left = Math.max(2, pagina - delta);
    const right = Math.min(totalPaginas - 1, pagina + delta);
    const pages = [1];
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPaginas - 1) pages.push('...');
    if (totalPaginas > 1) pages.push(totalPaginas);
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-5 px-1">
      <span className="text-xs text-slate-400">
        {total ? `Mostrando ${inicio}–${fin} de ${total}` : ''}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onCambiar(pagina - 1)} disabled={pagina === 1}
          className="btn-ghost btn-sm disabled:opacity-30">
          ‹
        </button>
        {rango().map((p, i) =>
          p === '...'
            ? <span key={`dots-${i}`} className="px-2 text-slate-300 text-sm">…</span>
            : <button key={p} onClick={() => onCambiar(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                  ${p === pagina ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {p}
              </button>
        )}
        <button onClick={() => onCambiar(pagina + 1)} disabled={pagina === totalPaginas}
          className="btn-ghost btn-sm disabled:opacity-30">
          ›
        </button>
      </div>
    </div>
  );
};

export default Paginacion;
