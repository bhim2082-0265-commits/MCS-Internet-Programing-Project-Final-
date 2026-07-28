import { useState, useEffect } from 'react';
import { medicineAPI } from '../services/api';
import toast from 'react-hot-toast';

function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tablet',
    dosage: '',
    form: 'Tablet',
    manufacturer: '',
    price: '',
    stock: '',
    unit: 'strip',
    description: '',
    requiresPrescription: true
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMedicines();
  }, [search, categoryFilter]);

  const fetchMedicines = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const res = await medicineAPI.getAll(params);
      setMedicines(res.data);
      const cats = [...new Set(res.data.map(m => m.category))].sort();
      setCategories(cats);
    } catch (error) {
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, price: Number(formData.price) || 0, stock: Number(formData.stock) || 0 };
    try {
      if (editingMedicine) {
        await medicineAPI.update(editingMedicine._id, data);
        toast.success('Medicine updated successfully');
      } else {
        await medicineAPI.create(data);
        toast.success('Medicine added successfully');
      }
      setShowModal(false);
      setEditingMedicine(null);
      resetForm();
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save medicine');
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      dosage: medicine.dosage || '',
      form: medicine.form || '',
      manufacturer: medicine.manufacturer || '',
      price: medicine.price || '',
      stock: medicine.stock || '',
      unit: medicine.unit || 'strip',
      description: medicine.description || '',
      requiresPrescription: medicine.requiresPrescription
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineAPI.delete(id);
        toast.success('Medicine deleted');
        fetchMedicines();
      } catch (error) {
        toast.error('Failed to delete medicine');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', category: 'Tablet', dosage: '', form: 'Tablet', manufacturer: '',
      price: '', stock: '', unit: 'strip', description: '', requiresPrescription: true
    });
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    resetForm();
    setShowModal(true);
  };

  const getCategoryBadge = (category) => {
    const colors = {
      Tablet: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Capsule: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Syrup: 'bg-green-500/20 text-green-400 border-green-500/30',
      Suspension: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      Gel: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      Cream: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Ointment: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      Drops: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      Solution: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Chewable Tablet': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
      'Dry Syrup': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      Lotion: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      Mouthwash: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      Paste: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    };
    return colors[category] || 'bg-dark-500/20 text-dark-400 border-dark-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pharmacy</h1>
          <p className="text-dark-400 mt-1">Manage medicine inventory ({medicines.length} medicines)</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary-600/20 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search medicines by name..."
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

      {/* Medicines Table */}
      <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">#</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Medicine Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Dosage</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Price</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-dark-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-dark-400">
                    No medicines found
                  </td>
                </tr>
              ) : (
                medicines.map((medicine, index) => (
                  <tr key={medicine._id} className="border-b border-dark-800/30 hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-dark-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{medicine.name}</div>
                      {medicine.manufacturer && <div className="text-xs text-dark-400 mt-0.5">{medicine.manufacturer}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getCategoryBadge(medicine.category)}`}>
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-300">{medicine.dosage || '-'}</td>
                    <td className="px-6 py-4 text-sm text-dark-300">{medicine.price > 0 ? `Rs. ${medicine.price}` : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${medicine.stock > 10 ? 'text-green-400' : medicine.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        {medicine.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(medicine)}
                          className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(medicine._id)}
                          className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-dark-800/50">
              <h2 className="text-xl font-bold text-white">{editingMedicine ? 'Edit Medicine' : 'Add Medicine'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                  placeholder="Enter medicine name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Gel">Gel</option>
                    <option value="Cream">Cream</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Drops">Drops</option>
                    <option value="Solution">Solution</option>
                    <option value="Lotion">Lotion</option>
                    <option value="Mouthwash">Mouthwash</option>
                    <option value="Paste">Paste</option>
                    <option value="Chewable Tablet">Chewable Tablet</option>
                    <option value="Dry Syrup">Dry Syrup</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="e.g. 500mg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Price (Rs.)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
                    placeholder="Manufacturer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                  >
                    <option value="strip">Strip</option>
                    <option value="bottle">Bottle</option>
                    <option value="tube">Tube</option>
                    <option value="box">Box</option>
                    <option value="piece">Piece</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all resize-none"
                  placeholder="Brief description"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                  className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-700 rounded focus:ring-primary-500"
                />
                <label htmlFor="requiresPrescription" className="text-sm text-dark-300">Requires Prescription</label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-dark-800/50">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingMedicine(null); }}
                  className="flex-1 px-4 py-2.5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/30 rounded-xl text-dark-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
                >
                  {editingMedicine ? 'Update' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pharmacy;
