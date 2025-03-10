import React, { useEffect, useState, useCallback } from 'react';
import { FaUserInjured, FaCalendarCheck, FaClock, FaChartLine } from 'react-icons/fa';
import { appointmentService } from '../services/api';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

function DoctorDashboard() {
  const doctor = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [doctorName, setDoctorName] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingReviews: 0,
    satisfaction: 85
  });

  const fetchAppointments = useCallback(async (doctorName) => {
    try {
      const response = await appointmentService.getDoctorAppointments();
      if (response.data.success) {
        const allAppointments = response.data.data.filter(apt => apt.doctorName === doctorName);
        setAppointments(allAppointments);

        // Calculate today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAppointments = allAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime() && apt.status === 'scheduled';
        });

        // Calculate unique patients
        const uniquePatients = new Set(allAppointments.map(apt => apt.patientId)).size;

        // Calculate pending reviews
        const pendingReviews = allAppointments.filter(apt => 
          apt.status === 'completed' && !apt.reviewed
        ).length;

        setStats(prevStats => ({
          ...prevStats,
          todayAppointments: todayAppointments.length,
          totalPatients: uniquePatients,
          pendingReviews: pendingReviews
        }));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      setDoctorName(user.name);
      fetchAppointments(user.name);
    }
  }, [fetchAppointments, refreshKey]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Doctor Dashboard</h1>
        <p className="welcome-text">Welcome back, Dr. {doctor?.name}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">
              <FaCalendarCheck size={24} />
            </div>
            <h2 className="card-title">Today's Appointments</h2>
          </div>
          <div className="card-content">
            <div className="stat-number">{stats.todayAppointments}</div>
            <p>Scheduled for today</p>
          </div>
          <div className="action-buttons">
            <button 
              className="action-button primary-button" 
              onClick={() => navigate('/doctor/appointments')}
            >
              View Schedule
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">
              <FaUserInjured size={24} />
            </div>
            <h2 className="card-title">Total Patients</h2>
          </div>
          <div className="card-content">
            <div className="stat-number">{stats.totalPatients}</div>
            <p>Registered patients</p>
          </div>
          <div className="action-buttons">
            <button 
              className="action-button primary-button"
              onClick={() => navigate('/doctor/patients')}
            >
              Patient List
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">
              <FaClock size={24} />
            </div>
            <h2 className="card-title">Pending Reviews</h2>
          </div>
          <div className="card-content">
            <div className="stat-number">{stats.pendingReviews}</div>
            <p>Awaiting review</p>
          </div>
          <div className="action-buttons">
            <button 
              className="action-button primary-button"
              onClick={() => navigate('/doctor/reviews')}
            >
              Review Now
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">
              <FaChartLine size={24} />
            </div>
            <h2 className="card-title">Analytics</h2>
          </div>
          <div className="card-content">
            <div className="stat-number">{stats.satisfaction}%</div>
            <p>Patient satisfaction</p>
          </div>
          <div className="action-buttons">
            <button 
              className="action-button primary-button"
              onClick={() => navigate('/doctor/analytics')}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;