import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { FaUserMd, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { getCurrentUser } from '../services/api';
import 'react-calendar/dist/Calendar.css';
import '../styles/AppointmentPage.css';

function AppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor } = location.state || {};
  const currentUser = getCurrentUser();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  // Available time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  if (!doctor || !currentUser) {
    return (
      <div className="error-container">
        <div className="error-message">
          Invalid access. Please select a doctor first.
        </div>
        <button onClick={() => navigate('/doctor/details')} className="back-btn">
          Back to Doctors
        </button>
      </div>
    );
  }

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    const isPM = selectedTime.includes('PM');
    appointmentDateTime.setHours(
      isPM ? parseInt(hours) + 12 : parseInt(hours),
      parseInt(minutes),
      0
    );

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          doctorId: doctor._id,
          doctorName: doctor.name,
          appointmentDate: appointmentDateTime,
          patientName: currentUser.name,
          patientAadhaar: currentUser.aadhaar
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsBooked(true);
        setTimeout(() => {
          navigate('/patient/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-container">
      <div className="appointment-card">
        <div className="doctor-info-section">
          <div className="doctor-avatar">
            <FaUserMd size={40} />
          </div>
          <div className="doctor-details">
            <h2>{doctor.name}</h2>
            <p className="specialization">{doctor.specialization}</p>
            <p className="qualification">{doctor.qualification}</p>
          </div>
        </div>

        <div className="appointment-form">
          <h3>Book Appointment</h3>
          
          {error && <div className="error-message">{error}</div>}
          {isBooked && (
            <div className="success-message">
              Appointment booked successfully! Redirecting...
            </div>
          )}

          <div className="calendar-section">
            <div className="section-header">
              <FaCalendarAlt />
              <h4>Select Date</h4>
            </div>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()}
              className="calendar"
              disabled={isBooked}
            />
          </div>

          {selectedDate && (
            <div className="time-slots-section">
              <div className="section-header">
                <FaClock />
                <h4>Select Time</h4>
              </div>
              <div className="time-slots">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => handleTimeSelect(time)}
                    disabled={isBooked}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="patient-info">
            <h4>Patient Information</h4>
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Aadhaar:</strong> {currentUser.aadhaar}</p>
          </div>

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading || !selectedDate || !selectedTime || isBooked}
          >
            {loading ? 'Booking...' : isBooked ? 'Appointment Booked' : 'Confirm Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppointmentPage;