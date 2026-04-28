const Cita = require('../models/Cita');
const Canino = require('../models/Canino');
const Propietario = require('../models/Propietario');

// @desc    Obtener citas
// @route   GET /api/citas
// @access  Privado (filtrado por rol)
const obtenerCitas = async (req, res) => {
  try {
    const { fecha, veterinario, estado, canino, pagina = 1, limite = 20 } = req.query;
    const filtro = {};

    if (fecha) {
      const inicio = new Date(fecha);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(fecha);
      fin.setHours(23, 59, 59, 999);
      filtro.fecha = { $gte: inicio, $lte: fin };
    }

    if (veterinario) filtro.veterinario = veterinario;
    if (estado) filtro.estado = estado;
    if (canino) filtro.canino = canino;

    // Si es veterinario, solo ver sus citas
    if (req.usuario.rol === 'veterinario') {
      filtro.veterinario = req.usuario._id;
    }

    // Si es cliente, solo ver citas de sus caninos
    if (req.usuario.rol === 'cliente') {
      const propietario = await Propietario.findOne({ usuario: req.usuario._id });
      if (!propietario) return res.json({ citas: [], total: 0 });
      const caninos = await Canino.find({ propietario: propietario._id }).select('_id');
      filtro.canino = { $in: caninos.map(c => c._id) };
    }

    const total = await Cita.countDocuments(filtro);
    const citas = await Cita.find(filtro)
      .populate({ path: 'canino', select: 'nombre raza propietario',
                  populate: { path: 'propietario', select: 'nombre _id documento' } })
      .populate('servicio', 'nombre precio duracionMin')
      .populate('serviciosExtra', 'nombre precio duracionMin')
      .populate('veterinario', 'nombre')
      .populate('creadoPor', 'nombre rol')
      .sort({ fecha: 1, hora: 1 })
      .skip((pagina - 1) * limite)
      .limit(parseInt(limite));

    res.json({ citas, total, paginas: Math.ceil(total / limite) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener citas', error: error.message });
  }
};

// @desc    Verificar disponibilidad
// @route   GET /api/citas/disponibilidad
// @access  Privado
const verificarDisponibilidad = async (req, res) => {
  try {
    const { veterinario, fecha, hora } = req.query;
    // Buscar por rango del día completo para evitar problemas de zona horaria
    const inicio = new Date(fecha); inicio.setHours(0, 0, 0, 0);
    const fin    = new Date(fecha); fin.setHours(23, 59, 59, 999);

    const citaExistente = await Cita.findOne({
      veterinario,
      fecha: { $gte: inicio, $lte: fin },
      hora,
      estado: { $in: ['pendiente', 'confirmada'] }
    });

    res.json({ disponible: !citaExistente });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar disponibilidad', error: error.message });
  }
};

// @desc    Crear cita
// @route   POST /api/citas
// @access  Privado
const crearCita = async (req, res) => {
  try {
    const { canino, servicio, serviciosExtra = [], veterinario, fecha, hora, notas } = req.body;

    // Verificar disponibilidad (rango del día para evitar problemas de zona horaria)
    const inicio = new Date(fecha); inicio.setHours(0, 0, 0, 0);
    const fin    = new Date(fecha); fin.setHours(23, 59, 59, 999);
    const citaExistente = await Cita.findOne({
      veterinario,
      fecha: { $gte: inicio, $lte: fin },
      hora,
      estado: { $in: ['pendiente', 'confirmada'] }
    });

    if (citaExistente) {
      return res.status(400).json({ mensaje: 'El veterinario ya tiene una cita a esa hora' });
    }

    // Si es cliente, verificar que el canino le pertenece
    if (req.usuario.rol === 'cliente') {
      const propietario = await Propietario.findOne({ usuario: req.usuario._id });
      if (!propietario) return res.status(403).json({ mensaje: 'No tiene propietario asociado' });
      const caninoObj = await Canino.findOne({ _id: canino, propietario: propietario._id });
      if (!caninoObj) return res.status(403).json({ mensaje: 'No tiene acceso a este canino' });
    }

    const cita = await Cita.create({
      canino,
      servicio,
      serviciosExtra,
      veterinario,
      fecha: new Date(fecha),
      hora,
      notas,
      creadoPor: req.usuario._id
    });

    await cita.populate([
      { path: 'canino', select: 'nombre raza' },
      { path: 'servicio', select: 'nombre precio' },
      { path: 'serviciosExtra', select: 'nombre precio' },
      { path: 'veterinario', select: 'nombre' }
    ]);

    res.status(201).json(cita);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear cita', error: error.message });
  }
};

// @desc    Actualizar estado de cita
// @route   PUT /api/citas/:id
// @access  Admin, Recepcionista, Veterinario
const actualizarCita = async (req, res) => {
  try {
    const cita = await Cita.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('canino', 'nombre raza')
      .populate('servicio', 'nombre precio')
      .populate('veterinario', 'nombre');

    if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada' });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar cita', error: error.message });
  }
};

// @desc    Cancelar cita
// @route   DELETE /api/citas/:id
// @access  Privado
const cancelarCita = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id).populate('canino', 'propietario');
    if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada' });

    // Si es cliente, verificar que la cita pertenece a uno de sus caninos
    if (req.usuario.rol === 'cliente') {
      const propietario = await Propietario.findOne({ usuario: req.usuario._id });
      if (!propietario) return res.status(403).json({ mensaje: 'Sin propietario asociado' });
      const canino = await Canino.findOne({ _id: cita.canino._id, propietario: propietario._id });
      if (!canino) return res.status(403).json({ mensaje: 'No tiene permiso para cancelar esta cita' });
    }

    cita.estado = 'cancelada';
    await cita.save();
    res.json({ mensaje: 'Cita cancelada correctamente', cita });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar cita', error: error.message });
  }
};

// @desc    Citas del día actual
// @route   GET /api/citas/hoy
// @access  Privado
const citasHoy = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const filtro = {
      fecha: { $gte: hoy, $lt: manana },
      estado: { $in: ['pendiente', 'confirmada'] }
    };

    if (req.usuario.rol === 'veterinario') {
      filtro.veterinario = req.usuario._id;
    }

    const citas = await Cita.find(filtro)
      .populate('canino', 'nombre raza')
      .populate('servicio', 'nombre')
      .populate('veterinario', 'nombre')
      .sort({ hora: 1 });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener citas de hoy', error: error.message });
  }
};

// @desc    Horas ocupadas de un veterinario en una fecha
// @route   GET /api/citas/horas-ocupadas
// @access  Privado
const horasOcupadas = async (req, res) => {
  try {
    const { veterinario, fecha } = req.query;
    if (!veterinario || !fecha) return res.json({ horasOcupadas: [] });

    const inicio = new Date(fecha); inicio.setHours(0, 0, 0, 0);
    const fin    = new Date(fecha); fin.setHours(23, 59, 59, 999);

    const citas = await Cita.find({
      veterinario,
      fecha: { $gte: inicio, $lte: fin },
      estado: { $in: ['pendiente', 'confirmada'] }
    }).select('hora');

    res.json({ horasOcupadas: citas.map(c => c.hora) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener horas ocupadas', error: error.message });
  }
};

module.exports = { obtenerCitas, crearCita, actualizarCita, cancelarCita, citasHoy, verificarDisponibilidad, horasOcupadas };
