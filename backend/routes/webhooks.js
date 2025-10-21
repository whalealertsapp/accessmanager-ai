import express from 'express';
import getRawBody from 'raw-body';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Whop webhook endpoint
router.post('/whop', async (req, res) => {
  try {
    const rawBody = await getRawBody(req); // <— read raw buffer safely
    const signature = req.headers['x-whop-signature'];
    const secret = process.env.WHOP_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.error('Missing signature or secret');
      return res.status(400).json({ error: 'Missing signature or secret' });
    }

    // optional: verify signature here if needed
    console.log('✅ Received Whop webhook');
    console.log('Event headers:', req.headers);
    console.log('Body:', rawBody.toString());

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Webhook error:', err);
    res.status(500).json({ success: false, body: 'Webhook error' });
  }
});

export default router;
