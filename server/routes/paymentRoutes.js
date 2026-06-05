const express = require('express');
const router = express.Router();
const { VNPay, HashAlgorithm, ProductCode, VnpLocale } = require('vnpay');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
require('dotenv').config();

// Initialize VNPay instance
const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMN_CODE || '2QXUI4B4',
    secureSecret: process.env.VNP_HASH_SECRET || 'secret',
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true, // Set to true for sandbox
    hashAlgorithm: HashAlgorithm.SHA512,
});

// POST /api/payment/create-vnpay-url
router.post('/create-vnpay-url', protect, async (req, res) => {
    const { orderId, amount, bankCode } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const ipAddr = req.headers['x-forwarded-for'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress || 
                       req.connection.socket.remoteAddress;

        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: amount, // VNPay library handles * 100 if passed as raw VND
            vnp_IpAddr: ipAddr,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: `Payment for order #${orderId}`,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/vnpay-return`,
            vnp_Locale: VnpLocale.VN,
            vnp_BankCode: bankCode || undefined, // Optional: e.g. 'NCB'
        });

        res.json({ paymentUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/payment/vnpay-ipn (Webhook for backend confirmation)
router.get('/vnpay-ipn', async (req, res) => {
    try {
        const verify = vnpay.verifyIpnCall(req.query);

        if (verify.isVerified) {
            const orderId = req.query.vnp_TxnRef;
            const amount = parseInt(req.query.vnp_Amount) / 100;
            const responseCode = req.query.vnp_ResponseCode;

            const order = await Order.findById(orderId);

            if (!order) {
                return res.json({ RspCode: '01', Message: 'Order not found' });
            }

            if (order.totalAmount !== amount) {
                return res.json({ RspCode: '04', Message: 'Invalid amount' });
            }

            if (order.paymentStatus !== 'Pending') {
                return res.json({ RspCode: '02', Message: 'Order already confirmed' });
            }

            if (responseCode === '00') {
                // Success
                order.paymentStatus = 'Paid';
                order.history.push({
                    status: order.status,
                    user: 'System (VNPay)',
                    changedAt: Date.now()
                });
                order.comments.push({
                    text: 'VNPay Payment Success. Transaction ID: ' + req.query.vnp_TransactionNo,
                    author: 'System',
                    createdAt: Date.now()
                });
            } else {
                // Failed
                order.paymentStatus = 'Failed';
                order.comments.push({
                    text: 'VNPay Payment Failed. Error Code: ' + responseCode,
                    author: 'System',
                    createdAt: Date.now()
                });
            }

            await order.save();
            return res.json({ RspCode: '00', Message: 'Confirm success' });
        }

        res.json({ RspCode: '97', Message: 'Invalid checksum' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
