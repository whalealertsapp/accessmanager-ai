import express from 'express';
import fetch from 'node-fetch';
import { getDb } from '../utils/migrate.js';
import { processQueuedForUser } from '../services/queueProcessor.js';

const router = express.Router();

router.get('/discord/link/start', (req, res) => {
  const whopUserId = req.query.whop_user_id;
  if (!whopUserId) return res.status(400).send('Missing whop_user_id');
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify',
    state: JSON.stringify({ whop_user_id: whopUserId })
  });
  const url = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  res.redirect(url);
});

router.get('/discord/link/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).send('Missing code');
    const parsed = JSON.parse(state || '{}');
    const whopUserId = parsed.whop_user_id;
    if (!whopUserId) return res.status(400).send('Missing whop_user_id');

    const body = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    });
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      throw new Error(`Token exchange failed: ${tokenRes.status} ${t}`);
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;

    const meRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!meRes.ok) {
      const t = await meRes.text();
      throw new Error(`@me failed: ${meRes.status} ${t}`);
    }
    const me = await meRes.json();
    const discordUserId = me.id;

    const db = getDb();
    db.prepare('INSERT INTO user_links (whop_user_id, discord_user_id) VALUES (?, ?) ON CONFLICT(whop_user_id) DO UPDATE SET discord_user_id=excluded.discord_user_id').run(whopUserId, discordUserId);

    await processQueuedForUser(whopUserId, discordUserId);

    res.send('<html><body style="font-family:system-ui">✅ Discord linked! You can close this window.</body></html>');
  } catch (e) {
    console.error(e);
    res.status(500).send('Linking error');
  }
});

export default router;
