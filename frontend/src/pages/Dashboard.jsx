import { useState, useEffect } from 'react';
import { appointmentAPI, analyticsAPI } from '../services/api';
import { io } from 'socket.io-client';

function Dashboard({ user }) {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    todayRevenue: 0,
    totalPrescriptions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    const socket = io(window.location.origin);
    socket.emit('join_room', 'reception');
    
    socket.on('queue_updated', (data) => {
      fetchData();
    });
    
    return () => socket.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, statsRes] = await Promise.all([
        appointmentAPI.getToday(),
        analyticsAPI.getDashboardStats()
      ]);
      setTodayAppointments(appointmentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.update(id, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
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
          <p className="text-dark-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients, icon: '👥', color: 'from-primary-600 to-primary-700' },
    { label: "Today's Appointments", value: stats.todayAppointments, icon: '📅', color: 'from-green-600 to-green-700' },
    { label: 'Pending', value: stats.pendingAppointments, icon: '⏳', color: 'from-yellow-600 to-yellow-700' },
    { label: 'Completed Today', value: stats.completedToday, icon: '✅', color: 'from-green-500 to-green-600' },
    { label: "Today's Revenue (NPR)", value: `Rs. ${stats.todayRevenue.toLocaleString()}`, icon: '💰', color: 'from-accent-600 to-accent-700' },
    { label: 'Prescriptions Today', value: stats.totalPrescriptions, icon: '💊', color: 'from-purple-600 to-purple-700' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-dark-900 via-dark-800 to-primary-900/30 rounded-2xl p-8 border border-dark-700/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-dark-300">Lincoln International Hospital and Research Center</p>
          <p className="text-sm text-dark-400 mt-1">Dhobidhara, Kathmandu, Nepal</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="relative group bg-dark-900/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 hover:border-dark-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-600/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Queue */}
      <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
        <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                Today's Appointment Queue
              </h2>
              <p className="text-sm text-dark-400 mt-2 ml-13">Real-time queue management</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400 font-medium">Live</span>
            </div>
          </div>
        </div>

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
              {todayAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-dark-400 font-medium">No appointments scheduled for today</p>
                    </div>
                  </td>
                </tr>
              ) : (
                todayAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-white">{apt.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-white">{apt.patientId?.firstName} {apt.patientId?.lastName}</p>
                        <p className="text-xs text-dark-400">MRN: {apt.patientId?.mrn}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-dark-200">{apt.doctorName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-dark-200">{apt.department}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={apt.status}
                        onChange={(e) => updateStatus(apt._id, e.target.value)}
                        className="px-3 py-2 bg-dark-800/50 border border-dark-600/50 rounded-xl text-sm text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
                      >
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
    </div>
  );
}

export default Dashboard;
