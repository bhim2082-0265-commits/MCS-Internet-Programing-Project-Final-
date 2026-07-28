const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  markAsPaid,
  addPayment,
  generatePDF,
  deleteInvoice,
  adjustInvoice
} = require('../controllers/invoiceController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createInvoice);
router.get('/', auth, getInvoices);
router.get('/:id', auth, getInvoiceById);
router.get('/:id/pdf', auth, generatePDF);
router.put('/:id/pay', auth, markAsPaid);
router.post('/:id/payments', auth, addPayment);
router.delete('/:id', auth, deleteInvoice);
router.put('/:id/adjust', auth, adjustInvoice);

module.exports = router;
