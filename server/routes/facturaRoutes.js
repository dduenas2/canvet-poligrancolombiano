const express = require('express');
const router  = express.Router();
const {
  obtenerFacturas, obtenerFactura, crearFactura, registrarPago, actualizarFactura
} = require('../controllers/facturaController');
const { proteger, autorizar } = require('../middleware/auth');

router.use(proteger);

router.get('/',    obtenerFacturas);
router.get('/:id', obtenerFactura);
router.post('/',   autorizar('admin', 'recepcionista'), crearFactura);
router.post('/:id/pago', autorizar('admin', 'recepcionista'), registrarPago);
router.put('/:id', autorizar('admin', 'recepcionista'), actualizarFactura);

module.exports = router;
