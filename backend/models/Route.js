const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  stops: [{
    name: String,
    lat: Number,
    lng: Number,
  }],
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
