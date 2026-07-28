const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Capsule', 'Tablet', 'Syrup', 'Suspension', 'Gel', 'Cream', 'Ointment', 'Drops', 'Solution', 'Lotion', 'Mouthwash', 'Paste', 'Chewable Tablet', 'Dry Syrup', 'Sublingual Tablet', 'Ointment', 'Other'],
    default: 'Other'
  },
  dosage: {
    type: String,
    trim: true
  },
  form: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true,
    default: 'Various'
  },
  price: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    enum: ['strip', 'bottle', 'tube', 'box', 'piece', 'vial'],
    default: 'strip'
  },
  description: {
    type: String,
    trim: true
  },
  requiresPrescription: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);
