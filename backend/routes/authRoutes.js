const express = require('express');
const router = express.Router();
const {
  registerDoctor,
  loginDoctor,
  registerPatient,
  loginPatient
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Doctor routes
router.post('/doctor/register', registerDoctor);
router.post('/doctor/login', loginDoctor);

// Patient routes
router.post('/patient/register', registerPatient);
router.post('/patient/login', loginPatient);

// Protected route example
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router; 