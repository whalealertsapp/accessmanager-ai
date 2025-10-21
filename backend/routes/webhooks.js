import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, PermissionsBitField } from "discord.js";
import { verifyWhopSignature } from "../utils/verifyWhopSignature.js";

dotenv.config();
const router = express.Router();

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
  console.log(`🤖 AccessManager.ai bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Use express.raw() for webhooks (no bodyParser interference)
router.use(express.raw({ type: "*/*" }));

// Helper: safely parse ROLE_MAP from .env
function parseRoleMap() {
  try {
    return JSON.parse(process.env.ROLE_MAP || "{}");
  } catch {
    return {};
  }
}

// Helper: sanitize role names
function sanitizeRoleName(name) {
  return name.replace(/[^\w\s-]/g, "").trim().slice(0, 90);
}

router.post("/whop", async (req, res) => {
  try {
    console.log("🧾 Incoming Whop webhook request:");
console.log("Headers:", req.headers);
console.log("Raw body type:", typeof req.body);



    // --- Optional test mode bypass ---
    const TEST_MODE = process.env.TEST_MODE === "true";
    if (!TEST_MODE) {
      if (!signature || !secret) {
        console.error("❌ Missing signature or secret");
        return res.status(400).json({ error: "Missing signature or secret" });
      }
      const isValid = verifyWhopSignature(rawBody, signature, secret);
      if (!isValid) {
        console.error("❌ Invalid Whop signature — possible spoof");
        return res.status(401).json({ error: "Invalid signature" });
      }
    } else {
      console.log("🧪 TEST_MODE active — skipping signature validation");
    }

    const json = JSON.parse(rawBody.toString());
    const eventType = json.event;
    const discordId = json.data?.discord_user_id;
    const guildId = process.env.DISCORD_GUILD_ID;

    console.log(`🪪 Whop event: ${eventType}`);
    console.log("Payload:", json);

    if (!guildId) throw new Error("Missing DISCORD_GUILD_ID in env");

    const guild = await client.guilds.fetch(guildId);

    // Determine role name
    const productName = json.data?.product_name || "Default Access";
    const roleMap = parseRoleMap();
    let roleName = roleMap[productName] || productName;
    roleName = sanitizeRoleName(roleName);

    // Auto-create role if not exists
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

    const member = await guild.members.fetch(discordId).catch(() => null);

    // Handle membership events
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
