const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del servicio es requerido'],
    trim: true
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoriaServicio',
    required: [true, 'La categoría es requerida']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: 0
  },
  duracionMin: {
    type: Number,
    default: 30,
    min: 0
  },
  activo: {
    type: Boolean,
    default: true
  },
  descripcion: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('Servicio', servicioSchema);
