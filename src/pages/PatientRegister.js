import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaIdCard, FaLock, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { patientAuth } from '../services/api';
import '../styles/PatientRegister.css';

function PatientRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    aadhaar: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Format Aadhaar number with spaces
  const formatAadhaar = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const matches = cleaned.match(/^(\d{4})(\d{4})?(\d{4})?$/);
    if (matches) {
      let formatted = matches[1];
      if (matches[2]) formatted += ' ' + matches[2];
      if (matches[3]) formatted += ' ' + matches[3];
      return formatted;
    }
    return cleaned;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'aadhaar') {
      const cleaned = value.replace(/\D/g, '');
      const formatted = formatAadhaar(cleaned);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanedAadhaar = formData.aadhaar.replace(/\s/g, '');
    
    if (cleanedAadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await patientAuth.register({
        name: formData.name,
        aadhaar: cleanedAadhaar,
        password: formData.password
      });
      navigate('/patient/login');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Patient Registration</h2>
          <p>Welcome to Digital Health Innovation</p>
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

          <div className="form-group">
            <div className="input-group">
              <FaIdCard className="input-icon" />
              <input
                type="text"
                name="aadhaar"
                placeholder="Aadhaar Number"
                value={formData.aadhaar}
                onChange={handleInputChange}
                maxLength={14}
                required
              />
            </div>
            <small className="input-hint">Enter 12-digit Aadhaar number</small>
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="toggle-form">
            <p>
              Already have an account?
              <button
                type="button"
                className="toggle-btn"
                onClick={() => navigate('/patient/login')}
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

export default PatientRegister; 