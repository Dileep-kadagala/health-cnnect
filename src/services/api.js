import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Doctor Authentication
export const doctorAuth = {
  register: async (data) => {
    const response = await api.post('/auth/doctor/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  login: async (data) => {
    const response = await api.post('/auth/doctor/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }
};

// Patient Authentication
export const patientAuth = {
  register: async (data) => {
    const response = await api.post('/auth/patient/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  login: async (data) => {
    const response = await api.post('/auth/patient/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }
};

// Doctor Details
export const doctorService = {
  getAllDoctors: () => api.get('/doctors'),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`)
};

// User Management
export const userService = {
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Auth service
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Patient service
export const patientService = {
  getPatientDetails: () => api.get('/patient/details'),
  updatePatient: (data) => api.put('/patient/update', data)
};

// Appointment service
export const appointmentService = {
  getDoctorAppointments: () => {
    console.log('Fetching doctor appointments');
    return api.get('/appointments/doctor-appointments');
  },
  getAppointmentById: (id) => {
    console.log('Fetching appointment:', id);
    return api.get(`/appointments/${id}`);
  },
  updateAppointmentStatus: (appointmentId, status) => {
    if (!appointmentId) {
      console.error('No appointmentId provided');
      return Promise.reject(new Error('No appointmentId provided'));
    }
    if (!status || !['completed', 'cancelled'].includes(status)) {
      console.error('Invalid status provided:', status);
      return Promise.reject(new Error('Invalid status provided'));
    }
    const url = `/appointments/status/${appointmentId}`;
    const data = { status };
    console.log('Making status update request:', { url, data });
    return api.put(url, data);
  },
  getAvailableSlots: (doctorId, date) => {
    console.log('Fetching available slots:', { doctorId, date });
    return api.get(`/appointments/available-slots/${doctorId}/${date}`);
  }
};

export default api; 