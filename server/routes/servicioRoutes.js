const express = require('express');
const router = express.Router();
const {
  obtenerServicios, obtenerServicio, crearServicio,
  actualizarServicio, desactivarServicio
} = require('../controllers/servicioController');
const { proteger, autorizar } = require('../middleware/auth');

router.get('/', obtenerServicios);
router.get('/:id', obtenerServicio);
router.post('/', proteger, autorizar('admin'), crearServicio);
router.put('/:id', proteger, autorizar('admin'), actualizarServicio);
router.delete('/:id', proteger, autorizar('admin'), desactivarServicio);

module.exports = router;
