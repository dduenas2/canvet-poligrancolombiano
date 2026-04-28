const HistorialClinico = require('../models/HistorialClinico');
const Canino = require('../models/Canino');
const Propietario = require('../models/Propietario');

// @desc    Obtener historial clínico de un canino
// @route   GET /api/historial/:caninoId
// @access  Admin, Veterinario, Recepcionista, Cliente (solo sus caninos)
const obtenerHistorial = async (req, res) => {
  try {
    const { pagina = 1, limite = 10 } = req.query;
    const caninoId = req.params.caninoId;

    // Si es cliente, verificar que el canino le pertenece
    if (req.usuario.rol === 'cliente') {
      const propietario = await Propietario.findOne({ usuario: req.usuario._id });
      if (!propietario) return res.status(403).json({ mensaje: 'No tiene caninos registrados' });

      const canino = await Canino.findOne({ _id: caninoId, propietario: propietario._id });
      if (!canino) return res.status(403).json({ mensaje: 'No tiene acceso a este historial' });
    }

    const total = await HistorialClinico.countDocuments({ canino: caninoId });
    const historial = await HistorialClinico.find({ canino: caninoId })
      .populate('veterinario', 'nombre')
      .populate('servicio', 'nombre precio')
      .sort({ fecha: -1 })
      .skip((pagina - 1) * limite)
      .limit(parseInt(limite));

    res.json({ historial, total, paginas: Math.ceil(total / limite) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener historial', error: error.message });
  }
};

// @desc    Crear registro clínico
// @route   POST /api/historial
// @access  Veterinario, Admin
const crearRegistroClinico = async (req, res) => {
  try {
    const { canino, servicio, diagnostico, tratamiento, observaciones, cita, fecha } = req.body;

    const registro = await HistorialClinico.create({
      canino,
      veterinario: req.usuario._id,
      servicio,
      diagnostico,
      tratamiento,
      observaciones,
      cita,
      fecha: fecha || Date.now()
    });

    await registro.populate([
      { path: 'veterinario', select: 'nombre' },
      { path: 'servicio', select: 'nombre precio' },
      { path: 'canino', select: 'nombre raza' }
    ]);

    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear registro clínico', error: error.message });
  }
};

// @desc    Actualizar registro clínico
// @route   PUT /api/historial/:id
// @access  Veterinario, Admin
const actualizarRegistroClinico = async (req, res) => {
  try {
    const registro = await HistorialClinico.findById(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado' });

    // Solo el veterinario que creó el registro o el admin puede editarlo
    if (req.usuario.rol === 'veterinario' && registro.veterinario.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ mensaje: 'No tiene permiso para editar este registro' });
    }

    const actualizado = await HistorialClinico.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('veterinario', 'nombre')
      .populate('servicio', 'nombre precio');

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar registro', error: error.message });
  }
};

module.exports = { obtenerHistorial, crearRegistroClinico, actualizarRegistroClinico };
