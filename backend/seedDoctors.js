const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const dotenv = require('dotenv');

dotenv.config();

// Admin and Department User Accounts
const adminUsers = [
  {
    name: "Bhim Kafle",
    email: "bhim.kafle@lincolnhospital.com.np",
    password: "admin123",
    phone: "9841234567",
    department: "Administration",
    specialty: "System Administrator",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 0,
    role: "admin",
    isSeedData: true
  },
  {
    name: "Rupesh Khatri",
    email: "rupesh.khatri@lincolnhospital.com.np",
    password: "admin123",
    phone: "9841234568",
    department: "Administration",
    specialty: "System Administrator",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 0,
    role: "admin",
    isSeedData: true
  },
  {
    name: "Dikshant Acharya",
    email: "dikshant.acharya@lincolnhospital.com.np",
    password: "admin123",
    phone: "9841234569",
    department: "Administration",
    specialty: "System Administrator",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 0,
    role: "admin",
    isSeedData: true
  },
  // Receptionist Users
  {
    name: "Sita Sharma",
    email: "sita.sharma@lincolnhospital.com.np",
    password: "reception123",
    phone: "9841234570",
    department: "Reception",
    specialty: "Front Desk",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 0,
    role: "receptionist",
    isSeedData: true
  },
  {
    name: "Ram Bahadur Thapa",
    email: "ram.thapa@lincolnhospital.com.np",
    password: "reception123",
    phone: "9841234571",
    department: "Reception",
    specialty: "Front Desk",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 0,
    role: "receptionist",
    isSeedData: true
  },
  // Doctor Users (for login)
  {
    name: "Dr. Aashish Manandhar",
    email: "aashish.manandhar@lincolnhospital.com.np",
    password: "doctor123",
    phone: "9841234572",
    department: "General Medicine",
    specialty: "General Practice",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 1000,
    role: "doctor",
    isSeedData: true
  },
  {
    name: "Dr. Suman Shrestha",
    email: "suman.shrestha@lincolnhospital.com.np",
    password: "doctor123",
    phone: "9841234573",
    department: "Cardiology",
    specialty: "Cardiology",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 2000,
    role: "doctor",
    isSeedData: true
  },
  {
    name: "Dr. Priya Thapa",
    email: "priya.thapa@lincolnhospital.com.np",
    password: "doctor123",
    phone: "9841234574",
    department: "Pediatrics",
    specialty: "Pediatrics",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 1000,
    role: "doctor",
    isSeedData: true
  },
  {
    name: "Dr. Ramesh Adhikari",
    email: "ramesh.adhikari@lincolnhospital.com.np",
    password: "doctor123",
    phone: "9841234575",
    department: "Orthopedics",
    specialty: "Orthopedics",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 1500,
    role: "doctor",
    isSeedData: true
  },
  {
    name: "Dr. Sarita Koirala",
    email: "sarita.koirala@lincolnhospital.com.np",
    password: "doctor123",
    phone: "9841234576",
    department: "Gynecology",
    specialty: "Gynecology",
    hospital: "Lincoln International Hospital",
    location: "Dhobidhara, Kathmandu, Nepal",
    consultationFee: 1200,
    role: "doctor",
    isSeedData: true
  }
];

// All doctors from the report
const doctors = [
  // AMDA Hospital, Damak, Jhapa
  { name: "Dr. Kishor Kumar Singh", department: "General Medicine", specialty: "MDGP", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  { name: "Dr. Nabin Dhakal", department: "Anesthesiology", specialty: "Anesthesiology", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  { name: "Dr. Prakash Sharma", department: "General Medicine", specialty: "MDGP", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  { name: "Dr. Bimala Budhathoki", department: "Gynecology", specialty: "Gynecology", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1200 },
  { name: "Dr. Sanjay Rimal", department: "General Surgery", specialty: "General Surgery", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1500 },
  { name: "Dr. Lila Sundar Shrestha", department: "Pediatrics", specialty: "Pediatrics", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  { name: "Dr. Dilli Raj Rijal", department: "Orthopedics", specialty: "Orthopedics", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1200 },
  { name: "Dr. Dibya Tulachan", department: "Radiology", specialty: "Radiology", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1500 },
  { name: "Dr. Diwash Raj Bohora", department: "Internal Medicine", specialty: "Internal Medicine", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  { name: "Dr. Shikhar Kattel", department: "General Medicine", specialty: "MDGP", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  { name: "Dr. Raju Prasad Sah", department: "Gynecology", specialty: "Gynecology", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1200 },
  { name: "Dr. Purushottam Majhi", department: "General Medicine", specialty: "MDGP", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  { name: "Dr. Narayan Nepal", department: "Internal Medicine", specialty: "Internal Medicine", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  { name: "Dr. Rohit Kumar Rai", department: "Anesthesiology", specialty: "Anesthesiology", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  { name: "Dr. Satya Narayan Chaudhary", department: "Pediatrics", specialty: "Pediatrics", hospital: "AMDA Hospital", location: "Damak, Jhapa", consultationFee: 1000 },
  // Nepal APF Hospital
  { name: "DIG Dr. Rupak Maharjan", department: "Dermatology", specialty: "Dermatology", hospital: "Nepal APF Hospital", location: "Kathmandu", consultationFee: 1200 },
  { name: "SSP Dr. Meena Kunwar Joshi", department: "Ophthalmology", specialty: "Ophthalmology", hospital: "Nepal APF Hospital", location: "Kathmandu", consultationFee: 1200 },
  { name: "SSP Dr. Sailendra Kumar Duwal Shrestha", department: "Orthopedics", specialty: "Orthopedics", hospital: "Nepal APF Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Basant Raj Panta", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neurological Institute", location: "Kathmandu", consultationFee: 2000 },
  { name: "Dr. Jyotindra Sharma", department: "Internal Medicine", specialty: "Internal Medicine", hospital: "HAMS Hospital", location: "Kathmandu", consultationFee: 1000 },
  // Metro Kathmandu Hospital
  { name: "Dr. Sweta Agrawal", department: "General Medicine", specialty: "General Physician", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1000 },
  { name: "Dr. Jyoti Bhattarai", department: "Endocrinology", specialty: "Endocrinology", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Tarkeshwor Mahato", department: "Endocrinology", specialty: "Endocrinology", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Binay Bhattarai", department: "Endocrinology", specialty: "Endocrinology", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Birat Krishna Timalsina", department: "Cardiology", specialty: "Cardiology", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 2000 },
  { name: "Dr. Suraj Kumar Gupta", department: "Pulmonology", specialty: "Chest Physician", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1200 },
  { name: "Dr. Subarna Acharya", department: "Pulmonology", specialty: "Chest Physician", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1200 },
  { name: "Dr. Dipendra Lal Shrestha", department: "General Medicine", specialty: "Senior Medical Officer", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1000 },
  { name: "Dr. Bikal Ghimire", department: "General Surgery", specialty: "GI Surgery", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 2000 },
  { name: "Dr. Prasan Bir Singh Kansakar", department: "General Surgery", specialty: "GI Surgery", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 2000 },
  { name: "Dr. Sangam Rayamajhi", department: "Plastic Surgery", specialty: "Plastic Surgery", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 2500 },
  { name: "Dr. Anjan Shrestha", department: "Hematology", specialty: "Hematology", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Rajat Pradhan", department: "Cardiovascular Surgery", specialty: "Cardiovascular Surgery", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 3000 },
  { name: "Dr. Ajay Rana", department: "Orthopedics", specialty: "Orthopedics", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Sumit Agrawal", department: "Orthopedics", specialty: "Orthopedics", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Gyanendra Shah", department: "Orthopedics", specialty: "Orthopedics", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Shankar Thapa", department: "Orthopedics", specialty: "Orthopedics", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Deependra Pandey", department: "Orthopedics", specialty: "Orthopedics", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  { name: "Dr. Deepak Khadka", department: "Orthopedics", specialty: "Orthopedics", hospital: "Metro Kathmandu Hospital", location: "Kathmandu", consultationFee: 1500 },
  // Annapurna Neuro Hospital
  { name: "Dr. Basant Pant", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Pravesh Rajbhandari", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Pranaya Shrestha", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Sudan Dhakal", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Resha Shrestha", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Samir Acharya", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Pritam Gurung", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Janam Shrestha", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Saujanya Rajbhandari", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Rizu Dahal", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Rajeev Pandit", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Reema Rajbhandari", department: "Neurology", specialty: "Neurology", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Avinash Chandra", department: "Neurology", specialty: "Neurology", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Tejashwi Shrestha", department: "Neurology", specialty: "Neurology", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Shrijana Maharjan", department: "Psychiatry", specialty: "Neuropsychiatry", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Ashish Dhakal", department: "Psychiatry", specialty: "Neuropsychiatry", hospital: "Annapurna Neuro Hospital", location: "Maitighar, Kathmandu", consultationFee: 1500 },
  // HAMS Hospital
  { name: "Dr. Abart Joshi", department: "Urology", specialty: "Urology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Amit Shrestha", department: "Hematology", specialty: "Hematology/Oncology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Amrit Bogati", department: "Cardiology", specialty: "Cardiology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Anuj Parajuli", department: "General Surgery", specialty: "GI Surgery", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Archana Pokharel", department: "Ophthalmology", specialty: "Ophthalmology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1200 },
  { name: "Dr. Arjun Karki", department: "Pulmonology", specialty: "Pulmonary & Critical Care", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Atit Poudel", department: "Gynecology", specialty: "Obstetrics & Gynecology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Avinab Prasad Shrestha", department: "Emergency Medicine", specialty: "Emergency Medicine", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1000 },
  { name: "Dr. Bhaskar Raj Pant", department: "Orthopedics", specialty: "Orthopedics", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Bhola Rijal", department: "Gynecology", specialty: "Gynecology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1200 },
  { name: "Dr. Bibek Kumar Purbey", department: "Gastroenterology", specialty: "Gastroenterology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Keshav Buddhathoki", department: "Cardiology", specialty: "Cardiology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Krishna Dhungana", department: "Neurology", specialty: "Neurology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1500 },
  { name: "Prof. Dr. Sunil Ram Koirala", department: "Neurology", specialty: "Neurology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 2000 },
  { name: "Dr. Madhu Sudhan Ghale Gurung", department: "Orthopedics", specialty: "Orthopedics", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Monisma Malla", department: "Radiology", specialty: "Radiology", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Urza Bhattarai", department: "Geriatric Medicine", specialty: "Geriatric Medicine", hospital: "HAMS Hospital", location: "Dhumbarahi, Kathmandu", consultationFee: 1200 },
  // Nepal Mediciti Hospital
  { name: "Dr. Gopal Raman Sharma", department: "Neurosurgery", specialty: "Neurosurgery", hospital: "Nepal Mediciti Hospital", location: "Lalitpur", consultationFee: 2000 },
  { name: "Dr. Baburam Pokharel", department: "Neurology", specialty: "Neurology", hospital: "Nepal Mediciti Hospital", location: "Lalitpur", consultationFee: 1500 },
  // Grande International Hospital
  { name: "Dr. Raju Paudel", department: "Neurology", specialty: "Neurology", hospital: "Grande International Hospital", location: "Tokha, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Naresh Kharbuja", department: "Neurology", specialty: "Neurology", hospital: "Grande International Hospital", location: "Tokha, Kathmandu", consultationFee: 1500 },
  { name: "Dr. Pankaj Jalan", department: "Neurology", specialty: "Neurology", hospital: "Grande International Hospital", location: "Tokha, Kathmandu", consultationFee: 1500 },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lincoln_hospital');
    console.log('MongoDB Connected');
    console.log('Starting seed...\n');

    // Seed Admin and User Accounts
    console.log('=== Seeding Admin & User Accounts ===');
    let adminInserted = 0;
    let adminSkipped = 0;

    for (const userData of adminUsers) {
      try {
        const existingUser = await Doctor.findOne({ email: userData.email });
        if (existingUser) {
          adminSkipped++;
          continue;
        }
        const user = new Doctor(userData);
        await user.save();
        adminInserted++;
        console.log(`Created: ${userData.name} (${userData.role}) - Email: ${userData.email}`);
      } catch (err) {
        console.log(`Skipping ${userData.name}: ${err.message}`);
        adminSkipped++;
      }
    }
    console.log(`Admin/Users - Inserted: ${adminInserted}, Skipped: ${adminSkipped}\n`);

    // Seed Doctors
    console.log('=== Seeding Doctors ===');
    let doctorInserted = 0;
    let doctorSkipped = 0;

    for (const doctorData of doctors) {
      try {
        const existingDoctor = await Doctor.findOne({ name: doctorData.name });
        if (existingDoctor) {
          doctorSkipped++;
          continue;
        }

        const emailSlug = doctorData.name.toLowerCase()
          .replace(/dr\.\s*/i, '')
          .replace(/prof\.\s*/i, '')
          .replace(/dig\s*/i, '')
          .replace(/ssp\s*/i, '')
          .replace(/\s+/g, '.')
          .replace(/[^a-z0-9.]/g, '');
        
        const doctor = new Doctor({
          ...doctorData,
          email: `${emailSlug}@lincolnhospital.com.np`,
          isSeedData: true
        });
        await doctor.save();
        doctorInserted++;
      } catch (err) {
        doctorSkipped++;
      }
    }
    console.log(`Doctors - Inserted: ${doctorInserted}, Skipped: ${doctorSkipped}\n`);

    // Summary
    const totalUsers = await Doctor.countDocuments();
    const admins = await Doctor.countDocuments({ role: 'admin' });
    const receptionists = await Doctor.countDocuments({ role: 'receptionist' });
    const doctorsCount = await Doctor.countDocuments({ role: 'doctor' });

    console.log('=== SEED COMPLETE ===');
    console.log(`Total Users in Database: ${totalUsers}`);
    console.log(`  Admins: ${admins}`);
    console.log(`  Receptionists: ${receptionists}`);
    console.log(`  Doctors: ${doctorsCount}`);
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin 1: bhim.kafle@lincolnhospital.com.np / admin123');
    console.log('Admin 2: rupesh.khatri@lincolnhospital.com.np / admin123');
    console.log('Admin 3: dikshant.acharya@lincolnhospital.com.np / admin123');
    console.log('Receptionist: sita.sharma@lincolnhospital.com.np / reception123');
    console.log('Doctor: aashish.manandhar@lincolnhospital.com.np / doctor123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
