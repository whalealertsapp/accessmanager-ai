import express from 'express';
import { getDb } from '../utils/migrate.js';

const router = express.Router();

router.get('/', (req, res) => {
  const companyId = req.query.company_id || process.env.WHOP_APP_ID;
  const db = getDb();
  const rows = db.prepare('SELECT * FROM product_role_mappings WHERE company_id = ?').all(companyId);
  db.close();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { company_id, product_id, discord_server_id, discord_role_id } = req.body;
  const db = getDb();
  const out = db.prepare('INSERT OR IGNORE INTO product_role_mappings (company_id, product_id, discord_server_id, discord_role_id) VALUES (?, ?, ?, ?)')
    .run(company_id, product_id, discord_server_id, discord_role_id);
  db.close();
  res.json({ ok: true, changes: out.changes });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const out = db.prepare('DELETE FROM product_role_mappings WHERE id = ?').run(id);
  db.close();
  res.json({ ok: true, changes: out.changes });
});

export default router;
