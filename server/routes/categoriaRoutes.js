const express = require('express');
const router = express.Router();
const { obtenerCategorias, crearCategoria } = require('../controllers/servicioController');
const { proteger, autorizar } = require('../middleware/auth');

router.get('/', obtenerCategorias);
router.post('/', proteger, autorizar('admin'), crearCategoria);

module.exports = router;
