import { useState, useEffect } from 'react';
import { roomAPI, admissionAPI, patientAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Bed, Users, DoorOpen, Building2, Plus, Search, Eye, Edit3, Trash2, X, Check, AlertCircle, Calendar, Stethoscope, Activity, ChevronDown, Filter } from 'lucide-react';

const ROOM_TYPES = ['General', 'Semi-Private', 'Private', 'VIP', 'ICU', 'Emergency', 'Operation', 'Maternity', 'Pediatric', 'Isolation'];
const BED_STATUSES = ['Available', 'Occupied', 'Reserved', 'Maintenance'];
const ADMISSION_STATUSES = ['Admitted', 'Discharged', 'Transferred'];
const FLOORS = [1, 2, 3, 4, 5, 6, 7, 8];

const roomTypeColors = {
  'General': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Semi-Private': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'Private': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'VIP': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'ICU': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Emergency': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Operation': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Maternity': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Pediatric': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Isolation': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const admissionStatusColors = {
  'Admitted': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'Discharged': 'bg-green-500/20 text-green-400 border border-green-500/30',
  'Transferred': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
};

const bedStatusColors = {
  'Available': 'bg-green-500 border-green-500',
  'Occupied': 'bg-red-500 border-red-500',
  'Reserved': 'bg-yellow-500 border-yellow-500',
  'Maintenance': 'bg-gray-500 border-gray-500',
};

const bedStatusBg = {
  'Available': 'bg-green-500/20 text-green-400 border border-green-500/30',
  'Occupied': 'bg-red-500/20 text-red-400 border border-red-500/30',
  'Reserved': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  'Maintenance': 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
};

function Inpatient() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargingAdmission, setDischargingAdmission] = useState(null);
  const [showBedStatusModal, setShowBedStatusModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedRoomForBed, setSelectedRoomForBed] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');

  const [roomForm, setRoomForm] = useState({
    roomNumber: '', floor: 1, type: 'General', department: '', capacity: 1, ratePerDay: 0, amenities: []
  });
  const [admitForm, setAdmitForm] = useState({
    patientId: '', doctorName: '', department: '', roomId: '', bedIndex: 0,
    diagnosis: '', treatmentPlan: '', reason: '', nurseAssigned: ''
  });
  const [dischargeForm, setDischargeForm] = useState({ notes: '', totalCharges: 0 });
  const [amenityInput, setAmenityInput] = useState('');

  useEffect(() => {
    fetchAll();
  }, [activeTab, typeFilter, floorFilter, statusFilter, search]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const promises = [patientAPI.getAll()];
      if (activeTab === 'rooms' || activeTab === 'availability') {
        promises.push(roomAPI.getAll());
      } else {
        promises.push(roomAPI.getAll());
      }
      if (activeTab === 'admissions' || activeTab === 'rooms') {
        promises.push(admissionAPI.getAll());
      } else {
        promises.push(admissionAPI.getAll());
      }
      promises.push(authAPI.getDoctors());
      const [patientRes, roomRes, admRes, docRes] = await Promise.all(promises);
      setPatients(patientRes.data);
      setRooms(roomRes.data);
      setAdmissions(admRes.data);
      if (docRes?.data) setDoctors(docRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await roomAPI.getAll();
      setRooms(res.data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    }
  };

  const fetchAdmissions = async () => {
    try {
      const res = await admissionAPI.getAll();
      setAdmissions(res.data);
    } catch (error) {
      toast.error('Failed to fetch admissions');
    }
  };

  const resetRoomForm = () => {
    setRoomForm({ roomNumber: '', floor: 1, type: 'General', department: '', capacity: 1, ratePerDay: 0, amenities: [] });
    setAmenityInput('');
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...roomForm, capacity: Number(roomForm.capacity) || 1, ratePerDay: Number(roomForm.ratePerDay) || 0 };
      if (editingRoom) {
        await roomAPI.update(editingRoom._id, data);
        toast.success('Room updated successfully');
      } else {
        await roomAPI.create(data);
        toast.success('Room added successfully');
      }
      setShowRoomModal(false);
      setEditingRoom(null);
      resetRoomForm();
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save room');
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber, floor: room.floor, type: room.type,
      department: room.department || '', capacity: room.capacity, ratePerDay: room.ratePerDay || 0,
      amenities: room.amenities || []
    });
    setShowRoomModal(true);
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await roomAPI.delete(id);
      toast.success('Room deleted');
      fetchRooms();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setRoomForm({ ...roomForm, amenities: [...roomForm.amenities, amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  const removeAmenity = (idx) => {
    setRoomForm({ ...roomForm, amenities: roomForm.amenities.filter((_, i) => i !== idx) });
  };

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...admitForm, bedIndex: Number(admitForm.bedIndex) || 0 };
      await admissionAPI.create(data);
      toast.success('Patient admitted successfully');
      setShowAdmitModal(false);
      setAdmitForm({ patientId: '', doctorName: '', department: '', roomId: '', bedIndex: 0, diagnosis: '', treatmentPlan: '', reason: '', nurseAssigned: '' });
      setPatientSearch('');
      fetchRooms();
      fetchAdmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to admit patient');
    }
  };

  const handleDischarge = async (e) => {
    e.preventDefault();
    try {
      await admissionAPI.discharge(dischargingAdmission._id, {
        notes: dischargeForm.notes,
        totalCharges: Number(dischargeForm.totalCharges) || 0
      });
      toast.success('Patient discharged successfully');
      setShowDischargeModal(false);
      setDischargingAdmission(null);
      setDischargeForm({ notes: '', totalCharges: 0 });
      fetchRooms();
      fetchAdmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to discharge patient');
    }
  };

  const openDischargeModal = (adm) => {
    setDischargingAdmission(adm);
    const days = adm.admissionDate ? Math.max(1, Math.ceil((new Date() - new Date(adm.admissionDate)) / (1000 * 60 * 60 * 24))) : 1;
    const rate = adm.roomId?.ratePerDay || 0;
    setDischargeForm({ notes: '', totalCharges: days * rate });
    setShowDischargeModal(true);
  };

  const openBedStatusModal = (room, bedIdx) => {
    setSelectedRoomForBed(room);
    setSelectedBed({ index: bedIdx, status: room.beds?.[bedIdx]?.status || 'Available' });
    setShowBedStatusModal(true);
  };

  const handleBedStatusUpdate = async (newStatus) => {
    try {
      await roomAPI.updateBed(selectedRoomForBed._id, {
        bedIndex: selectedBed.index,
        status: newStatus
      });
      toast.success('Bed status updated');
      setShowBedStatusModal(false);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bed status');
    }
  };

  const filteredRooms = rooms.filter(r => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (floorFilter && r.floor !== Number(floorFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.roomNumber?.toLowerCase().includes(q) || r.type?.toLowerCase().includes(q) || r.department?.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredAdmissions = admissions.filter(a => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.admissionNumber?.toLowerCase().includes(q) ||
        a.patientId?.firstName?.toLowerCase().includes(q) ||
        a.patientId?.lastName?.toLowerCase().includes(q) ||
        a.patientId?.mrn?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        a.roomId?.roomNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const roomStats = {
    total: rooms.length,
    totalBeds: rooms.reduce((sum, r) => sum + (r.capacity || r.beds?.length || 0), 0),
    available: rooms.reduce((sum, r) => sum + (r.beds?.filter(b => b.status === 'Available').length || 0), 0),
    occupied: rooms.reduce((sum, r) => sum + (r.beds?.filter(b => b.status === 'Occupied').length || 0), 0),
  };

  const filteredPatientList = patients.filter(p => {
    if (!patientSearch) return true;
    const q = patientSearch.toLowerCase();
    return (`${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.mrn?.toLowerCase().includes(q) || p.phone?.toLowerCase().includes(q));
  });

  const availableRooms = rooms.filter(r => r.beds?.some(b => b.status === 'Available'));

  const availabilityByType = ROOM_TYPES.map(type => {
    const typeRooms = rooms.filter(r => r.type === type);
    const totalBeds = typeRooms.reduce((sum, r) => sum + (r.capacity || r.beds?.length || 0), 0);
    const available = typeRooms.reduce((sum, r) => sum + (r.beds?.filter(b => b.status === 'Available').length || 0), 0);
    const occupied = typeRooms.reduce((sum, r) => sum + (r.beds?.filter(b => b.status === 'Occupied').length || 0), 0);
    const reserved = typeRooms.reduce((sum, r) => sum + (r.beds?.filter(b => b.status === 'Reserved').length || 0), 0);
    const maintenance = typeRooms.reduce((sum, r) => sum + (r.beds?.filter(b => b.status === 'Maintenance').length || 0), 0);
    return { type, rooms: typeRooms.length, totalBeds, available, occupied, reserved, maintenance };
  }).filter(s => s.rooms > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-medium">Loading inpatient data...</p>
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
              <Bed className="w-8 h-8 text-primary-400" />
              Inpatient Management
            </h1>
            <p className="text-dark-300 mt-1">Manage rooms, beds, and patient admissions</p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'rooms' && (
              <button onClick={() => { setEditingRoom(null); resetRoomForm(); setShowRoomModal(true); }}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Room
              </button>
            )}
            {activeTab === 'admissions' && (
              <button onClick={() => setShowAdmitModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Admit Patient
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-dark-900/50 p-1.5 rounded-xl border border-dark-700/50 w-fit">
        {[
          { key: 'rooms', label: 'Rooms & Beds', icon: DoorOpen },
          { key: 'admissions', label: 'Admissions', icon: Users },
          { key: 'availability', label: 'Bed Availability', icon: Activity },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${activeTab === tab.key ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-dark-300 hover:text-white hover:bg-dark-800/50'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ ROOMS & BEDS TAB ═══════════════ */}
      {activeTab === 'rooms' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-dark-900/50 rounded-xl border border-dark-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-dark-400 text-xs">Total Rooms</p>
                  <p className="text-2xl font-bold text-white">{roomStats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-dark-900/50 rounded-xl border border-dark-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Bed className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-dark-400 text-xs">Total Beds</p>
                  <p className="text-2xl font-bold text-white">{roomStats.totalBeds}</p>
                </div>
              </div>
            </div>
            <div className="bg-dark-900/50 rounded-xl border border-green-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-dark-400 text-xs">Available</p>
                  <p className="text-2xl font-bold text-green-400">{roomStats.available}</p>
                </div>
              </div>
            </div>
            <div className="bg-dark-900/50 rounded-xl border border-red-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-dark-400 text-xs">Occupied</p>
                  <p className="text-2xl font-bold text-red-400">{roomStats.occupied}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input type="text" placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
              <option value="" className="bg-dark-800">All Types</option>
              {ROOM_TYPES.map(t => <option key={t} value={t} className="bg-dark-800">{t}</option>)}
            </select>
            <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
              <option value="" className="bg-dark-800">All Floors</option>
              {FLOORS.map(f => <option key={f} value={f} className="bg-dark-800">Floor {f}</option>)}
            </select>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length === 0 ? (
            <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-16 text-center">
              <DoorOpen className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400 font-medium">No rooms found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map(room => {
                const beds = room.beds || [];
                const occCount = beds.filter(b => b.status === 'Occupied').length;
                const availCount = beds.filter(b => b.status === 'Available').length;
                return (
                  <div key={room._id} className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden hover:border-primary-500/30 transition-all">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                            <DoorOpen className="w-5 h-5 text-primary-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{room.roomNumber}</h3>
                            <p className="text-dark-400 text-xs">Floor {room.floor}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${roomTypeColors[room.type] || 'bg-dark-500/20 text-dark-400 border-dark-500/30'}`}>
                          {room.type}
                        </span>
                      </div>

                      {room.department && (
                        <p className="text-dark-300 text-sm mb-3 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> {room.department}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-dark-400">Capacity: <span className="text-white font-semibold">{room.capacity}</span></span>
                        <span className="text-primary-400 font-semibold">Rs. {room.ratePerDay?.toLocaleString()}/day</span>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-md">{availCount} Available</span>
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-md">{occCount} Occupied</span>
                      </div>

                      {/* Beds Visual */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {beds.map((bed, idx) => (
                          <button key={idx} onClick={() => openBedStatusModal(room, idx)}
                            className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold text-white transition-all hover:scale-110 ${bedStatusColors[bed.status] || 'bg-gray-500 border-gray-500'}`}
                            title={`Bed ${idx + 1}: ${bed.status}`}>
                            {idx + 1}
                          </button>
                        ))}
                      </div>

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {room.amenities.slice(0, 4).map((a, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-dark-800/50 border border-dark-700/30 rounded-full text-dark-300">{a}</span>
                          ))}
                          {room.amenities.length > 4 && (
                            <span className="text-[10px] px-2 py-0.5 bg-dark-800/50 border border-dark-700/30 rounded-full text-dark-400">+{room.amenities.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-dark-700/30 px-5 py-3 flex justify-end gap-2">
                      <button onClick={() => handleEditRoom(room)}
                        className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteRoom(room._id)}
                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══════════════ ADMISSIONS TAB ═══════════════ */}
      {activeTab === 'admissions' && (
        <>
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input type="text" placeholder="Search by admission #, patient, doctor, or room..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
              <option value="" className="bg-dark-800">All Status</option>
              {ADMISSION_STATUSES.map(s => <option key={s} value={s} className="bg-dark-800">{s}</option>)}
            </select>
          </div>

          {/* Admissions Table */}
          <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Admission #</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Bed</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Admission Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/50">
                  {filteredAdmissions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-dark-800/50 rounded-2xl flex items-center justify-center">
                            <Users className="w-8 h-8 text-dark-500" />
                          </div>
                          <p className="text-dark-400 font-medium">No admissions found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAdmissions.map((adm) => (
                      <tr key={adm._id} className="hover:bg-dark-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-primary-400">{adm.admissionNumber}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {adm.patientId?.firstName?.charAt(0)}{adm.patientId?.lastName?.charAt(0)}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-white">{adm.patientId?.firstName} {adm.patientId?.lastName}</span>
                              <p className="text-xs text-dark-500">{adm.patientId?.mrn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{adm.doctorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">{adm.roomId?.roomNumber || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">Bed {(adm.bedIndex || 0) + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                          {adm.admissionDate ? new Date(adm.admissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${admissionStatusColors[adm.status] || ''}`}>
                            {adm.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setSelectedAdmission(adm); setShowDetailModal(true); }}
                              className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                            {adm.status === 'Admitted' && (
                              <button onClick={() => openDischargeModal(adm)}
                                className="px-3 py-1.5 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors">
                                Discharge
                              </button>
                            )}
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

      {/* ═══════════════ BED AVAILABILITY TAB ═══════════════ */}
      {activeTab === 'availability' && (
        <>
          {/* Legend */}
          <div className="flex gap-4 flex-wrap items-center">
            <span className="text-sm text-dark-400 font-medium">Legend:</span>
            {Object.entries(bedStatusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${color}`}></div>
                <span className="text-sm text-dark-300">{status}</span>
              </div>
            ))}
          </div>

          {/* Summary by Room Type */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {availabilityByType.map(stat => (
              <div key={stat.type} className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${roomTypeColors[stat.type]}`}>{stat.type}</span>
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-400">Rooms</span>
                    <span className="text-white font-semibold">{stat.rooms}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-400">Total Beds</span>
                    <span className="text-white font-semibold">{stat.totalBeds}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">Available</span>
                    <span className="text-green-400 font-semibold">{stat.available}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-400">Occupied</span>
                    <span className="text-red-400 font-semibold">{stat.occupied}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-yellow-400">Reserved</span>
                    <span className="text-yellow-400 font-semibold">{stat.reserved}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Maintenance</span>
                    <span className="text-gray-400 font-semibold">{stat.maintenance}</span>
                  </div>
                </div>
                {stat.totalBeds > 0 && (
                  <div className="mt-3 bg-dark-700/50 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                      style={{ width: `${Math.round((stat.occupied / stat.totalBeds) * 100)}%` }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Visual Grid */}
          <div className="space-y-4">
            {rooms.length === 0 ? (
              <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-16 text-center">
                <Bed className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                <p className="text-dark-400 font-medium">No rooms configured</p>
              </div>
            ) : (
              rooms.map(room => (
                <div key={room._id} className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <DoorOpen className="w-5 h-5 text-primary-400" />
                      <h3 className="text-white font-bold">{room.roomNumber}</h3>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${roomTypeColors[room.type]}`}>{room.type}</span>
                      <span className="text-xs text-dark-400">Floor {room.floor}</span>
                      {room.department && <span className="text-xs text-dark-400">| {room.department}</span>}
                    </div>
                    <span className="text-xs text-dark-400">
                      {room.beds?.filter(b => b.status === 'Occupied').length || 0}/{room.beds?.length || room.capacity || 0} occupied
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(room.beds || []).map((bed, idx) => (
                      <button key={idx} onClick={() => openBedStatusModal(room, idx)}
                        className={`px-4 py-3 rounded-xl border-2 flex flex-col items-center gap-1 min-w-[70px] transition-all hover:scale-105 ${bedStatusColors[bed.status] || 'bg-gray-500 border-gray-500'}`}>
                        <span className="text-white font-bold text-sm">Bed {idx + 1}</span>
                        <span className="text-white/70 text-[10px]">{bed.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ═══════════════ ADD/EDIT ROOM MODAL ═══════════════ */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                  <p className="text-sm text-dark-400 mt-1">Configure room details and capacity</p>
                </div>
                <button onClick={() => { setShowRoomModal(false); setEditingRoom(null); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleRoomSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Room Number *</label>
                  <input type="text" required value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="e.g. 101-A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Floor *</label>
                  <select required value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    {FLOORS.map(f => <option key={f} value={f} className="bg-dark-800">Floor {f}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Room Type *</label>
                  <select required value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    {ROOM_TYPES.map(t => <option key={t} value={t} className="bg-dark-800">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Department</label>
                  <input type="text" value={roomForm.department}
                    onChange={(e) => setRoomForm({ ...roomForm, department: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="e.g. Cardiology" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Capacity (Beds) *</label>
                  <input type="number" required min="1" max="20" value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Rate Per Day (Rs.) *</label>
                  <input type="number" required min="0" value={roomForm.ratePerDay}
                    onChange={(e) => setRoomForm({ ...roomForm, ratePerDay: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Amenities</label>
                <div className="flex gap-2">
                  <input type="text" value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
                    className="flex-1 px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="e.g. AC, TV, WiFi" />
                  <button type="button" onClick={addAmenity}
                    className="px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-700/50 transition-all font-medium">
                    Add
                  </button>
                </div>
                {roomForm.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {roomForm.amenities.map((a, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-lg text-xs text-primary-400">
                        {a}
                        <button type="button" onClick={() => removeAmenity(i)} className="hover:text-white transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/50">
                <button type="button" onClick={() => { setShowRoomModal(false); setEditingRoom(null); }}
                  className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ ADMIT PATIENT MODAL ═══════════════ */}
      {showAdmitModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Admit Patient</h2>
                  <p className="text-sm text-dark-400 mt-1">Register a new inpatient admission</p>
                </div>
                <button onClick={() => { setShowAdmitModal(false); setPatientSearch(''); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAdmitSubmit} className="p-6 space-y-4">
              {/* Patient */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Select Patient *</label>
                <input type="text" placeholder="Search by name, MRN, or phone..." value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all mb-2" />
                <select required value={admitForm.patientId}
                  onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                  <option value="" className="bg-dark-800">Select Patient</option>
                  {filteredPatientList.map(p => (
                    <option key={p._id} value={p._id} className="bg-dark-800">{p.firstName} {p.lastName} ({p.mrn}){p.phone ? ` - ${p.phone}` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Doctor & Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Doctor Name *</label>
                  <input type="text" required value={admitForm.doctorName}
                    onChange={(e) => setAdmitForm({ ...admitForm, doctorName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Dr. Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Department *</label>
                  <input type="text" required value={admitForm.department}
                    onChange={(e) => setAdmitForm({ ...admitForm, department: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="e.g. Cardiology" />
                </div>
              </div>

              {/* Room & Bed */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Select Room *</label>
                  <select required value={admitForm.roomId}
                    onChange={(e) => setAdmitForm({ ...admitForm, roomId: e.target.value, bedIndex: 0 })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="" className="bg-dark-800">Select Room</option>
                    {availableRooms.map(r => (
                      <option key={r._id} value={r._id} className="bg-dark-800">
                        {r.roomNumber} - {r.type} ({r.beds?.filter(b => b.status === 'Available').length || 0} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Select Bed *</label>
                  <select required value={admitForm.bedIndex}
                    onChange={(e) => setAdmitForm({ ...admitForm, bedIndex: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="" className="bg-dark-800">Select Bed</option>
                    {admitForm.roomId && rooms.find(r => r._id === admitForm.roomId)?.beds?.map((bed, idx) => (
                      bed.status === 'Available' && (
                        <option key={idx} value={idx} className="bg-dark-800">Bed {idx + 1} - {bed.status}</option>
                      )
                    ))}
                  </select>
                </div>
              </div>

              {/* Diagnosis & Treatment */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Diagnosis *</label>
                <input type="text" required value={admitForm.diagnosis}
                  onChange={(e) => setAdmitForm({ ...admitForm, diagnosis: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Primary diagnosis" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Treatment Plan</label>
                <textarea value={admitForm.treatmentPlan}
                  onChange={(e) => setAdmitForm({ ...admitForm, treatmentPlan: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  rows="2" placeholder="Planned treatment approach" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Reason for Admission</label>
                  <input type="text" value={admitForm.reason}
                    onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Reason" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Nurse Assigned</label>
                  <input type="text" value={admitForm.nurseAssigned}
                    onChange={(e) => setAdmitForm({ ...admitForm, nurseAssigned: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Nurse name" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/50">
                <button type="button" onClick={() => { setShowAdmitModal(false); setPatientSearch(''); }}
                  className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">
                  Admit Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ ADMISSION DETAIL MODAL ═══════════════ */}
      {showDetailModal && selectedAdmission && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-dark-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Admission Details</h2>
                  <p className="text-sm text-dark-400 mt-1">{selectedAdmission.admissionNumber}</p>
                </div>
                <button onClick={() => { setShowDetailModal(false); setSelectedAdmission(null); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Patient</p>
                  <p className="text-sm font-semibold text-white">{selectedAdmission.patientId?.firstName} {selectedAdmission.patientId?.lastName}</p>
                  <p className="text-xs text-dark-500">{selectedAdmission.patientId?.mrn}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Doctor</p>
                  <p className="text-sm font-semibold text-white">{selectedAdmission.doctorName}</p>
                  <p className="text-xs text-dark-500">{selectedAdmission.department}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Room & Bed</p>
                  <p className="text-sm font-semibold text-white">{selectedAdmission.roomId?.roomNumber || '-'}</p>
                  <p className="text-xs text-dark-500">Bed {(selectedAdmission.bedIndex || 0) + 1}</p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Status</p>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${admissionStatusColors[selectedAdmission.status] || ''}`}>
                    {selectedAdmission.status}
                  </span>
                </div>
              </div>

              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <p className="text-xs text-dark-400 mb-1">Admission Date</p>
                <p className="text-sm text-white">
                  {selectedAdmission.admissionDate ? new Date(selectedAdmission.admissionDate).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
              </div>

              {selectedAdmission.diagnosis && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Diagnosis</p>
                  <p className="text-sm text-white">{selectedAdmission.diagnosis}</p>
                </div>
              )}

              {selectedAdmission.treatmentPlan && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Treatment Plan</p>
                  <p className="text-sm text-white">{selectedAdmission.treatmentPlan}</p>
                </div>
              )}

              {selectedAdmission.reason && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Reason for Admission</p>
                  <p className="text-sm text-white">{selectedAdmission.reason}</p>
                </div>
              )}

              {selectedAdmission.nurseAssigned && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Nurse Assigned</p>
                  <p className="text-sm text-white">{selectedAdmission.nurseAssigned}</p>
                </div>
              )}

              {selectedAdmission.dischargeDate && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Discharge Date</p>
                  <p className="text-sm text-white">
                    {new Date(selectedAdmission.dischargeDate).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              {selectedAdmission.dischargeNotes && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                  <p className="text-xs text-dark-400 mb-1">Discharge Notes</p>
                  <p className="text-sm text-white">{selectedAdmission.dischargeNotes}</p>
                </div>
              )}

              {selectedAdmission.totalCharges > 0 && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-primary-500/20">
                  <p className="text-xs text-dark-400 mb-1">Total Charges</p>
                  <p className="text-lg font-bold text-primary-400">Rs. {selectedAdmission.totalCharges?.toLocaleString()}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-dark-700/30">
                <button onClick={() => { setShowDetailModal(false); setSelectedAdmission(null); }}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/30">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ DISCHARGE MODAL ═══════════════ */}
      {showDischargeModal && dischargingAdmission && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-green-900/20 to-dark-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Discharge Patient</h2>
                  <p className="text-sm text-dark-400 mt-1">{dischargingAdmission.admissionNumber} — {dischargingAdmission.patientId?.firstName} {dischargingAdmission.patientId?.lastName}</p>
                </div>
                <button onClick={() => { setShowDischargeModal(false); setDischargingAdmission(null); }} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <form onSubmit={handleDischarge} className="p-6 space-y-4">
              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-dark-400">Room:</span>
                    <span className="ml-2 text-white font-semibold">{dischargingAdmission.roomId?.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-dark-400">Rate/Day:</span>
                    <span className="ml-2 text-primary-400 font-semibold">Rs. {dischargingAdmission.roomId?.ratePerDay?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-dark-400">Admitted:</span>
                    <span className="ml-2 text-white">{dischargingAdmission.admissionDate ? new Date(dischargingAdmission.admissionDate).toLocaleDateString() : '-'}</span>
                  </div>
                  <div>
                    <span className="text-dark-400">Days:</span>
                    <span className="ml-2 text-white font-semibold">
                      {dischargingAdmission.admissionDate ? Math.max(1, Math.ceil((new Date() - new Date(dischargingAdmission.admissionDate)) / (1000 * 60 * 60 * 24))) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Total Charges (Rs.)</label>
                <input type="number" required min="0" value={dischargeForm.totalCharges}
                  onChange={(e) => setDischargeForm({ ...dischargeForm, totalCharges: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Discharge Notes</label>
                <textarea value={dischargeForm.notes}
                  onChange={(e) => setDischargeForm({ ...dischargeForm, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600/50 rounded-xl text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  rows="3" placeholder="Discharge summary, instructions, follow-up..." />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700/50">
                <button type="button" onClick={() => { setShowDischargeModal(false); setDischargingAdmission(null); }}
                  className="px-6 py-3 border border-dark-600/50 rounded-xl text-dark-300 hover:bg-dark-800 transition-all font-medium">Cancel</button>
                <button type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30">
                  Confirm Discharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ BED STATUS MODAL ═══════════════ */}
      {showBedStatusModal && selectedRoomForBed && selectedBed && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 border-b border-dark-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Update Bed Status</h2>
                  <p className="text-sm text-dark-400 mt-1">{selectedRoomForBed.roomNumber} — Bed {selectedBed.index + 1}</p>
                </div>
                <button onClick={() => setShowBedStatusModal(false)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-dark-300 mb-2">Current: <span className="text-white font-semibold">{selectedBed.status}</span></p>
              {BED_STATUSES.map(status => (
                <button key={status} onClick={() => handleBedStatusUpdate(status)}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 border ${
                    selectedBed.status === status
                      ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                      : 'bg-dark-800/50 border-dark-700/30 text-dark-300 hover:bg-dark-700/50 hover:text-white'
                  }`}>
                  <div className={`w-4 h-4 rounded border-2 ${bedStatusColors[status]}`}></div>
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inpatient;
