const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

// Doctor Registration
exports.register = async (req, res) => {
  try {
    const { name, registrationNumber, password, specialization, qualification, experience, mobileNumber, city, medicalCouncil } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ registrationNumber });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    const doctor = new Doctor({
      name,
      registrationNumber,
      password: hashedPassword,
      specialization,
      qualification,
      experience,
      mobileNumber,
      city,
      medicalCouncil
    });

    await doctor.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: doctor._id, role: 'doctor' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in HTTP-only cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      user: {
        id: doctor._id,
        name: doctor.name,
        registrationNumber: doctor.registrationNumber,
        specialization: doctor.specialization,
        role: 'doctor'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Doctor Login
exports.login = async (req, res) => {
  try {
    const { registrationNumber, password } = req.body;

    // Find doctor
    const doctor = await Doctor.findOne({ registrationNumber });
    if (!doctor) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: doctor._id, role: 'doctor' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in HTTP-only cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      user: {
        id: doctor._id,
        name: doctor.name,
        registrationNumber: doctor.registrationNumber,
        specialization: doctor.specialization,
        role: 'doctor'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 