const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  fecha:       { type: Date, default: Date.now },
  monto:       { type: Number, required: true },
  metodoPago:  {
    type: String,
    enum: ['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'otro'],
    required: true
  },
  referencia:   String,   // N° transacción, comprobante transferencia
  procesadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { _id: true });

const detalleFacturaSchema = new mongoose.Schema({
  servicio:       { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
  nombreServicio: String,   // snapshot por si el servicio cambia de nombre
  cantidad:       { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true },
  subtotalLinea:  { type: Number, required: true }
}, { _id: false });

const facturaSchema = new mongoose.Schema({
  numero:    { type: String, unique: true },
  fecha:     { type: Date, default: Date.now },
  propietario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Propietario',
    required: [true, 'El propietario es requerido']
  },
  // Citas de origen (para evitar doble facturación)
  citas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cita' }],

  detalles:  [detalleFacturaSchema],
  subtotal:  { type: Number, required: true },
  iva:       { type: Number, required: true },
  total:     { type: Number, required: true },

  // Pagos registrados
  pagos:           { type: [pagoSchema], default: [] },
  saldoPendiente:  { type: Number, required: true },

  estado: {
    type: String,
    enum: ['emitida', 'parcial', 'pagada', 'anulada'],
    default: 'emitida'
  },

  generadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  notas: String
});

// Número correlativo automático
facturaSchema.pre('save', async function (next) {
  if (!this.numero) {
    const count = await mongoose.model('Factura').countDocuments();
    this.numero = `FAC-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Factura', facturaSchema);
