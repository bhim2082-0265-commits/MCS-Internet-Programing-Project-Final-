const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  isTaxable: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['Consultation', 'Lab Test', 'Procedure', 'Medication', 'Room', 'Other'],
    default: 'Other'
  }
});

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'eSewa', 'Khalti', 'ConnectIPS', 'Other'],
    required: true
  },
  transactionId: { type: String },
  paidAt: { type: Date, default: Date.now },
  receivedBy: { type: String },
  notes: { type: String },
  installmentNumber: { type: Number },
  splitPayments: [{
    method: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer', 'eSewa', 'Khalti', 'ConnectIPS', 'Other']
    },
    amount: { type: Number, required: true },
    transactionId: { type: String }
  }]
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorName: {
    type: String
  },
  doctorDepartment: {
    type: String
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  taxableAmount: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 13
  },
  taxAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  panNumber: {
    type: String,
    default: '601234567'
  },
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  payments: [paymentSchema],
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'eSewa', 'Khalti', 'ConnectIPS', 'Other']
  },
  paymentDate: {
    type: Date
  },
  transactionId: {
    type: String
  },
  notes: {
    type: String
  },
  termsAndConditions: {
    type: String,
    default: 'Thank you for choosing Lincoln International Hospital (HPBS). Please note that payments are non-refundable. Kindly confirm all details before making a payment.'
  },
  pdfFile: {
    type: String
  }
}, {
  timestamps: true
});

invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-2082-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
