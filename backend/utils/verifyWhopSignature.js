import crypto from "crypto";

/**
 * Verify Whop Webhook Signature (v1 format)
 * Handles headers like: t=timestamp,v1=hash
 */
export function verifyWhopSignature(payload, signatureHeader, secret) {
  try {
    if (!signatureHeader || !secret) {
      console.warn("⚠️ Missing signature or secret");
      return false;
    }

    // Convert body safely to Buffer
    const bodyBuffer = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(
          typeof payload === "string" ? payload : JSON.stringify(payload),
          "utf8"
        );

    // ✅ Extract v1 portion of header (after comma)
    const match = /v1=([a-f0-9]+)/i.exec(signatureHeader);
    if (!match) {
      console.warn("⚠️ No v1 signature found in header:", signatureHeader);
      return false;
    }
    const receivedSig = match[1].trim();

    // Compute expected HMAC SHA256 hex digest
    const computed = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest("hex");

    const receivedBuf = Buffer.from(receivedSig, "hex");
    const computedBuf = Buffer.from(computed, "hex");

    console.log(
      `🧩 Sig length check: received=${receivedBuf.length}, computed=${computedBuf.length}`
    );

    if (receivedBuf.length !== computedBuf.length) {
      console.warn(
        `⚠️ Signature length mismatch (received ${receivedBuf.length} vs computed ${computedBuf.length})`
      );
      return false;
    }

    const matchValid = crypto.timingSafeEqual(receivedBuf, computedBuf);

    if (!matchValid) console.warn("❌ Signature mismatch — rejecting");
    else console.log("✅ Whop signature verified successfully");

    return matchValid;
  } catch (err) {
    console.error("❌ Signature verification error:", err);
    return false;
  }
}
