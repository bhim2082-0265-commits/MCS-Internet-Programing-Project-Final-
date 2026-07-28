import { useState, useEffect } from 'react';
import { inventoryAPI, purchaseOrderAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Search, Plus, Trash2, Edit3, X, Package, ShoppingCart, AlertTriangle,
  BarChart3, DollarSign, Tag, Layers, Filter, ArrowUpDown, Minus,
  Truck, RefreshCw, Eye
} from 'lucide-react';

function Inventory() {
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalValue: 0, lowStock: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustType, setAdjustType] = useState('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const [showPOModal, setShowPOModal] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [showPOStatusModal, setShowPOStatusModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [newPOStatus, setNewPOStatus] = useState('');

  const [itemFormData, setItemFormData] = useState({
    name: '', category: 'Medical Supplies', description: '', unit: 'piece',
    quantity: '', minStock: '', maxStock: '', unitPrice: '', vendor: '',
    vendorContact: '', expiryDate: '', location: ''
  });

  const [poFormData, setPOFormData] = useState({
    vendor: '', vendorContact: '', items: [{ name: '', quantity: '', unitPrice: '' }],
    expectedDelivery: '', notes: ''
  });

  const categories = [
    'Medical Supplies', 'Surgical Equipment', 'PPE', 'Cleaning',
    'Office', 'IT Equipment', 'Furniture', 'Pharmaceutical', 'Other'
  ];

  const itemStatuses = ['Available', 'Low Stock', 'Out of Stock'];
  const poStatuses = ['Draft', 'Pending Approval', 'Approved', 'Ordered', 'Received', 'Cancelled'];

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (activeTab === 'items') fetchItems();
    else if (activeTab === 'orders') fetchPurchaseOrders();
    else fetchLowStockItems();
  }, [activeTab, search, categoryFilter, statusFilter]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchItems(), fetchPurchaseOrders(), fetchStats()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await inventoryAPI.getAll(params);
      setItems(res.data);
    } catch (error) {
      toast.error('Failed to fetch inventory items');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await inventoryAPI.getStats();
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await purchaseOrderAPI.getAll(params);
      setPurchaseOrders(res.data);
    } catch (error) {
      toast.error('Failed to fetch purchase orders');
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const res = await inventoryAPI.getAll({ lowStock: true });
      setItems(res.data);
    } catch (error) {
      toast.error('Failed to fetch low stock items');
    }
  };

  const getItemStatus = (item) => {
    if (item.quantity <= 0) return 'Out of Stock';
    if (item.quantity <= item.minStock) return 'Low Stock';
    return 'Available';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'Sufficient': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'Low Stock': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      'Out of Stock': 'bg-red-500/20 text-red-400 border border-red-500/30'
    };
    return colors[status] || 'bg-dark-500/20 text-dark-400 border border-dark-500/30';
  };

  const getPOStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-dark-500/20 text-dark-400 border border-dark-500/30',
      'Pending Approval': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'Approved': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'Ordered': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'Received': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'Cancelled': 'bg-red-500/20 text-red-400 border border-red-500/30'
    };
    return colors[status] || 'bg-dark-500/20 text-dark-400 border border-dark-500/30';
  };

  const getCategoryBadge = (category) => {
    const colors = {
      'Medical Supplies': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Surgical Equipment': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'PPE': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      'Cleaning': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Office': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      'IT Equipment': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Furniture': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Pharmaceutical': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Other': 'bg-dark-500/20 text-dark-400 border-dark-500/30'
    };
    return colors[category] || 'bg-dark-500/20 text-dark-400 border-dark-500/30';
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...itemFormData,
      quantity: Number(itemFormData.quantity) || 0,
      minStock: Number(itemFormData.minStock) || 0,
      maxStock: Number(itemFormData.maxStock) || 0,
      unitPrice: Number(itemFormData.unitPrice) || 0
    };
    try {
      if (editingItem) {
        await inventoryAPI.update(editingItem._id, data);
        toast.success('Item updated successfully');
      } else {
        await inventoryAPI.create(data);
        toast.success('Item added successfully');
      }
      setShowItemModal(false);
      setEditingItem(null);
      resetItemForm();
      fetchItems();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      category: item.category || 'Medical Supplies',
      description: item.description || '',
      unit: item.unit || 'piece',
      quantity: item.quantity || '',
      minStock: item.minStock || '',
      maxStock: item.maxStock || '',
      unitPrice: item.unitPrice || '',
      vendor: item.vendor || '',
      vendorContact: item.vendorContact || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      location: item.location || ''
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await inventoryAPI.delete(id);
        toast.success('Item deleted');
        fetchItems();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleStockAdjust = async () => {
    if (!adjustQty || Number(adjustQty) <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    try {
      await inventoryAPI.adjustStock(adjustItem._id, {
        type: adjustType,
        quantity: Number(adjustQty),
        reason: adjustReason
      });
      toast.success('Stock adjusted successfully');
      setShowAdjustModal(false);
      setAdjustItem(null);
      setAdjustQty('');
      setAdjustReason('');
      fetchItems();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const openAdjustModal = (item) => {
    setAdjustItem(item);
    setAdjustType('add');
    setAdjustQty('');
    setAdjustReason('');
    setShowAdjustModal(true);
  };

  const resetItemForm = () => {
    setItemFormData({
      name: '', category: 'Medical Supplies', description: '', unit: 'piece',
      quantity: '', minStock: '', maxStock: '', unitPrice: '', vendor: '',
      vendorContact: '', expiryDate: '', location: ''
    });
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    resetItemForm();
    setShowItemModal(true);
  };

  // Purchase Order handlers
  const handlePOSubmit = async (e) => {
    e.preventDefault();
    const validItems = poFormData.items.filter(i => i.name && i.quantity);
    if (validItems.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    const data = {
      ...poFormData,
      items: validItems.map(i => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice) || 0
      }))
    };
    try {
      if (editingPO) {
        await purchaseOrderAPI.update(editingPO._id, data);
        toast.success('Purchase order updated');
      } else {
        await purchaseOrderAPI.create(data);
        toast.success('Purchase order created');
      }
      setShowPOModal(false);
      setEditingPO(null);
      resetPOForm();
      fetchPurchaseOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save purchase order');
    }
  };

  const handleEditPO = (po) => {
    setEditingPO(po);
    setPOFormData({
      vendor: po.vendor || '',
      vendorContact: po.vendorContact || '',
      items: po.items && po.items.length > 0 ? po.items.map(i => ({
        name: i.name || '',
        quantity: i.quantity || '',
        unitPrice: i.unitPrice || ''
      })) : [{ name: '', quantity: '', unitPrice: '' }],
      expectedDelivery: po.expectedDelivery ? po.expectedDelivery.split('T')[0] : '',
      notes: po.notes || ''
    });
    setShowPOModal(true);
  };

  const handleDeletePO = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await purchaseOrderAPI.delete(id);
        toast.success('Purchase order deleted');
        fetchPurchaseOrders();
      } catch (error) {
        toast.error('Failed to delete purchase order');
      }
    }
  };

  const handleUpdatePOStatus = async () => {
    if (!newPOStatus) {
      toast.error('Select a status');
      return;
    }
    try {
      await purchaseOrderAPI.update(selectedPO._id, { status: newPOStatus });
      toast.success('Status updated');
      setShowPOStatusModal(false);
      setSelectedPO(null);
      setNewPOStatus('');
      fetchPurchaseOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const resetPOForm = () => {
    setPOFormData({
      vendor: '', vendorContact: '', items: [{ name: '', quantity: '', unitPrice: '' }],
      expectedDelivery: '', notes: ''
    });
  };

  const openAddPOModal = () => {
    setEditingPO(null);
    resetPOForm();
    setShowPOModal(true);
  };

  const addPOItem = () => {
    setPOFormData({
      ...poFormData,
      items: [...poFormData.items, { name: '', quantity: '', unitPrice: '' }]
    });
  };

  const removePOItem = (index) => {
    if (poFormData.items.length <= 1) return;
    setPOFormData({
      ...poFormData,
      items: poFormData.items.filter((_, i) => i !== index)
    });
  };

  const updatePOItem = (index, field, value) => {
    const updated = poFormData.items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setPOFormData({ ...poFormData, items: updated });
  };

  const getPOItemTotal = (item) => {
    return (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  };

  const getPOGrandTotal = () => {
    return poFormData.items.reduce((sum, item) => sum + getPOItemTotal(item), 0);
  };

  const handleReorder = async (item) => {
    setPOFormData({
      vendor: item.vendor || '',
      vendorContact: item.vendorContact || '',
      items: [{ name: item.name, quantity: item.minStock || 10, unitPrice: item.unitPrice || '' }],
      expectedDelivery: '',
      notes: `Reorder for ${item.name} - currently at ${item.quantity} units (min: ${item.minStock})`
    });
    setEditingPO(null);
    setShowPOModal(true);
  };

  const lowStockItems = items.filter(i => i.quantity <= i.minStock);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading inventory...</p>
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
              <Package className="w-8 h-8 text-primary-400" />
              Inventory Management
            </h1>
            <p className="text-dark-300 mt-1">Track supplies, equipment, and stock levels</p>
          </div>
          <button
            onClick={activeTab === 'orders' ? openAddPOModal : openAddItemModal}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'orders' ? 'Create PO' : 'Add Item'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setActiveTab('items'); setCategoryFilter(''); setStatusFilter(''); setSearch(''); }}
          className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === 'items' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-dark-800/50 text-dark-300 border border-dark-700/50 hover:bg-dark-700/50'}`}
        >
          <Package className="w-4 h-4" />
          Inventory Items
        </button>
        <button
          onClick={() => { setActiveTab('orders'); setCategoryFilter(''); setStatusFilter(''); setSearch(''); }}
          className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-dark-800/50 text-dark-300 border border-dark-700/50 hover:bg-dark-700/50'}`}
        >
          <ShoppingCart className="w-4 h-4" />
          Purchase Orders
        </button>
        <button
          onClick={() => { setActiveTab('alerts'); setCategoryFilter(''); setStatusFilter(''); setSearch(''); }}
          className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-dark-800/50 text-dark-300 border border-dark-700/50 hover:bg-dark-700/50'}`}
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock Alerts
          {lowStockItems.length > 0 && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
              {lowStockItems.length}
            </span>
          )}
        </button>
      </div>

      {/* ============ INVENTORY ITEMS TAB ============ */}
      {activeTab === 'items' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totalItems || items.length}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">Total Value</p>
                  <p className="text-2xl font-bold text-white mt-1">Rs. {(stats.totalValue || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{stats.lowStock || lowStockItems.length}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">Categories</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.categories || 0}</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Layers className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search inventory items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Items Table */}
          <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-800/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Code</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Category</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Qty</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Min Stock</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Unit Price</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Total Value</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Location</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center text-dark-400">
                        No inventory items found
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const status = getItemStatus(item);
                      const totalVal = (item.quantity || 0) * (item.unitPrice || 0);
                      const isLowStock = item.quantity <= item.minStock;
                      return (
                        <tr key={item._id} className={`border-b border-dark-800/30 hover:bg-dark-800/30 transition-colors ${isLowStock ? 'bg-amber-500/5' : ''}`}>
                          <td className="px-6 py-4 text-sm text-dark-400 font-mono">{item.itemCode || '-'}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{item.name}</div>
                            {item.description && <div className="text-xs text-dark-400 mt-0.5 max-w-[200px] truncate">{item.description}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getCategoryBadge(item.category)}`}>
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-semibold ${item.quantity <= 0 ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-green-400'}`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-dark-300">{item.minStock}</td>
                          <td className="px-6 py-4 text-sm text-dark-300">Rs. {(item.unitPrice || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-white font-medium">Rs. {totalVal.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-dark-300">{item.location || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openAdjustModal(item)}
                                className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                                title="Adjust Stock"
                              >
                                <ArrowUpDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditItem(item)}
                                className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
        </>
      )}

      {/* ============ PURCHASE ORDERS TAB ============ */}
      {activeTab === 'orders' && (
        <>
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search purchase orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
            >
              <option value="">All Status</option>
              {poStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* PO Table */}
          <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-800/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Order #</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Vendor</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Items</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Total Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Ordered Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Expected Delivery</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-dark-400">
                        No purchase orders found
                      </td>
                    </tr>
                  ) : (
                    purchaseOrders.map((po) => {
                      const total = (po.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
                      return (
                        <tr key={po._id} className="border-b border-dark-800/30 hover:bg-dark-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-primary-400 font-medium">{po.orderNumber || po._id?.slice(-8).toUpperCase()}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{po.vendor}</div>
                            {po.vendorContact && <div className="text-xs text-dark-400 mt-0.5">{po.vendorContact}</div>}
                          </td>
                          <td className="px-6 py-4 text-sm text-dark-300">{(po.items || []).length}</td>
                          <td className="px-6 py-4 text-sm text-white font-medium">Rs. {total.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getPOStatusColor(po.status)}`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-dark-300">
                            {po.orderedDate ? new Date(po.orderedDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-dark-300">
                            {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setSelectedPO(po); setNewPOStatus(po.status); setShowPOStatusModal(true); }}
                                className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                                title="Update Status"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditPO(po)}
                                className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePO(po._id)}
                                className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
        </>
      )}

      {/* ============ LOW STOCK ALERTS TAB ============ */}
      {activeTab === 'alerts' && (
        <>
          {lowStockItems.length === 0 ? (
            <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">All Stocked Up</h3>
              <p className="text-dark-400">No items are currently below minimum stock levels.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <p className="text-amber-400 font-medium">{lowStockItems.length} item(s) are below minimum stock level and need attention.</p>
              </div>
              {lowStockItems.map((item) => {
                const status = getItemStatus(item);
                const stockPercentage = item.minStock > 0 ? Math.round((item.quantity / item.minStock) * 100) : 0;
                return (
                  <div key={item._id} className={`bg-dark-900/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6 ${item.quantity <= 0 ? 'border-red-500/30' : 'border-amber-500/30'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-xl ${item.quantity <= 0 ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                            <Package className={`w-5 h-5 ${item.quantity <= 0 ? 'text-red-400' : 'text-amber-400'}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getCategoryBadge(item.category)}`}>
                                {item.category}
                              </span>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(status)}`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-dark-400 mb-1">Current Stock</p>
                            <p className={`text-lg font-bold ${item.quantity <= 0 ? 'text-red-400' : 'text-amber-400'}`}>{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-dark-400 mb-1">Min Stock</p>
                            <p className="text-lg font-bold text-white">{item.minStock}</p>
                          </div>
                          <div>
                            <p className="text-xs text-dark-400 mb-1">Unit Price</p>
                            <p className="text-lg font-bold text-white">Rs. {(item.unitPrice || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-dark-400 mb-1">Location</p>
                            <p className="text-sm font-medium text-dark-300">{item.location || '-'}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-dark-400">Stock Level</span>
                            <span className="text-dark-300">{stockPercentage}% of minimum</span>
                          </div>
                          <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${item.quantity <= 0 ? 'bg-red-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReorder(item)}
                        className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary-600/20 flex items-center gap-2 ml-4 shrink-0"
                      >
                        <Truck className="w-4 h-4" />
                        Reorder
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ============ ADD/EDIT ITEM MODAL ============ */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-dark-800/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
              <button onClick={() => { setShowItemModal(false); setEditingItem(null); }} className="text-dark-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Name *</label>
                  <input
                    type="text" required
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Category *</label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
                <textarea
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all resize-none"
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Unit</label>
                  <select
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                  >
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="kg">Kg</option>
                    <option value="liter">Liter</option>
                    <option value="pair">Pair</option>
                    <option value="set">Set</option>
                    <option value="roll">Roll</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Quantity *</label>
                  <input
                    type="number" required
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Min Stock</label>
                  <input
                    type="number"
                    value={itemFormData.minStock}
                    onChange={(e) => setItemFormData({ ...itemFormData, minStock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Max Stock</label>
                  <input
                    type="number"
                    value={itemFormData.maxStock}
                    onChange={(e) => setItemFormData({ ...itemFormData, maxStock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Unit Price (Rs.)</label>
                  <input
                    type="number" step="0.01"
                    value={itemFormData.unitPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, unitPrice: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={itemFormData.location}
                    onChange={(e) => setItemFormData({ ...itemFormData, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="e.g. Ward A, Shelf 3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Vendor</label>
                  <input
                    type="text"
                    value={itemFormData.vendor}
                    onChange={(e) => setItemFormData({ ...itemFormData, vendor: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="Vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Vendor Contact</label>
                  <input
                    type="text"
                    value={itemFormData.vendorContact}
                    onChange={(e) => setItemFormData({ ...itemFormData, vendorContact: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="Phone or email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  value={itemFormData.expiryDate}
                  onChange={(e) => setItemFormData({ ...itemFormData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-dark-800/50">
                <button
                  type="button"
                  onClick={() => { setShowItemModal(false); setEditingItem(null); }}
                  className="flex-1 px-4 py-2.5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/30 rounded-xl text-dark-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ STOCK ADJUSTMENT MODAL ============ */}
      {showAdjustModal && adjustItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800/50 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-dark-800/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Adjust Stock</h2>
              <button onClick={() => { setShowAdjustModal(false); setAdjustItem(null); }} className="text-dark-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-dark-800/50 rounded-xl p-4">
                <p className="text-sm text-dark-400">Adjusting</p>
                <p className="text-lg font-semibold text-white">{adjustItem.name}</p>
                <p className="text-sm text-dark-300 mt-1">Current stock: <span className="font-semibold text-white">{adjustItem.quantity}</span></p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustType('add')}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${adjustType === 'add' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-dark-800/50 text-dark-400 border border-dark-700/50 hover:bg-dark-700/50'}`}
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
                <button
                  onClick={() => setAdjustType('remove')}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${adjustType === 'remove' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-dark-800/50 text-dark-400 border border-dark-700/50 hover:bg-dark-700/50'}`}
                >
                  <Minus className="w-4 h-4" /> Remove
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Quantity *</label>
                <input
                  type="number" min="1" required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                  placeholder="e.g. Restocked, Damaged, Used"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowAdjustModal(false); setAdjustItem(null); }}
                  className="flex-1 px-4 py-2.5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/30 rounded-xl text-dark-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockAdjust}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ ADD/EDIT PO MODAL ============ */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-dark-800/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingPO ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
              <button onClick={() => { setShowPOModal(false); setEditingPO(null); }} className="text-dark-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePOSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Vendor *</label>
                  <input
                    type="text" required
                    value={poFormData.vendor}
                    onChange={(e) => setPOFormData({ ...poFormData, vendor: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="Vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Vendor Contact</label>
                  <input
                    type="text"
                    value={poFormData.vendorContact}
                    onChange={(e) => setPOFormData({ ...poFormData, vendorContact: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="Phone or email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Expected Delivery</label>
                <input
                  type="date"
                  value={poFormData.expectedDelivery}
                  onChange={(e) => setPOFormData({ ...poFormData, expectedDelivery: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-dark-300">Items *</label>
                  <button
                    type="button"
                    onClick={addPOItem}
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {poFormData.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => updatePOItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-800/50 border border-dark-700/50 rounded-lg text-white text-sm placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                          placeholder="Item name"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number" min="1" required
                          value={item.quantity}
                          onChange={(e) => updatePOItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-800/50 border border-dark-700/50 rounded-lg text-white text-sm placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                          placeholder="Qty"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number" step="0.01" min="0"
                          value={item.unitPrice}
                          onChange={(e) => updatePOItem(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-2 bg-dark-800/50 border border-dark-700/50 rounded-lg text-white text-sm placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                          placeholder="Price"
                        />
                      </div>
                      <div className="w-28 text-right py-2">
                        <span className="text-sm font-medium text-white">Rs. {getPOItemTotal(item).toLocaleString()}</span>
                      </div>
                      {poFormData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePOItem(index)}
                          className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3 pt-3 border-t border-dark-800/50">
                  <span className="text-sm text-dark-300">Grand Total: <span className="text-lg font-bold text-white">Rs. {getPOGrandTotal().toLocaleString()}</span></span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Notes</label>
                <textarea
                  value={poFormData.notes}
                  onChange={(e) => setPOFormData({ ...poFormData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all resize-none"
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-800/50">
                <button
                  type="button"
                  onClick={() => { setShowPOModal(false); setEditingPO(null); }}
                  className="flex-1 px-4 py-2.5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/30 rounded-xl text-dark-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
                >
                  {editingPO ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ UPDATE PO STATUS MODAL ============ */}
      {showPOStatusModal && selectedPO && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800/50 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-dark-800/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Update Status</h2>
              <button onClick={() => { setShowPOStatusModal(false); setSelectedPO(null); }} className="text-dark-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-dark-800/50 rounded-xl p-4">
                <p className="text-sm text-dark-400">Order</p>
                <p className="text-lg font-semibold text-white">{selectedPO.orderNumber || selectedPO._id?.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-dark-300 mt-1">Vendor: {selectedPO.vendor}</p>
                <p className="text-sm text-dark-300 mt-0.5">
                  Current Status: <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPOStatusColor(selectedPO.status)}`}>{selectedPO.status}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">New Status</label>
                <select
                  value={newPOStatus}
                  onChange={(e) => setNewPOStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                >
                  {poStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowPOStatusModal(false); setSelectedPO(null); }}
                  className="flex-1 px-4 py-2.5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/30 rounded-xl text-dark-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePOStatus}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
