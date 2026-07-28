import { useState, useEffect } from 'react';
import { labTestAPI, labReportAPI, patientAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Search, Plus, Trash2, Edit3, Eye, X, FlaskConical, FileText,
  Beaker, Droplets, Activity, ScanLine, ChevronDown, Clock,
  CheckCircle, XCircle, AlertCircle, Stethoscope, Microscope,
  HeartPulse, Radiation, TestTube, Syringe, BookOpen
} from 'lucide-react';

function Laboratory() {
  const [activeTab, setActiveTab] = useState('tests');
  const [labTests, setLabTests] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [testSearch, setTestSearch] = useState('');
  const [testCategoryFilter, setTestCategoryFilter] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('');

  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportDetailModal, setShowReportDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [testFormData, setTestFormData] = useState({
    testName: '', testCode: '', category: 'Blood', department: '',
    description: '', normalRange: '', unit: '', price: '', turnaroundTime: ''
  });

  const [reportFormData, setReportFormData] = useState({
    patientId: '', doctorName: '', department: '', tests: [],
    notes: ''
  });

  const [detailTests, setDetailTests] = useState([]);

  const testCategories = [
    'Blood', 'Urine', 'Stool', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound',
    'ECG', 'Echo', 'Endoscopy', 'Biopsy', 'Pathology', 'Microbiology',
    'Biochemistry', 'Hematology', 'Other'
  ];

  const reportStatuses = ['Pending', 'In-Progress', 'Completed', 'Cancelled'];

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (activeTab === 'tests') fetchLabTests();
    else fetchLabReports();
  }, [activeTab, testSearch, testCategoryFilter, reportSearch, reportStatusFilter]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchLabTests(), fetchLabReports(), fetchPatients()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabTests = async () => {
    try {
      const params = {};
      if (testSearch) params.search = testSearch;
      if (testCategoryFilter) params.category = testCategoryFilter;
      const res = await labTestAPI.getAll(params);
      setLabTests(res.data);
    } catch (error) {
      toast.error('Failed to fetch lab tests');
    }
  };

  const fetchLabReports = async () => {
    try {
      const params = {};
      if (reportSearch) params.search = reportSearch;
      if (reportStatusFilter) params.status = reportStatusFilter;
      const res = await labReportAPI.getAll(params);
      setLabReports(res.data);
    } catch (error) {
      toast.error('Failed to fetch lab reports');
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

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    const data = { ...testFormData, price: Number(testFormData.price) || 0 };
    try {
      if (editingTest) {
        await labTestAPI.update(editingTest._id, data);
        toast.success('Lab test updated successfully');
      } else {
        await labTestAPI.create(data);
        toast.success('Lab test added successfully');
      }
      setShowTestModal(false);
      setEditingTest(null);
      resetTestForm();
      fetchLabTests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save lab test');
    }
  };

  const handleTestEdit = (test) => {
    setEditingTest(test);
    setTestFormData({
      testName: test.testName || '', testCode: test.testCode || '',
      category: test.category || 'Blood', department: test.department || '',
      description: test.description || '', normalRange: test.normalRange || '',
      unit: test.unit || '', price: test.price || '', turnaroundTime: test.turnaroundTime || ''
    });
    setShowTestModal(true);
  };

  const handleTestDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab test?')) {
      try {
        await labTestAPI.delete(id);
        toast.success('Lab test deleted');
        fetchLabTests();
      } catch (error) {
        toast.error('Failed to delete lab test');
      }
    }
  };

  const resetTestForm = () => {
    setTestFormData({
      testName: '', testCode: '', category: 'Blood', department: '',
      description: '', normalRange: '', unit: '', price: '', turnaroundTime: ''
    });
  };

  const openAddTestModal = () => {
    setEditingTest(null);
    resetTestForm();
    setShowTestModal(true);
  };

  const addReportTest = () => {
    setReportFormData({
      ...reportFormData,
      tests: [...reportFormData.tests, {
        testId: '', testName: '', result: '', unit: '', normalRange: '', status: 'Pending'
      }]
    });
  };

  const removeReportTest = (index) => {
    if (reportFormData.tests.length <= 1) return;
    setReportFormData({
      ...reportFormData,
      tests: reportFormData.tests.filter((_, i) => i !== index)
    });
  };

  const updateReportTest = (index, field, value) => {
    const updated = reportFormData.tests.map((t, i) => {
      if (i === index) {
        const newTest = { ...t, [field]: value };
        if (field === 'testId') {
          const selectedTest = labTests.find(lt => lt._id === value);
          if (selectedTest) {
            newTest.testName = selectedTest.testName;
            newTest.unit = selectedTest.unit || '';
            newTest.normalRange = selectedTest.normalRange || '';
          }
        }
        return newTest;
      }
      return t;
    });
    setReportFormData({ ...reportFormData, tests: updated });
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (reportFormData.tests.length === 0) {
      toast.error('Add at least one test');
      return;
    }
    try {
      await labReportAPI.create(reportFormData);
      toast.success('Lab report created successfully');
      setShowReportModal(false);
      resetReportForm();
      fetchLabReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create lab report');
    }
  };

  const resetReportForm = () => {
    setReportFormData({ patientId: '', doctorName: '', department: '', tests: [], notes: '' });
  };

  const openReportDetail = (report) => {
    setSelectedReport(report);
    setDetailTests(report.tests ? [...report.tests] : []);
    setShowReportDetailModal(true);
  };

  const updateDetailTest = (index, field, value) => {
    setDetailTests(detailTests.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const handleReportUpdate = async () => {
    try {
      await labReportAPI.update(selectedReport._id, { tests: detailTests });
      toast.success('Report updated successfully');
      setShowReportDetailModal(false);
      setSelectedReport(null);
      fetchLabReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update report');
    }
  };

  const handleReportDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab report?')) {
      try {
        await labReportAPI.delete(id);
        toast.success('Lab report deleted');
        fetchLabReports();
      } catch (error) {
        toast.error('Failed to delete lab report');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'In-Progress': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'Completed': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'Cancelled': 'bg-dark-500/20 text-dark-400 border border-dark-500/30'
    };
    return colors[status] || 'bg-dark-500/20 text-dark-400 border border-dark-500/30';
  };

  const getCategoryBadge = (category) => {
    const colors = {
      Blood: 'bg-red-500/20 text-red-400 border-red-500/30',
      Urine: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Stool: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'X-Ray': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      MRI: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'CT Scan': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      Ultrasound: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      ECG: 'bg-green-500/20 text-green-400 border-green-500/30',
      Echo: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      Endoscopy: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      Biopsy: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      Pathology: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      Microbiology: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
      Biochemistry: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      Hematology: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    };
    return colors[category] || 'bg-dark-500/20 text-dark-400 border-dark-500/30';
  };

  const getCategoryIcon = (category) => {
    const iconClass = "w-4 h-4";
    switch (category) {
      case 'Blood': return <Droplets className={iconClass} />;
      case 'Urine': return <TestTube className={iconClass} />;
      case 'X-Ray': return <ScanLine className={iconClass} />;
      case 'MRI': return <Radiation className={iconClass} />;
      case 'CT Scan': return <Activity className={iconClass} />;
      case 'Ultrasound': return <HeartPulse className={iconClass} />;
      case 'ECG': return <Activity className={iconClass} />;
      case 'Echo': return <HeartPulse className={iconClass} />;
      case 'Endoscopy': return <Syringe className={iconClass} />;
      case 'Biopsy': return <Microscope className={iconClass} />;
      case 'Pathology': return <BookOpen className={iconClass} />;
      case 'Microbiology': return <Microscope className={iconClass} />;
      default: return <FlaskConical className={iconClass} />;
    }
  };

  const testStats = {
    total: labTests.length,
    blood: labTests.filter(t => t.category === 'Blood').length,
    imaging: labTests.filter(t => ['X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Echo'].includes(t.category)).length,
    other: labTests.filter(t => !['Blood', 'Urine', 'Stool', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Echo', 'Endoscopy', 'Biopsy', 'Pathology', 'Microbiology', 'Biochemistry', 'Hematology'].includes(t.category) || ['Endoscopy', 'Biopsy', 'Pathology', 'Microbiology', 'Biochemistry', 'Hematology', 'Urine', 'Stool', 'Other'].includes(t.category)).length
  };

  const reportStats = {
    total: labReports.length,
    pending: labReports.filter(r => r.status === 'Pending').length,
    inProgress: labReports.filter(r => r.status === 'In-Progress').length,
    completed: labReports.filter(r => r.status === 'Completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading laboratory...</p>
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
              <FlaskConical className="w-8 h-8 text-primary-400" />
              Laboratory
            </h1>
            <p className="text-dark-300 mt-1">Manage lab tests and diagnostic reports</p>
          </div>
          <button
            onClick={activeTab === 'tests' ? openAddTestModal : () => setShowReportModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'tests' ? 'Add Lab Test' : 'Create Report'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === 'tests' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-dark-800/50 text-dark-300 border border-dark-700/50 hover:bg-dark-700/50'}`}
        >
          <Beaker className="w-4 h-4" />
          Lab Tests
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-dark-800/50 text-dark-300 border border-dark-700/50 hover:bg-dark-700/50'}`}
        >
          <FileText className="w-4 h-4" />
          Lab Reports
        </button>
      </div>

      {/* ═══════════════ LAB TESTS TAB ═══════════════ */}
      {activeTab === 'tests' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-dark-400 text-xs">Total Tests</p>
              <p className="text-2xl font-bold text-white mt-1">{testStats.total}</p>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-red-500/20 p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-dark-400 text-xs">Blood Tests</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{testStats.blood}</p>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-dark-400 text-xs">Imaging</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{testStats.imaging}</p>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-500/20 p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-dark-500/20 rounded-xl flex items-center justify-center">
                <TestTube className="w-5 h-5 text-dark-400" />
              </div>
              <p className="text-dark-400 text-xs">Other</p>
              <p className="text-2xl font-bold text-dark-300 mt-1">{testStats.other}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search lab tests by name or code..."
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <select
              value={testCategoryFilter}
              onChange={(e) => setTestCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
            >
              <option value="" className="bg-dark-800">All Categories</option>
              {testCategories.map(cat => (
                <option key={cat} value={cat} className="bg-dark-800">{cat}</option>
              ))}
            </select>
          </div>

          {/* Lab Tests Table */}
          <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Test Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Turnaround</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/50">
                  {labTests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                            <FlaskConical className="w-8 h-8 text-dark-500" />
                          </div>
                          <p className="text-dark-400 font-medium">No lab tests found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    labTests.map((test, index) => (
                      <tr key={test._id} className="hover:bg-dark-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-dark-400">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                              {getCategoryIcon(test.category)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{test.testName}</div>
                              {test.department && <div className="text-xs text-dark-400 mt-0.5">{test.department}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-primary-400 font-mono">{test.testCode}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getCategoryBadge(test.category)}`}>
                            {test.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-dark-300">
                          {test.price > 0 ? `Rs. ${test.price.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-dark-300">
                            <Clock className="w-3.5 h-3.5 text-dark-400" />
                            {test.turnaroundTime || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${test.status === 'Active' || !test.status ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-dark-500/20 text-dark-400 border border-dark-500/30'}`}>
                            {test.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleTestEdit(test)}
                              className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTestDelete(test._id)}
                              className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
        </>
      )}

      {/* ═══════════════ LAB REPORTS TAB ═══════════════ */}
      {activeTab === 'reports' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-dark-400 text-xs">Total Reports</p>
              <p className="text-2xl font-bold text-white mt-1">{reportStats.total}</p>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-dark-400 text-xs">Pending</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{reportStats.pending}</p>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-dark-400 text-xs">In Progress</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{reportStats.inProgress}</p>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-green-500/20 p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-dark-400 text-xs">Completed</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{reportStats.completed}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search reports by patient or doctor..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <select
              value={reportStatusFilter}
              onChange={(e) => setReportStatusFilter(e.target.value)}
              className="px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
            >
              <option value="" className="bg-dark-800">All Status</option>
              {reportStatuses.map(s => (
                <option key={s} value={s} className="bg-dark-800">{s}</option>
              ))}
            </select>
          </div>

          {/* Lab Reports Table */}
          <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Report #</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Tests</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/50">
                  {labReports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                            <FileText className="w-8 h-8 text-dark-500" />
                          </div>
                          <p className="text-dark-400 font-medium">No lab reports found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    labReports.map((report) => (
                      <tr key={report._id} className="hover:bg-dark-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-primary-400">{report.reportNumber || report._id?.slice(-6).toUpperCase()}</span>
                          <p className="text-xs text-dark-500 mt-0.5">RPT-{report._id?.slice(-6).toUpperCase()}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {report.patientId?.firstName?.charAt(0)}{report.patientId?.lastName?.charAt(0)}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-white">{report.patientId?.firstName} {report.patientId?.lastName}</span>
                              <p className="text-xs text-dark-500">{report.patientId?.mrn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                          {report.doctorName ? `Dr. ${report.doctorName}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg text-xs font-semibold">
                            {report.tests?.length || 0} test{(report.tests?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                          {report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-NP') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openReportDetail(report)}
                              className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReportDelete(report._id)}
                              className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
        </>
      )}

      {/* ═══════════════ ADD/EDIT LAB TEST MODAL ═══════════════ */}
      {showTestModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent sticky top-0 z-10 bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{editingTest ? 'Edit Lab Test' : 'Add Lab Test'}</h2>
                  <p className="text-sm text-dark-400 mt-1">Configure test details and pricing</p>
                </div>
                <button onClick={() => { setShowTestModal(false); setEditingTest(null); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleTestSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Test Name *</label>
                  <input
                    type="text" required
                    value={testFormData.testName}
                    onChange={(e) => setTestFormData({ ...testFormData, testName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="e.g. Complete Blood Count"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Test Code *</label>
                  <input
                    type="text" required
                    value={testFormData.testCode}
                    onChange={(e) => setTestFormData({ ...testFormData, testCode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all font-mono"
                    placeholder="e.g. CBC001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Category *</label>
                  <select
                    value={testFormData.category}
                    onChange={(e) => setTestFormData({ ...testFormData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                  >
                    {testCategories.map(cat => (
                      <option key={cat} value={cat} className="bg-dark-800">{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Department</label>
                  <input
                    type="text"
                    value={testFormData.department}
                    onChange={(e) => setTestFormData({ ...testFormData, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="e.g. Pathology"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
                <textarea
                  value={testFormData.description}
                  onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all resize-none"
                  placeholder="Brief description of the test"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Normal Range</label>
                  <input
                    type="text"
                    value={testFormData.normalRange}
                    onChange={(e) => setTestFormData({ ...testFormData, normalRange: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="e.g. 4.5-5.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Unit</label>
                  <input
                    type="text"
                    value={testFormData.unit}
                    onChange={(e) => setTestFormData({ ...testFormData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="e.g. g/dL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Price (Rs.)</label>
                  <input
                    type="number" min="0"
                    value={testFormData.price}
                    onChange={(e) => setTestFormData({ ...testFormData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Turnaround Time</label>
                <input
                  type="text"
                  value={testFormData.turnaroundTime}
                  onChange={(e) => setTestFormData({ ...testFormData, turnaroundTime: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                  placeholder="e.g. 2-4 hours"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-dark-700/50">
                <button
                  type="button"
                  onClick={() => { setShowTestModal(false); setEditingTest(null); }}
                  className="flex-1 px-4 py-2.5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/30 rounded-xl text-dark-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
                >
                  {editingTest ? 'Update Test' : 'Add Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ CREATE LAB REPORT MODAL ═══════════════ */}
      {showReportModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent sticky top-0 z-10 bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Create Lab Report</h2>
                  <p className="text-sm text-dark-400 mt-1">Assign tests and enter diagnostic results</p>
                </div>
                <button onClick={() => { setShowReportModal(false); resetReportForm(); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Patient *</label>
                  <select
                    required
                    value={reportFormData.patientId}
                    onChange={(e) => setReportFormData({ ...reportFormData, patientId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                  >
                    <option value="" className="bg-dark-800">Select Patient</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Doctor Name</label>
                  <input
                    type="text"
                    value={reportFormData.doctorName}
                    onChange={(e) => setReportFormData({ ...reportFormData, doctorName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="Dr. name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Department</label>
                <input
                  type="text"
                  value={reportFormData.department}
                  onChange={(e) => setReportFormData({ ...reportFormData, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                  placeholder="e.g. Pathology"
                />
              </div>

              {/* Tests Section */}
              <div className="border-t border-dark-700/50 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <TestTube className="w-4 h-4 text-primary-400" />
                    Test Results ({reportFormData.tests.length})
                  </h3>
                  <button type="button" onClick={addReportTest} className="px-4 py-2 text-sm font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add Test
                  </button>
                </div>
                {reportFormData.tests.length === 0 ? (
                  <div className="bg-dark-800/30 border border-dashed border-dark-700/50 rounded-xl p-8 text-center">
                    <TestTube className="w-8 h-8 text-dark-500 mx-auto mb-2" />
                    <p className="text-dark-400 text-sm">No tests added. Click "Add Test" to begin.</p>
                  </div>
                ) : (
                  reportFormData.tests.map((test, idx) => (
                    <div key={idx} className="bg-dark-800/50 border border-dark-700/30 rounded-xl p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Test #{idx + 1}</span>
                        {reportFormData.tests.length > 1 && (
                          <button type="button" onClick={() => removeReportTest(idx)} className="text-red-400 hover:text-red-300 p-1">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-dark-400 mb-1">Select Test *</label>
                          <select
                            required
                            value={test.testId}
                            onChange={(e) => updateReportTest(idx, 'testId', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          >
                            <option value="" className="bg-dark-800">Choose test</option>
                            {labTests.map(lt => (
                              <option key={lt._id} value={lt._id} className="bg-dark-800">{lt.testName} ({lt.testCode})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-dark-400 mb-1">Test Name</label>
                          <input
                            type="text"
                            value={test.testName}
                            readOnly
                            className="w-full px-3 py-2 bg-dark-700/30 border border-dark-600/30 rounded-lg text-sm text-dark-300 cursor-not-allowed"
                            placeholder="Auto-filled"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-dark-400 mb-1">Result *</label>
                          <input
                            type="text" required
                            value={test.result}
                            onChange={(e) => updateReportTest(idx, 'result', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            placeholder="e.g. 12.5"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-dark-400 mb-1">Unit</label>
                          <input
                            type="text"
                            value={test.unit}
                            onChange={(e) => updateReportTest(idx, 'unit', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            placeholder="g/dL"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-dark-400 mb-1">Normal Range</label>
                          <input
                            type="text"
                            value={test.normalRange}
                            onChange={(e) => updateReportTest(idx, 'normalRange', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            placeholder="4.5-5.5"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-dark-400 mb-1">Status</label>
                          <select
                            value={test.status}
                            onChange={(e) => updateReportTest(idx, 'status', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          >
                            {reportStatuses.map(s => (
                              <option key={s} value={s} className="bg-dark-800">{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Notes</label>
                <textarea
                  value={reportFormData.notes}
                  onChange={(e) => setReportFormData({ ...reportFormData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all resize-none"
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-700/50">
                <button
                  type="button"
                  onClick={() => { setShowReportModal(false); resetReportForm(); }}
                  className="flex-1 px-4 py-2.5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/30 rounded-xl text-dark-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
                >
                  Create Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ REPORT DETAIL MODAL ═══════════════ */}
      {showReportDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent sticky top-0 z-10 bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Lab Report Details</h2>
                  <p className="text-sm text-dark-400 mt-1">
                    RPT-{selectedReport._id?.slice(-6).toUpperCase()} | {selectedReport.patientId?.firstName} {selectedReport.patientId?.lastName}
                  </p>
                </div>
                <button onClick={() => { setShowReportDetailModal(false); setSelectedReport(null); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Report Info */}
              <div className="grid grid-cols-3 gap-4 bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <div>
                  <p className="text-xs text-dark-400">Doctor</p>
                  <p className="text-sm text-white font-medium">{selectedReport.doctorName ? `Dr. ${selectedReport.doctorName}` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400">Department</p>
                  <p className="text-sm text-white font-medium">{selectedReport.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400">Status</p>
                  <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Tests */}
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-primary-400" />
                  Test Results ({detailTests.length})
                </h3>
                <div className="space-y-3">
                  {detailTests.map((test, idx) => (
                    <div key={idx} className="bg-dark-800/50 border border-dark-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{test.testName}</span>
                          {test.testId && (
                            <span className="text-xs text-dark-500 font-mono">({typeof test.testId === 'object' ? test.testId?.testCode : ''})</span>
                          )}
                        </div>
                        <select
                          value={test.status}
                          onChange={(e) => updateDetailTest(idx, 'status', e.target.value)}
                          className="px-3 py-1.5 bg-dark-700/50 border border-dark-600/50 rounded-lg text-xs text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
                        >
                          {reportStatuses.map(s => (
                            <option key={s} value={s} className="bg-dark-800">{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-dark-400 mb-1">Result</label>
                          <input
                            type="text"
                            value={test.result}
                            onChange={(e) => updateDetailTest(idx, 'result', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            placeholder="Enter result"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-dark-400 mb-1">Unit</label>
                          <input
                            type="text"
                            value={test.unit}
                            onChange={(e) => updateDetailTest(idx, 'unit', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-dark-400 mb-1">Normal Range</label>
                          <input
                            type="text"
                            value={test.normalRange}
                            onChange={(e) => updateDetailTest(idx, 'normalRange', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          />
                        </div>
                        <div className="flex items-end">
                          <span className={`px-3 py-2 rounded-lg text-xs font-semibold w-full text-center ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedReport.notes && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Notes</p>
                  <p className="text-sm text-dark-200">{selectedReport.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-dark-700/50">
                <button
                  type="button"
                  onClick={() => { setShowReportDetailModal(false); setSelectedReport(null); }}
                  className="flex-1 px-4 py-2.5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/30 rounded-xl text-dark-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportUpdate}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
                >
                  Update Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Laboratory;
