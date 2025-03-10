import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaFileMedical, FaNotesMedical, FaUserMd } from 'react-icons/fa';
import '../styles/Dashboard.css';

function PatientDashboard() {
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Guest'}</h1>
        <p className="welcome-text">Welcome back</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">
              <FaCalendarAlt size={24} />
            </div>
            <h2 className="card-title">Upcoming Appointments</h2>
          </div>
          <div className="card-content">
            <div className="stat-number">2</div>
            <p>Scheduled appointments</p>
          </div>
          <div className="action-buttons">
            <button className="action-button secondary-button" onClick={() => navigate('/appointments')}>View All</button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">
              <FaFileMedical size={24} />
            </div>
            <h2 className="card-title">Medical Records</h2>
          </div>
          <div className="card-content">
            <div className="stat-number">5</div>
            <p>Available records</p>
          </div>
          <div className="action-buttons">
            <button className="action-button primary-button">View Records</button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">
              <FaNotesMedical size={24} />
            </div>
            <h2 className="card-title">Prescriptions</h2>
          </div>
          <div className="card-content">
            <div className="stat-number">3</div>
            <p>Active prescriptions</p>
          </div>
          <div className="action-buttons">
            <button className="action-button primary-button">View All</button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">
              <FaUserMd size={24} />
            </div>
            <h2 className="card-title">My Doctors</h2>
          </div>
          <div className="card-content">
            <div className="stat-number">2</div>
            <p>Consulting doctors</p>
          </div>
          <div className="action-buttons">
            <button className="action-button primary-button" onClick={() => navigate('/doctor/details')}>Find Doctor</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;