const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  admissionNumber: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorName: { type: String, required: true },
  department: String,
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  bedNumber: String,
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: Date,
  diagnosis: String,
  treatmentPlan: String,
  status: { type: String, enum: ['Admitted', 'Transferred', 'Discharged', 'Cancelled'], default: 'Admitted' },
  reason: String,
  notes: String,
  totalCharges: { type: Number, default: 0 },
  nurseAssigned: String
}, { timestamps: true });

admissionSchema.pre('save', async function (next) {
  if (!this.admissionNumber) {
    const count = await mongoose.model('Admission').countDocuments();
    this.admissionNumber = `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Admission', admissionSchema);
