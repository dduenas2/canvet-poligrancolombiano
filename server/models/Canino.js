const mongoose = require('mongoose');

const caninoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del canino es requerido'],
    trim: true
  },
  raza: {
    type: String,
    required: [true, 'La raza es requerida'],
    trim: true
  },
  fechaNacimiento: {
    type: Date
  },
  peso: {
    type: Number,
    min: 0
  },
  sexo: {
    type: String,
    enum: ['M', 'H'],
    required: [true, 'El sexo es requerido']
  },
  chip: {
    type: String,
    trim: true,
    sparse: true  // Permite múltiples documentos con valor null
  },
  fotoUrl: {
    type: String
  },
  propietario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Propietario',
    required: [true, 'El propietario es requerido']
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Canino', caninoSchema);
