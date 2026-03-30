const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Bus = require('./models/Bus');
const User = require('./models/User');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    // Only create users if not present to avoid collisions
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany([
        { name: 'Admin User', email: 'admin@gocampus.com', password, role: 'admin' },
        { name: 'Driver User', email: 'driver@gocampus.com', password, role: 'driver' },
        { name: 'Student User', email: 'student@gocampus.com', password, role: 'student' }
      ]);
      console.log('Dummy users inserted.');
    }

    await Bus.deleteMany(); // Reset buses for fresh testing

    await Bus.insertMany([
      {
        busNumber: 'UK07-1234',
        capacity: 40,
        driverName: 'Ramesh Singh',
        status: 'On Route',
        route: 'ISBT to GEU',
        currentLocation: { lat: 30.2686, lng: 78.0019 } 
      },
      {
        busNumber: 'UK07-5678',
        capacity: 35,
        driverName: 'Suresh Kumar',
        status: 'On Route',
        route: 'Clock Tower to GEU',
        currentLocation: { lat: 30.2720, lng: 77.9950 }
      },
      {
        busNumber: 'UK07-9012',
        capacity: 45,
        driverName: 'Amit Negi',
        status: 'Maintenance',
        route: 'Prem Nagar to GEU'
      }
    ]);

    console.log('Database Seeding Completed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
