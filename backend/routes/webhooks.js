import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";

dotenv.config();
const router = express.Router();

// === Initialize Discord client ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
  console.log(`🤖 AccessManager.ai bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

// === RAW BODY middleware for webhooks ===
router.use(express.raw({ type: "*/*" }));

// === Helper: safely parse ROLE_MAP from .env ===
function parseRoleMap() {
  try {
    return JSON.parse(process.env.ROLE_MAP || "{}");
  } catch {
    return {};
  }
}

// === Helper: sanitize role names ===
function sanitizeRoleName(name) {
  return name.replace(/[^\w\s-]/g, "").trim().slice(0, 90);
}

// === MAIN WEBHOOK HANDLER ===
router.post("/whop", async (req, res) => {
  try {
    console.log("🧾 Incoming Whop webhook request:");

    // ✅ Skip signature verification (dev mode)
    console.warn("⚠️ Skipping Whop signature verification (dev mode).");

    // Parse JSON payload
    let json;
    try {
      json = JSON.parse(req.body.toString());
    } catch (e) {
      console.error("❌ Failed to parse webhook body:", e);
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const eventType = json.event;
    const discordId = json.data?.discord_user_id;
    const guildId = process.env.DISCORD_GUILD_ID;

    console.log(`📬 Event type: ${eventType}`);
    console.log("Payload:", json);

    if (!guildId) throw new Error("Missing DISCORD_GUILD_ID in environment");

    const guild = await client.guilds.fetch(guildId);

    // Determine which role to assign/remove
    const productName = json.data?.product_name || "Default Access";
    const roleMap = parseRoleMap();
    let roleName = roleMap[productName] || productName;
    roleName = sanitizeRoleName(roleName);

    // Find or auto-create the role
    let role = guild.roles.cache.find((r) => r.name === roleName);
    if (!role) {
      if (process.env.AUTO_CREATE_ROLES === "true") {
        console.log(`⚙️ Creating missing role: ${roleName}`);
        role = await guild.roles.create({
          name: roleName,
          permissions: [],
          color: "Grey",
          reason: "Auto-created by AccessManager.ai from Whop webhook",
        });
      } else {
        console.warn(
          `⚠️ Role '${roleName}' not found — skipping (set AUTO_CREATE_ROLES=true to enable creation)`
        );
      }
    }

    // Fetch the Discord member
    const member = await guild.members.fetch(discordId).catch(() => null);
    if (!member) {
      console.warn("⚠️ Could not find member with Discord ID:", discordId);
      return res.status(404).json({ error: "Discord user not found" });
    }

    // === Handle membership events ===
    if (eventType === "membership_went_valid") {
      if (member && role) {
        await member.roles.add(role);
        console.log(`🎉 Granted '${role.name}' to ${member.user.tag}`);
      } else {
        console.warn("⚠️ Could not find member or role to assign.");
      }
    }

    if (eventType === "membership_went_invalid") {
      if (member && role) {
        await member.roles.remove(role);
        console.log(`❌ Removed '${role.name}' from ${member.user.tag}`);
      } else {
        console.warn("⚠️ Could not find member or role to remove.");
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    res.status(500).json({ success: false, error: "Webhook error" });
  }
});

export default router;
