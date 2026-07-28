const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    if (!room.beds || room.beds.length === 0) {
      room.beds = [];
      for (let i = 1; i <= room.capacity; i++) {
        room.beds.push({ bedNumber: `${room.roomNumber}-B${i}` });
      }
    }
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const { type, floor, isActive } = req.query;
    let query = {};
    if (type) query.type = type;
    if (floor) query.floor = parseInt(floor);
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    const roomsWithStats = rooms.map(r => {
      const obj = r.toObject();
      obj.totalBeds = obj.beds.length;
      obj.occupiedBeds = obj.beds.filter(b => b.status === 'Occupied').length;
      obj.availableBeds = obj.beds.filter(b => b.status === 'Available').length;
      return obj;
    });
    res.json(roomsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('beds.patientId');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBed = async (req, res) => {
  try {
    const { bedIndex, status, patientId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (bedIndex >= 0 && bedIndex < room.beds.length) {
      room.beds[bedIndex].status = status;
      if (status === 'Occupied' && patientId) {
        room.beds[bedIndex].patientId = patientId;
        room.beds[bedIndex].admittedAt = new Date();
      } else if (status === 'Available') {
        room.beds[bedIndex].patientId = undefined;
        room.beds[bedIndex].dischargedAt = new Date();
      }
    }
    await room.save();
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true });
    const summary = rooms.map(r => ({
      roomNumber: r.roomNumber,
      type: r.type,
      floor: r.floor,
      total: r.beds.length,
      available: r.beds.filter(b => b.status === 'Available').length,
      occupied: r.beds.filter(b => b.status === 'Occupied').length
    }));
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
