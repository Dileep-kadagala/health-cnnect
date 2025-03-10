import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientLogin from './pages/PatientLogin';
import PatientRegister from './pages/PatientRegister';
import PatientDashboard from './pages/PatientDashboard';
import Appointment from './pages/AppointmentPage';
import Appointments from './pages/Appointments';
import DoctorsDetails from './pages/DoctorsDetails';
import DoctorAppointment from './pages/DoctorAppointment'; 
import Home from './pages/Home';
import Navbar from './components/Navbar';
import PatientsList from './pages/PatientsList';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book-appointment" element={<Appointment />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/doctor/details" element={<DoctorsDetails />} />
            <Route path="/doctor/register" element={<DoctorRegister />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/patient/register" element={<PatientRegister />} />
            <Route path="/doctor/appointments" element={<DoctorAppointment />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/doctor/patients" element={<PatientsList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 