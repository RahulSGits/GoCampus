const express = require('express');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const totalRoutes = await Route.countDocuments();
    const registeredDrivers = await User.countDocuments({ role: 'driver' });
    const registeredStudents = await User.countDocuments({ role: 'student' });

    res.json({
      totalBuses,
      totalRoutes,
      registeredDrivers,
      registeredStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
