import { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Users, Stethoscope, HeartPulse, UserCog, Clock, Phone, Search, Edit3, Trash2, UserPlus, Calendar, LogIn, LogOut, CalendarX } from 'lucide-react';

function Staff() {
  const [activeTab, setActiveTab] = useState('directory');
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, doctors: 0, nurses: 0, otherStaff: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0, absent: 0, onLeave: 0 });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(null);

  const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Radiology', 'Emergency', 'ICU', 'Pharmacy', 'Laboratory', 'Administration', 'General'];
  const roles = ['Doctor', 'Nurse', 'Lab Technician', 'Pharmacist', 'Accountant', 'Receptionist', 'Admin', 'Cleaner', 'Security', 'Other'];
  const shifts = ['Morning', 'Afternoon', 'Night', 'Rotating'];

  const defaultFormData = {
    firstName: '', lastName: '', email: '', phone: '', role: 'Doctor', department: 'Cardiology',
    designation: '', qualification: '', salary: '', shift: 'Morning',
    address: { street: '', city: '', district: '', province: '' },
    emergencyContact: { name: '', phone: '', relationship: '' }
  };
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchEmployees();
      fetchStats();
    } else {
      fetchAttendance();
    }
  }, [activeTab, search, filterRole, filterDepartment, filterShift, attendanceDate]);

  const fetchEmployees = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      if (filterDepartment) params.department = filterDepartment;
      if (filterShift) params.shift = filterShift;
      const res = await employeeAPI.getAll(params);
      setEmployees(res.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await employeeAPI.getStats();
      setStats(res.data);
    } catch (error) {}
  };

  const fetchAttendance = async () => {
    try {
      const res = await attendanceAPI.getDaily({ date: attendanceDate });
      setAttendanceRecords(res.data.records || []);
      setAttendanceStats(res.data.stats || { total: 0, present: 0, absent: 0, onLeave: 0 });
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, salary: Number(formData.salary) || 0 };
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee._id, data);
        toast.success('Employee updated successfully');
      } else {
        await employeeAPI.create(data);
        toast.success('Employee added successfully');
      }
      setShowModal(false);
      setEditingEmployee(null);
      setFormData(defaultFormData);
      fetchEmployees();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      firstName: emp.firstName, lastName: emp.lastName, email: emp.email || '', phone: emp.phone || '',
      role: emp.role, department: emp.department, designation: emp.designation || '',
      qualification: emp.qualification || '', salary: emp.salary || '', shift: emp.shift || 'Morning',
      address: emp.address || { street: '', city: '', district: '', province: '' },
      emergencyContact: emp.emergencyContact || { name: '', phone: '', relationship: '' }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await employeeAPI.delete(id);
      toast.success('Employee deleted');
      setShowDeleteConfirm(null);
      fetchEmployees();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const handleCheckIn = async () => {
    if (!selectedEmployee) return toast.error('Select an employee');
    try {
      await attendanceAPI.checkIn({ employeeId: selectedEmployee, date: attendanceDate });
      toast.success('Checked in successfully');
      setSelectedEmployee('');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    if (!selectedEmployee) return toast.error('Select an employee');
    try {
      await attendanceAPI.checkOut({ employeeId: selectedEmployee, date: attendanceDate });
      toast.success('Checked out successfully');
      setSelectedEmployee('');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
  };

  const handleMarkLeave = async (empId) => {
    try {
      await attendanceAPI.markLeave({ employeeId: empId, date: attendanceDate });
      toast.success('Marked as on leave');
      setShowLeaveModal(null);
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark leave');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Doctor': 'bg-blue-500/20 text-blue-400',
      'Nurse': 'bg-pink-500/20 text-pink-400',
      'Lab Technician': 'bg-teal-500/20 text-teal-400',
      'Pharmacist': 'bg-green-500/20 text-green-400',
      'Accountant': 'bg-yellow-500/20 text-yellow-400',
      'Receptionist': 'bg-purple-500/20 text-purple-400',
      'Admin': 'bg-red-500/20 text-red-400'
    };
    return colors[role] || 'bg-dark-500/20 text-dark-400';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Present': 'bg-green-500/20 text-green-400',
      'Absent': 'bg-red-500/20 text-red-400',
      'Late': 'bg-yellow-500/20 text-yellow-400',
      'On-Leave': 'bg-purple-500/20 text-purple-400'
    };
    return colors[status] || 'bg-dark-500/20 text-dark-400';
  };

  const calcHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    return diff > 0 ? `${diff.toFixed(1)}h` : '-';
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData(defaultFormData);
  };

  const statCards = [
    { label: 'Total Staff', value: stats.total, icon: Users, gradient: 'from-primary-600 to-primary-700' },
    { label: 'Doctors', value: stats.doctors, icon: Stethoscope, gradient: 'from-blue-600 to-blue-700' },
    { label: 'Nurses', value: stats.nurses, icon: HeartPulse, gradient: 'from-pink-600 to-pink-700' },
    { label: 'Other Staff', value: stats.otherStaff, icon: UserCog, gradient: 'from-teal-600 to-teal-700' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading staff data...</p>
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
            <h1 className="text-3xl font-bold text-white">Staff Management</h1>
            <p className="text-dark-300 mt-1">Manage employees, roles, and attendance</p>
          </div>
          {activeTab === 'directory' && (
            <button onClick={() => { resetForm(); setShowModal(true); }} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => { setActiveTab('directory'); setLoading(true); }}
          className={`px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'directory' ? 'bg-primary-600 text-white' : 'bg-dark-800/50 text-dark-300 border border-dark-700/50 hover:bg-dark-700/50'}`}>
          Staff Directory
        </button>
        <button onClick={() => { setActiveTab('attendance'); setLoading(true); }}
          className={`px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'attendance' ? 'bg-primary-600 text-white' : 'bg-dark-800/50 text-dark-300 border border-dark-700/50 hover:bg-dark-700/50'}`}>
          Attendance
        </button>
      </div>

      {/* ═══════════════ STAFF DIRECTORY TAB ═══════════════ */}
      {activeTab === 'directory' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">{card.label}</p>
                    <p className="text-2xl font-bold text-white">{card.value || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-dark-400" />
              </div>
              <input type="text" placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </div>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
              <option value="" className="bg-dark-800">All Roles</option>
              {roles.map(r => <option key={r} value={r} className="bg-dark-800">{r}</option>)}
            </select>
            <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
              <option value="" className="bg-dark-800">All Departments</option>
              {departments.map(d => <option key={d} value={d} className="bg-dark-800">{d}</option>)}
            </select>
            <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
              <option value="" className="bg-dark-800">All Shifts</option>
              {shifts.map(s => <option key={s} value={s} className="bg-dark-800">{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Shift</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/50">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                            <Users className="w-8 h-8 text-dark-500" />
                          </div>
                          <p className="text-dark-400 font-medium">No staff members found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-dark-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-primary-400">{emp.employeeId}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-white">{emp.firstName} {emp.lastName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getRoleColor(emp.role)}`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{emp.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{emp.shift}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{emp.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${emp.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {emp.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(emp)} className="p-2 text-dark-300 hover:text-primary-400 hover:bg-dark-800 rounded-lg transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setShowDeleteConfirm(emp)} className="p-2 text-dark-300 hover:text-red-400 hover:bg-dark-800 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════ ATTENDANCE TAB ═══════════════ */}
      {activeTab === 'attendance' && (
        <>
          {/* Attendance Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Staff', value: attendanceStats.total, color: 'from-primary-600 to-primary-700', icon: Users },
              { label: 'Present', value: attendanceStats.present, color: 'from-green-600 to-green-700', icon: LogIn },
              { label: 'Absent', value: attendanceStats.absent, color: 'from-red-600 to-red-700', icon: LogOut },
              { label: 'On Leave', value: attendanceStats.onLeave, color: 'from-purple-600 to-purple-700', icon: CalendarX }
            ].map((card) => (
              <div key={card.label} className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">{card.label}</p>
                    <p className="text-2xl font-bold text-white">{card.value || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance Actions */}
          <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Date</label>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-dark-300 mb-2">Select Employee</label>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                  <option value="" className="bg-dark-800">Choose Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id} className="bg-dark-800">{emp.firstName} {emp.lastName} - {emp.role}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleCheckIn} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30 flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Check In
              </button>
              <button onClick={handleCheckOut} className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30 flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Check Out
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Employee Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Check Out</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/50">
                  {attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-dark-500" />
                          </div>
                          <p className="text-dark-400 font-medium">No attendance records for this date</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    attendanceRecords.map((rec) => (
                      <tr key={rec._id} className="hover:bg-dark-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {rec.employeeId?.firstName?.charAt(0)}{rec.employeeId?.lastName?.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-white">{rec.employeeId?.firstName} {rec.employeeId?.lastName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getRoleColor(rec.employeeId?.role)}`}>
                            {rec.employeeId?.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                          {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                          {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                          {calcHours(rec.checkIn, rec.checkOut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(rec.status)}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button onClick={() => setShowLeaveModal(rec.employeeId)} className="px-3 py-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center gap-1">
                            <CalendarX className="w-3 h-3" />
                            Mark Leave
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════ ADD/EDIT EMPLOYEE MODAL ═══════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                  <p className="text-sm text-dark-400 mt-1">Lincoln International Hospital (HPBS)</p>
                </div>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" required value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <input type="text" placeholder="Last Name" required value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="email" placeholder="Email" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <input type="tel" placeholder="Phone" value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                  {roles.map(r => <option key={r} value={r} className="bg-dark-800">{r}</option>)}
                </select>
                <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                  {departments.map(d => <option key={d} value={d} className="bg-dark-800">{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input type="text" placeholder="Designation" value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <input type="text" placeholder="Qualification" value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <input type="number" placeholder="Salary" value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <select value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                {shifts.map(s => <option key={s} value={s} className="bg-dark-800">{s} Shift</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Street Address" value={formData.address.street}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <input type="text" placeholder="City" value={formData.address.city}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="District" value={formData.address.district}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, district: e.target.value}})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <input type="text" placeholder="Province" value={formData.address.province}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, province: e.target.value}})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <div className="border-t border-dark-700/50 pt-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-400" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Name" value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, name: e.target.value}})}
                    className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  <input type="tel" placeholder="Phone" value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, phone: e.target.value}})}
                    className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  <input type="text" placeholder="Relationship" value={formData.emergencyContact.relationship}
                    onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, relationship: e.target.value}})}
                    className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ DELETE CONFIRM MODAL ═══════════════ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Employee</h2>
              <p className="text-dark-400">Are you sure you want to delete <span className="text-white font-medium">{showDeleteConfirm.firstName} {showDeleteConfirm.lastName}</span>? This action cannot be undone.</p>
              <div className="flex justify-center gap-3 mt-6">
                <button onClick={() => setShowDeleteConfirm(null)} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button onClick={() => handleDelete(showDeleteConfirm._id)} className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MARK LEAVE MODAL ═══════════════ */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarX className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Mark as On Leave</h2>
              <p className="text-dark-400">Mark <span className="text-white font-medium">{showLeaveModal.firstName} {showLeaveModal.lastName}</span> as on leave for <span className="text-white font-medium">{attendanceDate}</span>?</p>
              <div className="flex justify-center gap-3 mt-6">
                <button onClick={() => setShowLeaveModal(null)} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button onClick={() => handleMarkLeave(showLeaveModal._id)} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/30">Mark Leave</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
