import express from 'express';
import getRawBody from 'raw-body';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Explicitly disable Express JSON parsing for this route
router.use(
  express.raw({ type: '*/*' }) // accept any content type as raw
);

router.post('/whop', async (req, res) => {
  try {
    const rawBody = req.body; // already raw buffer from express.raw()
    const signature = req.headers['x-whop-signature'];
    const secret = process.env.WHOP_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.error('Missing signature or secret');
      return res.status(400).json({ error: 'Missing signature or secret' });
    }

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
