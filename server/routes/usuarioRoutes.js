const express = require('express');
const router = express.Router();
const {
  obtenerUsuarios, obtenerUsuario, crearUsuario,
  actualizarUsuario, desactivarUsuario, obtenerVeterinarios
} = require('../controllers/usuarioController');
const { proteger, autorizar } = require('../middleware/auth');

router.use(proteger);

router.get('/veterinarios', obtenerVeterinarios);
router.get('/', autorizar('admin'), obtenerUsuarios);
router.get('/:id', autorizar('admin'), obtenerUsuario);
router.post('/', autorizar('admin'), crearUsuario);
router.put('/:id', autorizar('admin'), actualizarUsuario);
router.delete('/:id', autorizar('admin'), desactivarUsuario);

module.exports = router;
