import crypto from "crypto";

/**
 * Verify Whop Webhook Signature
 * @param {string|Buffer|Object} payload - Raw JSON or Buffer from Whop webhook
 * @param {string} signature - X-Whop-Signature header
 * @param {string} secret - Your Whop webhook secret
 * @returns {boolean} true if signature is valid, false otherwise
 */
export function verifyWhopSignature(payload, signature, secret) {
  if (!signature || !secret) return false;

  try {
    // Ensure payload is a Buffer or string
    const data = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(
          typeof payload === "string" ? payload : JSON.stringify(payload)
        );

    const computed = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    // Normalize both sides for safe comparison
    const sigBuf = Buffer.from(signature.trim().toLowerCase(), "utf8");
    const compBuf = Buffer.from(computed.trim().toLowerCase(), "utf8");

    // Prevent RangeError on timingSafeEqual
    if (sigBuf.length !== compBuf.length) {
      console.warn(
        "⚠️ Signature length mismatch — rejecting (likely invalid signature)."
      );
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, compBuf);
  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
    return false;
  }
}
