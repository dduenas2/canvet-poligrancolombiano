const express = require('express');
const router = express.Router();
const {
  obtenerCitas, crearCita, actualizarCita, cancelarCita, citasHoy, verificarDisponibilidad, horasOcupadas
} = require('../controllers/citaController');
const { proteger, autorizar } = require('../middleware/auth');

router.use(proteger);

router.get('/hoy', citasHoy);
router.get('/disponibilidad', verificarDisponibilidad);
router.get('/horas-ocupadas', horasOcupadas);
router.get('/', obtenerCitas);
router.post('/', crearCita);
router.put('/:id', autorizar('admin', 'recepcionista', 'veterinario'), actualizarCita);
router.delete('/:id', cancelarCita);

module.exports = router;
