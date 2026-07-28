const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  vendor: { type: String, required: true },
  vendorContact: String,
  items: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Pending Approval', 'Approved', 'Ordered', 'Received', 'Cancelled'], default: 'Draft' },
  orderedBy: String,
  approvedBy: String,
  expectedDelivery: Date,
  receivedDate: Date,
  notes: String
}, { timestamps: true });

purchaseOrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.orderNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
