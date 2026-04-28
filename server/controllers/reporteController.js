const HistorialClinico = require('../models/HistorialClinico');
const Factura = require('../models/Factura');
const Cita = require('../models/Cita');
const Canino = require('../models/Canino');
const Usuario = require('../models/Usuario');

// @desc    Reporte de servicios prestados por período
// @route   GET /api/reportes/servicios
// @access  Admin, Recepcionista
const reporteServiciosPorPeriodo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const filtro = {};

    if (fechaInicio && fechaFin) {
      filtro.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin + 'T23:59:59')
      };
    }

    const reporte = await HistorialClinico.aggregate([
      { $match: filtro },
      {
        $lookup: {
          from: 'servicios',
          localField: 'servicio',
          foreignField: '_id',
          as: 'servicioData'
        }
      },
      { $unwind: '$servicioData' },
      {
        $group: {
          _id: '$servicioData._id',
          nombre: { $first: '$servicioData.nombre' },
          precio: { $first: '$servicioData.precio' },
          cantidad: { $sum: 1 },
          valorTotal: { $sum: '$servicioData.precio' }
        }
      },
      { $sort: { cantidad: -1 } }
    ]);

    const totalCantidad = reporte.reduce((sum, r) => sum + r.cantidad, 0);
    const totalValor = reporte.reduce((sum, r) => sum + r.valorTotal, 0);

    res.json({ reporte, totalCantidad, totalValor });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar reporte', error: error.message });
  }
};

// @desc    Reporte de pacientes atendidos por veterinario
// @route   GET /api/reportes/veterinarios
// @access  Admin, Recepcionista
const reportePacientesPorVeterinario = async (req, res) => {
  try {
    const { veterinario, fechaInicio, fechaFin } = req.query;
    const filtro = {};

    if (veterinario) filtro.veterinario = require('mongoose').Types.ObjectId.createFromHexString(veterinario);
    if (fechaInicio && fechaFin) {
      filtro.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin + 'T23:59:59')
      };
    }

    const reporte = await HistorialClinico.aggregate([
      { $match: filtro },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'veterinario',
          foreignField: '_id',
          as: 'veterinarioData'
        }
      },
      { $unwind: '$veterinarioData' },
      {
        $group: {
          _id: '$veterinarioData._id',
          nombre: { $first: '$veterinarioData.nombre' },
          email: { $first: '$veterinarioData.email' },
          pacientesAtendidos: { $sum: 1 },
          caninos: { $addToSet: '$canino' }
        }
      },
      {
        $project: {
          nombre: 1,
          email: 1,
          pacientesAtendidos: 1,
          caninosUnicos: { $size: '$caninos' }
        }
      },
      { $sort: { pacientesAtendidos: -1 } }
    ]);

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar reporte', error: error.message });
  }
};

// @desc    Reporte de ingresos por categoría de servicio
// @route   GET /api/reportes/ingresos-categoria
// @access  Admin, Recepcionista
const reporteIngresosPorCategoria = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const filtroFactura = { estado: { $in: ['emitida', 'pagada'] } };

    if (fechaInicio && fechaFin) {
      filtroFactura.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin + 'T23:59:59')
      };
    }

    const reporte = await Factura.aggregate([
      { $match: filtroFactura },
      { $unwind: '$detalles' },
      {
        $lookup: {
          from: 'servicios',
          localField: 'detalles.servicio',
          foreignField: '_id',
          as: 'servicioData'
        }
      },
      { $unwind: '$servicioData' },
      {
        $lookup: {
          from: 'categoriaservicios',
          localField: 'servicioData.categoria',
          foreignField: '_id',
          as: 'categoriaData'
        }
      },
      { $unwind: '$categoriaData' },
      {
        $group: {
          _id: '$categoriaData._id',
          categoria: { $first: '$categoriaData.nombre' },
          totalIngresos: { $sum: '$detalles.subtotalLinea' },
          cantidadServicios: { $sum: '$detalles.cantidad' }
        }
      },
      { $sort: { totalIngresos: -1 } }
    ]);

    const totalIngresos = reporte.reduce((sum, r) => sum + r.totalIngresos, 0);
    res.json({ reporte, totalIngresos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar reporte', error: error.message });
  }
};

// @desc    Estadísticas del dashboard
// @route   GET /api/reportes/dashboard
// @access  Privado
const estadisticasDashboard = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const stats = {};

    if (req.usuario.rol === 'admin') {
      stats.totalCaninos = await Canino.countDocuments({ activo: true });
      stats.citasHoy = await Cita.countDocuments({
        fecha: { $gte: hoy, $lt: manana },
        estado: { $in: ['pendiente', 'confirmada'] }
      });
      const facturasMes = await Factura.aggregate([
        {
          $match: {
            fecha: { $gte: inicioMes },
            estado: { $in: ['emitida', 'pagada'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      stats.ingresosMes = facturasMes[0]?.total || 0;
      stats.totalUsuarios = await Usuario.countDocuments({ activo: true });
    }

    if (req.usuario.rol === 'veterinario') {
      stats.citasHoy = await Cita.countDocuments({
        veterinario: req.usuario._id,
        fecha: { $gte: hoy, $lt: manana },
        estado: { $in: ['pendiente', 'confirmada'] }
      });
      stats.pacientesHoy = await HistorialClinico.countDocuments({
        veterinario: req.usuario._id,
        fecha: { $gte: hoy, $lt: manana }
      });
      stats.pacientesMes = await HistorialClinico.countDocuments({
        veterinario: req.usuario._id,
        fecha: { $gte: inicioMes }
      });
    }

    if (req.usuario.rol === 'recepcionista') {
      stats.citasPendientes = await Cita.countDocuments({ estado: 'pendiente' });
      stats.citasHoy = await Cita.countDocuments({
        fecha: { $gte: hoy, $lt: manana }
      });
      stats.facturasHoy = await Factura.countDocuments({
        fecha: { $gte: hoy, $lt: manana }
      });
    }

    if (req.usuario.rol === 'cliente') {
      const Propietario = require('../models/Propietario');
      const propietario = await Propietario.findOne({ usuario: req.usuario._id });
      if (propietario) {
        stats.misCaninos = await Canino.countDocuments({ propietario: propietario._id, activo: true });
        const caninos = await Canino.find({ propietario: propietario._id }).select('_id');
        stats.proximasCitas = await Cita.countDocuments({
          canino: { $in: caninos.map(c => c._id) },
          fecha: { $gte: hoy },
          estado: { $in: ['pendiente', 'confirmada'] }
        });
      }
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: error.message });
  }
};

module.exports = { reporteServiciosPorPeriodo, reportePacientesPorVeterinario, reporteIngresosPorCategoria, estadisticasDashboard };
