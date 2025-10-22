// backend/utils/verifyWhopSignature.js
import crypto from "crypto";

export function verifyWhopSignature(rawBodyBuffer, sigHeader, secret) {
  try {
    if (!sigHeader || !secret) return false;

    const header = String(sigHeader);
    const match = header.match(/v1=([a-f0-9]+)/i);
    if (!match) {
      console.error("❌ No v1 signature found in header");
      return false;
    }
    const received = match[1];

    // Convert buffer to UTF-8 string since Whop signs the stringified body
    const rawString =
      Buffer.isBuffer(rawBodyBuffer)
        ? rawBodyBuffer.toString("utf8")
        : typeof rawBodyBuffer === "string"
        ? rawBodyBuffer
        : JSON.stringify(rawBodyBuffer);

    // Whop HMAC uses sha256 of the string body directly
    const computed = crypto
      .createHmac("sha256", secret)
      .update(rawString, "utf8")
      .digest("hex");

    console.log(
      `🧩 Sig compare:\n  received=${received}\n  computed=${computed}`
    );

    return crypto.timingSafeEqual(
      Buffer.from(received, "hex"),
      Buffer.from(computed, "hex")
    );
  } catch (err) {
    console.error("verifyWhopSignature error:", err);
    return false;
  }
}
