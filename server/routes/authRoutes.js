const express = require('express');
const router = express.Router();
const { login, registro, obtenerPerfil } = require('../controllers/authController');
const { proteger } = require('../middleware/auth');

router.post('/login', login);
router.post('/registro', registro);
router.get('/perfil', proteger, obtenerPerfil);

module.exports = router;
