const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Generar JWT con expiración de 30 minutos de inactividad (usamos 8h para practicidad)
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'canvet_secret_key_2026', {
    expiresIn: '8h'
  });
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Público
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario incluyendo password
    const usuario = await Usuario.findOne({ email }).select('+password');

    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ mensaje: 'Cuenta desactivada, contacte al administrador' });
    }

    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token: generarToken(usuario._id)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// @desc    Registro de cliente (auto-registro)
// @route   POST /api/auth/registro
// @access  Público
const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y contraseña son requeridos' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya existe una cuenta con ese email' });
    }

    // Solo se pueden registrar como clientes
    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol: 'cliente'
    });

    res.status(201).json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token: generarToken(usuario._id)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// @desc    Obtener perfil del usuario logueado
// @route   GET /api/auth/perfil
// @access  Privado
const obtenerPerfil = async (req, res) => {
  res.json(req.usuario);
};

module.exports = { login, registro, obtenerPerfil };
