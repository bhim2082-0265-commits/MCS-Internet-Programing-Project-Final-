import { useState, useEffect } from 'react';
import { insuranceAPI, patientAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Shield, ShieldCheck, ShieldX, Plus, Search, Edit3, Trash2, Eye, X, Filter, CreditCard, Calendar, Phone, Mail, FileText, User, ChevronDown } from 'lucide-react';

function Insurance() {
  const [policies, setPolicies] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    providerName: '',
    policyNumber: '',
    groupNumber: '',
    coverageType: 'Individual',
    coveragePercent: 80,
    maxCoverage: '',
    startDate: '',
    expiryDate: '',
    contactPhone: '',
    contactEmail: '',
    notes: ''
  });

  useEffect(() => {
    fetchPolicies();
    fetchPatients();
  }, [filterStatus]);

  const fetchPolicies = async () => {
    try {
      const res = await insuranceAPI.getAll({ status: filterStatus });
      setPolicies(res.data);
    } catch (error) {
      toast.error('Failed to fetch insurance policies');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await insuranceAPI.create(formData);
      toast.success('Insurance policy created successfully');
      setShowModal(false);
      resetForm();
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create insurance policy');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await insuranceAPI.update(selectedPolicy._id, formData);
      toast.success('Insurance policy updated successfully');
      setShowEditModal(false);
      setSelectedPolicy(null);
      resetForm();
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update insurance policy');
    }
  };

  const handleDelete = async () => {
    try {
      await insuranceAPI.delete(selectedPolicy._id);
      toast.success('Insurance policy deleted');
      setShowDeleteConfirm(false);
      setSelectedPolicy(null);
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to delete insurance policy');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      providerName: '',
      policyNumber: '',
      groupNumber: '',
      coverageType: 'Individual',
      coveragePercent: 80,
      maxCoverage: '',
      startDate: '',
      expiryDate: '',
      contactPhone: '',
      contactEmail: '',
      notes: ''
    });
  };

  const openEditModal = (policy) => {
    setSelectedPolicy(policy);
    setFormData({
      patientId: policy.patientId?._id || '',
      providerName: policy.providerName || '',
      policyNumber: policy.policyNumber || '',
      groupNumber: policy.groupNumber || '',
      coverageType: policy.coverageType || 'Individual',
      coveragePercent: policy.coveragePercent || 80,
      maxCoverage: policy.maxCoverage || '',
      startDate: policy.startDate ? policy.startDate.split('T')[0] : '',
      expiryDate: policy.expiryDate ? policy.expiryDate.split('T')[0] : '',
      contactPhone: policy.contactPhone || '',
      contactEmail: policy.contactEmail || '',
      notes: policy.notes || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = async (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Expired': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Cancelled': return 'bg-dark-500/20 text-dark-400 border border-dark-700/30';
      default: return 'bg-dark-500/20 text-dark-400 border border-dark-700/30';
    }
  };

  const filteredPolicies = policies.filter(policy => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      policy.patientId?.firstName?.toLowerCase().includes(search) ||
      policy.patientId?.lastName?.toLowerCase().includes(search) ||
      policy.patientId?.mrn?.toLowerCase().includes(search) ||
      policy.providerName?.toLowerCase().includes(search) ||
      policy.policyNumber?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: policies.length,
    active: policies.filter(p => p.status === 'Active').length,
    expired: policies.filter(p => p.status === 'Expired').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading insurance policies...</p>
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
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-400" />
              Insurance Management
            </h1>
            <p className="text-dark-300 mt-1">Manage patient insurance policies and coverage</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Policy
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center border border-primary-500/20">
            <Shield className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-dark-400 text-sm">Total Policies</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
        <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
            <ShieldCheck className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-dark-400 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          </div>
        </div>
        <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
            <ShieldX className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-dark-400 text-sm">Expired</p>
            <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input type="text" placeholder="Search by patient name, MRN, provider, or policy number..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-11 pr-10 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none">
            <option value="" className="bg-dark-800">All Status</option>
            <option value="Active" className="bg-dark-800">Active</option>
            <option value="Expired" className="bg-dark-800">Expired</option>
            <option value="Cancelled" className="bg-dark-800">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">MRN</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Policy #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Coverage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Max Coverage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center border border-dark-700/50">
                        <Shield className="w-8 h-8 text-dark-500" />
                      </div>
                      <p className="text-dark-400 font-medium">No insurance policies found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy._id} className="hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">{policy.patientId?.firstName} {policy.patientId?.lastName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-primary-400 font-semibold">{policy.patientId?.mrn}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{policy.providerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200 font-mono">{policy.policyNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-white">{policy.coveragePercent}%</span>
                      <span className="text-xs text-dark-500 ml-1">({policy.coverageType})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                      Rs. {Number(policy.maxCoverage).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-dark-400">
                      <div>{new Date(policy.startDate).toLocaleDateString()}</div>
                      <div className="text-dark-500">to {new Date(policy.expiryDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openViewModal(policy)} className="px-2.5 py-1.5 text-xs font-semibold text-dark-300 bg-dark-800/50 border border-dark-700/50 rounded-lg hover:bg-dark-700/50 transition-colors" title="View Details">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEditModal(policy)} className="px-2.5 py-1.5 text-xs font-semibold text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors" title="Edit">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setSelectedPolicy(policy); setShowDeleteConfirm(true); }} className="px-2.5 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-primary-900/20 to-dark-800/50 sticky top-0 z-10 bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-400" />
                    Add Insurance Policy
                  </h2>
                  <p className="text-sm text-dark-400 mt-1">Create a new insurance policy for a patient</p>
                </div>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Patient *
                  </label>
                  <select required value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="" className="bg-dark-800">Select Patient</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Insurance Provider *
                  </label>
                  <input type="text" required value={formData.providerName}
                    onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                    placeholder="e.g. Nepal Insurance, NLG Insurance"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Policy Number *
                  </label>
                  <input type="text" required value={formData.policyNumber}
                    onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
                    placeholder="e.g. NLG-2024-12345"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Group Number</label>
                  <input type="text" value={formData.groupNumber}
                    onChange={(e) => setFormData({...formData, groupNumber: e.target.value})}
                    placeholder="Optional group number"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Coverage Type *</label>
                  <select required value={formData.coverageType}
                    onChange={(e) => setFormData({...formData, coverageType: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="Individual" className="bg-dark-800">Individual</option>
                    <option value="Family" className="bg-dark-800">Family</option>
                    <option value="Group" className="bg-dark-800">Group</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Coverage Percentage (%) *</label>
                  <input type="number" required min="0" max="100" value={formData.coveragePercent}
                    onChange={(e) => setFormData({...formData, coveragePercent: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Max Coverage (Rs.) *</label>
                  <input type="number" required min="0" value={formData.maxCoverage}
                    onChange={(e) => setFormData({...formData, maxCoverage: e.target.value})}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date *
                  </label>
                  <input type="date" required value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expiry Date *
                  </label>
                  <input type="date" required value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Phone
                  </label>
                  <input type="tel" value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="Insurance provider phone"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Email
                  </label>
                  <input type="email" value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="insurance@provider.com"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </label>
                  <textarea value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes about this insurance policy..."
                    rows="3"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/50">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {showEditModal && selectedPolicy && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-primary-900/20 to-dark-800/50 sticky top-0 z-10 bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary-400" />
                    Edit Insurance Policy
                  </h2>
                  <p className="text-sm text-dark-400 mt-1">Update policy details for {selectedPolicy.patientId?.firstName} {selectedPolicy.patientId?.lastName}</p>
                </div>
                <button onClick={() => { setShowEditModal(false); setSelectedPolicy(null); resetForm(); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Patient *
                  </label>
                  <select required value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="" className="bg-dark-800">Select Patient</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Insurance Provider *
                  </label>
                  <input type="text" required value={formData.providerName}
                    onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                    placeholder="e.g. Nepal Insurance, NLG Insurance"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Policy Number *
                  </label>
                  <input type="text" required value={formData.policyNumber}
                    onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
                    placeholder="e.g. NLG-2024-12345"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Group Number</label>
                  <input type="text" value={formData.groupNumber}
                    onChange={(e) => setFormData({...formData, groupNumber: e.target.value})}
                    placeholder="Optional group number"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Coverage Type *</label>
                  <select required value={formData.coverageType}
                    onChange={(e) => setFormData({...formData, coverageType: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="Individual" className="bg-dark-800">Individual</option>
                    <option value="Family" className="bg-dark-800">Family</option>
                    <option value="Group" className="bg-dark-800">Group</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Coverage Percentage (%) *</label>
                  <input type="number" required min="0" max="100" value={formData.coveragePercent}
                    onChange={(e) => setFormData({...formData, coveragePercent: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Max Coverage (Rs.) *</label>
                  <input type="number" required min="0" value={formData.maxCoverage}
                    onChange={(e) => setFormData({...formData, maxCoverage: e.target.value})}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date *
                  </label>
                  <input type="date" required value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expiry Date *
                  </label>
                  <input type="date" required value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Phone
                  </label>
                  <input type="tel" value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="Insurance provider phone"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Email
                  </label>
                  <input type="email" value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="insurance@provider.com"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </label>
                  <textarea value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes about this insurance policy..."
                    rows="3"
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/50">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedPolicy(null); resetForm(); }} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30 flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Update Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Policy Modal */}
      {showViewModal && selectedPolicy && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-primary-900/20 to-dark-800/50 sticky top-0 z-10 bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary-400" />
                    Insurance Policy Details
                  </h2>
                  <p className="text-sm text-dark-400 mt-1">{selectedPolicy.patientId?.firstName} {selectedPolicy.patientId?.lastName}</p>
                </div>
                <button onClick={() => { setShowViewModal(false); setSelectedPolicy(null); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Patient & Provider Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Patient</p>
                  <p className="text-white font-semibold">{selectedPolicy.patientId?.firstName} {selectedPolicy.patientId?.lastName}</p>
                  <p className="text-primary-400 text-sm mt-0.5">MRN: {selectedPolicy.patientId?.mrn}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Provider</p>
                  <p className="text-white font-semibold">{selectedPolicy.providerName}</p>
                  <p className="text-dark-400 text-sm mt-0.5">Policy: {selectedPolicy.policyNumber}</p>
                </div>
              </div>

              {/* Coverage Details */}
              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-3">Coverage Details</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-dark-500 text-xs">Coverage %</p>
                    <p className="text-2xl font-bold text-white">{selectedPolicy.coveragePercent}%</p>
                  </div>
                  <div>
                    <p className="text-dark-500 text-xs">Max Coverage</p>
                    <p className="text-2xl font-bold text-primary-400">Rs. {Number(selectedPolicy.maxCoverage).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-dark-500 text-xs">Type</p>
                    <p className="text-lg font-semibold text-white">{selectedPolicy.coverageType}</p>
                  </div>
                </div>
              </div>

              {/* Dates & Status */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Start Date</p>
                  <p className="text-white font-medium">{new Date(selectedPolicy.startDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Expiry Date</p>
                  <p className="text-white font-medium">{new Date(selectedPolicy.expiryDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Status</p>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(selectedPolicy.status)}`}>
                    {selectedPolicy.status}
                  </span>
                </div>
              </div>

              {/* Contact & Group */}
              <div className="grid grid-cols-2 gap-4">
                {selectedPolicy.groupNumber && (
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                    <p className="text-xs text-dark-400 mb-1">Group Number</p>
                    <p className="text-white font-medium">{selectedPolicy.groupNumber}</p>
                  </div>
                )}
                {selectedPolicy.contactPhone && (
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                    <p className="text-xs text-dark-400 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Contact Phone</p>
                    <p className="text-white font-medium">{selectedPolicy.contactPhone}</p>
                  </div>
                )}
                {selectedPolicy.contactEmail && (
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                    <p className="text-xs text-dark-400 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Contact Email</p>
                    <p className="text-white font-medium">{selectedPolicy.contactEmail}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedPolicy.notes && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Notes</p>
                  <p className="text-dark-200 text-sm">{selectedPolicy.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/50">
                <button onClick={() => { setShowViewModal(false); setSelectedPolicy(null); }} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Close</button>
                <button onClick={() => { setShowViewModal(false); openEditModal(selectedPolicy); }} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30 flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Edit Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedPolicy && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete Insurance Policy</h3>
              <p className="text-dark-400 text-center mb-6">
                Are you sure you want to delete the insurance policy <span className="text-white font-semibold">{selectedPolicy.policyNumber}</span> for <span className="text-white font-semibold">{selectedPolicy.patientId?.firstName} {selectedPolicy.patientId?.lastName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setSelectedPolicy(null); }} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button onClick={handleDelete} className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30">Delete Policy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Insurance;
