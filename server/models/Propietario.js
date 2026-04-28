const mongoose = require('mongoose');

const propietarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  documento: {
    type: String,
    required: [true, 'El documento (cédula) es requerido'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  direccion: {
    type: String,
    trim: true
  },
  // Opcional: si el propietario tiene cuenta de usuario
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Propietario', propietarioSchema);
