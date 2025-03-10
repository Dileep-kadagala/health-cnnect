import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaLock, FaIdCard, FaUser, FaPhone, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';
import { doctorAuth } from '../services/api';
import '../styles/DoctorLogin.css';

function DoctorRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    qualification: '',
    experience: '',
    mobileNumber: '',
    city: '',
    medicalCouncil: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'registrationNumber') {
      const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
      return;
    }

    if (name === 'mobileNumber') {
      const formatted = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Validate mobile number
    if (formData.mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate registration number
    if (!formData.registrationNumber) {
      setError('Medical registration number is required');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      
      // Add experience if not provided
      if (!registrationData.experience) {
        registrationData.experience = '0 years';
      }

      // Add medical council if not provided
      if (!registrationData.medicalCouncil) {
        registrationData.medicalCouncil = 'State Medical Council';
      }

      await doctorAuth.register(registrationData);
      navigate('/doctor/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError('Please check all required fields and try again');
      } else {
        setError('An error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Doctor Registration</h2>
          <p>Healthcare Professional Portal</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="input-group">
                <FaGraduationCap className="input-icon" />
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Qualification</option>
                  <option value="MBBS">MBBS</option>
                  <option value="MD">MD</option>
                  <option value="MS">MS</option>
                  <option value="DNB">DNB</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <FaUserMd className="input-icon" />
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="input-group">
                <FaPhone className="input-icon" />
                <input
                  type="text"
                  name="mobileNumber"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <small className="input-hint">Enter 10-digit mobile number</small>
            </div>

            <div className="form-group">
              <div className="input-group">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="input-group">
              <FaIdCard className="input-icon" />
              <input
                type="text"
                name="registrationNumber"
                placeholder="Medical Registration Number"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <small className="input-hint">Enter your medical council registration number</small>
          </div>

          <div className="form-group">
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="8"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength="8"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="toggle-form">
            <p>
              Already have an account?
              <button
                type="button"
                className="toggle-btn"
                onClick={() => navigate('/doctor/login')}
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorRegister;