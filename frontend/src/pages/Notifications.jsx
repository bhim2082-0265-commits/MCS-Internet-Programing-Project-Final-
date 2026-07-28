import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Calendar, DollarSign, Pill, FlaskConical, Package,
  Bell, BedDouble, LogOut, CheckCheck, Plus, X,
  Clock, AlertTriangle, Filter, Trash2
} from 'lucide-react';

const TYPE_OPTIONS = [
  'Appointment Reminder', 'Bill Due', 'Prescription Refill', 'Lab Result',
  'Stock Alert', 'General', 'Admission', 'Discharge'
];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

const typeIcon = {
  'Appointment Reminder': Calendar,
  'Bill Due': DollarSign,
  'Prescription Refill': Pill,
  'Lab Result': FlaskConical,
  'Stock Alert': Package,
  'General': Bell,
  'Admission': BedDouble,
  'Discharge': LogOut
};

const priorityColor = {
  Low: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  High: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  Urgent: 'bg-red-500/20 text-red-400 border border-red-500/30'
};

const typeColor = {
  'Appointment Reminder': 'bg-primary-500/10 text-primary-400',
  'Bill Due': 'bg-yellow-500/10 text-yellow-400',
  'Prescription Refill': 'bg-purple-500/10 text-purple-400',
  'Lab Result': 'bg-green-500/10 text-green-400',
  'Stock Alert': 'bg-orange-500/10 text-orange-400',
  'General': 'bg-dark-500/10 text-dark-300',
  'Admission': 'bg-blue-500/10 text-blue-400',
  'Discharge': 'bg-red-500/10 text-red-400'
};

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const secs = Math.floor((now - then) / 1000);
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString('en-NP', { month: 'short', day: 'numeric' });
}

function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterRead, setFilterRead] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'General', title: '', message: '', priority: 'Medium'
  });

  useEffect(() => {
    fetchNotifications();
  }, [filterType, filterPriority, filterRead]);

  const fetchNotifications = async () => {
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterPriority) params.priority = filterPriority;
      if (filterRead === 'unread') params.read = false;
      if (filterRead === 'read') params.read = true;
      const res = await notificationAPI.getAll(params);
      setNotifications(res.data);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    try {
      await notificationAPI.create(formData);
      toast.success('Notification created');
      setShowModal(false);
      setFormData({ type: 'General', title: '', message: '', priority: 'Medium' });
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create notification');
    }
  };

  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const highCount = notifications.filter(n => n.priority === 'High' || n.priority === 'Urgent').length;
  const todayCount = notifications.filter(n => {
    const d = new Date(n.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total', value: totalCount, color: 'from-primary-600 to-primary-700', icon: Bell },
    { label: 'Unread', value: unreadCount, color: 'from-blue-600 to-blue-700', icon: Bell },
    { label: 'High Priority', value: highCount, color: 'from-orange-600 to-orange-700', icon: AlertTriangle },
    { label: "Today's", value: todayCount, color: 'from-green-600 to-green-700', icon: Clock }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-dark-900 via-dark-800 to-primary-900/30 rounded-2xl p-8 border border-dark-700/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-dark-300 mt-1">Stay updated with hospital activities and alerts</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleMarkAllRead}
              className="px-5 py-3 bg-dark-800/50 border border-dark-700/50 text-dark-300 rounded-xl font-semibold hover:bg-dark-700/50 hover:text-white transition-all duration-300 flex items-center gap-2">
              <CheckCheck className="w-5 h-5" />
              Mark All Read
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Notification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="relative group bg-dark-900/50 backdrop-blur-sm rounded-2xl p-5 border border-dark-700/50 hover:border-dark-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-600/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-400 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl">
          <Filter className="w-4 h-4 text-dark-400" />
          <span className="text-sm text-dark-400 font-medium">Filters:</span>
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
          <option value="" className="bg-dark-800">All Types</option>
          {TYPE_OPTIONS.map(t => (
            <option key={t} value={t} className="bg-dark-800">{t}</option>
          ))}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
          <option value="" className="bg-dark-800">All Priorities</option>
          {PRIORITY_OPTIONS.map(p => (
            <option key={p} value={p} className="bg-dark-800">{p}</option>
          ))}
        </select>
        <select value={filterRead} onChange={(e) => setFilterRead(e.target.value)}
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
          <option value="" className="bg-dark-800">All Status</option>
          <option value="unread" className="bg-dark-800">Unread</option>
          <option value="read" className="bg-dark-800">Read</option>
        </select>
        {(filterType || filterPriority || filterRead) && (
          <button onClick={() => { setFilterType(''); setFilterPriority(''); setFilterRead(''); }}
            className="px-4 py-3 text-sm text-dark-400 hover:text-white transition-colors font-medium">
            Clear Filters
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 bg-dark-800/50 rounded-2xl flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-dark-500" />
            </div>
            <p className="text-dark-400 font-medium text-lg">No notifications found</p>
            <p className="text-dark-500 text-sm mt-1">
              {filterType || filterPriority || filterRead
                ? 'Try adjusting your filters'
                : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-800/50">
            {notifications.map((notification) => {
              const Icon = typeIcon[notification.type] || Bell;
              const isUnread = !notification.read;
              return (
                <div key={notification._id}
                  className={`flex items-start gap-4 p-5 transition-all duration-200 hover:bg-dark-800/30 ${isUnread ? 'bg-primary-500/5' : ''}`}
                  onClick={() => !isUnread ? null : handleMarkAsRead(notification._id)}
                  style={{ cursor: isUnread ? 'pointer' : 'default' }}>
                  {/* Unread indicator */}
                  <div className="pt-2 flex-shrink-0">
                    {isUnread ? (
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    ) : (
                      <div className="w-3 h-3"></div>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[notification.type] || 'bg-dark-500/10 text-dark-300'}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className={`text-sm font-semibold ${isUnread ? 'text-white' : 'text-dark-300'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-dark-400 mt-1 line-clamp-2">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${priorityColor[notification.priority] || 'bg-dark-500/20 text-dark-400 border border-dark-500/30'}`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-dark-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(notification.createdAt)}
                      </span>
                      <span className="text-xs text-dark-500 px-2 py-0.5 bg-dark-800/50 rounded-md">
                        {notification.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isUnread && (
                      <button onClick={() => handleMarkAsRead(notification._id)}
                        className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                        title="Mark as read">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(notification._id)}
                      className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Create Notification</h2>
                  <p className="text-sm text-dark-400 mt-1">Send a notification to hospital staff</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    {TYPE_OPTIONS.map(t => (
                      <option key={t} value={t} className="bg-dark-800">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p} value={p} className="bg-dark-800">{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Title</label>
                <input type="text" required placeholder="Notification title" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Message</label>
                <textarea required placeholder="Notification message..." value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" rows="4" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">
                  Cancel
                </button>
                <button type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">
                  Create Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
