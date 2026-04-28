const express = require('express');
const router = express.Router();
const {
  obtenerPropietarios, obtenerPropietario, crearPropietario,
  actualizarPropietario, eliminarPropietario
} = require('../controllers/propietarioController');
const { proteger, autorizar } = require('../middleware/auth');

router.use(proteger);

router.get('/', autorizar('admin', 'veterinario', 'recepcionista'), obtenerPropietarios);
router.get('/:id', autorizar('admin', 'veterinario', 'recepcionista'), obtenerPropietario);
router.post('/', autorizar('admin', 'recepcionista'), crearPropietario);
router.put('/:id', autorizar('admin', 'recepcionista'), actualizarPropietario);
router.delete('/:id', autorizar('admin'), eliminarPropietario);

module.exports = router;
