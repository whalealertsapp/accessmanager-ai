import crypto from "crypto";

/**
 * Verify Whop Webhook Signature
 * @param {Buffer|object|string} rawBody - Raw request body (may be Buffer or parsed JSON)
 * @param {string|string[]} signature - X-Whop-Signature header
 * @param {string} secret - Your Whop webhook secret
 * @returns {boolean} true if valid, false otherwise
 */
export function verifyWhopSignature(rawBody, signature, secret) {
  try {
    if (!signature || !secret || !rawBody) {
      console.error("❌ Missing data for signature verification");
      return false;
    }

    // Convert rawBody safely into a Buffer
    const bodyBuffer =
      Buffer.isBuffer(rawBody)
        ? rawBody
        : Buffer.from(
            typeof rawBody === "string"
              ? rawBody
              : JSON.stringify(rawBody),
            "utf8"
          );

    // Normalize Whop signature (handle arrays, extra whitespace)
    const sigString = Array.isArray(signature)
      ? signature[0]
      : String(signature || "").trim();

    // Compute expected signature
    const computed = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest("hex");

    // Compare safely
    const sigBuf = Buffer.from(sigString, "utf8");
    const compBuf = Buffer.from(computed, "utf8");

    if (sigBuf.length !== compBuf.length) {
      console.warn(
        `⚠️ Signature length mismatch (${sigBuf.length} vs ${compBuf.length})`
      );
      return false;
    }

    const valid = crypto.timingSafeEqual(sigBuf, compBuf);

    if (!valid) {
      console.warn("❌ Signature mismatch — rejecting");
    } else {
      console.log("✅ Signature verified successfully");
    }

    return valid;
  } catch (err) {
    console.error("❌ Signature verification error:", err.message);
    return false;
  }
}
