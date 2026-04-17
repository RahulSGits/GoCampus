const express = require('express');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications sorted by latest
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/notifications
// @desc    Create a new notification
router.post('/', async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
