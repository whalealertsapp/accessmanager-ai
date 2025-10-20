import express from 'express';
import getRawBody from 'raw-body';
import { verifyWhopSignature } from '../utils/verifyWhopSignature.js';
import { getDb } from '../utils/migrate.js';

const router = express.Router();

router.post('/whop', async (req, res) => {
  try {
    const raw = await getRawBody(req);
    const sig = req.headers['whop-signature'];
    if (!verifyWhopSignature(raw, sig)) {
      return res.status(401).send('Invalid signature');
    }
    const event = JSON.parse(raw.toString('utf8'));
    const { event_type, data } = event;

    const productId = data?.product_id || data?.product?.id;
    const whopUserId = data?.user_id || data?.user?.id;

    const db = getDb();
    if (!productId || !whopUserId) {
      db.close();
      return res.status(200).json({ ok: true, note: 'No product/user in event' });
    }

    if (event_type === 'subscription.created' || event_type === 'access_pass.assigned') {
      db.prepare('INSERT INTO role_events_queue (whop_user_id, product_id, action) VALUES (?, ?, ?)')
        .run(whopUserId, productId, 'grant');
    }
    if (event_type === 'subscription.canceled' || event_type === 'access_pass.revoked') {
      db.prepare('INSERT INTO role_events_queue (whop_user_id, product_id, action) VALUES (?, ?, ?)')
        .run(whopUserId, productId, 'revoke');
    }

    db.close();
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).send('Webhook error');
  }
});

export default router;
