const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true,
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  departureTimes: [{
    type: String, // HH:MM
  }],
  daysActive: [{
    type: String, // e.g., 'Monday'
  }],
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
