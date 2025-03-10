import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaMapMarkerAlt, FaGraduationCap, FaStethoscope, FaHospital } from 'react-icons/fa';
import { doctorService } from '../services/api';
import '../styles/DoctorsDetails.css';

function DoctorsDetails() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getAllDoctors();
      console.log('API Response:', response.data);
      setDoctors(response.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again later.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor) => {
    navigate('/book-appointment', { state: { doctor } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading doctors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="doctors-details-container">
      <h1>Our Doctors</h1>
      
      <div className="doctors-grid">
        {doctors && doctors.length > 0 ? (
          doctors.map(doctor => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-header">
                <div className="doctor-avatar">
                  <FaUserMd size={30} />
                </div>
                <div className="doctor-info">
                  <h3>{doctor.name || 'Doctor Name'}</h3>
                  <p className="specialization">{doctor.specialization || 'Specialization'}</p>
                </div>
              </div>

              <div className="doctor-details">
                <p>
                  <FaGraduationCap className="icon" />
                  <span>{doctor.qualification || 'Qualification'}</span>
                </p>
                <p>
                  <FaMapMarkerAlt className="icon" />
                  <span>{doctor.city || 'Location'}</span>
                </p>
                <p>
                  <FaHospital className="icon" />
                  <span>{doctor.medicalCouncil || 'Medical Council'}</span>
                </p>
              </div>

              <button 
                className="book-appointment-btn"
                onClick={() => handleBookAppointment(doctor)}
              >
                Book Appointment
              </button>
            </div>
          ))
        ) : (
          <div className="no-results">No doctors available at the moment.</div>
        )}
      </div>
    </div>
  );
}

export default DoctorsDetails;
