const express = require('express');
const router = express.Router();
const {
  reporteServiciosPorPeriodo, reportePacientesPorVeterinario,
  reporteIngresosPorCategoria, estadisticasDashboard
} = require('../controllers/reporteController');
const { proteger, autorizar } = require('../middleware/auth');

router.use(proteger);

router.get('/dashboard', estadisticasDashboard);
router.get('/servicios', autorizar('admin', 'recepcionista'), reporteServiciosPorPeriodo);
router.get('/veterinarios', autorizar('admin', 'recepcionista'), reportePacientesPorVeterinario);
router.get('/ingresos-categoria', autorizar('admin', 'recepcionista'), reporteIngresosPorCategoria);

module.exports = router;
