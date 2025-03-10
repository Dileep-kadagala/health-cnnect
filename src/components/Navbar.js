import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUserMd, FaUser, FaSignOutAlt, FaCaretDown } from 'react-icons/fa';
import { userService, logout } from '../services/api';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await userService.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <FaHome className="brand-icon" />
          <span>Digital Health</span>
        </Link>
      </div>

      <div className="navbar-links">
        {user ? (
          <div className="profile-section">
            <div 
              className="profile-trigger"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="profile-avatar">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name || 'User'} />
                ) : (
                  <span>{user.name ? getInitials(user.name) : 'U'}</span>
                )}
              </div>
              <span className="username">{user.name || 'User'}</span>
              <FaCaretDown className="dropdown-icon" />
            </div>
            
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <Link to={getDashboardLink()} className="dropdown-item">
                  Dashboard
                </Link>
                <Link to="/profile" className="dropdown-item">
                  Profile Settings
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/doctor/login" className="nav-link">
              <FaUserMd />
              <span>Doctor Login</span>
            </Link>
            <Link to="/patient/login" className="nav-link">
              <FaUser />
              <span>Patient Login</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 