import { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import toast from 'react-hot-toast';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    email: '',
    bloodGroup: '',
    address: { street: '', city: '', district: '', province: '' },
    emergencyContact: { name: '', phone: '', relationship: '' },
    allergies: [],
    chronicConditions: []
  });

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    try {
      const res = await patientAPI.getAll(search);
      setPatients(res.data);
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await patientAPI.create(formData);
      toast.success('Patient registered successfully');
      setShowModal(false);
      setFormData({
        firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', phone: '', email: '',
        bloodGroup: '', address: { street: '', city: '', district: '', province: '' },
        emergencyContact: { name: '', phone: '', relationship: '' }, allergies: [], chronicConditions: []
      });
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register patient');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientAPI.delete(id);
        toast.success('Patient deleted');
        fetchPatients();
      } catch (error) {
        toast.error('Failed to delete patient');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading patients...</p>
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
            <h1 className="text-3xl font-bold text-white">Patients</h1>
            <p className="text-dark-300 mt-1">Manage patient registration and records</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Register Patient
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by name, MRN, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 pl-12 pr-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">MRN</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Blood Group</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-dark-400 font-medium">No patients found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-primary-400">{patient.mrn}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-white">{patient.firstName} {patient.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{patient.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{patient.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{patient.bloodGroup || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="px-3 py-1.5 text-xs font-semibold text-accent-400 bg-accent-500/10 border border-accent-500/20 rounded-lg hover:bg-accent-500/20 transition-colors"
                      >
                        Delete
                      </button>
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
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Register New Patient</h2>
                  <p className="text-sm text-dark-400 mt-1">Lincoln International Hospital</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
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
                <input type="date" placeholder="Date of Birth" required value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                  <option value="Male" className="bg-dark-800">Male</option>
                  <option value="Female" className="bg-dark-800">Female</option>
                  <option value="Other" className="bg-dark-800">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="tel" placeholder="Phone (10 digits)" required value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <input type="email" placeholder="Email (optional)" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <select value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                <option value="" className="bg-dark-800">Blood Group</option>
                <option value="A+" className="bg-dark-800">A+</option><option value="A-" className="bg-dark-800">A-</option>
                <option value="B+" className="bg-dark-800">B+</option><option value="B-" className="bg-dark-800">B-</option>
                <option value="AB+" className="bg-dark-800">AB+</option><option value="AB-" className="bg-dark-800">AB-</option>
                <option value="O+" className="bg-dark-800">O+</option><option value="O-" className="bg-dark-800">O-</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Street Address" value={formData.address.street}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <input type="text" placeholder="City" value={formData.address.city}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <div className="border-t border-dark-700/50 pt-4">
                <h3 className="font-semibold text-white mb-3">Emergency Contact</h3>
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
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;
