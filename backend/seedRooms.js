const mongoose = require('mongoose');
const Room = require('./models/Room');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lincoln_hospital';

const rooms = [
  { roomNumber: '101', floor: 1, type: 'General', department: 'General Medicine', capacity: 4, ratePerDay: 1500, amenities: ['Fan', 'TV'] },
  { roomNumber: '102', floor: 1, type: 'General', department: 'General Medicine', capacity: 4, ratePerDay: 1500, amenities: ['Fan', 'TV'] },
  { roomNumber: '103', floor: 1, type: 'Semi-Private', department: 'General Medicine', capacity: 2, ratePerDay: 3000, amenities: ['AC', 'TV', 'Refrigerator'] },
  { roomNumber: '104', floor: 1, type: 'Emergency', department: 'Emergency', capacity: 6, ratePerDay: 2000, amenities: ['Monitors', 'Oxygen'] },
  { roomNumber: '201', floor: 2, type: 'General', department: 'Surgery', capacity: 4, ratePerDay: 1500, amenities: ['Fan', 'TV'] },
  { roomNumber: '202', floor: 2, type: 'Private', department: 'Surgery', capacity: 1, ratePerDay: 5000, amenities: ['AC', 'TV', 'Refrigerator', 'Sofa'] },
  { roomNumber: '203', floor: 2, type: 'Private', department: 'Cardiology', capacity: 1, ratePerDay: 6000, amenities: ['AC', 'TV', 'Refrigerator', 'Sofa', 'Balcony'] },
  { roomNumber: '204', floor: 2, type: 'Semi-Private', department: 'Orthopedics', capacity: 2, ratePerDay: 3000, amenities: ['AC', 'TV'] },
  { roomNumber: '301', floor: 3, type: 'ICU', department: 'ICU', capacity: 1, ratePerDay: 10000, amenities: ['Ventilator', 'Monitor', 'Oxygen', 'IV Pump'] },
  { roomNumber: '302', floor: 3, type: 'ICU', department: 'ICU', capacity: 1, ratePerDay: 10000, amenities: ['Ventilator', 'Monitor', 'Oxygen', 'IV Pump'] },
  { roomNumber: '303', floor: 3, type: 'ICU', department: 'ICU', capacity: 1, ratePerDay: 10000, amenities: ['Ventilator', 'Monitor', 'Oxygen', 'IV Pump'] },
  { roomNumber: '304', floor: 3, type: 'VIP', department: 'VIP', capacity: 1, ratePerDay: 15000, amenities: ['AC', 'TV', 'Refrigerator', 'Sofa', 'Balcony', 'Kitchen', 'Wifi'] },
  { roomNumber: '401', floor: 4, type: 'Operation', department: 'Surgery', capacity: 1, ratePerDay: 20000, amenities: ['Surgical Lights', 'Anesthesia Machine', 'Monitor'] },
  { roomNumber: '402', floor: 4, type: 'Operation', department: 'Surgery', capacity: 1, ratePerDay: 20000, amenities: ['Surgical Lights', 'Anesthesia Machine', 'Monitor'] },
  { roomNumber: '403', floor: 4, type: 'Maternity', department: 'Gynecology', capacity: 2, ratePerDay: 4000, amenities: ['AC', 'TV', 'Baby Cot'] },
  { roomNumber: '501', floor: 5, type: 'Pediatric', department: 'Pediatrics', capacity: 3, ratePerDay: 2500, amenities: ['AC', 'TV', 'Toys'] },
  { roomNumber: '502', floor: 5, type: 'Isolation', department: 'Pulmonology', capacity: 1, ratePerDay: 5000, amenities: ['Negative Pressure', 'AC', 'TV', 'PPE Station'] },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    
    await Room.deleteMany({});
    console.log('Cleared existing rooms');
    
    for (const roomData of rooms) {
      const room = new Room(roomData);
      for (let i = 1; i <= roomData.capacity; i++) {
        room.beds.push({ bedNumber: `${roomData.roomNumber}-B${i}` });
      }
      await room.save();
      console.log(`Created room ${roomData.roomNumber} with ${roomData.capacity} beds`);
    }
    
    console.log(`\nSeeded ${rooms.length} rooms successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
