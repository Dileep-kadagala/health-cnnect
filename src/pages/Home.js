import React from 'react';
import '../styles/HomePage.css';
import { FaUserMd, FaUser, FaLock, FaCalendarCheck, FaClipboardList, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <FaShieldAlt className="hero-icon" />
          <h1>Digital Health Innovation</h1>
          <p className="hero-subtitle">A Secure Platform for Patient-Centric Care</p>
        </div>
      </header>

      <section className="features-section">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">Comprehensive healthcare management solutions</p>
        <div className="features-grid">
          <div className="feature-card">
            <FaClipboardList className="feature-icon" />
            <h3>Digital Records</h3>
            <p>Secure access to your complete medical history</p>
          </div>
          <div className="feature-card">
            <FaCalendarCheck className="feature-icon" />
            <h3>Smart Scheduling</h3>
            <p>Efficient appointment management system</p>
          </div>
          <div className="feature-card">
            <FaLock className="feature-icon" />
            <h3>Data Security</h3>
            <p>Advanced encryption for your medical data</p>
          </div>
        </div>
      </section>

      <section className="user-types">
        <div className="user-card">
          <FaUser className="card-icon" />
          <h3>For Patients</h3>
          <ul>
            <li><FaClipboardList /> Access medical records</li>
            <li><FaCalendarCheck /> Schedule appointments</li>
            <li><FaLock /> Secure messaging</li>
          </ul>
          <Link to="/patient/login" className="login-btn">
            Patient Login
          </Link>
        </div>

        <div className="user-card">
          <FaUserMd className="card-icon" />
          <h3>For Healthcare Providers</h3>
          <ul>
            <li><FaClipboardList /> Manage patient records</li>
            <li><FaCalendarCheck /> View appointments</li>
            <li><FaLock /> Update medical history</li>
          </ul>
          <Link to="/doctor/login" className="login-btn">
            Provider Login
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home; 