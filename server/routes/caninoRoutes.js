const express = require('express');
const router = express.Router();
const {
  obtenerCaninos, obtenerCanino, crearCanino,
  actualizarCanino, eliminarCanino, misCaninosPropietario
} = require('../controllers/caninoController');
const { proteger, autorizar } = require('../middleware/auth');

router.use(proteger);

router.get('/mis-caninos', misCaninosPropietario);
router.get('/', obtenerCaninos);
router.get('/:id', obtenerCanino);
router.post('/', autorizar('admin', 'recepcionista', 'veterinario'), crearCanino);
router.put('/:id', autorizar('admin', 'recepcionista', 'veterinario'), actualizarCanino);
router.delete('/:id', autorizar('admin'), eliminarCanino);

module.exports = router;
