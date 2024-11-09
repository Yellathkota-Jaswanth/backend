// controllers/appointmentController.js
const Appointment = require('../models/Appointment');

// Create a new appointment (for clients)
exports.createAppointment = async (req, res) => {
  const { counselorId, date, sessionType } = req.body;

  try {
    const appointment = new Appointment({
      client: req.user,
      counselor: counselorId,
      date:new Date(date),
      sessionType,
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get appointments for the logged-in counselor
exports.getCounselorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ counselor: req.user }).populate('client', 'name email');
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get appointments for the logged-in client
exports.getClientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ client: req.user }).populate('counselor', 'name email');
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
