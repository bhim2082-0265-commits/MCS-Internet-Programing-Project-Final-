import { useState, useEffect } from 'react';
import { vitalsAPI, patientAPI } from '../services/api';
import toast from 'react-hot-toast';

function Vitals({ user }) {
  const [vitals, setVitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    spO2: '',
    weight: '',
    height: '',
    notes: ''
  });

  useEffect(() => {
    fetchVitals();
    fetchPatients();
  }, [selectedPatient]);

  const fetchVitals = async () => {
    try {
      if (selectedPatient) {
        const res = await vitalsAPI.getByPatient(selectedPatient);
        setVitals(Array.isArray(res.data) ? res.data : []);
      } else {
        setVitals([]);
      }
    } catch (error) {
      setVitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await patientAPI.getAll();
      setPatients(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vitalsAPI.create(formData);
      toast.success('Vitals recorded successfully');
      setShowModal(false);
      setFormData({ patientId: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', heartRate: '', temperature: '', spO2: '', weight: '', height: '', notes: '' });
      fetchVitals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record vitals');
    }
  };

  const getBPStatus = (sys, dia) => {
    if (sys <= 120 && dia <= 80) return { label: 'Normal', color: 'text-green-400 bg-green-500/10 border-green-500/20' };
    if (sys <= 139 || dia <= 89) return { label: 'Elevated', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
    if (sys <= 159 || dia <= 99) return { label: 'High Stage 1', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    return { label: 'High Stage 2', color: 'text-accent-400 bg-accent-500/10 border-accent-500/20' };
  };

  const getTempStatus = (temp) => {
    if (temp >= 36.1 && temp <= 37.2) return { label: 'Normal', color: 'text-green-400' };
    if (temp >= 37.3 && temp <= 38.0) return { label: 'Low-grade fever', color: 'text-yellow-400' };
    return { label: 'Fever', color: 'text-accent-400' };
  };

  const getSpo2Status = (spo2) => {
    if (spo2 >= 95) return { label: 'Normal', color: 'text-green-400' };
    if (spo2 >= 90) return { label: 'Low', color: 'text-yellow-400' };
    return { label: 'Critical', color: 'text-accent-400' };
  };

  const getBMI = (w, h) => {
    if (!w || !h) return null;
    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    let category = 'Normal';
    let color = 'text-green-400';
    if (bmi < 18.5) { category = 'Underweight'; color = 'text-yellow-400'; }
    else if (bmi >= 25 && bmi < 30) { category = 'Overweight'; color = 'text-orange-400'; }
    else if (bmi >= 30) { category = 'Obese'; color = 'text-accent-400'; }
    return { bmi: bmi.toFixed(1), category, color };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading vitals...</p>
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
            <h1 className="text-3xl font-bold text-white">Patient Vitals</h1>
            <p className="text-dark-300 mt-1">Record and monitor patient vital signs</p>
          </div>
          {user?.role !== 'receptionist' && (
            <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Record Vitals
            </button>
          )}
        </div>
      </div>

      {/* Patient Filter */}
      <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}
        className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
        <option value="" className="bg-dark-800">Select a patient to view vitals</option>
        {patients.map(p => (
          <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn})</option>
        ))}
      </select>

      {/* Vitals Cards */}
      {vitals.length === 0 ? (
        <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-dark-400 font-medium">{selectedPatient ? 'No vitals recorded yet' : 'Select a patient to view their vitals'}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {vitals.map((v) => {
            const bp = getBPStatus(v.bloodPressureSystolic, v.bloodPressureDiastolic);
            const temp = getTempStatus(v.temperature);
            const spo2 = getSpo2Status(v.spO2);
            const bmi = getBMI(v.weight, v.height);
            return (
              <div key={v._id} className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-6 hover:border-dark-600/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-dark-400">{new Date(v.createdAt).toLocaleString()}</span>
                  {v.recordedBy && <span className="text-sm text-dark-400">By: {v.recordedBy}</span>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Blood Pressure */}
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                    <p className="text-xs text-dark-400 mb-1">Blood Pressure</p>
                    <p className="text-xl font-bold text-white">{v.bloodPressureSystolic}/{v.bloodPressureDiastolic}</p>
                    <p className="text-xs mt-1">mmHg</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full border ${bp.color}`}>{bp.label}</span>
                  </div>
                  {/* Heart Rate */}
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                    <p className="text-xs text-dark-400 mb-1">Heart Rate</p>
                    <p className="text-xl font-bold text-white">{v.heartRate}</p>
                    <p className="text-xs mt-1">bpm</p>
                  </div>
                  {/* Temperature */}
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                    <p className="text-xs text-dark-400 mb-1">Temperature</p>
                    <p className="text-xl font-bold text-white">{v.temperature}</p>
                    <p className="text-xs mt-1">&deg;C</p>
                    <span className={`text-xs mt-1 ${temp.color}`}>{temp.label}</span>
                  </div>
                  {/* SpO2 */}
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                    <p className="text-xs text-dark-400 mb-1">SpO2</p>
                    <p className="text-xl font-bold text-white">{v.spO2}</p>
                    <p className="text-xs mt-1">%</p>
                    <span className={`text-xs mt-1 ${spo2.color}`}>{spo2.label}</span>
                  </div>
                </div>
                {(v.weight || v.height) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-dark-700/30">
                    {v.weight && (
                      <div>
                        <p className="text-xs text-dark-400">Weight</p>
                        <p className="text-sm font-semibold text-white">{v.weight} kg</p>
                      </div>
                    )}
                    {v.height && (
                      <div>
                        <p className="text-xs text-dark-400">Height</p>
                        <p className="text-sm font-semibold text-white">{v.height} cm</p>
                      </div>
                    )}
                    {bmi && (
                      <div>
                        <p className="text-xs text-dark-400">BMI</p>
                        <p className={`text-sm font-semibold ${bmi.color}`}>{bmi.bmi} - {bmi.category}</p>
                      </div>
                    )}
                  </div>
                )}
                {v.notes && (
                  <div className="mt-4 pt-4 border-t border-dark-700/30">
                    <p className="text-xs text-dark-400">Notes:</p>
                    <p className="text-sm text-dark-200">{v.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Record Vitals</h2>
                  <p className="text-sm text-dark-400 mt-1">Enter patient vital signs</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <select required value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                <option value="" className="bg-dark-800">Select Patient</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn})</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">BP Systolic (mmHg)</label>
                  <input type="number" placeholder="120" value={formData.bloodPressureSystolic}
                    onChange={(e) => setFormData({...formData, bloodPressureSystolic: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">BP Diastolic (mmHg)</label>
                  <input type="number" placeholder="80" value={formData.bloodPressureDiastolic}
                    onChange={(e) => setFormData({...formData, bloodPressureDiastolic: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Heart Rate (bpm)</label>
                  <input type="number" placeholder="72" value={formData.heartRate}
                    onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Temperature (&deg;C)</label>
                  <input type="number" step="0.1" placeholder="36.5" value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">SpO2 (%)</label>
                  <input type="number" placeholder="98" value={formData.spO2}
                    onChange={(e) => setFormData({...formData, spO2: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Weight (kg)</label>
                  <input type="number" step="0.1" placeholder="65" value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Height (cm)</label>
                  <input type="number" step="0.1" placeholder="170" value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>

              <textarea placeholder="Notes (optional)" value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" rows="2" />

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">Save Vitals</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vitals;
