const express = require('express');
const router = express.Router();
const {
  obtenerHistorial, crearRegistroClinico, actualizarRegistroClinico
} = require('../controllers/historialController');
const { proteger, autorizar } = require('../middleware/auth');

router.use(proteger);

router.get('/:caninoId', obtenerHistorial);
router.post('/', autorizar('admin', 'veterinario'), crearRegistroClinico);
router.put('/:id', autorizar('admin', 'veterinario'), actualizarRegistroClinico);

module.exports = router;
