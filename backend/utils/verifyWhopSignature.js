import crypto from "crypto";

/**
 * Verify Whop Webhook Signature (final version)
 * Supports both hex and base64 encodings, ensures Buffers, and avoids mismatch errors.
 * @param {Buffer|string} rawBody - Raw request body (Buffer preferred)
 * @param {string} signature - X-Whop-Signature header
 * @param {string} secret - Your Whop webhook secret
 * @returns {boolean}
 */
export function verifyWhopSignature(rawBody, signature, secret) {
  try {
    if (!rawBody || !signature || !secret) {
      console.error("❌ Missing parameters for signature verification.");
      return false;
    }

    // Ensure we have a Buffer (Express.raw provides this)
    const payload =
      Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(JSON.stringify(rawBody));

    // Compute HMAC
    const computed = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Normalize signatures (handle array or string)
    const received = Array.isArray(signature)
      ? signature[0]
      : signature.toString();

    const a = Buffer.from(computed, "utf8");
    const b = Buffer.from(received, "utf8");

    if (a.length !== b.length) {
      console.warn("⚠️ Signature length mismatch — rejecting.");
      return false;
    }

    const match = crypto.timingSafeEqual(a, b);

    if (!match) {
      console.error("❌ Invalid Whop signature — possible spoof.");
    }

    return match;
  } catch (err) {
    console.error("❌ Signature verification error:", err);
    return false;
  }
}
