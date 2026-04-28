const Propietario = require('../models/Propietario');

// @desc    Obtener todos los propietarios
// @route   GET /api/propietarios
// @access  Admin, Veterinario, Recepcionista
const obtenerPropietarios = async (req, res) => {
  try {
    const { busqueda, pagina = 1, limite = 10 } = req.query;
    const filtro = {};

    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { documento: { $regex: busqueda, $options: 'i' } },
        { telefono: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const total = await Propietario.countDocuments(filtro);
    const propietarios = await Propietario.find(filtro)
      .populate('usuario', 'email rol')
      .sort({ nombre: 1 })
      .skip((pagina - 1) * limite)
      .limit(parseInt(limite));

    res.json({ propietarios, total, paginas: Math.ceil(total / limite) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener propietarios', error: error.message });
  }
};

// @desc    Obtener un propietario
// @route   GET /api/propietarios/:id
// @access  Admin, Veterinario, Recepcionista
const obtenerPropietario = async (req, res) => {
  try {
    const propietario = await Propietario.findById(req.params.id).populate('usuario', 'email rol');
    if (!propietario) return res.status(404).json({ mensaje: 'Propietario no encontrado' });
    res.json(propietario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener propietario', error: error.message });
  }
};

// @desc    Crear propietario
// @route   POST /api/propietarios
// @access  Admin, Recepcionista
const crearPropietario = async (req, res) => {
  try {
    const propietario = await Propietario.create(req.body);
    res.status(201).json(propietario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear propietario', error: error.message });
  }
};

// @desc    Actualizar propietario
// @route   PUT /api/propietarios/:id
// @access  Admin, Recepcionista
const actualizarPropietario = async (req, res) => {
  try {
    const propietario = await Propietario.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!propietario) return res.status(404).json({ mensaje: 'Propietario no encontrado' });
    res.json(propietario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar propietario', error: error.message });
  }
};

// @desc    Eliminar propietario
// @route   DELETE /api/propietarios/:id
// @access  Admin
const eliminarPropietario = async (req, res) => {
  try {
    const propietario = await Propietario.findByIdAndDelete(req.params.id);
    if (!propietario) return res.status(404).json({ mensaje: 'Propietario no encontrado' });
    res.json({ mensaje: 'Propietario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar propietario', error: error.message });
  }
};

module.exports = { obtenerPropietarios, obtenerPropietario, crearPropietario, actualizarPropietario, eliminarPropietario };
