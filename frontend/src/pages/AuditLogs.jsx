import { useState, useEffect } from 'react';
import { auditLogAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Shield, Search, Filter, Calendar, Activity, FileText, ChevronLeft, ChevronRight, Clock, Globe, User, RefreshCw } from 'lucide-react';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ todayLogs: 0, totalLogs: 0, actionsToday: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const actions = ['Create', 'Read', 'Update', 'Delete', 'Login', 'Logout', 'Export', 'Adjust', 'Pay', 'Cancel'];
  const limit = 20;

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, filterAction, filterResource, filterStartDate, filterEndDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filterAction) params.action = filterAction;
      if (filterResource) params.resource = filterResource;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      const res = await auditLogAPI.getAll(params);
      setLogs(res.data.logs || res.data);
      setTotalPages(res.data.totalPages || 1);
      setHasMore(res.data.hasMore || false);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await auditLogAPI.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchLogs();
    fetchStats();
    toast.success('Refreshed');
  };

  const clearFilters = () => {
    setFilterAction('');
    setFilterResource('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(1);
  };

  const getActionColor = (action) => {
    const colors = {
      'Create': 'bg-green-500/20 text-green-400',
      'Read': 'bg-blue-500/20 text-blue-400',
      'Update': 'bg-yellow-500/20 text-yellow-400',
      'Delete': 'bg-red-500/20 text-red-400',
      'Login': 'bg-purple-500/20 text-purple-400',
      'Logout': 'bg-dark-500/20 text-dark-400',
      'Export': 'bg-teal-500/20 text-teal-400',
      'Pay': 'bg-green-500/20 text-green-400',
      'Cancel': 'bg-red-500/20 text-red-400'
    };
    return colors[action] || 'bg-dark-500/20 text-dark-400';
  };

  const statCards = [
    { label: "Today's Logs", value: stats.todayLogs, icon: Clock, gradient: 'from-primary-600 to-primary-700' },
    { label: 'Total Logs', value: stats.totalLogs, icon: FileText, gradient: 'from-blue-600 to-blue-700' },
    { label: 'Actions Today', value: stats.actionsToday, icon: Activity, gradient: 'from-teal-600 to-teal-700' }
  ];

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-r from-dark-900 via-dark-800 to-primary-900/30 rounded-2xl p-8 border border-dark-700/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/50"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
            <p className="text-dark-300 mt-1">Track all system activity and user actions</p>
          </div>
          <button onClick={handleRefresh} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="w-5 h-5 text-dark-400" />
            <span className="text-sm font-semibold text-white">Filters</span>
          </div>
          <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
            <option value="" className="bg-dark-800">All Actions</option>
            {actions.map(a => <option key={a} value={a} className="bg-dark-800">{a}</option>)}
          </select>
          <input type="text" placeholder="Resource (e.g. Patient, Invoice)" value={filterResource}
            onChange={(e) => { setFilterResource(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-dark-400" />
            <input type="date" value={filterStartDate}
              onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            <span className="text-dark-400">to</span>
            <input type="date" value={filterEndDate}
              onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
          </div>
          {(filterAction || filterResource || filterStartDate || filterEndDate) && (
            <button onClick={clearFilters} className="px-4 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium text-sm">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                        <Shield className="w-8 h-8 text-dark-500" />
                      </div>
                      <p className="text-dark-400 font-medium">No audit logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-dark-500" />
                        <div>
                          <p className="text-sm text-white">{new Date(log.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          <p className="text-xs text-dark-400">{new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {log.userId?.firstName?.charAt(0) || log.userName?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-medium text-white">{log.userId?.firstName} {log.userId?.lastName || log.userName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-dark-500/20 text-dark-300">
                        {log.userId?.role || log.userRole || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                      {log.resource || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-dark-300 max-w-xs truncate" title={log.description || log.details || ''}>
                        {log.description || log.details || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-dark-500" />
                        <span className="text-sm text-dark-300">{log.ipAddress || log.ip || '-'}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50">
            <p className="text-sm text-dark-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-dark-800/50 border border-dark-700/50 text-dark-300 hover:bg-dark-700/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-dark-800/50 border border-dark-700/50 text-dark-300 hover:bg-dark-700/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;
