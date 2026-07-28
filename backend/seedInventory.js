const mongoose = require('mongoose');
const InventoryItem = require('./models/InventoryItem');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lincoln_hospital';

const items = [
  { name: 'Disposable Gloves (Box)', category: 'PPE', description: 'Latex-free nitrile examination gloves', unit: 'box', quantity: 150, minStock: 50, unitPrice: 800, vendor: 'MedSupply Nepal', location: 'Store Room A' },
  { name: 'Surgical Masks (Box)', category: 'PPE', description: '3-ply disposable surgical masks', unit: 'box', quantity: 100, minStock: 30, unitPrice: 600, vendor: 'MedSupply Nepal', location: 'Store Room A' },
  { name: 'Face Shields', category: 'PPE', description: 'Full face protection shields', unit: 'pcs', quantity: 30, minStock: 20, unitPrice: 350, vendor: 'MedSupply Nepal', location: 'Store Room A' },
  { name: 'Disposable Syringes 5ml', category: 'Medical Supplies', description: '5ml disposable syringes with needle', unit: 'pcs', quantity: 500, minStock: 100, unitPrice: 8, vendor: 'Nepal Medico', location: 'Store Room B' },
  { name: 'Disposable Syringes 10ml', category: 'Medical Supplies', description: '10ml disposable syringes', unit: 'pcs', quantity: 200, minStock: 50, unitPrice: 12, vendor: 'Nepal Medico', location: 'Store Room B' },
  { name: 'IV Cannula 18G', category: 'Medical Supplies', description: 'Intravenous cannula 18 gauge', unit: 'pcs', quantity: 150, minStock: 50, unitPrice: 25, vendor: 'Nepal Medico', location: 'Store Room B' },
  { name: 'IV Cannula 22G', category: 'Medical Supplies', description: 'Intravenous cannula 22 gauge', unit: 'pcs', quantity: 120, minStock: 50, unitPrice: 25, vendor: 'Nepal Medico', location: 'Store Room B' },
  { name: 'IV Fluid Normal Saline', category: 'Medical Supplies', description: '0.9% NaCl 1000ml', unit: 'bottle', quantity: 80, minStock: 30, unitPrice: 65, vendor: 'Baxter Nepal', location: 'Store Room B' },
  { name: 'IV Fluid Ringer Lactate', category: 'Medical Supplies', description: 'Ringer Lactate 500ml', unit: 'bottle', quantity: 60, minStock: 20, unitPrice: 55, vendor: 'Baxter Nepal', location: 'Store Room B' },
  { name: 'Sterile Gauze Pads', category: 'Medical Supplies', description: '4x4 inch sterile gauze', unit: 'pack', quantity: 200, minStock: 50, unitPrice: 120, vendor: 'MedSupply Nepal', location: 'Store Room B' },
  { name: 'Bandage Rolls', category: 'Medical Supplies', description: 'Crepe bandage 4 inch', unit: 'roll', quantity: 100, minStock: 30, unitPrice: 45, vendor: 'MedSupply Nepal', location: 'Store Room B' },
  { name: 'Surgical Gloves (Sterile)', category: 'Surgical Equipment', description: 'Powder-free sterile surgical gloves', unit: 'pair', quantity: 60, minStock: 30, unitPrice: 45, vendor: 'MedSupply Nepal', location: 'OT Store' },
  { name: 'Surgical Suture Kit', category: 'Surgical Equipment', description: 'Absorbable suture material', unit: 'pcs', quantity: 40, minStock: 20, unitPrice: 350, vendor: 'Johnson & Johnson Nepal', location: 'OT Store' },
  { name: 'Pulse Oximeter', category: 'IT Equipment', description: 'Fingertip pulse oximeter', unit: 'pcs', quantity: 15, minStock: 5, unitPrice: 2500, vendor: 'Nepal Electronics', location: 'Equipment Room' },
  { name: 'BP Monitor (Manual)', category: 'Medical Supplies', description: 'Sphygmomanometer with stethoscope', unit: 'set', quantity: 10, minStock: 5, unitPrice: 3500, vendor: 'Nepal Electronics', location: 'Equipment Room' },
  { name: 'Thermometer (Digital)', category: 'Medical Supplies', description: 'Digital clinical thermometer', unit: 'pcs', quantity: 20, minStock: 10, unitPrice: 500, vendor: 'Nepal Electronics', location: 'Equipment Room' },
  { name: 'Examination Gloves (Latex)', category: 'PPE', description: 'Powdered latex examination gloves', unit: 'box', quantity: 8, minStock: 30, unitPrice: 650, vendor: 'MedSupply Nepal', location: 'Store Room A' },
  { name: 'Hand Sanitizer (500ml)', category: 'Cleaning', description: 'Alcohol-based hand sanitizer', unit: 'bottle', quantity: 25, minStock: 20, unitPrice: 350, vendor: 'Dettol Nepal', location: 'Cleaning Store' },
  { name: 'Disinfectant Spray', category: 'Cleaning', description: 'Surface disinfectant spray', unit: 'bottle', quantity: 15, minStock: 10, unitPrice: 450, vendor: 'Dettol Nepal', location: 'Cleaning Store' },
  { name: 'Printer Paper A4', category: 'Office', description: 'A4 size printing paper', unit: 'ream', quantity: 10, minStock: 5, unitPrice: 550, vendor: 'Office Supplies Nepal', location: 'Office Store' },
  { name: 'Wheelchair', category: 'Furniture', description: 'Standard folding wheelchair', unit: 'pcs', quantity: 5, minStock: 2, unitPrice: 25000, vendor: 'MedFurniture Nepal', location: 'Ground Floor' },
  { name: 'Oxygen Cylinder (B-type)', category: 'Medical Supplies', description: 'Medical oxygen cylinder B-type', unit: 'pcs', quantity: 12, minStock: 5, unitPrice: 8000, vendor: 'Nepal Gases', location: 'Emergency Store' },
  { name: 'Nebulizer Machine', category: 'IT Equipment', description: 'Compressor nebulizer', unit: 'pcs', quantity: 6, minStock: 3, unitPrice: 5500, vendor: 'Nepal Electronics', location: 'Equipment Room' },
  { name: 'Suction Machine', category: 'Surgical Equipment', description: 'Portable suction machine', unit: 'pcs', quantity: 3, minStock: 2, unitPrice: 35000, vendor: 'MedFurniture Nepal', location: 'OT Store' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    
    await InventoryItem.deleteMany({});
    console.log('Cleared existing inventory items');
    
    for (const itemData of items) {
      await InventoryItem.create(itemData);
      console.log(`Created: ${itemData.name}`);
    }
    
    console.log(`\nSeeded ${items.length} inventory items successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
