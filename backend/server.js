const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Load env
dotenv.config();

// Initialize app & server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Security Middleware
// Set security headers (CSP disabled to allow React frontend to load assets easily)
app.use(helmet({ contentSecurityPolicy: false })); 

// Prevent NoSQL injection
app.use(mongoSanitize()); 

// Rate limiting (100 requests per 10 minutes)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100 
});
app.use('/api', limiter);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/buses', require('./routes/busRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analytics'));

// Temporary endpoint to seed database
app.get('/api/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const Bus = require('./models/Bus');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany([
        { name: 'Admin User', email: 'admin@gocampus.com', password, role: 'admin' },
        { name: 'Driver User', email: 'driver@gocampus.com', password, role: 'driver' },
        { name: 'Student User', email: 'student@gocampus.com', password, role: 'student' }
      ]);
    }
    res.send('<h1>Database Seeding Completed!</h1><p>You can now go back to the login page and log in as admin@gocampus.com with password 123456.</p>');
  } catch (err) {
    res.status(500).send('Error seeding database: ' + err.message);
  }
});

// Serve Frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  // Simple root route
  app.get('/', (req, res) => {
    res.send('GoCampus API is running automatically...');
  });
}

// Socket logic mapping
require('./sockets/socketHandler')(io);

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  // Log successful server initialization
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
