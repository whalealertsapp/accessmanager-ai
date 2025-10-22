import express from "express";
import { verifyWhopSignature } from "../utils/verifyWhopSignature.js";

const router = express.Router();

router.post("/whop", async (req, res) => {
  try {
    console.log("🧾 Incoming Whop webhook request:");
    console.log("Headers:", req.headers);

    // Ensure raw body is a Buffer
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body));

    console.log("Raw body type:", typeof req.body);

    // === Get required data ===
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    const signature = req.headers["x-whop-signature"];

    if (!signature) {
      console.warn("⚠️ No x-whop-signature header received");
      return res.status(400).json({ success: false, error: "Missing signature header" });
    }

    // === Verify signature ===
    const isValid = verifyWhopSignature(rawBody, signature, secret);
    if (!isValid) {
      console.warn("⚠️ Invalid Whop signature — possible spoof");
      return res.status(401).json({ success: false, error: "Invalid signature" });
    }

    // === Parse payload ===
    const json = JSON.parse(rawBody.toString());
    console.log("✅ Verified Whop payload:", json);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    res.status(500).json({ success: false, error: "Webhook error" });
  }
});

export default router;
