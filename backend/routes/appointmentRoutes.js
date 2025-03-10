const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

// Book a new appointment
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, doctorName, appointmentDate } = req.body;
    
    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      status: 'scheduled'
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      patientName: req.user.name,
      doctorName,
      patientAadhaar: req.user.aadhaar,
      appointmentDate: new Date(appointmentDate)
    });

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all appointments (admin only)
router.get('/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view all appointments'
      });
    }

    const appointments = await Appointment.find()
      .sort({ appointmentDate: -1 });
    
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get patient's appointments by Aadhaar
router.get('/my-appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      patientAadhaar: req.user.aadhaar 
    }).sort({ appointmentDate: -1 });
    
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get doctor's appointments
router.get('/doctor-appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      doctorId: req.user._id,
    }).sort({ appointmentDate: -1 });
    
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get appointment by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized to view this appointment
    if (appointment.doctorId.toString() !== req.user._id.toString() &&
        appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update appointment status (complete/cancel)
router.put('/status/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Status update request:', { id: req.params.id, status, body: req.body });
    
    const appointment = await Appointment.findById(req.params.id);
    console.log('Found appointment:', appointment);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if the user is the doctor for this appointment
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Validate status
    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either completed or cancelled'
      });
    }

    // Only allow status update for scheduled appointments
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled appointments can be updated'
      });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel appointment
router.put('/cancel/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if the user is authorized to cancel this appointment
    if (appointment.doctorId.toString() !== req.user._id.toString() &&
        appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled appointments can be cancelled'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete appointment (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete appointments'
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await appointment.remove();

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get available time slots for a doctor on a specific date
router.get('/available-slots/:doctorId/:date', protect, async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const selectedDate = new Date(date);
    
    // Get all scheduled appointments for the doctor on the selected date
    const bookedAppointments = await Appointment.find({
      doctorId,
      status: 'scheduled',
      appointmentDate: {
        $gte: new Date(selectedDate.setHours(0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59))
      }
    });

    // Define available time slots (9 AM to 5 PM, 30-minute intervals)
    const allTimeSlots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const timeSlot = new Date(selectedDate);
        timeSlot.setHours(hour, minute, 0);
        allTimeSlots.push(timeSlot);
      }
    }

    // Filter out booked slots
    const availableSlots = allTimeSlots.filter(slot => {
      return !bookedAppointments.some(appointment => 
        appointment.appointmentDate.getTime() === slot.getTime()
      );
    });

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Export the router
module.exports = router; 