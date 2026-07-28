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
  delete: (id) => api.delete(`/invoices/${id}`),
  getPatientBills: (patientId) => api.get(`/invoices/patient/${patientId}`)
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

export const labTestAPI = {
  getAll: (params) => api.get('/lab-tests', { params }),
  getById: (id) => api.get(`/lab-tests/${id}`),
  create: (data) => api.post('/lab-tests', data),
  update: (id, data) => api.put(`/lab-tests/${id}`, data),
  delete: (id) => api.delete(`/lab-tests/${id}`)
};

export const labReportAPI = {
  getAll: (params) => api.get('/lab-reports', { params }),
  getById: (id) => api.get(`/lab-reports/${id}`),
  create: (data) => api.post('/lab-reports', data),
  update: (id, data) => api.put(`/lab-reports/${id}`, data),
  updateTestResult: (id, data) => api.put(`/lab-reports/${id}/test-result`, data),
  delete: (id) => api.delete(`/lab-reports/${id}`)
};

export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  updateBed: (id, data) => api.put(`/rooms/${id}/bed`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  getAvailability: () => api.get('/rooms/availability')
};

export const admissionAPI = {
  getAll: (params) => api.get('/admissions', { params }),
  getById: (id) => api.get(`/admissions/${id}`),
  create: (data) => api.post('/admissions', data),
  discharge: (id, data) => api.put(`/admissions/${id}/discharge`, data),
  delete: (id) => api.delete(`/admissions/${id}`)
};

export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats')
};

export const attendanceAPI = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getAll: (params) => api.get('/attendance', { params }),
  getDaily: (params) => api.get('/attendance/daily', { params }),
  markLeave: (data) => api.post('/attendance/leave', data)
};

export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  adjustStock: (id, data) => api.put(`/inventory/${id}/adjust-stock`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getStats: () => api.get('/inventory/stats')
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  create: (data) => api.post('/notifications', data),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export const auditLogAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
  getStats: () => api.get('/audit-logs/stats')
};

export const insuranceAPI = {
  getAll: (params) => api.get('/insurance', { params }),
  getByPatient: (patientId) => api.get(`/insurance/patient/${patientId}`),
  create: (data) => api.post('/insurance', data),
  update: (id, data) => api.put(`/insurance/${id}`, data),
  delete: (id) => api.delete(`/insurance/${id}`)
};

export const purchaseOrderAPI = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`)
};

export const medicalRecordAPI = {
  getAll: (params) => api.get('/medical-records', { params }),
  getById: (id) => api.get(`/medical-records/${id}`),
  create: (data) => api.post('/medical-records', data),
  update: (id, data) => api.put(`/medical-records/${id}`, data),
  addVaccination: (id, data) => api.post(`/medical-records/${id}/vaccination`, data),
  delete: (id) => api.delete(`/medical-records/${id}`)
};

export default api;
