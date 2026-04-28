const Canino = require('../models/Canino');
const Propietario = require('../models/Propietario');

// @desc    Obtener todos los caninos
// @route   GET /api/caninos
// @access  Admin, Veterinario, Recepcionista
const obtenerCaninos = async (req, res) => {
  try {
    const { busqueda, propietario, pagina = 1, limite = 10 } = req.query;
    const filtro = { activo: true };

    if (propietario) filtro.propietario = propietario;

    if (busqueda) {
      // Buscar también por nombre del propietario
      const propietarios = await Propietario.find({
        nombre: { $regex: busqueda, $options: 'i' }
      }).select('_id');

      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { raza: { $regex: busqueda, $options: 'i' } },
        { chip: { $regex: busqueda, $options: 'i' } },
        { propietario: { $in: propietarios.map(p => p._id) } }
      ];
    }

    const total = await Canino.countDocuments(filtro);
    const caninos = await Canino.find(filtro)
      .populate('propietario', 'nombre documento telefono')
      .sort({ nombre: 1 })
      .skip((pagina - 1) * limite)
      .limit(parseInt(limite));

    res.json({ caninos, total, paginas: Math.ceil(total / limite) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener caninos', error: error.message });
  }
};

// @desc    Obtener un canino por ID
// @route   GET /api/caninos/:id
// @access  Privado
const obtenerCanino = async (req, res) => {
  try {
    const canino = await Canino.findById(req.params.id).populate('propietario');
    if (!canino) return res.status(404).json({ mensaje: 'Canino no encontrado' });
    res.json(canino);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener canino', error: error.message });
  }
};

// @desc    Crear canino
// @route   POST /api/caninos
// @access  Admin, Recepcionista, Veterinario
const crearCanino = async (req, res) => {
  try {
    const canino = await Canino.create(req.body);
    await canino.populate('propietario', 'nombre documento');
    res.status(201).json(canino);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear canino', error: error.message });
  }
};

// @desc    Actualizar canino
// @route   PUT /api/caninos/:id
// @access  Admin, Recepcionista, Veterinario
const actualizarCanino = async (req, res) => {
  try {
    const canino = await Canino.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('propietario', 'nombre documento');
    if (!canino) return res.status(404).json({ mensaje: 'Canino no encontrado' });
    res.json(canino);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar canino', error: error.message });
  }
};

// @desc    Desactivar canino
// @route   DELETE /api/caninos/:id
// @access  Admin
const eliminarCanino = async (req, res) => {
  try {
    const canino = await Canino.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!canino) return res.status(404).json({ mensaje: 'Canino no encontrado' });
    res.json({ mensaje: 'Canino eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar canino', error: error.message });
  }
};

// @desc    Obtener caninos del propietario logueado (cliente)
// @route   GET /api/caninos/mis-caninos
// @access  Cliente
const misCaninosPropietario = async (req, res) => {
  try {
    const propietario = await Propietario.findOne({ usuario: req.usuario._id });
    if (!propietario) return res.json({ caninos: [], total: 0 });

    const caninos = await Canino.find({ propietario: propietario._id, activo: true })
      .populate('propietario', 'nombre');
    res.json({ caninos, total: caninos.length });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener caninos', error: error.message });
  }
};

module.exports = { obtenerCaninos, obtenerCanino, crearCanino, actualizarCanino, eliminarCanino, misCaninosPropietario };
