import crypto from "crypto";

// ─── Session Encryption ─────────────────────────────────────────────────────
const SECRET_KEY = process.env.SESSION_SECRET || "care_online_auth_secret_key_32ch";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export interface SessionData {
  id: string;
  email: string;
  name: string;
  expires: number;
}

export function encryptSession(data: SessionData): string {
  const key = Buffer.alloc(32);
  key.write(SECRET_KEY, "utf-8");
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
    if (Date.now() > data.expires) return null;
    return data;
  } catch (e) {
    return null;
  }
}

// ─── User Storage ────────────────────────────────────────────────────────────
//
// Strategy (compatible with Vercel's read-only filesystem):
//
// 1. PRIMARY: The env var USERS_DB holds a base64-encoded JSON array of users.
//    Vercel lets you update env vars via their dashboard or CLI, so on signup
//    we write the updated list back via the Vercel API (if VERCEL_API_TOKEN
//    is provided). This is the production path.
//
// 2. FALLBACK (local dev): If no USERS_DB env var, we fall back to the local
//    filesystem db.json so local dev still works seamlessly.
//
// 3. SEED: The account vincent@care-online.fr / password123 is always injected
//    from SEED_USER_EMAIL + SEED_USER_PASSWORD env vars (or the hardcoded
//    defaults) so you can always log in even with an empty USERS_DB.

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // SHA-256 hash
}

function getSeedUsers(): StoredUser[] {
  const seedEmail = (process.env.SEED_USER_EMAIL || "vincent@care-online.fr").toLowerCase();
  const seedPassword = process.env.SEED_USER_PASSWORD || "password123";
  return [
    {
      id: "seed-001",
      name: "Vincent",
      email: seedEmail,
      password: hashPassword(seedPassword),
    },
  ];
}

function mergeWithSeed(users: StoredUser[]): StoredUser[] {
  const seed = getSeedUsers();
  for (const seedUser of seed) {
    if (!users.find((u) => u.email === seedUser.email)) {
      users = [seedUser, ...users];
    }
  }
  return users;
}

export async function getUsers(): Promise<StoredUser[]> {
  // 1. Try env var (production / Vercel)
  const envDb = process.env.USERS_DB;
  if (envDb) {
    try {
      const decoded = Buffer.from(envDb, "base64").toString("utf-8");
      const users: StoredUser[] = JSON.parse(decoded);
      return mergeWithSeed(users);
    } catch {
      return getSeedUsers();
    }
  }

  // 2. Fall back to local filesystem (dev)
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dbPath = path.join(process.cwd(), "src/lib/db.json");
    const data = await fs.readFile(dbPath, "utf-8");
    const users: StoredUser[] = JSON.parse(data);
    return mergeWithSeed(users);
  } catch {
    return getSeedUsers();
  }
}

export async function saveUsers(users: StoredUser[]): Promise<void> {
  // 1. Attempt Vercel env var update (production)
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;
  const vercelTeamId = process.env.VERCEL_TEAM_ID; // optional

  if (vercelToken && vercelProjectId) {
    try {
      const encoded = Buffer.from(JSON.stringify(users)).toString("base64");
      const teamQuery = vercelTeamId ? `?teamId=${vercelTeamId}` : "";
      const url = `https://api.vercel.com/v10/projects/${vercelProjectId}/env${teamQuery}`;

      // Check if USERS_DB already exists (to decide PATCH vs POST)
      const listRes = await fetch(url, {
        headers: { Authorization: `Bearer ${vercelToken}` },
      });
      const listData = await listRes.json();
      const existing = listData.envs?.find((e: any) => e.key === "USERS_DB");

      if (existing) {
        await fetch(
          `https://api.vercel.com/v10/projects/${vercelProjectId}/env/${existing.id}${teamQuery}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${vercelToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ value: encoded }),
          }
        );
      } else {
        await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: "USERS_DB",
            value: encoded,
            type: "encrypted",
            target: ["production", "preview"],
          }),
        });
      }
      return;
    } catch (e) {
      console.error("Vercel env update failed, falling back to filesystem:", e);
    }
  }

  // 2. Fall back to local filesystem (dev)
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dbPath = path.join(process.cwd(), "src/lib/db.json");
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.error("Could not persist users:", e);
  }
}
