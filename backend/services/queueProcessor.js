import { getDb } from '../utils/migrate.js';
import { addRole, removeRole } from './discordService.js';

export async function processQueuedForUser(whopUserId, discordUserId) {
  const db = getDb();
  const events = db.prepare('SELECT * FROM role_events_queue WHERE whop_user_id = ? AND processed = 0').all(whopUserId);
  for (const ev of events) {
    const mappings = db.prepare('SELECT * FROM product_role_mappings WHERE product_id = ?').all(ev.product_id);
    for (const m of mappings) {
      if (ev.action === 'grant') {
        await addRole(m.discord_server_id, discordUserId, m.discord_role_id);
      } else if (ev.action === 'revoke') {
        await removeRole(m.discord_server_id, discordUserId, m.discord_role_id);
      }
    }
    db.prepare('UPDATE role_events_queue SET processed = 1 WHERE id = ?').run(ev.id);
  }
  db.close();
}
