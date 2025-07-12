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
const uploadToDrive = require('./routes/uploadToDrive');




const reviewSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true,
  },
  doctorRegistrationNumber: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  stars: {
    type: Number,
    required: true,
    min: 1, // Minimum rating of 1 star
    max: 5, // Maximum rating of 5 stars
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


const app = express();




// Middleware
app.use(cors({
  // origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  origin: '*',  // Allow all origins during testing
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
app.use('/api/upload', uploadToDrive);

// Add direct endpoint for files
app.get('/api/files/:aadhaarNumber', async (req, res) => {
  try {
    const { aadhaarNumber } = req.params;
    console.log('Retrieving files for Aadhaar:', aadhaarNumber);
    
    // Ensure the FileModel is available
    const FileModel = mongoose.model('File');
    
    const files = await FileModel.find({ aadhaarNumber });
    console.log('Files found:', files.length);
    
    res.status(200).json(files);
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ message: 'Error retrieving files', error: error.message });
  }
});

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
  res.status(500).json({ error: 'Something went wrong!' });
});


// POST route to create a new review
app.post('/reviews', async (req, res) => {
  try {
    console.log('Received review data:', req.body); // Debugging

    const { doctorName, doctorRegistrationNumber, patientName, comment, stars } = req.body;

    if (!doctorName || !doctorRegistrationNumber || !patientName || !comment || !stars) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Stars must be between 1 and 5.' });
    }

    const newReview = new Review({
      doctorName,
      doctorRegistrationNumber,
      patientName,
      comment,
      stars,
    });

    await newReview.save();
    res.status(201).json({ message: 'Review created successfully.', review: newReview });
  } catch (error) {
    console.error('Error creating review:', error); // Detailed error log
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});

app.get('/reviews/doctor/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    console.log("Backend doctor name: ", name);
    console.log("Database query: ", { doctorName: name }); // Log the query
    const reviews = await Review.find({ doctorName: name });

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this doctor.' });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
