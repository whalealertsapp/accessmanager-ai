import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

dotenv.config();
const router = express.Router();

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
  console.log(`🤖 AccessManager.ai bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Use express.raw() for webhooks (no bodyParser interference)
router.use(express.raw({ type: '*/*' }));

// Verify Whop signature
function verifyWhopSignature(secret, body, signature) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}

router.post('/whop', async (req, res) => {
  try {
    const signature = req.headers['x-whop-signature'];
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    const rawBody = req.body; // Buffer

    if (!signature || !secret) {
      console.error('❌ Missing signature or secret');
      return res.status(400).json({ error: 'Missing signature or secret' });
    }

    // Verify authenticity
    const isValid = verifyWhopSignature(secret, rawBody, signature);
    if (!isValid) {
      console.error('❌ Invalid Whop signature — possible spoof');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const json = JSON.parse(rawBody.toString());
    const eventType = json.event;
    const discordId = json.data?.discord_user_id; // Expect this from Whop metadata
    const guildId = process.env.DISCORD_GUILD_ID; // Your server ID

    console.log(`✅ Verified webhook from Whop: ${eventType}`);
    console.log('Payload:', json);

    // Handle membership events
    if (eventType === 'membership_went_valid') {
      // Assign role
      const roleName = json.data?.product_name || 'Pro Access';
      const guild = await client.guilds.fetch(guildId);
      const member = await guild.members.fetch(discordId).catch(() => null);
      const role = guild.roles.cache.find(r => r.name === roleName);

      if (member && role) {
        await member.roles.add(role);
        console.log(`🎉 Granted ${role.name} to ${member.user.tag}`);
      } else {
        console.warn('⚠️ Could not find member or role.');
      }
    }

    if (eventType === 'membership_went_invalid') {
      // Remove role
      const roleName = json.data?.product_name || 'Pro Access';
      const guild = await client.guilds.fetch(guildId);
      const member = await guild.members.fetch(discordId).catch(() => null);
      const role = guild.roles.cache.find(r => r.name === roleName);

      if (member && role) {
        await member.roles.remove(role);
        console.log(`❌ Removed ${role.name} from ${member.user.tag}`);
      } else {
        console.warn('⚠️ Could not find member or role.');
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Webhook processing error:', err);
    res.status(500).json({ success: false, error: 'Webhook error' });
  }
});

export default router;
