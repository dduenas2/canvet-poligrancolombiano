const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const conectarDB = require('./config/db');
const Usuario = require('./models/Usuario');
const ejecutarSeed = require('./seeds/seed');

// Conectar base de datos y, si está vacía, sembrar datos de ejemplo
(async () => {
  await conectarDB();
  try {
    const total = await Usuario.countDocuments();
    if (total === 0) {
      console.log('🌱 Base de datos vacía: ejecutando seed inicial...');
      await ejecutarSeed();
    }
  } catch (e) {
    console.error('Error verificando/sembrando BD:', e.message);
  }
})();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/propietarios', require('./routes/propietarioRoutes'));
app.use('/api/caninos', require('./routes/caninoRoutes'));
app.use('/api/categorias', require('./routes/categoriaRoutes'));
app.use('/api/servicios', require('./routes/servicioRoutes'));
app.use('/api/historial', require('./routes/historialRoutes'));
app.use('/api/citas', require('./routes/citaRoutes'));
app.use('/api/facturas', require('./routes/facturaRoutes'));
app.use('/api/reportes', require('./routes/reporteRoutes'));

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor CanVet corriendo en puerto ${PORT} - Modo: ${process.env.NODE_ENV || 'desarrollo'}`);
});
