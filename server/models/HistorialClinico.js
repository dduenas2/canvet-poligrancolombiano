const mongoose = require('mongoose');

const historialClinicoSchema = new mongoose.Schema({
  canino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canino',
    required: [true, 'El canino es requerido']
  },
  veterinario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El veterinario es requerido']
  },
  servicio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servicio',
    required: [true, 'El servicio es requerido']
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  diagnostico: {
    type: String,
    required: [true, 'El diagnóstico es requerido'],
    trim: true
  },
  tratamiento: {
    type: String,
    trim: true
  },
  observaciones: {
    type: String,
    trim: true
  },
  // Referencia a cita si proviene de una
  cita: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cita',
    default: null
  }
});

// Índice para búsquedas por canino y fecha
historialClinicoSchema.index({ canino: 1, fecha: -1 });

module.exports = mongoose.model('HistorialClinico', historialClinicoSchema);
