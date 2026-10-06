import { createClient, type Row } from "@libsql/client";

// Local: archivo SQLite en la raíz del proyecto.
// Vercel: base Turso (libSQL) vía TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:tresco.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let ready: Promise<void> | undefined;

export function migrate() {
  ready ??= (async () => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS phones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'phone',
        whatsapp_only INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    // Tablas creadas antes de que existieran estas columnas.
    const { rows } = await db.execute("PRAGMA table_info(phones)");
    const cols = new Set(rows.map((r) => r.name));
    if (!cols.has("type")) {
      await db.execute("ALTER TABLE phones ADD COLUMN type TEXT NOT NULL DEFAULT 'phone'");
    }
    if (!cols.has("whatsapp_only")) {
      await db.execute(
        "ALTER TABLE phones ADD COLUMN whatsapp_only INTEGER NOT NULL DEFAULT 0",
      );
    }
  })().catch((err) => {
    ready = undefined;
    throw err;
  });
  return ready;
}

export type PhoneType = "phone" | "whatsapp";

export type Phone = {
  id: number;
  name: string;
  phone: string;
  type: PhoneType;
  whatsappOnly: boolean;
};

export const COLUMNS = "id, name, phone, type, whatsapp_only";

export function toPhone(row: Row): Phone {
  return {
    id: Number(row.id),
    name: String(row.name),
    phone: String(row.phone),
    type: row.type === "whatsapp" ? "whatsapp" : "phone",
    whatsappOnly: Boolean(row.whatsapp_only),
  };
}

export function parsePhone(body: unknown): Omit<Phone, "id"> | null {
  if (!body || typeof body !== "object") return null;
  const { name, phone, type, whatsappOnly } = body as Record<string, unknown>;
  if (typeof name !== "string" || typeof phone !== "string") return null;
  if (type !== "phone" && type !== "whatsapp") return null;
  const n = name.trim();
  const p = phone.trim();
  if (!n || !p || n.length > 80 || p.length > 40) return null;
  return {
    name: n,
    phone: p,
    type,
    // "Solo WhatsApp" solo tiene sentido si el contacto es de WhatsApp.
    whatsappOnly: type === "whatsapp" && whatsappOnly === true,
  };
}
