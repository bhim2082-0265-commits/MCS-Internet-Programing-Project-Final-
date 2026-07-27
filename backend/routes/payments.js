const express = require('express');
const router = express.Router();
const { initiateEsewaPayment, verifyEsewaPayment, initiateKhaltiPayment, verifyKhaltiPayment } = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

router.post('/esewa/init', auth, initiateEsewaPayment);
router.post('/esewa/verify', verifyEsewaPayment);
router.post('/khalti/init', auth, initiateKhaltiPayment);
router.post('/khalti/verify', auth, verifyKhaltiPayment);

module.exports = router;
