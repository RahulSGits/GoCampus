const express = require('express');
const Route = require('../models/Route');

const router = express.Router();

// @route   GET /api/routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find({});
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/routes
router.post('/', async (req, res) => {
  try {
    const newRoute = await Route.create(req.body);
    res.status(201).json(newRoute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
