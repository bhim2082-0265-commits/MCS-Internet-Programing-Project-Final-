const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

exports.createInvoice = async (req, res) => {
  try {
    const { patientId, doctorName, doctorDepartment, items, taxRate = 13, discount = 0, panNumber, notes, termsAndConditions } = req.body;
    
    let subtotal = 0;
    let taxableAmount = 0;
    
    const processedItems = items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      if (item.isTaxable !== false) {
        taxableAmount += itemTotal;
      }
      return { ...item, total: itemTotal };
    });
    
    const taxAmount = (taxableAmount * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discount;
    
    const invoice = new Invoice({
      patientId,
      doctorName,
      doctorDepartment,
      items: processedItems,
      subtotal,
      taxableAmount,
      taxRate,
      taxAmount,
      discount,
      totalAmount,
      panNumber: panNumber || '601234567',
      notes,
      termsAndConditions: termsAndConditions || 'Thank you for choosing Lincoln International Hospital and Research Center. Please note that payments are non-refundable. Kindly confirm all details before making a payment.'
    });
    
    await invoice.save();
    const populated = await invoice.populate('patientId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { patientId, status, startDate, endDate } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    const invoices = await Invoice.find(query)
      .populate('patientId')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('patientId');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    let { amount, method, transactionId, receivedBy, notes, splitPayments } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      amount = invoice.totalAmount - invoice.amountPaid;
    }

    const paymentMethod = method || 'Cash';
    const installmentNumber = (invoice.payments?.length || 0) + 1;

    invoice.payments.push({
      amount,
      method: paymentMethod,
      transactionId,
      receivedBy,
      notes,
      paidAt: new Date(),
      installmentNumber,
      splitPayments: splitPayments && splitPayments.length > 0 ? splitPayments : undefined
    });

    invoice.amountPaid += amount;
    invoice.paymentMethod = paymentMethod;
    invoice.paymentDate = new Date();
    if (transactionId) invoice.transactionId = transactionId;

    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.amountPaid = invoice.totalAmount;
      invoice.status = 'Paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partial';
    }

    invoice.markModified('payments');
    await invoice.save();
    const populated = await invoice.populate('patientId');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    let { amount, method, transactionId, receivedBy, notes, splitPayments } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    if (invoice.status === 'Paid' || invoice.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot add payment to ${invoice.status} invoice` });
    }

    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid payment amount' });
    }

    const remaining = invoice.totalAmount - invoice.amountPaid;
    if (amount > remaining + 0.01) {
      return res.status(400).json({ message: `Payment amount (Rs. ${amount.toLocaleString()}) exceeds remaining balance (Rs. ${remaining.toLocaleString()})` });
    }

    const installmentNumber = (invoice.payments?.length || 0) + 1;

    const paymentEntry = {
      amount,
      method: method || 'Cash',
      transactionId,
      receivedBy,
      notes,
      paidAt: new Date(),
      installmentNumber,
      splitPayments: splitPayments && splitPayments.length > 0 ? splitPayments : undefined
    };

    invoice.payments.push(paymentEntry);

    invoice.amountPaid += amount;
    invoice.paymentMethod = method || 'Cash';
    invoice.paymentDate = new Date();
    if (transactionId) invoice.transactionId = transactionId;

    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.amountPaid = invoice.totalAmount;
      invoice.status = 'Paid';
    } else {
      invoice.status = 'Partial';
    }

    invoice.markModified('payments');
    await invoice.save();
    const populated = await invoice.populate('patientId');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('patientId');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const pdfBuffer = await generateInvoicePDF(invoice, invoice.patientId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
