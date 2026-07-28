const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itemCode: { type: String, unique: true },
  category: { type: String, enum: ['Medical Supplies', 'Surgical Equipment', 'PPE', 'Cleaning', 'Office', 'IT Equipment', 'Furniture', 'Pharmaceutical', 'Other'], required: true },
  description: String,
  unit: { type: String, default: 'pcs' },
  quantity: { type: Number, default: 0 },
  minStock: { type: Number, default: 10 },
  maxStock: { type: Number, default: 1000 },
  unitPrice: { type: Number, default: 0 },
  vendor: String,
  vendorContact: String,
  expiryDate: Date,
  location: String,
  purchaseDate: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

inventoryItemSchema.pre('save', async function (next) {
  if (!this.itemCode) {
    const count = await mongoose.model('InventoryItem').countDocuments();
    this.itemCode = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
