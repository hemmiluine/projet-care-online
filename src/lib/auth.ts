import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

// 32-character key for AES-256 encryption (uses env or falls back to a default for local testing)
const SECRET_KEY = process.env.SESSION_SECRET || "care_online_auth_secret_key_32_chars_long";
const dbPath = path.join(process.cwd(), "src/lib/db.json");

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function getUsers() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    // If the file doesn't exist, return empty array
    return [];
  }
}

export async function saveUsers(users: any[]) {
  // Ensure the directory exists
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(users, null, 2), "utf-8");
}

export interface SessionData {
  id: string;
  email: string;
  name: string;
  expires: number;
}

export function encryptSession(data: SessionData): string {
  // We use aes-256-cbc. The key must be exactly 32 bytes.
  // We pad/slice the secret to ensure it is exactly 32 bytes.
  const key = Buffer.alloc(32);
  key.write(SECRET_KEY, "utf-8");

  // Fixed initialization vector (IV) for local development simplicity
  const iv = Buffer.alloc(16, 0);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decryptSession(token: string): SessionData | null {
  try {
    const key = Buffer.alloc(32);
    key.write(SECRET_KEY, "utf-8");
    const iv = Buffer.alloc(16, 0);

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(token, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    const data = JSON.parse(decrypted) as SessionData;
    
    // Check expiration
    if (Date.now() > data.expires) {
      return null;
    }
    
    return data;
  } catch (e) {
    return null;
  }
}
