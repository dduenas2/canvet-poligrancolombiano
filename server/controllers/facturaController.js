const Factura  = require('../models/Factura');
const Propietario = require('../models/Propietario');
const Cita     = require('../models/Cita');

// ─── Obtener listado de facturas ──────────────────────────────────────────────
// GET /api/facturas
const obtenerFacturas = async (req, res) => {
  try {
    const { propietario, estado, pagina = 1, limite = 10 } = req.query;
    const filtro = {};

    if (propietario) filtro.propietario = propietario;
    if (estado) filtro.estado = estado;

    if (req.usuario.rol === 'cliente') {
      const prop = await Propietario.findOne({ usuario: req.usuario._id });
      if (!prop) return res.json({ facturas: [], total: 0 });
      filtro.propietario = prop._id;
    }

    const total    = await Factura.countDocuments(filtro);
    const facturas = await Factura.find(filtro)
      .populate('propietario', 'nombre documento')
      .populate('detalles.servicio', 'nombre')
      .populate('generadaPor', 'nombre')
      .sort({ fecha: -1 })
      .skip((pagina - 1) * limite)
      .limit(parseInt(limite));

    res.json({ facturas, total, paginas: Math.ceil(total / limite) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener facturas', error: error.message });
  }
};

// ─── Obtener una factura ──────────────────────────────────────────────────────
// GET /api/facturas/:id
const obtenerFactura = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id)
      .populate('propietario', 'nombre documento telefono email direccion')
      .populate('detalles.servicio', 'nombre categoria')
      .populate('generadaPor', 'nombre')
      .populate('pagos.procesadoPor', 'nombre');

    if (!factura) return res.status(404).json({ mensaje: 'Factura no encontrada' });
    res.json(factura);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener factura', error: error.message });
  }
};

// ─── Crear factura ────────────────────────────────────────────────────────────
// POST /api/facturas
const crearFactura = async (req, res) => {
  try {
    const { propietario, detalles, notas, citasIds = [] } = req.body;

    if (!detalles || detalles.length === 0)
      return res.status(400).json({ mensaje: 'La factura debe tener al menos un detalle' });

    const subtotal = detalles.reduce((sum, d) => sum + d.subtotalLinea, 0);
    const iva      = Math.round(subtotal * 0.19);
    const total    = subtotal + iva;

    const factura = await Factura.create({
      propietario,
      detalles,
      subtotal,
      iva,
      total,
      saldoPendiente: total,
      citas: citasIds,
      notas,
      generadaPor: req.usuario._id
    });

    // Marcar citas como facturadas para evitar doble facturación
    if (citasIds.length > 0) {
      await Cita.updateMany({ _id: { $in: citasIds } }, { facturada: true });
    }

    await factura.populate('propietario', 'nombre documento');
    res.status(201).json(factura);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear factura', error: error.message });
  }
};

// ─── Registrar pago ───────────────────────────────────────────────────────────
// POST /api/facturas/:id/pago
const registrarPago = async (req, res) => {
  try {
    const { monto, metodoPago, referencia } = req.body;
    const factura = await Factura.findById(req.params.id);

    if (!factura)
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    if (factura.estado === 'anulada')
      return res.status(400).json({ mensaje: 'No se puede registrar un pago en una factura anulada' });
    if (factura.estado === 'pagada')
      return res.status(400).json({ mensaje: 'La factura ya está pagada completamente' });
    if (!monto || monto <= 0)
      return res.status(400).json({ mensaje: 'El monto debe ser mayor a cero' });
    if (monto > factura.saldoPendiente + 0.01)   // margen de centavos por redondeo
      return res.status(400).json({ mensaje: `El monto excede el saldo pendiente ($${factura.saldoPendiente})` });

    // Registrar el pago
    factura.pagos.push({
      monto,
      metodoPago,
      referencia: referencia || undefined,
      procesadoPor: req.usuario._id
    });

    factura.saldoPendiente = Math.max(0, Math.round((factura.saldoPendiente - monto) * 100) / 100);

    if (factura.saldoPendiente === 0) {
      factura.estado = 'pagada';
    } else {
      factura.estado = 'parcial';
    }

    await factura.save();
    await factura.populate('pagos.procesadoPor', 'nombre');

    res.json(factura);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar pago', error: error.message });
  }
};

// ─── Anular factura ───────────────────────────────────────────────────────────
// PUT /api/facturas/:id  (solo para anular, no se permiten otros cambios)
const actualizarFactura = async (req, res) => {
  try {
    const { estado } = req.body;

    if (estado !== 'anulada')
      return res.status(400).json({ mensaje: 'Solo se puede anular una factura por esta vía' });

    const factura = await Factura.findById(req.params.id);
    if (!factura)
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    if (factura.estado === 'anulada')
      return res.status(400).json({ mensaje: 'La factura ya está anulada' });

    factura.estado = 'anulada';
    await factura.save();

    // Desmarcar citas vinculadas para que puedan volver a facturarse
    if (factura.citas?.length > 0) {
      await Cita.updateMany({ _id: { $in: factura.citas } }, { facturada: false });
    }

    res.json(factura);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al anular factura', error: error.message });
  }
};

module.exports = { obtenerFacturas, obtenerFactura, crearFactura, registrarPago, actualizarFactura };
