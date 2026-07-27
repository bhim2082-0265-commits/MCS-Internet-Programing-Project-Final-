import { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

function Appointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorName: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
    fetchDepartments();
  }, [filterDate, filterDoctor, filterDepartment]);

  const fetchAppointments = async () => {
    try {
      const params = { date: filterDate };
      if (filterDoctor) params.doctor = filterDoctor;
      if (filterDepartment) params.department = filterDepartment;
      const res = await appointmentAPI.getAll(params);
      setAppointments(res.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await patientAPI.getAll();
      setPatients(res.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await authAPI.getDoctors();
      setDoctors(res.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await authAPI.getDepartments();
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleDoctorSelect = (e) => {
    const doctorId = e.target.value;
    const doctor = doctors.find(d => d._id === doctorId);
    setSelectedDoctor(doctor);
    if (doctor) {
      setFormData({
        ...formData,
        doctorName: doctor.name,
        department: doctor.department
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await appointmentAPI.create(formData);
      toast.success('Appointment booked successfully');
      setShowModal(false);
      setFormData({
        patientId: '', doctorName: '', department: '',
        date: new Date().toISOString().split('T')[0], time: '09:00', reason: ''
      });
      setSelectedDoctor(null);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.update(id, { status });
      toast.success('Status updated');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
      'Arrived': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'In-Consultation': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'Completed': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'Cancelled': 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
    };
    return colors[status] || 'bg-dark-500/20 text-dark-400 border border-dark-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-dark-900 via-dark-800 to-primary-900/30 rounded-2xl p-8 border border-dark-700/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/50"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Appointments</h1>
            <p className="text-dark-300 mt-1">Schedule and manage patient appointments</p>
          </div>
          <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book Appointment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
        <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
          <option value="" className="bg-dark-800">All Doctors</option>
          {doctors.map(d => (
            <option key={d._id} value={d.name} className="bg-dark-800">{d.name} - {d.specialty || d.department}</option>
          ))}
        </select>
        <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
          <option value="" className="bg-dark-800">All Departments</option>
          {departments.map(d => (
            <option key={d} value={d} className="bg-dark-800">{d}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-dark-400 font-medium">No appointments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-white">{apt.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">{apt.patientId?.firstName} {apt.patientId?.lastName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{apt.doctorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{apt.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select value={apt.status} onChange={(e) => updateStatus(apt._id, e.target.value)}
                        className="px-3 py-2 bg-dark-800/50 border border-dark-600/50 rounded-xl text-sm text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer">
                        <option value="Scheduled" className="bg-dark-800">Scheduled</option>
                        <option value="Arrived" className="bg-dark-800">Arrived</option>
                        <option value="In-Consultation" className="bg-dark-800">In-Consultation</option>
                        <option value="Completed" className="bg-dark-800">Completed</option>
                        <option value="Cancelled" className="bg-dark-800">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Book Appointment</h2>
                  <p className="text-sm text-dark-400 mt-1">Select from {doctors.length}+ specialists</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Select Patient</label>
                <input type="text" placeholder="Search by name, MRN, or phone..." value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all mb-2" />
                <select required value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                  <option value="" className="bg-dark-800">Select Patient</option>
                  {patients.filter(p => {
                    if (!patientSearch) return true;
                    const q = patientSearch.toLowerCase();
                    return (`${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
                      p.mrn?.toLowerCase().includes(q) ||
                      p.phone?.toLowerCase().includes(q));
                  }).map(p => (
                    <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn}){p.phone ? ` - ${p.phone}` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Select Doctor</label>
                <select required value={selectedDoctor?._id || ''} onChange={handleDoctorSelect}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                  <option value="" className="bg-dark-800">Choose a Doctor</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id} className="bg-dark-800">
                      {d.name} - {d.specialty || d.department} ({d.hospital || 'Lincoln Hospital'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedDoctor && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400 w-24">Department:</span>
                    <span className="text-sm text-white">{selectedDoctor.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400 w-24">Specialty:</span>
                    <span className="text-sm text-white">{selectedDoctor.specialty || selectedDoctor.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400 w-24">Hospital:</span>
                    <span className="text-sm text-white">{selectedDoctor.hospital || 'Lincoln International Hospital'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400 w-24">Fee:</span>
                    <span className="text-sm text-primary-400 font-semibold">Rs. {selectedDoctor.consultationFee?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <input type="hidden" value={formData.doctorName} />
              <input type="hidden" value={formData.department} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Date</label>
                  <input type="date" required value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Time</label>
                  <input type="time" required value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>

              <textarea placeholder="Reason for visit (optional)" value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" rows="2" />

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
