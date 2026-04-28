const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  canino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canino',
    required: [true, 'El canino es requerido']
  },
  servicio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servicio',
    required: [true, 'El servicio es requerido']
  },
  serviciosExtra: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servicio'
  }],
  veterinario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El veterinario es requerido']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es requerida']
  },
  hora: {
    type: String,
    required: [true, 'La hora es requerida']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'atendida', 'cancelada'],
    default: 'pendiente'
  },
  notas: {
    type: String,
    trim: true
  },
  // Indica que ya fue incluida en una factura
  facturada: { type: Boolean, default: false },

  // Quien agendó la cita
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

// Índice para verificar disponibilidad del veterinario
citaSchema.index({ veterinario: 1, fecha: 1, hora: 1 });

module.exports = mongoose.model('Cita', citaSchema);
