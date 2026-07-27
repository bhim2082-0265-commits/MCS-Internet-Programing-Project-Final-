const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password: { type: String, minlength: 6 },
  phone: { type: String },
  department: { type: String, required: true },
  specialty: { type: String },
  hospital: { type: String },
  location: { type: String },
  consultationFee: { type: Number, default: 0 },
  role: { type: String, enum: ['doctor','admin','receptionist'], default: 'receptionist' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

const receptionists = [
  { name: 'Kusam', email: 'kusam@lincolnhospital.com.np', password: 'reception123', phone: '9841234580', department: 'Reception', specialty: 'Front Desk', hospital: 'Lincoln International Hospital', location: 'Dhobidhara, Kathmandu, Nepal', role: 'receptionist' },
  { name: 'Goma', email: 'goma@lincolnhospital.com.np', password: 'reception123', phone: '9841234581', department: 'Reception', specialty: 'Front Desk', hospital: 'Lincoln International Hospital', location: 'Dhobidhara, Kathmandu, Nepal', role: 'receptionist' },
  { name: 'Binita', email: 'binita@lincolnhospital.com.np', password: 'reception123', phone: '9841234582', department: 'Reception', specialty: 'Front Desk', hospital: 'Lincoln International Hospital', location: 'Dhobidhara, Kathmandu, Nepal', role: 'receptionist' }
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lincoln_hospital');
  for (const r of receptionists) {
    const exists = await Doctor.findOne({ email: r.email });
    if (exists) { console.log('Already exists: ' + r.name); continue; }
    await new Doctor(r).save();
    console.log('Created: ' + r.name + ' (' + r.email + ')');
  }
  process.exit(0);
})();
