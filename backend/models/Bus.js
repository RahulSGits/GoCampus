const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Idle', 'On Route', 'Maintenance'],
    default: 'Idle',
  },
  currentLocation: {
    lat: Number,
    lng: Number,
  },
  route: {
    type: String, // String representation for simplicity initially
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
