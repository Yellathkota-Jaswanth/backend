// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  sessionType: {
    type: String,
    enum: ['mental_health', 'relationship', 'career'],
    required: true
  },
  link:{
    type:String,
    required:false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
