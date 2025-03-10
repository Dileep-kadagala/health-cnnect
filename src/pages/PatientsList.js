import React, { useState, useEffect } from 'react';
import { FaUser, FaIdCard, FaCalendarAlt, FaSearch, FaUserMd } from 'react-icons/fa';
import { appointmentService } from '../services/api';
import '../styles/PatientsList.css';

function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getDoctorAppointments();
      
      if (response.data.success) {
        // Get unique patients from appointments
        const uniquePatients = Array.from(new Set(
          response.data.data.map(apt => apt.patientAadhaar)
        )).map(aadhaar => {
          const patientAppts = response.data.data.filter(apt => apt.patientAadhaar === aadhaar);
          return {
            aadhaar,
            name: patientAppts[0].patientName,
            totalAppointments: patientAppts.length,
            lastVisit: new Date(Math.max(...patientAppts.map(apt => new Date(apt.appointmentDate)))),
            appointments: patientAppts
          };
        });

        setPatients(uniquePatients);
      } else {
        setError('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.aadhaar.includes(searchTerm)
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="patients-list-loading">
        <div className="loading-spinner">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="patients-list-container">
      <div className="patients-list-header">
        <h1>
          <FaUserMd className="header-icon" />
          My Patients History
        </h1>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by patient name or Aadhaar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div className="patients-list-error">
          <div className="error-message">{error}</div>
        </div>
      )}

      <div className="patients-grid">
        {filteredPatients.map((patient) => (
          <div key={patient.aadhaar} className="patient-card">
            <div className="patient-header">
              <FaUser className="patient-icon" />
              <div className="patient-info">
                <h3>{patient.name}</h3>
                <div className="patient-aadhaar">
                  <FaIdCard className="icon" />
                  <span>{patient.aadhaar}</span>
                </div>
              </div>
            </div>
            
            <div className="patient-stats">
              <div className="stat-item">
                <span className="stat-label">Total Visits</span>
                <span className="stat-value">{patient.totalAppointments}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Visit</span>
                <span className="stat-value">{formatDate(patient.lastVisit)}</span>
              </div>
            </div>

            <div className="appointment-history">
              <h4>Recent Appointments</h4>
              <div className="history-list">
                {patient.appointments.slice(0, 3).map((apt, index) => (
                  <div key={index} className="history-item">
                    <FaCalendarAlt className="icon" />
                    <span>{formatDate(apt.appointmentDate)}</span>
                    <span className={`status ${apt.status}`}>{apt.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="no-patients">
          <FaUser size={40} />
          <p>No patients found</p>
        </div>
      )}
    </div>
  );
}

export default PatientsList; 