import crypto from "crypto";

/**
 * Verify Whop Webhook Signature — works for both hex & base64 encodings
 * @param {Buffer|string} payload - Raw JSON buffer or string
 * @param {string} signature - X-Whop-Signature header
 * @param {string} secret - Whop webhook secret
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

    // Compute expected signatures in both formats
    const expectedHex = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest("hex");

    const expectedBase64 = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest("base64");

    // Helper: safely compare two signatures
    const safeCompare = (expected, sig) => {
      try {
        const expectedBuf = Buffer.from(expected, expected.match(/^[0-9a-f]+$/i) ? "hex" : "utf8");
        const sigBuf = Buffer.from(sig, sig.match(/^[0-9a-f]+$/i) ? "hex" : "utf8");
        if (expectedBuf.length !== sigBuf.length) return false;
        return crypto.timingSafeEqual(expectedBuf, sigBuf);
      } catch {
        return false;
      }
    };

    const isValid =
      safeCompare(expectedHex, signature) || safeCompare(expectedBase64, signature);

    if (!isValid) {
      console.warn("⚠️ Invalid Whop signature — mismatched or malformed encoding.");
    }

    return isValid;
  } catch (err) {
    console.error("❌ Signature verification error:", err);
    return false;
  }
}
