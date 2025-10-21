import crypto from "crypto";

/**
 * Verify Whop Webhook Signature
 * @param {Buffer} rawBody - Raw request body as Buffer
 * @param {string|string[]} signature - X-Whop-Signature header
 * @param {string} secret - Your Whop webhook secret
 * @returns {boolean} true if valid, false otherwise
 */
export function verifyWhopSignature(rawBody, signature, secret) {
  try {
    if (!signature || !secret || !rawBody) return false;

    // Normalize signature
    const sigString = Array.isArray(signature)
      ? signature[0]
      : String(signature || "").trim();

    // Compute HMAC SHA-256 in hex
    const computed = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    // Length must match or timingSafeEqual will throw
    if (sigString.length !== computed.length) {
      console.warn("⚠️ Signature length mismatch — adjusting for normalization");
      return sigString.trim().toLowerCase() === computed.toLowerCase();
    }

    const valid = crypto.timingSafeEqual(
      Buffer.from(sigString, "utf8"),
      Buffer.from(computed, "utf8")
    );

    if (!valid) {
      console.warn("❌ Signature mismatch — rejecting");
    }

    return valid;
  } catch (err) {
    console.error("❌ Signature verification error:", err.message);
    return false;
  }
}
