const mongoose = require('mongoose');
const LabTest = require('./models/LabTest');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lincoln_hospital';

const tests = [
  { testName: 'Complete Blood Count', testCode: 'CBC', category: 'Blood', department: 'Hematology', description: 'Measures RBC, WBC, platelets, hemoglobin', normalRange: 'WBC: 4,000-11,000/μL', unit: 'cells/μL', price: 800, turnaroundTime: '4 hours' },
  { testName: 'Blood Glucose Fasting', testCode: 'BGF', category: 'Blood', department: 'Biochemistry', description: 'Fasting blood sugar level', normalRange: '70-100 mg/dL', unit: 'mg/dL', price: 300, turnaroundTime: '2 hours' },
  { testName: 'Blood Glucose Random', testCode: 'BGR', category: 'Blood', department: 'Biochemistry', description: 'Random blood sugar level', normalRange: '< 140 mg/dL', unit: 'mg/dL', price: 300, turnaroundTime: '2 hours' },
  { testName: 'HbA1c', testCode: 'HBA1C', category: 'Blood', department: 'Biochemistry', description: 'Glycated hemoglobin for diabetes monitoring', normalRange: '< 5.7%', unit: '%', price: 1200, turnaroundTime: '24 hours' },
  { testName: 'Lipid Profile', testCode: 'LP', category: 'Blood', department: 'Biochemistry', description: 'Total cholesterol, HDL, LDL, Triglycerides', normalRange: 'TC < 200 mg/dL', unit: 'mg/dL', price: 1500, turnaroundTime: '24 hours' },
  { testName: 'Liver Function Test', testCode: 'LFT', category: 'Blood', department: 'Biochemistry', description: 'SGOT, SGPT, ALP, Bilirubin, Albumin', normalRange: 'SGOT: 5-40 U/L', unit: 'U/L', price: 1800, turnaroundTime: '24 hours' },
  { testName: 'Kidney Function Test', testCode: 'KFT', category: 'Blood', department: 'Biochemistry', description: 'Creatinine, BUN, Uric Acid', normalRange: 'Creatinine: 0.6-1.2 mg/dL', unit: 'mg/dL', price: 1500, turnaroundTime: '24 hours' },
  { testName: 'Thyroid Profile TSH', testCode: 'TSH', category: 'Blood', department: 'Endocrinology', description: 'Thyroid Stimulating Hormone', normalRange: '0.4-4.0 mIU/L', unit: 'mIU/L', price: 1200, turnaroundTime: '24 hours' },
  { testName: 'Urine Routine', testCode: 'UR', category: 'Urine', department: 'Pathology', description: 'Physical, chemical and microscopic examination', normalRange: 'Clear, pale yellow', unit: '', price: 400, turnaroundTime: '4 hours' },
  { testName: 'Urine Culture', testCode: 'UC', category: 'Urine', department: 'Microbiology', description: 'Bacterial culture and sensitivity', normalRange: '< 100,000 CFU/mL', unit: 'CFU/mL', price: 1200, turnaroundTime: '48 hours' },
  { testName: 'Stool Routine', testCode: 'SR', category: 'Stool', department: 'Pathology', description: 'Physical and microscopic examination', normalRange: 'No parasites', unit: '', price: 400, turnaroundTime: '4 hours' },
  { testName: 'Chest X-Ray', testCode: 'CXR', category: 'X-Ray', department: 'Radiology', description: 'PA view chest radiograph', normalRange: 'No active lesion', unit: '', price: 1500, turnaroundTime: '2 hours' },
  { testName: 'X-Ray Knee', testCode: 'XKN', category: 'X-Ray', department: 'Radiology', description: 'Knee joint X-ray AP and lateral', normalRange: 'No fracture', unit: '', price: 1500, turnaroundTime: '2 hours' },
  { testName: 'MRI Brain', testCode: 'MRIB', category: 'MRI', department: 'Radiology', description: 'MRI brain with and without contrast', normalRange: 'No mass lesion', unit: '', price: 12000, turnaroundTime: '24 hours' },
  { testName: 'CT Scan Abdomen', testCode: 'CTA', category: 'CT Scan', department: 'Radiology', description: 'CT abdomen with contrast', normalRange: 'No abnormality', unit: '', price: 10000, turnaroundTime: '24 hours' },
  { testName: 'Ultrasound Abdomen', testCode: 'USG', category: 'Ultrasound', department: 'Radiology', description: 'USG whole abdomen', normalRange: 'Normal', unit: '', price: 3000, turnaroundTime: '4 hours' },
  { testName: 'ECG', testCode: 'ECG', category: 'ECG', department: 'Cardiology', description: '12-lead electrocardiogram', normalRange: 'Normal sinus rhythm', unit: '', price: 500, turnaroundTime: '1 hour' },
  { testName: 'Echocardiography', testCode: 'ECHO', category: 'Echo', department: 'Cardiology', description: 'Transthoracic echocardiogram', normalRange: 'Normal LV function', unit: '', price: 5000, turnaroundTime: '24 hours' },
  { testName: 'Blood Grouping', testCode: 'BG', category: 'Blood', department: 'Hematology', description: 'ABO and Rh blood grouping', normalRange: '', unit: '', price: 400, turnaroundTime: '2 hours' },
  { testName: 'Hemoglobin', testCode: 'HB', category: 'Blood', department: 'Hematology', description: 'Hemoglobin estimation', normalRange: 'Male: 13-17 g/dL, Female: 12-15 g/dL', unit: 'g/dL', price: 300, turnaroundTime: '1 hour' },
  { testName: 'ESR', testCode: 'ESR', category: 'Hematology', department: 'Hematology', description: 'Erythrocyte Sedimentation Rate', normalRange: 'Male: 0-15 mm/hr', unit: 'mm/hr', price: 200, turnaroundTime: '1 hour' },
  { testName: 'PT/INR', testCode: 'PTINR', category: 'Blood', department: 'Hematology', description: 'Prothrombin Time and INR', normalRange: 'INR: 0.8-1.2', unit: '', price: 800, turnaroundTime: '4 hours' },
  { testName: 'HIV Test', testCode: 'HIV', category: 'Blood', department: 'Microbiology', description: 'HIV 1&2 antibody screening', normalRange: 'Non-reactive', unit: '', price: 1000, turnaroundTime: '24 hours' },
  { testName: 'Hepatitis B Surface Antigen', testCode: 'HBSAG', category: 'Blood', department: 'Microbiology', description: 'HBsAg screening', normalRange: 'Negative', unit: '', price: 800, turnaroundTime: '24 hours' },
  { testName: 'Pregnancy Test (Urine)', testCode: 'PREG', category: 'Urine', department: 'Pathology', description: 'Urine hCG pregnancy test', normalRange: 'Negative', unit: '', price: 300, turnaroundTime: '30 minutes' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    
    await LabTest.deleteMany({});
    console.log('Cleared existing lab tests');
    
    for (const testData of tests) {
      await LabTest.create(testData);
      console.log(`Created: ${testData.testName} (${testData.testCode})`);
    }
    
    console.log(`\nSeeded ${tests.length} lab tests successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
