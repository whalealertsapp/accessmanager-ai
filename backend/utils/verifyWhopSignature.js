import crypto from "crypto";

/**
 * Verify Whop Webhook Signature (handles arrays, base64, hex)
 * @param {Buffer|string} payload - Raw JSON buffer or string
 * @param {string|string[]} signature - X-Whop-Signature header
 * @param {string} secret - Whop webhook secret
 * @returns {boolean}
 */
export function verifyWhopSignature(payload, signature, secret) {
  if (!signature || !secret) {
    console.error("❌ Missing signature or secret");
    return false;
  }

  try {
    // 🧹 Normalize signature (if array or object)
    if (Array.isArray(signature)) signature = signature[0];
    if (typeof signature === "object" && signature !== null)
      signature = Object.values(signature)[0];
    signature = String(signature).trim();

    const bodyBuffer = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(payload, "utf8");

    // Compute both encodings
    const expectedHex = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest("hex");
    const expectedBase64 = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest("base64");

    const safeCompare = (expected, sig) => {
      try {
        const expectedBuf = Buffer.from(expected, "utf8");
        const sigBuf = Buffer.from(sig, "utf8");
        if (expectedBuf.length !== sigBuf.length) return false;
        return crypto.timingSafeEqual(expectedBuf, sigBuf);
      } catch {
        return false;
      }
    };

    const isValid =
      safeCompare(expectedHex, signature) || safeCompare(expectedBase64, signature);

    if (!isValid) console.warn("⚠️ Invalid Whop signature — mismatched encoding or array form.");
    return isValid;
  } catch (err) {
    console.error("❌ Signature verification error:", err.message);
    return false;
  }
}
