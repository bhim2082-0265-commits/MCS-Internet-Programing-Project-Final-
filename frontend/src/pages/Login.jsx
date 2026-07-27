import { useState } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    nmcNumber: '',
    phone: '',
    department: 'General Medicine',
    consultationFee: 1000,
    role: 'doctor'
  });
  const [loading, setLoading] = useState(false);

  const departments = ['General Medicine', 'Orthopedics', 'Pediatrics', 'Cardiology', 'Dermatology', 'ENT', 'Ophthalmology', 'Gynecology', 'Neurology', 'Urology', 'Radiology', 'Anesthesiology', 'Neurosurgery', 'Pulmonology', 'Gastroenterology', 'Hematology', 'Emergency Medicine', 'Psychiatry', 'Administration', 'Reception'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await authAPI.login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Login successful');
        onLogin(res.data.user);
      } else {
        await authAPI.register(formData);
        toast.success('Registration successful. Please login.');
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail);
      setForgotSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-dark-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-dark-700/50 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary-700 via-primary-800 to-dark-900 p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/50"></div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Lincoln International Hospital</h1>
              <p className="text-primary-200 text-sm mt-2 font-medium">Hospital Patient Management System</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-accent-400 rounded-full"></div>
                <p className="text-primary-300/80 text-xs">Dhobidhara, Kathmandu, Nepal</p>
                <div className="w-1.5 h-1.5 bg-accent-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Forgot Password View */}
          {showForgot ? (
            <div className="p-8">
              <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }} className="flex items-center gap-2 text-sm text-dark-400 hover:text-white mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Login
              </button>
              <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-dark-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              {forgotSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Check your email</p>
                  <p className="text-dark-400 text-sm mt-2">We sent a password reset link to</p>
                  <p className="text-primary-400 text-sm mt-1">{forgotEmail}</p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white rounded-xl font-bold text-sm tracking-wide hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-primary-600/30"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div className="px-8 pt-6">
                <div className="flex bg-dark-800 rounded-xl p-1.5 border border-dark-700/50">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      isLogin 
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30' 
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      !isLogin 
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30' 
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                {!isLogin && (
                  <>
                    <div className="relative group">
                      <input type="text" placeholder="Full Name" required value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 group-hover:border-dark-500" />
                    </div>
                    <div className="relative group">
                      <input type="text" placeholder="NMC Number" required value={formData.nmcNumber}
                        onChange={(e) => setFormData({...formData, nmcNumber: e.target.value})}
                        className="w-full px-4 py-3.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 group-hover:border-dark-500" />
                    </div>
                    <div className="relative group">
                      <input type="tel" placeholder="Phone (10 digits)" required value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 group-hover:border-dark-500" />
                    </div>
                    <div className="relative group">
                      <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-4 py-3.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 group-hover:border-dark-500">
                        {departments.map(d => <option key={d} value={d} className="bg-dark-800">{d}</option>)}
                      </select>
                    </div>
                    <div className="relative group">
                      <input type="number" placeholder="Consultation Fee (NPR)" required value={formData.consultationFee}
                        onChange={(e) => setFormData({...formData, consultationFee: parseInt(e.target.value)})}
                        className="w-full px-4 py-3.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 group-hover:border-dark-500" />
                    </div>
                    <div className="relative group">
                      <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-3.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 group-hover:border-dark-500">
                        <option value="doctor" className="bg-dark-800">Doctor</option>
                        <option value="receptionist" className="bg-dark-800">Receptionist</option>
                        <option value="admin" className="bg-dark-800">Admin</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Email Field */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-dark-400 group-focus-within:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 group-hover:border-dark-500"
                  />
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-dark-400 group-focus-within:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-12 py-3.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 group-hover:border-dark-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-dark-400 hover:text-white transition-colors">
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>

                {/* Forgot Password Link */}
                {isLogin && (
                  <div className="text-right">
                    <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white rounded-xl font-bold text-sm tracking-wide hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="px-8 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent"></div>
                  <span className="text-xs text-dark-500 font-medium">SECURE ACCESS</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent"></div>
                </div>
                <p className="text-center text-xs text-dark-500">
                  Lincoln International College &copy; {new Date().getFullYear()}
                </p>
                <p className="text-center text-xs text-dark-600 mt-1">
                  PAN: 601234567 | VAT: 13%
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
