import { useState, useEffect } from 'react';
import { invoiceAPI, patientAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

function Billing({ user }) {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [patientSearchId, setPatientSearchId] = useState('');
  const [patientBills, setPatientBills] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorName: '',
    doctorDepartment: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0, isTaxable: true, category: 'Consultation' }],
    taxRate: 13,
    panNumber: '601234567',
    discount: 0,
    notes: ''
  });

  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payTxnId, setPayTxnId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [splitMode, setSplitMode] = useState(false);
  const [splitPayments, setSplitPayments] = useState([{ method: 'Cash', amount: '', transactionId: '' }]);
  const [processing, setProcessing] = useState(false);
  const [justPaid, setJustPaid] = useState(false);

  const [adjustAction, setAdjustAction] = useState('apply_discount');
  const [adjustDiscount, setAdjustDiscount] = useState(0);
  const [adjustTaxRate, setAdjustTaxRate] = useState(13);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustItem, setAdjustItem] = useState({ description: '', quantity: 1, unitPrice: 0, isTaxable: true, category: 'Consultation' });
  const [adjustItemIndex, setAdjustItemIndex] = useState(0);

  const categories = ['Consultation', 'Lab Test', 'Procedure', 'Medication', 'Room', 'Other'];
  const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'eSewa', 'Khalti', 'ConnectIPS', 'Other'];
  const methodColors = {
    'Cash': '#059669', 'Card': '#2563eb', 'Bank Transfer': '#7c3aed',
    'eSewa': '#059669', 'Khalti': '#2563eb', 'ConnectIPS': '#7c3aed', 'Other': '#64748b'
  };

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
    fetchDoctors();
  }, [filterStatus]);

  const fetchInvoices = async () => {
    try {
      const res = await invoiceAPI.getAll({ status: filterStatus });
      setInvoices(res.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
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

  const fetchDoctors = async () => {
    try {
      const res = await authAPI.getDoctors();
      setDoctors(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPatientBills = async (patientId) => {
    if (!patientId) { setPatientBills(null); return; }
    try {
      const res = await invoiceAPI.getPatientBills(patientId);
      setPatientBills(res.data);
    } catch (error) {
      toast.error('Failed to fetch patient bills');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0, isTaxable: true, category: 'Other' }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const updated = formData.items.map((item, i) => {
      if (i === index) {
        const newItem = { ...item, [field]: value };
        newItem.total = newItem.quantity * newItem.unitPrice;
        return newItem;
      }
      return item;
    });
    setFormData({ ...formData, items: updated });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxableAmount = formData.items.filter(item => item.isTaxable).reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (taxableAmount * formData.taxRate) / 100;
    const total = subtotal + taxAmount - formData.discount;
    return { subtotal, taxableAmount, taxAmount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await invoiceAPI.create(formData);
      toast.success('Invoice created successfully');
      setShowModal(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);
    try {
      let payload;
      if (splitMode) {
        const totalSplit = splitPayments.reduce((s, sp) => s + (parseFloat(sp.amount) || 0), 0);
        if (totalSplit <= 0) {
          toast.error('Enter at least one split payment amount');
          setProcessing(false);
          return;
        }
        const remaining = selectedInvoice.totalAmount - selectedInvoice.amountPaid;
        if (totalSplit > remaining + 0.01) {
          toast.error(`Split total (Rs. ${totalSplit.toLocaleString()}) exceeds balance (Rs. ${remaining.toLocaleString()})`);
          setProcessing(false);
          return;
        }
        const primary = splitPayments.find(sp => parseFloat(sp.amount) > 0);
        payload = {
          amount: totalSplit,
          method: primary.method,
          transactionId: primary.transactionId || '',
          notes: payNotes,
          splitPayments: splitPayments.filter(sp => parseFloat(sp.amount) > 0).map(sp => ({
            method: sp.method,
            amount: parseFloat(sp.amount),
            transactionId: sp.transactionId || ''
          }))
        };
      } else {
        const amt = parseFloat(payAmount);
        if (!amt || amt <= 0) {
          toast.error('Enter a valid amount');
          setProcessing(false);
          return;
        }
        const remaining = selectedInvoice.totalAmount - selectedInvoice.amountPaid;
        if (amt > remaining + 0.01) {
          toast.error(`Amount (Rs. ${amt.toLocaleString()}) exceeds balance (Rs. ${remaining.toLocaleString()})`);
          setProcessing(false);
          return;
        }
        payload = {
          amount: amt,
          method: payMethod,
          transactionId: payTxnId,
          notes: payNotes
        };
      }

      await invoiceAPI.addPayment(selectedInvoice._id, payload);
      const newPaid = selectedInvoice.amountPaid + payload.amount;
      const isFull = newPaid >= selectedInvoice.totalAmount;

      if (isFull) {
        setJustPaid(true);
        toast.success('Invoice fully paid! Generating receipt...');
        setTimeout(async () => {
          try {
            const res = await invoiceAPI.generatePDF(selectedInvoice._id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${selectedInvoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
          } catch (e) {}
        }, 500);
      } else {
        toast.success(`Payment of Rs. ${payload.amount.toLocaleString()} recorded`);
      }

      setShowPayModal(false);
      setSelectedInvoice(null);
      resetPayForm();
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const res = await invoiceAPI.generatePDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await invoiceAPI.delete(id);
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorName: '',
      doctorDepartment: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0, isTaxable: true, category: 'Consultation' }],
      taxRate: 13,
      panNumber: '601234567',
      discount: 0,
      notes: ''
    });
  };

  const resetPayForm = () => {
    setPayAmount('');
    setPayMethod('Cash');
    setPayTxnId('');
    setPayNotes('');
    setSplitMode(false);
    setSplitPayments([{ method: 'Cash', amount: '', transactionId: '' }]);
    setJustPaid(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'Pending': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'Partial': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      'Cancelled': 'bg-accent-500/20 text-accent-400 border border-accent-500/30',
      'Refunded': 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    };
    return colors[status] || 'bg-dark-500/20 text-dark-400 border border-dark-500/30';
  };

  const openPayModal = (invoice) => {
    setSelectedInvoice(invoice);
    const remaining = invoice.totalAmount - invoice.amountPaid;
    setPayAmount(remaining.toString());
    setPayMethod('Cash');
    setPayTxnId('');
    setPayNotes('');
    setSplitMode(false);
    setSplitPayments([{ method: 'Cash', amount: '', transactionId: '' }]);
    setJustPaid(false);
    setShowPayModal(true);
  };

  const openDetailModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const addSplitRow = () => {
    setSplitPayments([...splitPayments, { method: 'Cash', amount: '', transactionId: '' }]);
  };

  const removeSplitRow = (idx) => {
    if (splitPayments.length <= 1) return;
    setSplitPayments(splitPayments.filter((_, i) => i !== idx));
  };

  const updateSplitRow = (idx, field, value) => {
    setSplitPayments(splitPayments.map((sp, i) => i === idx ? { ...sp, [field]: value } : sp));
  };

  const getSplitTotal = () => splitPayments.reduce((s, sp) => s + (parseFloat(sp.amount) || 0), 0);

  const openAdjustModal = (invoice) => {
    setSelectedInvoice(invoice);
    setAdjustAction('apply_discount');
    setAdjustDiscount(invoice.discount || 0);
    setAdjustTaxRate(invoice.taxRate || 13);
    setAdjustNotes(invoice.notes || '');
    setAdjustItem({ description: '', quantity: 1, unitPrice: 0, isTaxable: true, category: 'Consultation' });
    setAdjustItemIndex(0);
    setShowAdjustModal(true);
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      let data = {};
      switch (adjustAction) {
        case 'apply_discount':
          data = { action: 'apply_discount', discount: parseFloat(adjustDiscount) || 0 };
          break;
        case 'update_tax':
          data = { action: 'update_tax', taxRate: parseFloat(adjustTaxRate) || 13 };
          break;
        case 'update_notes':
          data = { action: 'update_notes', notes: adjustNotes };
          break;
        case 'add_item':
          data = { action: 'add_item', item: { ...adjustItem, total: adjustItem.quantity * adjustItem.unitPrice } };
          break;
        case 'remove_item':
          data = { action: 'remove_item', itemIndex: parseInt(adjustItemIndex) };
          break;
        default:
          return;
      }
      await invoiceAPI.adjust(selectedInvoice._id, data);
      toast.success('Invoice adjusted successfully');
      setShowAdjustModal(false);
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adjust invoice');
    }
  };

  const totals = calculateTotals();

  const filteredInvoices = invoices.filter(inv => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber?.toLowerCase().includes(search) ||
      inv.patientId?.firstName?.toLowerCase().includes(search) ||
      inv.patientId?.lastName?.toLowerCase().includes(search) ||
      inv.patientId?.mrn?.toLowerCase().includes(search) ||
      inv.patientId?.phone?.toLowerCase().includes(search) ||
      inv.patientId?.email?.toLowerCase().includes(search)
    );
  });

  const summaryStats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'Paid').length,
    pending: invoices.filter(i => i.status === 'Pending').length,
    partial: invoices.filter(i => i.status === 'Partial').length,
    totalRevenue: invoices.reduce((sum, i) => sum + i.amountPaid, 0),
    totalOutstanding: invoices.reduce((sum, i) => sum + Math.max(0, i.totalAmount - i.amountPaid), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading invoices...</p>
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
            <h1 className="text-3xl font-bold text-white">Billing & Invoices</h1>
            <p className="text-dark-300 mt-1">Manage hospital billing in Nepalese Rupees (NPR) | PAN: 601234567</p>
          </div>
          <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-dark-900/50 rounded-xl border border-dark-700/50 p-4 text-center">
          <p className="text-dark-400 text-xs">Total Invoices</p>
          <p className="text-2xl font-bold text-white mt-1">{summaryStats.total}</p>
        </div>
        <div className="bg-dark-900/50 rounded-xl border border-green-500/20 p-4 text-center">
          <p className="text-dark-400 text-xs">Paid</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{summaryStats.paid}</p>
        </div>
        <div className="bg-dark-900/50 rounded-xl border border-yellow-500/20 p-4 text-center">
          <p className="text-dark-400 text-xs">Pending</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{summaryStats.pending}</p>
        </div>
        <div className="bg-dark-900/50 rounded-xl border border-orange-500/20 p-4 text-center">
          <p className="text-dark-400 text-xs">Partial</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{summaryStats.partial}</p>
        </div>
        <div className="bg-dark-900/50 rounded-xl border border-primary-500/20 p-4 text-center">
          <p className="text-dark-400 text-xs">Collected (Rs.)</p>
          <p className="text-lg font-bold text-primary-400 mt-1">Rs. {summaryStats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-dark-900/50 rounded-xl border border-accent-500/20 p-4 text-center">
          <p className="text-dark-400 text-xs">Outstanding (Rs.)</p>
          <p className="text-lg font-bold text-accent-400 mt-1">Rs. {summaryStats.totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2">
          <button onClick={() => { setActiveTab('all'); setPatientBills(null); setPatientSearchId(''); }}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'all' ? 'bg-primary-600 text-white' : 'bg-dark-800/50 text-dark-300 border border-dark-700/50 hover:bg-dark-700/50'}`}>
            All Bills
          </button>
          <button onClick={() => setActiveTab('patient')}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'patient' ? 'bg-primary-600 text-white' : 'bg-dark-800/50 text-dark-300 border border-dark-700/50 hover:bg-dark-700/50'}`}>
            Patient Bills
          </button>
        </div>
        {activeTab === 'all' ? (
          <>
            <input type="text" placeholder="Search by invoice #, patient name, MRN, or phone number..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
              <option value="" className="bg-dark-800">All Status</option>
              <option value="Pending" className="bg-dark-800">Pending</option>
              <option value="Partial" className="bg-dark-800">Partial</option>
              <option value="Paid" className="bg-dark-800">Paid</option>
              <option value="Cancelled" className="bg-dark-800">Cancelled</option>
            </select>
          </>
        ) : (
          <select value={patientSearchId} onChange={(e) => { setPatientSearchId(e.target.value); fetchPatientBills(e.target.value); }}
            className="flex-1 px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
            <option value="" className="bg-dark-800">Select Patient to view bills</option>
            {patients.map(p => (
              <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn})</option>
            ))}
          </select>
        )}
      </div>

      {/* ═══════════════ PATIENT BILLS VIEW ═══════════════ */}
      {activeTab === 'patient' && patientBills && (
        <div className="space-y-4">
          {patientBills.pending.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                Pending Bills ({patientBills.pending.length})
              </h3>
              <div className="space-y-3">
                {patientBills.pending.map(inv => {
                  const balance = inv.totalAmount - inv.amountPaid;
                  return (
                    <div key={inv._id} className="flex items-center justify-between bg-dark-900/50 border border-dark-700/30 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm font-semibold text-primary-400">{inv.invoiceNumber}</span>
                          <p className="text-xs text-dark-400 mt-0.5">{inv.doctorName} — {inv.doctorDepartment}</p>
                          <p className="text-xs text-dark-500">{new Date(inv.createdAt).toLocaleDateString('en-NP')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">Rs. {inv.totalAmount.toLocaleString()}</p>
                          <p className="text-xs text-amber-400">Balance: Rs. {balance.toLocaleString()}</p>
                        </div>
                        {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                          <button onClick={() => openPayModal(inv)} className="px-3 py-2 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors">
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {patientBills.all.length > 0 && (
            <div className="bg-dark-900/50 border border-dark-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">All Invoices ({patientBills.all.length})</h3>
              <div className="space-y-3">
                {patientBills.all.map(inv => {
                  const balance = inv.totalAmount - inv.amountPaid;
                  const pct = inv.totalAmount > 0 ? Math.min(Math.round((inv.amountPaid / inv.totalAmount) * 100), 100) : 0;
                  return (
                    <div key={inv._id} className="flex items-center justify-between bg-dark-800/50 border border-dark-700/30 rounded-xl p-4">
                      <div>
                        <span className="text-sm font-semibold text-primary-400">{inv.invoiceNumber}</span>
                        <p className="text-xs text-dark-400 mt-0.5">{inv.doctorName} — Rs. {inv.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <div className="bg-dark-700/50 rounded-full h-2 overflow-hidden">
                            <div className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[10px] text-dark-400 mt-1">{pct}% paid</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          inv.status === 'Paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          inv.status === 'Partial' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {patientBills.all.length === 0 && (
            <div className="bg-dark-900/50 border border-dark-700/50 rounded-2xl p-12 text-center">
              <p className="text-dark-400 text-lg">No invoices found for this patient</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ALL BILLS TABLE ═══════════════ */}
      {activeTab === 'all' && (
      <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Total (NPR)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                      </div>
                      <p className="text-dark-400 font-medium">No invoices found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const pct = inv.totalAmount > 0 ? Math.min(Math.round((inv.amountPaid / inv.totalAmount) * 100), 100) : 0;
                  const balance = Math.max(0, inv.totalAmount - inv.amountPaid);
                  return (
                    <tr key={inv._id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-primary-400">{inv.invoiceNumber}</span>
                        <p className="text-xs text-dark-500 mt-0.5">{new Date(inv.createdAt).toLocaleDateString('en-NP')}</p>
                        {inv.appointmentId && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                            AUTO-GENERATED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">{inv.patientId?.firstName} {inv.patientId?.lastName}</span>
                        <p className="text-xs text-dark-500 mt-0.5">{inv.patientId?.mrn}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                        {inv.doctorName ? `Dr. ${inv.doctorName}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-white">Rs. {inv.totalAmount?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${pct >= 100 ? 'text-green-400' : pct > 0 ? 'text-yellow-400' : 'text-dark-400'}`}>
                          Rs. {inv.amountPaid?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-24">
                          <div className="bg-dark-700/50 rounded-full h-2 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct > 50 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[10px] text-dark-400 mt-1">{pct}%{balance > 0 ? ` (Rs. ${balance.toLocaleString()} left)` : ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                        {inv.payments?.length > 0 && (
                          <p className="text-[10px] text-dark-500 mt-1">{inv.payments.length} payment{inv.payments.length !== 1 ? 's' : ''}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openDetailModal(inv)} className="px-2.5 py-1.5 text-xs font-semibold text-dark-300 bg-dark-800/50 border border-dark-700/50 rounded-lg hover:bg-dark-700/50 transition-colors" title="View Details">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => handleDownloadPDF(inv._id)} className="px-2.5 py-1.5 text-xs font-semibold text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors" title="Download PDF">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </button>
                          {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                            <button onClick={() => openPayModal(inv)} className="px-2.5 py-1.5 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors" title="Add Payment">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </button>
                          )}
                          {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                            <button onClick={() => openAdjustModal(inv)} className="px-2.5 py-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors" title="Adjust Invoice">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            </button>
                          )}
                          {user?.role === 'admin' && (
                            <button onClick={() => handleDelete(inv._id)} className="px-2.5 py-1.5 text-xs font-semibold text-accent-400 bg-accent-500/10 border border-accent-500/20 rounded-lg hover:bg-accent-500/20 transition-colors" title="Delete">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ═══════════════ CREATE INVOICE MODAL ═══════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent sticky top-0 z-10 bg-dark-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Create Tax Invoice</h2>
                  <p className="text-sm text-dark-400 mt-1">PAN: 601234567 | 13% VAT as per Nepal IRD</p>
                </div>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Patient *</label>
                  <select required value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="" className="bg-dark-800">Select Patient</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Doctor</label>
                  <select value={formData.doctorName} onChange={(e) => {
                    const doc = doctors.find(d => d.name === e.target.value);
                    setFormData({...formData, doctorName: e.target.value, doctorDepartment: doc?.department || ''});
                  }}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="" className="bg-dark-800">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d.name} className="bg-dark-800">{d.name} ({d.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-dark-700/50 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-white">Invoice Items</h3>
                  <button type="button" onClick={addItem} className="px-4 py-2 text-sm font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors">+ Add Item</button>
                </div>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700/30">
                    <input type="text" placeholder="Description" required value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="col-span-4 px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    <select value={item.category}
                      onChange={(e) => updateItem(idx, 'category', e.target.value)}
                      className="col-span-2 px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                      {categories.map(c => <option key={c} value={c} className="bg-dark-800">{c}</option>)}
                    </select>
                    <input type="number" placeholder="Qty" min="1" required value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="col-span-1 px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    <input type="number" placeholder="Unit Price" min="0" required value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    <div className="col-span-2 flex items-center justify-between px-2">
                      <span className="text-sm font-semibold text-white">Rs. {item.total.toLocaleString()}</span>
                      {formData.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="text-accent-400 hover:text-accent-300 p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center gap-1">
                      <input type="checkbox" id={`taxable-${idx}`} checked={item.isTaxable}
                        onChange={(e) => updateItem(idx, 'isTaxable', e.target.checked)}
                        className="rounded text-primary-600 bg-dark-700 border-dark-600" />
                      <label htmlFor={`taxable-${idx}`} className="text-xs text-dark-400">Tax</label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Tax Rate (%)</label>
                  <input type="number" value={formData.taxRate}
                    onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Discount (Rs.)</label>
                  <input type="number" value={formData.discount} min="0"
                    onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">PAN Number</label>
                  <input type="text" value={formData.panNumber}
                    onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>

              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">Subtotal:</span>
                  <span className="text-white">Rs. {totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">Taxable Amount:</span>
                  <span className="text-white">Rs. {totals.taxableAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">VAT ({formData.taxRate}%):</span>
                  <span className="text-white">Rs. {totals.taxAmount.toLocaleString()}</span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Discount:</span>
                    <span>- Rs. {formData.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-dark-700/30 pt-2 mt-2">
                  <span className="text-white">Total (NPR):</span>
                  <span className="text-primary-400">Rs. {totals.total.toLocaleString()}</span>
                </div>
              </div>

              <textarea placeholder="Notes (optional)" value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" rows="2" />

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ ADVANCED PAYMENT MODAL ═══════════════ */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-green-900/20 to-dark-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {justPaid ? 'Payment Complete!' : 'Record Payment'}
                  </h2>
                  <p className="text-sm text-dark-400 mt-1">{selectedInvoice.invoiceNumber} — {selectedInvoice.patientId?.firstName} {selectedInvoice.patientId?.lastName}</p>
                </div>
                <button onClick={() => { setShowPayModal(false); resetPayForm(); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handlePayment} className="p-6 space-y-4">
              {justPaid && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <svg className="w-12 h-12 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-green-400 font-bold text-lg">Fully Paid</p>
                  <p className="text-dark-400 text-sm mt-1">Receipt PDF downloading...</p>
                </div>
              )}

              {/* ── Balance Overview ── */}
              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider">Total Bill</p>
                    <p className="text-lg font-bold text-white">Rs. {selectedInvoice.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider">Already Paid</p>
                    <p className="text-lg font-bold text-green-400">Rs. {selectedInvoice.amountPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-400 uppercase tracking-wider">Balance Due</p>
                    <p className="text-lg font-bold text-accent-400">Rs. {(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 bg-dark-700/50 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                    style={{width: `${Math.min((selectedInvoice.amountPaid / selectedInvoice.totalAmount) * 100, 100)}%`}}></div>
                </div>
                <p className="text-[10px] text-dark-400 mt-1 text-center">
                  {Math.round((selectedInvoice.amountPaid / selectedInvoice.totalAmount) * 100)}% paid
                  {selectedInvoice.payments?.length > 0 && ` · Installment #${selectedInvoice.payments.length + 1} of next payment`}
                </p>
              </div>

              {/* ── Payment History Timeline ── */}
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div className="bg-dark-800/30 rounded-xl p-3 border border-dark-700/30 max-h-32 overflow-y-auto">
                  <p className="text-[10px] text-dark-400 mb-2 font-semibold uppercase tracking-wider">Payment History ({selectedInvoice.payments.length} installment{selectedInvoice.payments.length !== 1 ? 's' : ''})</p>
                  {selectedInvoice.payments.map((p, idx) => {
                    const runningBalance = selectedInvoice.totalAmount - selectedInvoice.payments.slice(0, idx + 1).reduce((s, x) => s + x.amount, 0);
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs py-1.5 border-b border-dark-700/20 last:border-0">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ backgroundColor: methodColors[p.method] || '#64748b' }}>
                          {p.installmentNumber || idx + 1}
                        </div>
                        <span className="text-dark-300 flex-1">
                          {new Date(p.paidAt).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                          {' '}· {p.method}
                          {p.splitPayments?.length > 1 && ` (${p.splitPayments.length} methods)`}
                        </span>
                        <span className="text-green-400 font-semibold">Rs. {p.amount.toLocaleString()}</span>
                        <span className="text-dark-500 text-[10px] w-20 text-right">
                          {runningBalance > 0 ? `Bal: Rs. ${runningBalance.toLocaleString()}` : 'CLEARED'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Split Payment Toggle ── */}
              <div className="flex items-center justify-between bg-dark-800/30 rounded-xl p-3 border border-dark-700/30">
                <div>
                  <p className="text-sm text-white font-medium">Split Payment</p>
                  <p className="text-[10px] text-dark-400">Pay with multiple methods at once</p>
                </div>
                <button type="button" onClick={() => setSplitMode(!splitMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${splitMode ? 'bg-green-600' : 'bg-dark-600'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${splitMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>

              {/* ── Single Payment ── */}
              {!splitMode && (
                <>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Payment Amount (NPR) *</label>
                    <input type="number" required min="0.01" step="any"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white text-lg font-semibold focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    <div className="grid grid-cols-5 gap-2 mt-3">
                      {[25, 50, 75, 90, 100].map(pct => {
                        const remaining = selectedInvoice.totalAmount - selectedInvoice.amountPaid;
                        const amt = remaining * pct / 100;
                        return (
                          <button key={pct} type="button" onClick={() => setPayAmount(amt.toFixed(2))}
                            className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all border ${
                              parseFloat(payAmount) === parseFloat(amt.toFixed(2))
                                ? 'bg-primary-600 text-white border-primary-500'
                                : 'bg-dark-800/50 text-dark-300 border-dark-700/50 hover:bg-dark-700/50 hover:border-dark-600'
                            }`}>
                            {pct}%<br/><span className="text-[9px] opacity-70">Rs. {amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-dark-400 mb-2 block">Payment Method *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {paymentMethods.map(m => (
                        <button key={m} type="button" onClick={() => { setPayMethod(m); setPayTxnId(''); }}
                          className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                            payMethod === m
                              ? 'text-white border-transparent shadow-lg'
                              : 'bg-dark-800/50 text-dark-300 border-dark-700/50 hover:bg-dark-700/50 hover:border-dark-600'
                          }`}
                          style={payMethod === m ? { backgroundColor: methodColors[m] || '#2563eb' } : {}}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(payMethod === 'eSewa' || payMethod === 'Khalti' || payMethod === 'Card' || payMethod === 'Bank Transfer' || payMethod === 'ConnectIPS') && (
                    <div>
                      <label className="text-sm text-dark-400 mb-2 block">Transaction ID</label>
                      <input type="text" placeholder="Enter transaction/reference ID" value={payTxnId}
                        onChange={(e) => setPayTxnId(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    </div>
                  )}
                </>
              )}

              {/* ── Split Payment Mode ── */}
              {splitMode && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-dark-400">Payment Split *</label>
                    <button type="button" onClick={addSplitRow} className="text-xs text-primary-400 hover:text-primary-300 font-semibold">+ Add Method</button>
                  </div>
                  {splitPayments.map((sp, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-dark-800/30 rounded-xl p-3 border border-dark-700/20">
                      <select value={sp.method} onChange={(e) => updateSplitRow(idx, 'method', e.target.value)}
                        className="col-span-4 px-2 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-xs text-white focus:ring-2 focus:ring-primary-500 transition-all">
                        {paymentMethods.map(m => <option key={m} value={m} className="bg-dark-800">{m}</option>)}
                      </select>
                      <input type="number" placeholder="Amount" min="0" step="any" value={sp.amount}
                        onChange={(e) => updateSplitRow(idx, 'amount', e.target.value)}
                        className="col-span-4 px-2 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-xs text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 transition-all" />
                      <input type="text" placeholder="Txn ID" value={sp.transactionId}
                        onChange={(e) => updateSplitRow(idx, 'transactionId', e.target.value)}
                        className="col-span-3 px-2 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-xs text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 transition-all" />
                      {splitPayments.length > 1 && (
                        <button type="button" onClick={() => removeSplitRow(idx)} className="col-span-1 text-accent-400 hover:text-accent-300 text-center">
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between text-sm bg-dark-800/30 rounded-lg p-3 border border-dark-700/20">
                    <span className="text-dark-300">Split Total:</span>
                    <span className={`font-bold ${getSplitTotal() > (selectedInvoice.totalAmount - selectedInvoice.amountPaid) ? 'text-red-400' : 'text-green-400'}`}>
                      Rs. {getSplitTotal().toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-dark-400 mb-2 block">Notes</label>
                <input type="text" placeholder="Optional payment notes" value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/30">
                <button type="button" onClick={() => { setShowPayModal(false); resetPayForm(); }} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" disabled={processing} className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2 ${processing ? 'bg-dark-600 text-dark-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-green-600/30'}`}>
                  {processing ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                  ) : (
                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Record Payment</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ DETAIL MODAL ═══════════════ */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-primary-900/30 to-dark-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Invoice Details</h2>
                  <p className="text-sm text-primary-400 mt-1 font-semibold">{selectedInvoice.invoiceNumber}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-dark-800/30 rounded-xl p-4 border border-dark-700/30">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-dark-400">Patient</p>
                    <p className="text-sm font-semibold text-white">{selectedInvoice.patientId?.firstName} {selectedInvoice.patientId?.lastName}</p>
                    <p className="text-xs text-dark-500">{selectedInvoice.patientId?.mrn} · {selectedInvoice.patientId?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Doctor</p>
                    <p className="text-sm font-semibold text-white">{selectedInvoice.doctorName ? `Dr. ${selectedInvoice.doctorName}` : '-'}</p>
                    <p className="text-xs text-dark-500">{selectedInvoice.doctorDepartment || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Date</p>
                    <p className="text-sm text-white">{new Date(selectedInvoice.createdAt).toLocaleDateString('en-NP')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Status</p>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>{selectedInvoice.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dark-700/50">
                        <th className="py-2 text-left text-xs text-dark-400">#</th>
                        <th className="py-2 text-left text-xs text-dark-400">Description</th>
                        <th className="py-2 text-center text-xs text-dark-400">Qty</th>
                        <th className="py-2 text-right text-xs text-dark-400">Unit Price</th>
                        <th className="py-2 text-right text-xs text-dark-400">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, idx) => (
                        <tr key={idx} className="border-b border-dark-700/20">
                          <td className="py-2 text-dark-300">{idx + 1}</td>
                          <td className="py-2 text-white">{item.description}</td>
                          <td className="py-2 text-center text-dark-200">{item.quantity}</td>
                          <td className="py-2 text-right text-dark-200">Rs. {item.unitPrice.toLocaleString()}</td>
                          <td className="py-2 text-right text-white font-semibold">Rs. {item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-dark-800/30 rounded-xl p-4 border border-dark-700/30 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">Subtotal:</span>
                  <span className="text-white">Rs. {selectedInvoice.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">VAT ({selectedInvoice.taxRate}%):</span>
                  <span className="text-white">Rs. {selectedInvoice.taxAmount?.toLocaleString()}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Discount:</span>
                    <span>- Rs. {selectedInvoice.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-dark-700/30 pt-2">
                  <span className="text-white">Total:</span>
                  <span className="text-primary-400">Rs. {selectedInvoice.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-300">Paid:</span>
                  <span className="text-green-400 font-semibold">Rs. {selectedInvoice.amountPaid?.toLocaleString()}</span>
                </div>
                {selectedInvoice.totalAmount - selectedInvoice.amountPaid > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">Balance Due:</span>
                    <span className="text-accent-400 font-bold">Rs. {(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Payment Timeline */}
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Payment Timeline ({selectedInvoice.payments.length} installment{selectedInvoice.payments.length !== 1 ? 's' : ''})</h3>
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((p, idx) => {
                      const runningPaid = selectedInvoice.payments.slice(0, idx + 1).reduce((s, x) => s + x.amount, 0);
                      const runningBal = selectedInvoice.totalAmount - runningPaid;
                      return (
                        <div key={idx} className="flex items-center gap-3 bg-dark-800/30 rounded-lg p-3 border border-dark-700/20">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: methodColors[p.method] || '#64748b' }}>
                            #{p.installmentNumber || idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-semibold">Rs. {p.amount.toLocaleString()}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: methodColors[p.method] || '#64748b' }}>{p.method}</span>
                              {p.splitPayments?.length > 1 && (
                                <span className="text-[10px] text-dark-400">({p.splitPayments.length} methods)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-dark-400">{new Date(p.paidAt).toLocaleString('en-NP')}</span>
                              {p.transactionId && <span className="text-[10px] text-dark-500">· {p.transactionId}</span>}
                              {p.notes && <span className="text-[10px] text-dark-500">· {p.notes}</span>}
                            </div>
                            {p.splitPayments && p.splitPayments.length > 1 && (
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {p.splitPayments.map((sp, si) => (
                                  <span key={si} className="text-[10px] text-dark-300 bg-dark-700/50 px-2 py-0.5 rounded">
                                    {sp.method}: Rs. {sp.amount.toLocaleString()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] text-dark-400">Balance</p>
                            <p className={`text-xs font-bold ${runningBal <= 0 ? 'text-green-400' : 'text-dark-300'}`}>
                              {runningBal <= 0 ? 'CLEARED' : `Rs. ${runningBal.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => handleDownloadPDF(selectedInvoice._id)} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download PDF
                </button>
                {selectedInvoice.status !== 'Paid' && selectedInvoice.status !== 'Cancelled' && (
                  <button onClick={() => { setShowDetailModal(false); openPayModal(selectedInvoice); }} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Add Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════ ADJUSTMENT MODAL ═══════════════ */}
      {showAdjustModal && selectedInvoice && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-amber-900/20 to-dark-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Billing Adjustment</h2>
                  <p className="text-sm text-dark-400 mt-1">{selectedInvoice.invoiceNumber} — {selectedInvoice.patientId?.firstName} {selectedInvoice.patientId?.lastName}</p>
                </div>
                <button onClick={() => setShowAdjustModal(false)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[10px] text-dark-400 uppercase">Subtotal</p>
                    <p className="text-sm font-bold text-white">Rs. {selectedInvoice.subtotal?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-400 uppercase">Discount</p>
                    <p className="text-sm font-bold text-amber-400">Rs. {(selectedInvoice.discount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-400 uppercase">Total</p>
                    <p className="text-sm font-bold text-primary-400">Rs. {selectedInvoice.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-dark-400 mb-2 block">Adjustment Type *</label>
                <select value={adjustAction} onChange={(e) => setAdjustAction(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 transition-all">
                  <option value="apply_discount" className="bg-dark-800">Apply/Update Discount</option>
                  <option value="update_tax" className="bg-dark-800">Update Tax Rate</option>
                  <option value="add_item" className="bg-dark-800">Add Line Item</option>
                  <option value="remove_item" className="bg-dark-800">Remove Line Item</option>
                  <option value="update_notes" className="bg-dark-800">Update Notes</option>
                </select>
              </div>

              {adjustAction === 'apply_discount' && (
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Discount Amount (NPR)</label>
                  <input type="number" min="0" value={adjustDiscount} onChange={(e) => setAdjustDiscount(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
              )}

              {adjustAction === 'update_tax' && (
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Tax Rate (%)</label>
                  <input type="number" min="0" max="100" step="0.5" value={adjustTaxRate} onChange={(e) => setAdjustTaxRate(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
              )}

              {adjustAction === 'add_item' && (
                <div className="space-y-3">
                  <input type="text" placeholder="Description" required value={adjustItem.description}
                    onChange={(e) => setAdjustItem({ ...adjustItem, description: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 transition-all" />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="number" placeholder="Qty" min="1" value={adjustItem.quantity}
                      onChange={(e) => setAdjustItem({ ...adjustItem, quantity: parseInt(e.target.value) || 1 })}
                      className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 transition-all" />
                    <input type="number" placeholder="Unit Price" min="0" value={adjustItem.unitPrice}
                      onChange={(e) => setAdjustItem({ ...adjustItem, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 transition-all" />
                    <select value={adjustItem.category} onChange={(e) => setAdjustItem({ ...adjustItem, category: e.target.value })}
                      className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 transition-all">
                      {categories.map(c => <option key={c} value={c} className="bg-dark-800">{c}</option>)}
                    </select>
                  </div>
                  <p className="text-sm text-dark-400">Item Total: <span className="text-white font-semibold">Rs. {(adjustItem.quantity * adjustItem.unitPrice).toLocaleString()}</span></p>
                </div>
              )}

              {adjustAction === 'remove_item' && (
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Select Item to Remove</label>
                  <select value={adjustItemIndex} onChange={(e) => setAdjustItemIndex(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 transition-all">
                    {selectedInvoice.items?.map((item, idx) => (
                      <option key={idx} value={idx} className="bg-dark-800">
                        {idx + 1}. {item.description} - Rs. {item.total?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {adjustAction === 'update_notes' && (
                <div>
                  <label className="text-sm text-dark-400 mb-2 block">Notes</label>
                  <textarea value={adjustNotes} onChange={(e) => setAdjustNotes(e.target.value)} rows={3}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 transition-all resize-none" />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/30">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg shadow-amber-600/30">Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
