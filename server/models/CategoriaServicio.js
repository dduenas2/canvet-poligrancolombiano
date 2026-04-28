const mongoose = require('mongoose');

const categoriaServicioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    trim: true,
    unique: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  icono: {
    type: String,
    default: '🐾'
  },
  activo: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('CategoriaServicio', categoriaServicioSchema);
