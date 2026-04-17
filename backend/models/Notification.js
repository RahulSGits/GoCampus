const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning'],
    default: 'info'
  }
}, {
  timestamps: true // Automatically creates createdAt and updatedAt fields
});

module.exports = mongoose.model('Notification', notificationSchema);
