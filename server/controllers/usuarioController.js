const Usuario = require('../models/Usuario');

// @desc    Obtener todos los usuarios (solo admin)
// @route   GET /api/usuarios
// @access  Admin
const obtenerUsuarios = async (req, res) => {
  try {
    const { rol, pagina = 1, limite = 10 } = req.query;
    const filtro = {};
    if (rol) filtro.rol = rol;

    const total = await Usuario.countDocuments(filtro);
    const usuarios = await Usuario.find(filtro)
      .sort({ fechaCreacion: -1 })
      .skip((pagina - 1) * limite)
      .limit(parseInt(limite));

    res.json({ usuarios, total, paginas: Math.ceil(total / limite) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/usuarios/:id
// @access  Admin
const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario', error: error.message });
  }
};

// @desc    Crear usuario (solo admin puede crear veterinarios y recepcionistas)
// @route   POST /api/usuarios
// @access  Admin
const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya existe una cuenta con ese email' });
    }

    const usuario = await Usuario.create({ nombre, email, password, rol });
    res.status(201).json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/usuarios/:id
// @access  Admin
const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, email, rol, activo } = req.body;
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (rol) usuario.rol = rol;
    if (typeof activo === 'boolean') usuario.activo = activo;

    // Si se envía nueva contraseña
    if (req.body.password) {
      usuario.password = req.body.password;
    }

    await usuario.save();
    res.json({ _id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, activo: usuario.activo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

// @desc    Desactivar usuario (no eliminar)
// @route   DELETE /api/usuarios/:id
// @access  Admin
const desactivarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.activo = false;
    await usuario.save();
    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al desactivar usuario', error: error.message });
  }
};

// @desc    Obtener veterinarios activos
// @route   GET /api/usuarios/veterinarios
// @access  Privado
const obtenerVeterinarios = async (req, res) => {
  try {
    const veterinarios = await Usuario.find({ rol: 'veterinario', activo: true }).select('nombre email');
    res.json(veterinarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener veterinarios', error: error.message });
  }
};

module.exports = { obtenerUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, desactivarUsuario, obtenerVeterinarios };
