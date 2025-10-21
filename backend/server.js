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

// Health check (safe)
app.get('/api/health', (req, res) =>
  res.json({ ok: true, name: 'AccessManager.ai' })
);

// === Apply RAW BODY parser ONLY for Whop ===
// This ensures Whop webhooks stay raw for signature verification
import webhookRouter from './routes/webhooks.js';
app.use(
  '/api/webhooks/whop',
  express.raw({ type: '*/*' }),
  webhookRouter
);

// === Apply normal middleware for everything else ===
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/mappings', mappingRoutes);

// === Start server ===
const PORT = process.env.PORT || 8080;
ensureDb();
app.listen(PORT, () =>
  console.log(`AccessManager.ai backend running on :${PORT}`)
);

// === Discord Bot Initialization ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once('ready', () => {
  console.log(`🤖 AccessManager.ai bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
