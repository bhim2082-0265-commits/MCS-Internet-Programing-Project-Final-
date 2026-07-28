import { useState, useEffect } from 'react';
import { medicalRecordAPI, patientAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  User,
  Stethoscope,
  Activity,
  Eye,
  Edit3,
  Trash2,
  X,
  Clock,
  Syringe,
  Thermometer,
  Heart,
  Weight,
  Ruler,
  AlertCircle,
  Filter,
  ChevronDown,
  Pill,
  ClipboardList,
  TrendingUp
} from 'lucide-react';

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [symptomInput, setSymptomInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const emptyFormData = {
    patientId: '',
    doctorName: '',
    department: '',
    visitDate: new Date().toISOString().split('T')[0],
    chiefComplaint: '',
    symptoms: [],
    diagnosis: '',
    treatmentPlan: '',
    progressNotes: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    followUpDate: '',
    vaccinations: []
  };

  const [formData, setFormData] = useState(emptyFormData);

  const [vaccinationData, setVaccinationData] = useState({
    vaccineName: '',
    date: new Date().toISOString().split('T')[0],
    batchNumber: '',
    nextDoseDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, [filterDoctor, filterDateFrom, filterDateTo]);

  const fetchRecords = async () => {
    try {
      const params = {};
      if (filterDoctor) params.doctor = filterDoctor;
      if (filterDateFrom) params.dateFrom = filterDateFrom;
      if (filterDateTo) params.dateTo = filterDateTo;
      const res = await medicalRecordAPI.getAll(params);
      setRecords(res.data);
    } catch (error) {
      toast.error('Failed to fetch medical records');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await medicalRecordAPI.update(editingRecord._id, formData);
        toast.success('Medical record updated successfully');
      } else {
        await medicalRecordAPI.create(formData);
        toast.success('Medical record created successfully');
      }
      setShowModal(false);
      setEditingRecord(null);
      setFormData(emptyFormData);
      setSymptomInput('');
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save medical record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      patientId: record.patientId?._id || '',
      doctorName: record.doctorName || '',
      department: record.department || '',
      visitDate: record.visitDate ? record.visitDate.split('T')[0] : '',
      chiefComplaint: record.chiefComplaint || '',
      symptoms: record.symptoms || [],
      diagnosis: record.diagnosis || '',
      treatmentPlan: record.treatmentPlan || '',
      progressNotes: record.progressNotes || '',
      vitals: {
        bloodPressure: record.vitals?.bloodPressure || '',
        heartRate: record.vitals?.heartRate || '',
        temperature: record.vitals?.temperature || '',
        weight: record.vitals?.weight || '',
        height: record.vitals?.height || ''
      },
      followUpDate: record.followUpDate ? record.followUpDate.split('T')[0] : '',
      vaccinations: record.vaccinations || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await medicalRecordAPI.delete(id);
      toast.success('Medical record deleted');
      setDeleteConfirm(null);
      fetchRecords();
    } catch (error) {
      toast.error('Failed to delete medical record');
    }
  };

  const addSymptom = () => {
    const trimmed = symptomInput.trim();
    if (trimmed && !formData.symptoms.includes(trimmed)) {
      setFormData({ ...formData, symptoms: [...formData.symptoms, trimmed] });
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom) => {
    setFormData({ ...formData, symptoms: formData.symptoms.filter(s => s !== symptom) });
  };

  const handleSymptomKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSymptom();
    }
  };

  const handleAddVaccination = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      await medicalRecordAPI.addVaccination(selectedRecord._id, vaccinationData);
      toast.success('Vaccination record added');
      setShowVaccinationModal(false);
      setVaccinationData({
        vaccineName: '',
        date: new Date().toISOString().split('T')[0],
        batchNumber: '',
        nextDoseDate: '',
        notes: ''
      });
      const res = await medicalRecordAPI.getById(selectedRecord._id);
      setSelectedRecord(res.data);
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add vaccination');
    }
  };

  const openDetailModal = async (record) => {
    try {
      const res = await medicalRecordAPI.getById(record._id);
      setSelectedRecord(res.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load record details');
    }
  };

  const openNewModal = () => {
    setEditingRecord(null);
    setFormData(emptyFormData);
    setSymptomInput('');
    setShowModal(true);
  };

  const filteredRecords = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.patientId?.firstName?.toLowerCase().includes(q) ||
      r.patientId?.lastName?.toLowerCase().includes(q) ||
      r.patientId?.mrn?.toLowerCase().includes(q) ||
      r.doctorName?.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q) ||
      r.chiefComplaint?.toLowerCase().includes(q)
    );
  });

  const totalRecords = records.length;
  const thisMonth = records.filter(r => {
    const d = new Date(r.visitDate || r.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const followUpsDue = records.filter(r => {
    if (!r.followUpDate) return false;
    const fu = new Date(r.followUpDate);
    const now = new Date();
    return fu >= now;
  }).length;

  const departments = [...new Set(doctors.map(d => d.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading medical records...</p>
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
            <h1 className="text-3xl font-bold text-white">Medical Records</h1>
            <p className="text-dark-300 mt-1">Manage patient medical history and clinical documentation</p>
          </div>
          <button
            onClick={openNewModal}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Record
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-dark-400 text-xs">Total Records</p>
            <p className="text-2xl font-bold text-white">{totalRecords}</p>
          </div>
        </div>
        <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-dark-400 text-xs">This Month</p>
            <p className="text-2xl font-bold text-white">{thisMonth}</p>
          </div>
        </div>
        <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-dark-400 text-xs">Follow-ups Due</p>
            <p className="text-2xl font-bold text-white">{followUpsDue}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search by patient, doctor, diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <select
          value={filterDoctor}
          onChange={(e) => setFilterDoctor(e.target.value)}
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        >
          <option value="" className="bg-dark-800">All Doctors</option>
          {doctors.map(d => (
            <option key={d._id} value={d.name} className="bg-dark-800">{d.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          placeholder="From Date"
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          placeholder="To Date"
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Visit Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Chief Complaint</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Diagnosis</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-dark-500" />
                      </div>
                      <p className="text-dark-400 font-medium">No medical records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {record.patientId?.firstName?.charAt(0)}{record.patientId?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-white">{record.patientId?.firstName} {record.patientId?.lastName}</span>
                          <p className="text-xs text-dark-500">{record.patientId?.mrn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{record.doctorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                      {record.visitDate ? new Date(record.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200 max-w-[200px] truncate">{record.chiefComplaint || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200 max-w-[200px] truncate">{record.diagnosis || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.followUpDate ? (
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Follow-up: {new Date(record.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-xs text-dark-400">No follow-up</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openDetailModal(record)}
                          className="p-2 text-dark-300 bg-dark-800/50 border border-dark-700/50 rounded-lg hover:bg-dark-700/50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-2 text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(record)}
                          className="p-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
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

      {/* ═══════════════ ADD/EDIT MODAL ═══════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent sticky top-0 z-10 bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{editingRecord ? 'Edit Medical Record' : 'New Medical Record'}</h2>
                  <p className="text-sm text-dark-400 mt-1">Lincoln International Hospital</p>
                </div>
                <button onClick={() => { setShowModal(false); setEditingRecord(null); setFormData(emptyFormData); setSymptomInput(''); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Patient & Doctor */}
              <div>
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" /> Patient & Doctor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Patient *</label>
                    <select required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                      <option value="" className="bg-dark-800">Select Patient</option>
                      {patients.map(p => (
                        <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Doctor Name *</label>
                    <input type="text" required placeholder="Dr. name" value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Department</label>
                    <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                      <option value="" className="bg-dark-800">Select Department</option>
                      {departments.map(d => (
                        <option key={d} value={d} className="bg-dark-800">{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Visit Date *</label>
                    <input type="date" required value={formData.visitDate}
                      onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  </div>
                </div>
              </div>

              {/* Clinical Information */}
              <div>
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> Clinical Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Chief Complaint *</label>
                    <input type="text" required placeholder="Primary reason for visit" value={formData.chiefComplaint}
                      onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Symptoms (press Enter to add)</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Type symptom and press Enter" value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        onKeyDown={handleSymptomKeyDown}
                        className="flex-1 px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                      <button type="button" onClick={addSymptom}
                        className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-700/50 transition-all">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {formData.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.symptoms.map((sym, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium rounded-full">
                            {sym}
                            <button type="button" onClick={() => removeSymptom(sym)} className="hover:text-white transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Diagnosis *</label>
                    <input type="text" required placeholder="Diagnosis" value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Treatment Plan</label>
                    <textarea placeholder="Describe the treatment plan..." value={formData.treatmentPlan}
                      onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" rows="3" />
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Progress Notes</label>
                    <textarea placeholder="Additional notes on patient progress..." value={formData.progressNotes}
                      onChange={(e) => setFormData({ ...formData, progressNotes: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" rows="3" />
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div>
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Vitals
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Blood Pressure</label>
                    <input type="text" placeholder="120/80" value={formData.vitals.bloodPressure}
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, bloodPressure: e.target.value } })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Heart Rate</label>
                    <input type="text" placeholder="bpm" value={formData.vitals.heartRate}
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, heartRate: e.target.value } })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Temperature</label>
                    <input type="text" placeholder="36.5°C" value={formData.vitals.temperature}
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, temperature: e.target.value } })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Weight (kg)</label>
                    <input type="text" placeholder="kg" value={formData.vitals.weight}
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, weight: e.target.value } })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Height (cm)</label>
                    <input type="text" placeholder="cm" value={formData.vitals.height}
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, height: e.target.value } })}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                  </div>
                </div>
              </div>

              {/* Follow-up */}
              <div>
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Follow-up
                </h3>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Follow-up Date</label>
                  <input type="date" value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full md:w-64 px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/50">
                <button type="button" onClick={() => { setShowModal(false); setEditingRecord(null); setFormData(emptyFormData); setSymptomInput(''); }}
                  className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">
                  {editingRecord ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ DETAIL MODAL ═══════════════ */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-primary-900/20 sticky top-0 z-10 bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Medical Record Detail</h2>
                  <p className="text-sm text-dark-400 mt-1">
                    {selectedRecord.patientId?.firstName} {selectedRecord.patientId?.lastName} — {selectedRecord.patientId?.mrn}
                  </p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">

              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Doctor</p>
                  <p className="text-sm font-semibold text-white">{selectedRecord.doctorName}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Department</p>
                  <p className="text-sm font-semibold text-white">{selectedRecord.department || '-'}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Visit Date</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedRecord.visitDate ? new Date(selectedRecord.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                  </p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Follow-up</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedRecord.followUpDate ? new Date(selectedRecord.followUpDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'None'}
                  </p>
                </div>
              </div>

              {/* Chief Complaint & Diagnosis */}
              <div className="space-y-4">
                <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-primary-400" />
                    <h4 className="text-sm font-semibold text-dark-300">Chief Complaint</h4>
                  </div>
                  <p className="text-white">{selectedRecord.chiefComplaint || '-'}</p>
                </div>

                {selectedRecord.symptoms && selectedRecord.symptoms.length > 0 && (
                  <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-4 h-4 text-primary-400" />
                      <h4 className="text-sm font-semibold text-dark-300">Symptoms</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.symptoms.map((sym, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium rounded-full">
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-green-400" />
                    <h4 className="text-sm font-semibold text-dark-300">Diagnosis</h4>
                  </div>
                  <p className="text-white">{selectedRecord.diagnosis || '-'}</p>
                </div>

                {selectedRecord.treatmentPlan && (
                  <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-dark-300">Treatment Plan</h4>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{selectedRecord.treatmentPlan}</p>
                  </div>
                )}

                {selectedRecord.progressNotes && (
                  <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                      <h4 className="text-sm font-semibold text-dark-300">Progress Notes</h4>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{selectedRecord.progressNotes}</p>
                  </div>
                )}
              </div>

              {/* Vitals */}
              {selectedRecord.vitals && Object.values(selectedRecord.vitals).some(v => v) && (
                <div>
                  <h4 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Recorded Vitals
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {selectedRecord.vitals.bloodPressure && (
                      <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30 text-center">
                        <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                        <p className="text-xs text-dark-400">Blood Pressure</p>
                        <p className="text-lg font-bold text-white">{selectedRecord.vitals.bloodPressure}</p>
                      </div>
                    )}
                    {selectedRecord.vitals.heartRate && (
                      <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30 text-center">
                        <Activity className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                        <p className="text-xs text-dark-400">Heart Rate</p>
                        <p className="text-lg font-bold text-white">{selectedRecord.vitals.heartRate}</p>
                      </div>
                    )}
                    {selectedRecord.vitals.temperature && (
                      <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30 text-center">
                        <Thermometer className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <p className="text-xs text-dark-400">Temperature</p>
                        <p className="text-lg font-bold text-white">{selectedRecord.vitals.temperature}</p>
                      </div>
                    )}
                    {selectedRecord.vitals.weight && (
                      <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30 text-center">
                        <Weight className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-xs text-dark-400">Weight</p>
                        <p className="text-lg font-bold text-white">{selectedRecord.vitals.weight} kg</p>
                      </div>
                    )}
                    {selectedRecord.vitals.height && (
                      <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30 text-center">
                        <Ruler className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <p className="text-xs text-dark-400">Height</p>
                        <p className="text-lg font-bold text-white">{selectedRecord.vitals.height} cm</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vaccinations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-2">
                    <Syringe className="w-4 h-4" /> Vaccinations
                  </h4>
                  <button
                    onClick={() => { setVaccinationData({ vaccineName: '', date: new Date().toISOString().split('T')[0], batchNumber: '', nextDoseDate: '', notes: '' }); setShowVaccinationModal(true); }}
                    className="px-4 py-2 text-sm font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Vaccination
                  </button>
                </div>
                {selectedRecord.vaccinations && selectedRecord.vaccinations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRecord.vaccinations.map((v, idx) => (
                      <div key={idx} className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                            <Syringe className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{v.vaccineName}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-dark-400">
                                {v.date ? new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                              </span>
                              {v.batchNumber && <span className="text-xs text-dark-500">Batch: {v.batchNumber}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {v.nextDoseDate && (
                            <p className="text-xs text-blue-400">Next: {new Date(v.nextDoseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          )}
                          {v.notes && <p className="text-xs text-dark-500 mt-1 max-w-[200px] truncate">{v.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-dark-800/30 rounded-xl p-6 text-center border border-dark-700/20">
                    <Syringe className="w-8 h-8 text-dark-500 mx-auto mb-2" />
                    <p className="text-sm text-dark-400">No vaccination records</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-dark-700/30">
                <button onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ADD VACCINATION MODAL ═══════════════ */}
      {showVaccinationModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Add Vaccination</h2>
                  <p className="text-sm text-dark-400 mt-1">{selectedRecord?.patientId?.firstName} {selectedRecord?.patientId?.lastName}</p>
                </div>
                <button onClick={() => setShowVaccinationModal(false)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddVaccination} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dark-400 mb-2 block">Vaccine Name *</label>
                <input type="text" required placeholder="e.g. COVID-19, Hepatitis B" value={vaccinationData.vaccineName}
                  onChange={(e) => setVaccinationData({ ...vaccinationData, vaccineName: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Date Given *</label>
                  <input type="date" required value={vaccinationData.date}
                    onChange={(e) => setVaccinationData({ ...vaccinationData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Batch Number</label>
                  <input type="text" placeholder="Batch #" value={vaccinationData.batchNumber}
                    onChange={(e) => setVaccinationData({ ...vaccinationData, batchNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400 mb-2 block">Next Dose Date</label>
                <input type="date" value={vaccinationData.nextDoseDate}
                  onChange={(e) => setVaccinationData({ ...vaccinationData, nextDoseDate: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <div>
                <label className="text-sm text-dark-400 mb-2 block">Notes</label>
                <textarea placeholder="Additional notes..." value={vaccinationData.notes}
                  onChange={(e) => setVaccinationData({ ...vaccinationData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" rows="2" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowVaccinationModal(false)}
                  className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">
                  Add Vaccination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ DELETE CONFIRMATION ═══════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Medical Record?</h3>
              <p className="text-sm text-dark-400 mb-6">
                This will permanently delete the record for <span className="text-white font-medium">{deleteConfirm.patientId?.firstName} {deleteConfirm.patientId?.lastName}</span> ({deleteConfirm.patientId?.mrn}). This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm._id)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30">
                  Delete Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicalRecords;