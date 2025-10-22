// backend/utils/verifyWhopSignature.js
import crypto from "crypto";

// Canonicalize JSON by sorting object keys consistently
function canonicalJSONString(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj))
    return `[${obj.map((i) => canonicalJSONString(i)).join(",")}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${canonicalJSONString(obj[k])}`)
    .join(",")}}`;
}

export function verifyWhopSignature(rawBodyBuffer, sigHeader, secret) {
  try {
    if (!sigHeader || !secret) return false;
    const match = String(sigHeader).match(/v1=([a-f0-9]+)/i);
    if (!match) return false;
    const received = match[1];

    // Parse and canonicalize
    let json;
    try {
      const rawString = Buffer.isBuffer(rawBodyBuffer)
        ? rawBodyBuffer.toString("utf8")
        : typeof rawBodyBuffer === "string"
        ? rawBodyBuffer
        : JSON.stringify(rawBodyBuffer);
      json = JSON.parse(rawString);
    } catch {
      return false;
    }

    const canonical = canonicalJSONString(json);
    const computed = crypto
      .createHmac("sha256", secret)
      .update(canonical, "utf8")
      .digest("hex");

    console.log("🧩 Sig compare:");
    console.log("  received=", received);
    console.log("  computed=", computed);

    return crypto.timingSafeEqual(
      Buffer.from(received, "hex"),
      Buffer.from(computed, "hex")
    );
  } catch (err) {
    console.error("verifyWhopSignature error:", err);
    return false;
  }
}
