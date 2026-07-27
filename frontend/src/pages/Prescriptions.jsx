import { useState, useEffect } from 'react';
import { prescriptionAPI, patientAPI } from '../services/api';
import toast from 'react-hot-toast';

function Prescriptions({ user }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    doctorName: user?.name || '',
    nmcNumber: user?.nmcNumber || '',
    diagnosis: '',
    medications: [{ drugName: '', dosage: '', frequency: '', route: 'Oral', duration: '', instructions: '' }],
    notes: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [selectedPatient]);

  const fetchPrescriptions = async () => {
    try {
      const params = selectedPatient ? { patientId: selectedPatient } : {};
      const res = await prescriptionAPI.getAll(params);
      setPrescriptions(res.data);
    } catch (error) {
      toast.error('Failed to fetch prescriptions');
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

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { drugName: '', dosage: '', frequency: '', route: 'Oral', duration: '', instructions: '' }]
    });
  };

  const removeMedication = (index) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index)
    });
  };

  const updateMedication = (index, field, value) => {
    const updated = formData.medications.map((med, i) => i === index ? { ...med, [field]: value } : med);
    setFormData({ ...formData, medications: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await prescriptionAPI.create(formData);
      toast.success('Prescription added successfully');
      setShowModal(false);
      setFormData({
        patientId: '',
        doctorName: user?.name || '',
        nmcNumber: user?.nmcNumber || '',
        diagnosis: '',
        medications: [{ drugName: '', dosage: '', frequency: '', route: 'Oral', duration: '', instructions: '' }],
        notes: '',
        followUpDate: ''
      });
      fetchPrescriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add prescription');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const res = await prescriptionAPI.generatePDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading prescriptions...</p>
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
            <h1 className="text-3xl font-bold text-white">Prescriptions</h1>
            <p className="text-dark-300 mt-1">Manage patient prescriptions and medical records</p>
          </div>
          {user?.role !== 'receptionist' && (
            <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Prescription
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}
        className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
        <option value="" className="bg-dark-800">All Patients</option>
        {patients.map(p => (
          <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName}</option>
        ))}
      </select>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {prescriptions.length === 0 ? (
          <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-dark-400 font-medium">No prescriptions found</p>
            </div>
          </div>
        ) : (
          prescriptions.map((presc) => (
            <div key={presc._id} className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-6 hover:border-dark-600/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {presc.patientId?.firstName} {presc.patientId?.lastName}
                  </h3>
                  <p className="text-sm text-dark-400">Dr. {presc.doctorName} | NMC: {presc.nmcNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-dark-400">{new Date(presc.createdAt).toLocaleDateString()}</span>
                  <button onClick={() => handleDownloadPDF(presc._id)} className="px-4 py-2 text-sm font-semibold text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-dark-400 mb-1">Diagnosis:</p>
                <p className="text-white">{presc.diagnosis}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-dark-400 mb-2">Medications:</p>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30 space-y-2">
                  {presc.medications.map((med, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 text-xs font-bold">{idx + 1}</span>
                      <span className="font-semibold text-white">{med.drugName}</span>
                      <span className="text-dark-400">-</span>
                      <span className="text-dark-200">{med.dosage}</span>
                      <span className="text-dark-400">|</span>
                      <span className="text-dark-200">{med.frequency}</span>
                      <span className="text-dark-400">|</span>
                      <span className="text-dark-200">{med.route}</span>
                      <span className="text-dark-400">|</span>
                      <span className="text-dark-200">{med.duration}</span>
                      {med.instructions && <span className="text-dark-400 ml-2">({med.instructions})</span>}
                    </div>
                  ))}
                </div>
              </div>
              {presc.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-dark-400 mb-1">Notes:</p>
                  <p className="text-dark-200 text-sm">{presc.notes}</p>
                </div>
              )}
              {presc.followUpDate && (
                <div className="mt-3">
                  <span className="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-xs font-semibold rounded-full border border-primary-500/20">
                    Follow-up: {new Date(presc.followUpDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Add Prescription</h2>
                  <p className="text-sm text-dark-400 mt-1">Digital Rx Pad with NMC Compliance</p>
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
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Doctor Name" required value={formData.doctorName}
                  onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <input type="text" placeholder="NMC Number" required value={formData.nmcNumber}
                  onChange={(e) => setFormData({...formData, nmcNumber: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <textarea placeholder="Diagnosis" required value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" rows="2" />
              
              <div className="border-t border-dark-700/50 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-white">Medications</h3>
                  <button type="button" onClick={addMedication} className="text-primary-400 text-sm hover:text-primary-300 font-medium">+ Add Medication</button>
                </div>
                {formData.medications.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-3 mb-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700/30">
                    <input type="text" placeholder="Drug Name" required value={med.drugName}
                      onChange={(e) => updateMedication(idx, 'drugName', e.target.value)}
                      className="px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    <input type="text" placeholder="Dosage (e.g., 500mg)" required value={med.dosage}
                      onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                      className="px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    <input type="text" placeholder="Frequency (e.g., 1-0-1)" required value={med.frequency}
                      onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                      className="px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    <select value={med.route} onChange={(e) => updateMedication(idx, 'route', e.target.value)}
                      className="px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                      <option value="Oral" className="bg-dark-800">Oral</option><option value="IV" className="bg-dark-800">IV</option>
                      <option value="IM" className="bg-dark-800">IM</option><option value="Topical" className="bg-dark-800">Topical</option>
                      <option value="Inhalation" className="bg-dark-800">Inhalation</option><option value="Other" className="bg-dark-800">Other</option>
                    </select>
                    <input type="text" placeholder="Duration (e.g., 5 days)" required value={med.duration}
                      onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                      className="px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    <input type="text" placeholder="Instructions" value={med.instructions}
                      onChange={(e) => updateMedication(idx, 'instructions', e.target.value)}
                      className="px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    {formData.medications.length > 1 && (
                      <button type="button" onClick={() => removeMedication(idx)} className="text-accent-400 text-sm hover:text-accent-300 font-medium">Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <textarea placeholder="Doctor Notes (optional)" value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" rows="2" />
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Follow-up Date</label>
                  <input type="date" value={formData.followUpDate}
                    onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">Save Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prescriptions;
