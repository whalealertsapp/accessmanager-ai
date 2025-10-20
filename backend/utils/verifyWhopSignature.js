import crypto from "crypto";

/**
 * Verify Whop Webhook Signature
 * @param {string} payload - Raw JSON string from Whop webhook
 * @param {string} signature - X-Whop-Signature header
 * @param {string} secret - Your Whop webhook secret
 * @returns {boolean} true if signature is valid, false otherwise
 */
export function verifyWhopSignature(payload, signature, secret) {
  if (!signature || !secret) return false;

  try {
    const computed = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch (err) {
    console.error("Signature verification failed:", err.message);
    return false;
  }
}
