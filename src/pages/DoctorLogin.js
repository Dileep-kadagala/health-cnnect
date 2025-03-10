import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaIdCard, FaLock } from 'react-icons/fa';
import { doctorAuth } from '../services/api';
import '../styles/DoctorLogin.css';

function DoctorLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    registrationNumber: '',
    password: ''
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

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await doctorAuth.login(formData);
      navigate('/doctor/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Doctor Login</h2>
          <p>Healthcare Professional Portal</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
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

          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="toggle-form">
            <p>
              Don't have an account?
              <button
                type="button"
                className="toggle-btn"
                onClick={() => navigate('/doctor/register')}
              >
                Register
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorLogin;

