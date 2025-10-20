import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import mappingRoutes from './routes/mappings.js';
import webhookRoutes from './routes/webhooks.js';
import { ensureDb } from './utils/migrate.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'AccessManager.ai' }));

app.use('/api/auth', authRoutes);
app.use('/api/mappings', mappingRoutes);
app.use('/api/webhooks', webhookRoutes);

const PORT = process.env.PORT || 8080;
ensureDb();
app.listen(PORT, () => console.log(`AccessManager.ai backend running on :${PORT}`));
