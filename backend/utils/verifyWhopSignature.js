import crypto from "crypto";

/**
 * Verify Whop Webhook Signature
 * Handles both hex and base64 encodings + auto-normalization
 * @param {Buffer|string} payload - raw request body
 * @param {string} signatureHeader - x-whop-signature header
 * @param {string} secret - your Whop webhook secret
 */
export function verifyWhopSignature(payload, signatureHeader, secret) {
  try {
    if (!signatureHeader || !secret) {
      console.warn("⚠️ Missing signature or secret");
      return false;
    }

    // Normalize payload → Buffer
    const bodyBuffer = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(payload, "utf8");

    // Some Whop headers may contain prefixes like "sha256="
    let receivedSig = signatureHeader.trim().replace(/^sha256=/i, "");

    // Normalize and detect encoding
    let receivedBuf;
    if (/^[0-9a-f]+$/i.test(receivedSig) && receivedSig.length % 2 === 0) {
      receivedBuf = Buffer.from(receivedSig, "hex");
    } else {
      // fallback: base64 or mixed
      try {
        receivedBuf = Buffer.from(receivedSig, "base64");
      } catch {
        receivedBuf = Buffer.from(receivedSig, "utf8");
      }
    }

    // Compute HMAC SHA256 in binary (Buffer)
    const computedBuf = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest();

    // Log partials for debugging (safe)
    console.log(
      `🧩 Sig length check: received=${receivedBuf.length}, computed=${computedBuf.length}`
    );

    // Ensure equal lengths for timingSafeEqual
    if (receivedBuf.length !== computedBuf.length) {
      console.warn(
        `⚠️ Signature length mismatch (received ${receivedBuf.length} vs computed ${computedBuf.length})`
      );
      return false;
    }

    const match = crypto.timingSafeEqual(receivedBuf, computedBuf);

    if (!match) console.error("❌ Signature mismatch (digest differs)");
    else console.log("✅ Whop signature verified successfully");

    return match;
  } catch (err) {
    console.error("❌ Signature verification error:", err);
    return false;
  }
}
