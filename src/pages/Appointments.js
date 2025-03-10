import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUserMd, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getCurrentUser } from '../services/api';
import '../styles/Appointments.css';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAadhaar, setUserAadhaar] = useState('');

  useEffect(() => {
    fetchUserDetails();
    fetchAppointments();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUserAadhaar(data.user.aadhaar);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/appointments/my-appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch appointments');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again later.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/cancel/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Fetch updated appointments list after cancellation
        fetchAppointments();
      } else {
        setError(data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError('Failed to cancel appointment. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return '#1976d2';
      case 'completed':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <div className="appointments-loading">
        <div className="loading-spinner">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <h1>My Appointments</h1>
      <div className="user-details">
        <p>Aadhaar Number: {userAadhaar}</p>
      </div>
      
      {appointments.length === 0 ? (
        <div className="no-appointments">
          <FaCalendarAlt size={40} />
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <div className="doctor-info">
                  <FaUserMd className="icon" />
                  <div>
                    <h3>{appointment.doctorName}</h3>
                  </div>
                </div>
                <div 
                  className="appointment-status"
                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                >
                  {appointment.status}
                </div>
              </div>

              <div className="appointment-details">
                <div className="detail-item">
                  <FaCalendarAlt className="icon" />
                  <span>{formatDate(appointment.appointmentDate)}</span>
                </div>
              </div>

              {appointment.status === 'scheduled' && (
                <button 
                  className="cancel-btn"
                  onClick={() => handleCancelAppointment(appointment._id)}
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Appointments;