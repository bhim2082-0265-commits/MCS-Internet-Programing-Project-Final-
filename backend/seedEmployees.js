const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lincoln_hospital';

const employees = [
  { firstName: 'Sita', lastName: 'Sharma', email: 'sita.sharma@lincoln.com.np', phone: '9841234567', role: 'Nurse', department: 'Emergency', designation: 'Senior Nurse', qualification: 'B.Sc Nursing', salary: 45000, shift: 'Morning' },
  { firstName: 'Ram', lastName: 'Thapa', email: 'ram.thapa@lincoln.com.np', phone: '9841234568', role: 'Nurse', department: 'ICU', designation: 'ICU Nurse', qualification: 'B.Sc Nursing', salary: 50000, shift: 'Night' },
  { firstName: 'Gita', lastName: 'Poudel', email: 'gita.poudel@lincoln.com.np', phone: '9841234569', role: 'Nurse', department: 'Surgery', designation: 'OT Nurse', qualification: 'B.Sc Nursing', salary: 48000, shift: 'Morning' },
  { firstName: 'Hari', lastName: 'Maharjan', email: 'hari.maharjan@lincoln.com.np', phone: '9841234570', role: 'Lab Technician', department: 'Pathology', designation: 'Senior Lab Tech', qualification: 'MSc Microbiology', salary: 42000, shift: 'Morning' },
  { firstName: 'Sunita', lastName: 'Gurung', email: 'sunita.gurung@lincoln.com.np', phone: '9841234571', role: 'Lab Technician', department: 'Biochemistry', designation: 'Lab Technician', qualification: 'BSc Medical Lab Tech', salary: 38000, shift: 'Morning' },
  { firstName: 'Prakash', lastName: 'Rai', email: 'prakash.rai@lincoln.com.np', phone: '9841234572', role: 'Pharmacist', department: 'Pharmacy', designation: 'Chief Pharmacist', qualification: 'B.Pharm', salary: 45000, shift: 'Morning' },
  { firstName: 'Anita', lastName: 'Tamang', email: 'anita.tamang@lincoln.com.np', phone: '9841234573', role: 'Pharmacist', department: 'Pharmacy', designation: 'Pharmacist', qualification: 'B.Pharm', salary: 38000, shift: 'Afternoon' },
  { firstName: 'Bishnu', lastName: 'Karki', email: 'bishnu.karki@lincoln.com.np', phone: '9841234574', role: 'Accountant', department: 'Finance', designation: 'Senior Accountant', qualification: 'M.Com', salary: 50000, shift: 'Morning' },
  { firstName: 'Sarita', lastName: 'Bhandari', email: 'sarita.bhandari@lincoln.com.np', phone: '9841234575', role: 'Receptionist', department: 'Front Desk', designation: 'Receptionist', qualification: 'BBA', salary: 30000, shift: 'Morning' },
  { firstName: 'Deepak', lastName: 'Lama', email: 'deepak.lama@lincoln.com.np', phone: '9841234576', role: 'Security', department: 'Security', designation: 'Security Guard', qualification: 'SLC', salary: 22000, shift: 'Night' },
  { firstName: 'Kamala', lastName: 'Adhikari', email: 'kamala.adhikari@lincoln.com.np', phone: '9841234577', role: 'Nurse', department: 'Pediatrics', designation: 'Pediatric Nurse', qualification: 'B.Sc Nursing', salary: 45000, shift: 'Morning' },
  { firstName: 'Manoj', lastName: 'Basnet', email: 'manoj.basnet@lincoln.com.np', phone: '9841234578', role: 'Other', department: 'Housekeeping', designation: 'Head Cleaner', qualification: 'SLC', salary: 20000, shift: 'Morning' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    
    await Employee.deleteMany({});
    console.log('Cleared existing employees');
    
    for (const empData of employees) {
      await Employee.create(empData);
      console.log(`Created: ${empData.firstName} ${empData.lastName} (${empData.role})`);
    }
    
    console.log(`\nSeeded ${employees.length} employees successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
