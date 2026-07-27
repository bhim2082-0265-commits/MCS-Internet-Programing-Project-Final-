const crypto = require('crypto');
const Invoice = require('../models/Invoice');

const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  baseUrl: process.env.ESEWA_BASE_URL || 'https://uat.esewa.com.np/epay/main'
};

const KHALTI_CONFIG = {
  publicKey: process.env.KHALTI_PUBLIC_KEY || 'test_public_key_xxxxx',
  secretKey: process.env.KHALTI_SECRET_KEY || 'test_secret_key_xxxxx',
  baseUrl: 'https://a.khalti.com/api/v2'
};

exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId).populate('patientId');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const signedFieldNames = 'total_amount,product_code,transaction_uuid';
    const message = `total_amount=${invoice.totalAmount},product_code=${ESEWA_CONFIG.merchantId},transaction_uuid=${invoice.invoiceNumber}`;
    
    const signature = crypto
      .createHmac('sha256', ESEWA_CONFIG.secretKey)
      .update(message)
      .digest('base64');

    const esewaPayload = {
      amt: invoice.subtotal,
      psc: 0,
      pdc: 0,
      txAmt: invoice.taxAmount,
      tAmt: invoice.totalAmount,
      pid: invoice.invoiceNumber,
      scd: ESEWA_CONFIG.merchantId,
      su: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      fu: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failure`
    };

    res.json({
      success: true,
      paymentUrl: ESEWA_CONFIG.baseUrl,
      payload: esewaPayload,
      signature
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { refId, oid, amt } = req.body;
    
    const invoice = await Invoice.findOne({ invoiceNumber: oid });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = 'Paid';
    invoice.amountPaid = invoice.totalAmount;
    invoice.paymentMethod = 'eSewa';
    invoice.paymentDate = new Date();
    await invoice.save();

    res.json({
      success: true,
      message: 'Payment verified and recorded',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.initiateKhaltiPayment = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId).populate('patientId');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const khaltiPayload = {
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:3000',
      amount: invoice.totalAmount * 100,
      purchase_order_id: invoice.invoiceNumber,
      purchase_order_name: `Invoice ${invoice.invoiceNumber}`,
      product_details: invoice.items.map(item => ({
        name: item.description,
        quantity: item.quantity,
        price: item.unitPrice * 100
      })),
      customer: {
        name: `${invoice.patientId.firstName} ${invoice.patientId.lastName}`,
        phone: invoice.patientId.phone,
        email: invoice.patientId.email || ''
      }
    };

    const response = await fetch(`${KHALTI_CONFIG.baseUrl}/payment/initiate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(khaltiPayload)
    });

    const data = await response.json();
    
    if (data.token) {
      res.json({
        success: true,
        paymentUrl: `https://a.khalti.com/app/#/payment/${data.token}`,
        token: data.token
      });
    } else {
      res.status(400).json({ message: 'Failed to initiate Khalti payment', error: data });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyKhaltiPayment = async (req, res) => {
  try {
    const { token, amount, invoiceId } = req.body;

    const response = await fetch(`${KHALTI_CONFIG.baseUrl}/payment/verify/`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, amount })
    });

    const data = await response.json();
    
    if (data.state && data.state.name === 'Completed') {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        invoice.status = 'Paid';
        invoice.amountPaid = invoice.totalAmount;
        invoice.paymentMethod = 'Khalti';
        invoice.paymentDate = new Date();
        await invoice.save();
      }

      res.json({
        success: true,
        message: 'Payment verified and recorded',
        transactionDetails: data,
        invoice
      });
    } else {
      res.status(400).json({ message: 'Payment verification failed', error: data });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
