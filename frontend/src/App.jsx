import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Billing from './pages/Billing';
import Vitals from './pages/Vitals';

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  
  const links = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/patients', label: 'Patients', icon: '👥', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/appointments', label: 'Appointments', icon: '📅', roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/prescriptions', label: 'Prescriptions', icon: '💊', roles: ['admin', 'doctor'] },
    { path: '/vitals', label: 'Vitals', icon: '💓', roles: ['admin', 'doctor'] },
    { path: '/billing', label: 'Billing', icon: '💰', roles: ['admin', 'receptionist'] }
  ];

  const filteredLinks = links.filter(link => link.roles.includes(user?.role));

  const roleColors = {
    admin: 'from-accent-500 to-accent-600',
    doctor: 'from-primary-500 to-primary-600',
    receptionist: 'from-green-500 to-green-600'
  };

  return (
    <div className="w-72 bg-dark-950 text-white min-h-screen flex flex-col border-r border-dark-800/50">
      {/* Header */}
      <div className="p-6 border-b border-dark-800/50 bg-gradient-to-b from-dark-900 to-dark-950">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Lincoln International</h1>
            <p className="text-xs text-primary-300/80">Hospital & Research Center</p>
          </div>
        </div>
        <p className="text-xs text-dark-400 pl-15">Dhobidhara, Kathmandu, Nepal</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 space-y-2">
        {filteredLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
              location.pathname === link.path
                ? 'bg-gradient-to-r from-primary-600/20 to-primary-700/20 text-white border border-primary-500/30 shadow-lg shadow-primary-600/10'
                : 'text-dark-300 hover:bg-dark-800/50 hover:text-white border border-transparent'
            }`}
          >
            <span className={`text-xl ${location.pathname === link.path ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>
              {link.icon}
            </span>
            <span className="font-medium">{link.label}</span>
            {location.pathname === link.path && (
              <div className="ml-auto w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-dark-800/50 bg-dark-900/30">
        <div className="flex items-center gap-3 mb-4 p-3 bg-dark-800/30 rounded-xl border border-dark-700/30">
          <div className={`w-10 h-10 bg-gradient-to-br ${roleColors[user?.role] || 'from-primary-500 to-primary-600'} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 bg-dark-800/50 hover:bg-accent-600/20 border border-dark-700/30 hover:border-accent-500/30 rounded-xl text-sm font-medium text-dark-300 hover:text-accent-400 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }}
        />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />
      <div className="flex min-h-screen bg-dark-950">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/patients" element={<Patients user={user} />} />
            <Route path="/appointments" element={<Appointments user={user} />} />
            <Route path="/prescriptions" element={<Prescriptions user={user} />} />
            <Route path="/vitals" element={<Vitals user={user} />} />
            <Route path="/billing" element={<Billing user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
