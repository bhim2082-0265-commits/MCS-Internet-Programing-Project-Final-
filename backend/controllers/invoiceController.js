const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const fs = require('fs');
const path = require('path');

const saveInvoicePDF = async (invoice) => {
  try {
    const patient = invoice.patientId;
    if (!patient) return;
    const pdfBuffer = await generateInvoicePDF(invoice, patient);
    const invoicesDir = path.join(__dirname, '..', 'invoices');
    if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });
    const fileName = `${invoice.invoiceNumber}_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
    fs.writeFileSync(path.join(invoicesDir, fileName), pdfBuffer);
    invoice.pdfFile = fileName;
    await invoice.save();
  } catch (pdfErr) {
    console.error('PDF save error:', pdfErr.message);
  }
};

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
      termsAndConditions: termsAndConditions || 'Thank you for choosing Lincoln International Hospital (HPBS). Please note that payments are non-refundable. Kindly confirm all details before making a payment.'
    });
    
    await invoice.save();
    const populated = await invoice.populate('patientId');
    await saveInvoicePDF(populated);
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
    await saveInvoicePDF(populated);
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
    await saveInvoicePDF(populated);
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

exports.getPatientPendingBills = async (req, res) => {
  try {
    const { patientId } = req.params;
    const invoices = await Invoice.find({ patientId })
      .populate('patientId')
      .sort({ createdAt: -1 });
    const pending = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'Partial');
    const allInvoices = invoices;
    res.json({ pending, all: allInvoices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adjustInvoice = async (req, res) => {
  try {
    const { action, itemIndex, item, discount, taxRate, notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    if (invoice.status === 'Paid' || invoice.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot adjust a ${invoice.status.toLowerCase()} invoice` });
    }

    switch (action) {
      case 'add_item':
        if (!item) return res.status(400).json({ message: 'Item data required' });
        const addTotal = item.quantity * item.unitPrice;
        invoice.items.push({ ...item, total: addTotal });
        break;

      case 'update_item':
        if (itemIndex === undefined || !item) return res.status(400).json({ message: 'Item index and data required' });
        if (itemIndex < 0 || itemIndex >= invoice.items.length) return res.status(400).json({ message: 'Invalid item index' });
        const updTotal = item.quantity * item.unitPrice;
        invoice.items[itemIndex] = { ...invoice.items[itemIndex].toObject(), ...item, total: updTotal };
        break;

      case 'remove_item':
        if (itemIndex === undefined) return res.status(400).json({ message: 'Item index required' });
        if (invoice.items.length <= 1) return res.status(400).json({ message: 'Cannot remove the last item' });
        invoice.items.splice(itemIndex, 1);
        break;

      case 'apply_discount':
        invoice.discount = Math.max(0, parseFloat(discount) || 0);
        break;

      case 'update_tax':
        invoice.taxRate = parseFloat(taxRate) || 13;
        break;

      case 'update_notes':
        invoice.notes = notes || '';
        break;

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    let subtotal = 0;
    let taxableAmount = 0;
    invoice.items.forEach(item => {
      subtotal += item.total;
      if (item.isTaxable !== false) {
        taxableAmount += item.total;
      }
    });

    invoice.subtotal = subtotal;
    invoice.taxableAmount = taxableAmount;
    invoice.taxAmount = (taxableAmount * invoice.taxRate) / 100;
    invoice.totalAmount = subtotal + invoice.taxAmount - invoice.discount;

    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.amountPaid = invoice.totalAmount;
      invoice.status = 'Paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partial';
    } else {
      invoice.status = 'Pending';
    }

    await invoice.save();
    const populated = await invoice.populate('patientId');
    await saveInvoicePDF(populated);

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
