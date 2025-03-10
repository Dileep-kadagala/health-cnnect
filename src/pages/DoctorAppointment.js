import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaUser, FaIdCard, FaClock, FaCheckCircle, FaTimesCircle, FaSearch } from 'react-icons/fa';
import { appointmentService } from '../services/api';
import '../styles/DoctorAppointment.css';

function DoctorAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentService.getDoctorAppointments();
      
      if (response.data.success) {
        const sortedAppointments = response.data.data.sort((a, b) => 
          new Date(b.appointmentDate) - new Date(a.appointmentDate)
        );
        setAppointments(sortedAppointments);
        filterAppointments(sortedAppointments, statusFilter, searchTerm);
      } else {
        setError('Failed to fetch appointments');
        setAppointments([]);
        setFilteredAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again later.');
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  const filterAppointments = (appointments, status, search) => {
    let filtered = [...appointments];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply search filter
    if (search) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
        apt.patientAadhaar.includes(search)
      );
    }

    // Apply status filter
    switch(status) {
      case 'scheduled':
        // Show only today's scheduled appointments
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime() && apt.status === 'scheduled';
        });
        break;
      case 'completed':
        // Show all completed appointments regardless of date
        filtered = filtered.filter(apt => apt.status === 'completed');
        break;
      case 'cancelled':
        // Show all cancelled appointments regardless of date
        filtered = filtered.filter(apt => apt.status === 'cancelled');
        break;
      case 'all':
      default:
        // Show all upcoming scheduled appointments
        filtered = filtered.filter(apt => {
          if (apt.status === 'completed' || apt.status === 'cancelled') {
            return false;
          }
          const aptDate = new Date(apt.appointmentDate);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate >= today;
        });
        break;
    }

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (appointments.length > 0) {
      filterAppointments(appointments, statusFilter, searchTerm);
    }
  }, [searchTerm, statusFilter, appointments]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setError('');
      
      // Validate inputs
      if (!appointmentId || !newStatus) {
        const errorMsg = 'Invalid appointment or status';
        console.error(errorMsg, { appointmentId, newStatus });
        setError(errorMsg);
        return;
      }

      console.log('Starting status update:', { appointmentId, newStatus });
      
      // First update locally to show immediate feedback
      setAppointments(prevAppointments => {
        const updatedAppointments = prevAppointments.map(apt => 
          apt._id === appointmentId 
            ? {...apt, status: newStatus}
            : apt
        );
        console.log('Updated appointments locally:', updatedAppointments);
        return updatedAppointments;
      });

      // Then make API call
      console.log('Making API call to update status');
      const response = await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      console.log('API response:', response);
      
      if (response.data.success) {
        const message = newStatus === 'completed' ? 'Appointment marked as completed' : 'Appointment cancelled';
        console.log('Status update successful:', message);
        alert(message);
        // Refresh appointments to ensure sync with server
        await fetchAppointments();
      } else {
        // Revert local change if API call failed
        const errorMsg = response.data.message || 'Failed to update appointment status';
        console.error('API call failed:', errorMsg);
        setError(errorMsg);
        setAppointments(prevAppointments => 
          prevAppointments.map(apt => 
            apt._id === appointmentId 
              ? {...apt, status: apt.status}
              : apt
          )
        );
      }
    } catch (error) {
      console.error('Error updating appointment status:', {
        error,
        response: error.response,
        message: error.message,
        appointmentId,
        newStatus
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update appointment status';
      setError(errorMessage);
      
      // Revert local change on error
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt._id === appointmentId 
            ? {...apt, status: apt.status}
            : apt
        )
      );
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
        return '#1976d2'; // Blue
      case 'completed':
        return '#4caf50'; // Green
      case 'cancelled':
        return '#f44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  if (loading) {
    return (
      <div className="doctor-appointments-loading">
        <div className="loading-spinner">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="doctor-appointments-container">
      <div className="doctor-appointments-header">
        <h1>My Patient Appointments</h1>
        <p className="filter-description">
          {statusFilter === 'all' && "Upcoming Appointments"}
          {statusFilter === 'scheduled' && "Today's Appointments"}
          {statusFilter === 'completed' && "Completed Appointments"}
          {statusFilter === 'cancelled' && "Cancelled Appointments"}
        </p>
      </div>

      <div className="filters-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by patient name or Aadhaar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filters">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Upcoming
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('scheduled')}
          >
            Today's
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {error && (
        <div className="doctor-appointments-error">
          <div className="error-message">{error}</div>
        </div>
      )}
      
      {filteredAppointments.length === 0 ? (
        <div className="no-appointments">
          <FaCalendarAlt size={40} />
          <p>{loading ? 'Loading appointments...' : 'No appointments found'}</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <div className="patient-info">
                  <FaUser className="icon" />
                  <div>
                    <h3>{appointment.patientName}</h3>
                    <div className="patient-details">
                      <FaIdCard className="icon" />
                      <span>Aadhaar: {appointment.patientAadhaar}</span>
                    </div>
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

                <div className="appointment-actions">
                  {appointment.status === 'scheduled' && (
                    <>
                      <button 
                        className="complete-btn"
                        onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                      >
                        <FaCheckCircle /> Mark as Completed
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                      >
                        <FaTimesCircle /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointment;