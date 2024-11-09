// routes/appointmentRoutes.js
const express = require('express');
const { createAppointment, getCounselorAppointments, getClientAppointments } = require('../controllers/appointmentController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Create an appointment (Client route)
router.post('/create', auth, createAppointment);

// Get appointments for the logged-in counselor
router.get('/counselor', auth, getCounselorAppointments);

// Get appointments for the logged-in client
router.get('/client', auth, getClientAppointments);

module.exports = router;
