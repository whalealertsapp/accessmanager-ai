import fetch from 'node-fetch';

const API = 'https://discord.com/api';

export async function addRole(discordServerId, discordUserId, roleId) {
  const r = await fetch(`${API}/guilds/${discordServerId}/members/${discordUserId}/roles/${roleId}`, {
    method: 'PUT',
    headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Discord addRole failed: ${r.status} ${t}`);
  }
}

export async function removeRole(discordServerId, discordUserId, roleId) {
  const r = await fetch(`${API}/guilds/${discordServerId}/members/${discordUserId}/roles/${roleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Discord removeRole failed: ${r.status} ${t}`);
  }
}
