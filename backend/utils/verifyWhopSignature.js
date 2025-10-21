import crypto from "crypto";

/**
 * Verify Whop Webhook Signature (handles hex safely)
 * @param {Buffer|string} payload - Raw JSON buffer or string
 * @param {string} signature - X-Whop-Signature header
 * @param {string} secret - Your Whop webhook secret
 * @returns {boolean}
 */
export function verifyWhopSignature(payload, signature, secret) {
  if (!signature || !secret) {
    console.error("Missing signature or secret");
    return false;
  }

  try {
    // Make sure payload is a Buffer
    const bodyBuffer = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(payload, "utf8");

    // Compute the expected signature (hex string)
    const expected = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest("hex");

    // Convert both to Buffers with 'hex' encoding for safe comparison
    const expectedBuf = Buffer.from(expected, "hex");
    const signatureBuf = Buffer.from(signature, "hex");

    // Compare with constant-time check
    if (expectedBuf.length !== signatureBuf.length) {
      console.warn("⚠️ Signature length mismatch — likely invalid signature.");
      return false;
    }

    const isValid = crypto.timingSafeEqual(expectedBuf, signatureBuf);
    return isValid;
  } catch (err) {
    console.error("❌ Signature verification failed:", err);
    return false;
  }
}
