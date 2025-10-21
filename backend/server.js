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

// ✅ This must come BEFORE bodyParser.json()
// Ensures Whop webhook payload arrives as raw Buffer (not parsed Object)
app.use('/api/webhooks/whop', express.raw({ type: '*/*' }));

// Standard middlewares
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, name: 'AccessManager.ai' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mappings', mappingRoutes);
app.use('/api/webhooks', webhookRoutes);

// Start server
const PORT = process.env.PORT || 8080;
ensureDb();
app.listen(PORT, () => console.log(`AccessManager.ai backend running on :${PORT}`));

// === Discord Bot Initialization ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once('ready', () => {
  console.log(`🤖 AccessManager.ai bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
