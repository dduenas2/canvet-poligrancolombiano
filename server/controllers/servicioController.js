const Servicio = require('../models/Servicio');
const CategoriaServicio = require('../models/CategoriaServicio');

// @desc    Obtener categorías con sus servicios
// @route   GET /api/categorias
// @access  Público
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaServicio.find({ activo: true });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
};

// @desc    Obtener todos los servicios agrupados por categoría
// @route   GET /api/servicios
// @access  Público
const obtenerServicios = async (req, res) => {
  try {
    const { categoria, soloActivos } = req.query;
    const filtro = {};
    if (categoria) filtro.categoria = categoria;
    if (soloActivos !== 'false') filtro.activo = true;

    const servicios = await Servicio.find(filtro)
      .populate('categoria', 'nombre descripcion icono')
      .sort({ 'categoria.nombre': 1, nombre: 1 });

    res.json(servicios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener servicios', error: error.message });
  }
};

// @desc    Obtener un servicio
// @route   GET /api/servicios/:id
// @access  Público
const obtenerServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id).populate('categoria');
    if (!servicio) return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener servicio', error: error.message });
  }
};

// @desc    Crear servicio (solo admin)
// @route   POST /api/servicios
// @access  Admin
const crearServicio = async (req, res) => {
  try {
    const servicio = await Servicio.create(req.body);
    await servicio.populate('categoria', 'nombre');
    res.status(201).json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear servicio', error: error.message });
  }
};

// @desc    Actualizar servicio (solo admin)
// @route   PUT /api/servicios/:id
// @access  Admin
const actualizarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('categoria', 'nombre');
    if (!servicio) return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar servicio', error: error.message });
  }
};

// @desc    Desactivar servicio
// @route   DELETE /api/servicios/:id
// @access  Admin
const desactivarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!servicio) return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    res.json({ mensaje: 'Servicio desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al desactivar servicio', error: error.message });
  }
};

// @desc    Crear categoría (solo admin)
// @route   POST /api/categorias
// @access  Admin
const crearCategoria = async (req, res) => {
  try {
    const categoria = await CategoriaServicio.create(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear categoría', error: error.message });
  }
};

module.exports = { obtenerCategorias, obtenerServicios, obtenerServicio, crearServicio, actualizarServicio, desactivarServicio, crearCategoria };
