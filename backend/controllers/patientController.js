const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

// Patient Registration
exports.register = async (req, res) => {
  try {
    const { name, aadhaarNumber, password } = req.body;
    
    // Check if patient already exists
    const existingPatient = await Patient.findOne({ aadhaarNumber });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient
    const patient = new Patient({
      name,
      aadhaarNumber,
      password: hashedPassword
    });

    await patient.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: patient._id, role: 'patient' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in HTTP-only cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      user: {
        id: patient._id,
        name: patient.name,
        aadhaarNumber: patient.aadhaarNumber,
        role: 'patient'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Patient Login
exports.login = async (req, res) => {
  try {
    const { aadhaarNumber, password } = req.body;

    // Find patient
    const patient = await Patient.findOne({ aadhaarNumber });
    if (!patient) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: patient._id, role: 'patient' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in HTTP-only cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      user: {
        id: patient._id,
        name: patient.name,
        aadhaarNumber: patient.aadhaarNumber,
        role: 'patient'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 