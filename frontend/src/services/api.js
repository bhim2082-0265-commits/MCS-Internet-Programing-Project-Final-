import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getDoctors: (params) => api.get('/auth/doctors', { params }),
  getDoctorById: (id) => api.get(`/auth/doctors/${id}`),
  getDoctorSchedule: (id) => api.get(`/auth/doctors/${id}/schedule`),
  getDepartments: () => api.get('/auth/doctors/departments'),
  getHospitals: () => api.get('/auth/doctors/hospitals'),
  updateDoctor: (id, data) => api.put(`/auth/doctors/${id}`, data)
};

export const patientAPI = {
  getAll: (search) => api.get('/patients', { params: { search } }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`)
};

export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getToday: () => api.get('/appointments/today'),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`)
};

export const prescriptionAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`),
  generatePDF: (id) => api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' })
};

export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  markAsPaid: (id, data) => api.put(`/invoices/${id}/pay`, data),
  addPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),
  generatePDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  adjust: (id, data) => api.put(`/invoices/${id}/adjust`, data),
  delete: (id) => api.delete(`/invoices/${id}`)
};

export const vitalsAPI = {
  getByPatient: (patientId) => api.get(`/vitals/patient/${patientId}`),
  getById: (id) => api.get(`/vitals/${id}`),
  create: (data) => api.post('/vitals', data),
  update: (id, data) => api.put(`/vitals/${id}`, data),
  delete: (id) => api.delete(`/vitals/${id}`)
};

export const analyticsAPI = {
  getDailyRevenue: () => api.get('/analytics/daily-revenue'),
  getMonthlyRevenue: () => api.get('/analytics/monthly-revenue'),
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getDoctorPerformance: (params) => api.get('/analytics/doctor-performance', { params }),
  getDiseaseStats: () => api.get('/analytics/disease-stats')
};

export const medicineAPI = {
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  getStats: () => api.get('/medicines/stats')
};

export const paymentAPI = {
  initiateEsewa: (data) => api.post('/payments/esewa/init', data),
  verifyEsewa: (data) => api.post('/payments/esewa/verify', data),
  initiateKhalti: (data) => api.post('/payments/khalti/init', data),
  verifyKhalti: (data) => api.post('/payments/khalti/verify', data)
};

export default api;
