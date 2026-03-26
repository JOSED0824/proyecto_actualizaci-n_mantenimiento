const express = require('express');
const router  = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { isAuthenticated, isVeterinario } = require('../middleware/authMiddleware');

// Cualquier usuario autenticado puede ver y crear citas
router.get('/',        isAuthenticated, appointmentController.getAllAppointments);
router.get('/create',  isAuthenticated, appointmentController.getCreateForm);
router.post('/create', isAuthenticated, appointmentController.createAppointment);

// Solo veterinarios pueden eliminar registros (Criterio 2)
router.post('/delete/:id', isAuthenticated, isVeterinario, appointmentController.deleteAppointment);

module.exports = router;