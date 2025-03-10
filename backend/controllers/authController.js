const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Doctor Registration
exports.registerDoctor = async (req, res) => {
  try {
    const {
      name,
      registrationNumber,
      password,
      specialization,
      qualification,
      experience,
      mobileNumber,
      city,
      medicalCouncil
    } = req.body;

    // Check if doctor already exists
    const doctorExists = await Doctor.findOne({ registrationNumber });
    if (doctorExists) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this registration number already exists'
      });
    }

    // Create doctor
    const doctor = await Doctor.create({
      name,
      registrationNumber,
      password,
      specialization,
      qualification,
      experience,
      mobileNumber,
      city,
      medicalCouncil
    });

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        registrationNumber: doctor.registrationNumber,
        specialization: doctor.specialization,
        role: 'doctor'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Doctor Login
exports.loginDoctor = async (req, res) => {
  try {
    const { registrationNumber, password } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findOne({ registrationNumber }).select('+password');
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid registration number or password'
      });
    }

    // Check password
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid registration number or password'
      });
    }

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    res.json({
      success: true,
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        registrationNumber: doctor.registrationNumber,
        specialization: doctor.specialization,
        role: 'doctor'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Patient Registration
exports.registerPatient = async (req, res) => {
  try {
    const { name, aadhaar, password } = req.body;

    // Check if patient already exists
    const patientExists = await Patient.findOne({ aadhaar });
    if (patientExists) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this Aadhaar number already exists'
      });
    }

    // Create patient
    const patient = await Patient.create({
      name,
      aadhaar,
      password
    });

    // Generate token
    const token = generateToken(patient._id, 'patient');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: patient._id,
        name: patient.name,
        aadhaar: patient.aadhaar,
        role: 'patient'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Patient Login
exports.loginPatient = async (req, res) => {
  try {
    const { aadhaar, password } = req.body;

    // Check if patient exists
    const patient = await Patient.findOne({ aadhaar }).select('+password');
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Aadhaar number or password'
      });
    }

    // Check password
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Aadhaar number or password'
      });
    }

    // Generate token
    const token = generateToken(patient._id, 'patient');

    res.json({
      success: true,
      token,
      user: {
        id: patient._id,
        name: patient.name,
        aadhaar: patient.aadhaar,
        role: 'patient'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 