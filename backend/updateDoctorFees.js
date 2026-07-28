const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const dotenv = require('dotenv');

dotenv.config();

const feeByDepartment = {
  'General Medicine': 1500,
  'Pediatrics': 1500,
  'Emergency Medicine': 1000,
  'Geriatric Medicine': 1500,
  'Internal Medicine': 1500,
  'Gynecology': 2000,
  'Pulmonology': 2000,
  'Endocrinology': 2500,
  'Dermatology': 2000,
  'Ophthalmology': 2000,
  'Urology': 2500,
  'Gastroenterology': 2500,
  'Psychiatry': 2500,
  'Hematology': 2500,
  'Orthopedics': 2500,
  'Anesthesiology': 2000,
  'Radiology': 2000,
  'Cardiology': 3000,
  'Neurology': 3000,
  'General Surgery': 3000,
  'Neurosurgery': 3500,
  'Cardiovascular Surgery': 4000,
  'Plastic Surgery': 4000,
  'Administration': 0,
  'Reception': 0
};

const updateFees = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lincoln_hospital');
    console.log('MongoDB Connected\n');

    const doctors = await Doctor.find({ role: 'doctor' });
    console.log(`Found ${doctors.length} doctors\n`);

    let updated = 0;
    for (const doctor of doctors) {
      const newFee = feeByDepartment[doctor.department] || 1500;
      if (doctor.consultationFee !== newFee) {
        doctor.consultationFee = newFee;
        await doctor.save();
        updated++;
        console.log(`Updated: ${doctor.name} (${doctor.department}) - Rs. ${newFee}`);
      }
    }

    console.log(`\n=== UPDATE COMPLETE ===`);
    console.log(`Total doctors: ${doctors.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Already correct: ${doctors.length - updated}`);

    const feeRanges = await Doctor.aggregate([
      { $match: { role: 'doctor' } },
      { $group: { _id: null, minFee: { $min: '$consultationFee' }, maxFee: { $max: '$consultationFee' }, avgFee: { $avg: '$consultationFee' } } }
    ]);
    if (feeRanges.length > 0) {
      console.log(`\nFee Range: Rs. ${feeRanges[0].minFee} - Rs. ${feeRanges[0].maxFee}`);
      console.log(`Average Fee: Rs. ${Math.round(feeRanges[0].avgFee)}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateFees();
