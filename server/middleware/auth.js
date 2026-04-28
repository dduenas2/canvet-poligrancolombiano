const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para verificar JWT
const proteger = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ mensaje: 'No autorizado, token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'canvet_secret_key_2026');
    req.usuario = await Usuario.findById(decoded.id).select('-password');

    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    if (!req.usuario.activo) {
      return res.status(401).json({ mensaje: 'Cuenta desactivada' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

// Middleware para verificar roles
const autorizar = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: `El rol '${req.usuario.rol}' no tiene permiso para esta acción`
      });
    }
    next();
  };
};

module.exports = { proteger, autorizar };
