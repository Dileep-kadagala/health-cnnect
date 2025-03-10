const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/patient', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Doctor details endpoint
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('-password');
    console.log('Fetched doctors:', doctors); // For debugging
    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching doctor details', 
      error: error.message 
    });
  }
});

// Current user endpoint
app.get('/api/me', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    // Verify token and get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find user based on decoded info
    const user = await (decoded.role === 'doctor' ? Doctor : Patient).findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Add sample doctor if none exist
app.get('/api/add-sample-doctor', async (req, res) => {
  try {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      const sampleDoctor = new Doctor({
        name: "Dr. John Doe",
        registrationNumber: "MED123456",
        password: "password123",
        specialization: "General Medicine",
        qualification: "MBBS, MD",
        experience: "10 years",
        mobileNumber: "1234567890",
        city: "New York",
        medicalCouncil: "State Medical Council"
      });
      await sampleDoctor.save();
      res.json({ message: 'Sample doctor added successfully' });
    } else {
      res.json({ message: 'Doctors already exist in database' });
    }
  } catch (error) {
    console.error('Error adding sample doctor:', error);
    res.status(500).json({ message: 'Error adding sample doctor' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
