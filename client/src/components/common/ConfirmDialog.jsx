import Modal from './Modal';

const ConfirmDialog = ({
  abierto, onCerrar, onConfirmar, titulo, mensaje,
  textoCancelar = 'Cancelar', textoConfirmar = 'Confirmar', tipo = 'danger'
}) => (
  <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo} tamaño="sm">
    <p className="text-slate-600 text-sm leading-relaxed mb-6">{mensaje}</p>
    <div className="flex justify-end gap-3">
      <button onClick={onCerrar} className="btn-outline">{textoCancelar}</button>
      <button
        onClick={() => { onConfirmar(); onCerrar(); }}
        className={tipo === 'danger' ? 'btn-danger' : 'btn-primary'}
      >
        {textoConfirmar}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
