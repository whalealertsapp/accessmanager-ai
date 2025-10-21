import crypto from "crypto";

/**
 * Verify Whop Webhook Signature (handles both hex & base64 safely)
 * @param {Buffer|string} payload - Raw JSON buffer or string
 * @param {string} signature - X-Whop-Signature header
 * @param {string} secret - Your Whop webhook secret
 * @returns {boolean}
 */
export function verifyWhopSignature(payload, signature, secret) {
  if (!signature || !secret) {
    console.error("❌ Missing signature or secret");
    return false;
  }

  try {
    const bodyBuffer = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(payload, "utf8");

    // Compute expected signature as both hex and base64
    const hmac = crypto.createHmac("sha256", secret).update(bodyBuffer);
    const expectedHex = hmac.digest("hex");
    const expectedBase64 = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest("base64");

    // Convert to buffers safely (auto-detect format)
    const tryCompare = (expected, sig) => {
      const expectedBuf = Buffer.from(expected);
      const sigBuf = Buffer.from(sig);
      if (expectedBuf.length !== sigBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, sigBuf);
    };

    const isValid =
      tryCompare(expectedHex, signature) ||
      tryCompare(expectedBase64, signature);

    if (!isValid)
      console.warn("⚠️ Signature verification failed — mismatched encoding.");

    return isValid;
  } catch (err) {
    console.error("❌ Signature verification error:", err.message);
    return false;
  }
}
