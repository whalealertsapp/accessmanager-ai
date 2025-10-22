import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import mappingRoutes from './routes/mappings.js';
import webhookRoutes from './routes/webhooks.js';
import { ensureDb } from './utils/migrate.js';
import { Client, GatewayIntentBits } from 'discord.js';

const app = express();

// === Health check ===
app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'AccessManager.ai' });
});

// === Whop Webhooks (raw body for signature) ===
app.use(
  '/api/webhooks',
  express.raw({ type: '*/*' }),
  webhookRoutes
);

// === Normal middleware for everything else ===
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/mappings', mappingRoutes);

// === Route Debugging Helper ===
app._router && app._router.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log('🛣️ Registered route:', r.route.path);
  }
});

// === Start Server ===
const PORT = process.env.PORT || 8080;
ensureDb();
app.listen(PORT, () => {
  console.log(`AccessManager.ai backend running on :${PORT}`);
});

// === Discord Bot Initialization ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once('ready', () => {
  console.log(`🤖 AccessManager.ai bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
