import crypto from "crypto";

// Ensure the secret is exactly 32 bytes for AES-256
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || "fallback-secret-key-32-chars-long";
  return crypto.createHash("sha256").update(String(secret)).digest("base64").substr(0, 32);
};

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = crypto.pbkdf2Sync(getSecretKey(), salt, 100000, 32, "sha512");
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    // Format: iv:salt:tag:encryptedData
    return `${iv.toString("hex")}:${salt.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Decrypts a string that was encrypted with the above method
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  // If the text isn't in our encrypted format (legacy plain text keys), just return it
  if (!encryptedText.includes(":")) {
    return encryptedText;
  }
  
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 4) return encryptedText;
    
    const [ivHex, saltHex, tagHex, encryptedHex] = parts;
    
    const iv = Buffer.from(ivHex, "hex");
    const salt = Buffer.from(saltHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    
    const key = crypto.pbkdf2Sync(getSecretKey(), salt, 100000, 32, "sha512");
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Decryption failed:", error);
    // If decryption fails, the key might have changed, or it might be legacy plaintext
    // that somehow had colons in it. Return it as is as a fallback.
    return encryptedText;
  }
}
