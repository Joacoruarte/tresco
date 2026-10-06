import { NextResponse } from "next/server";
import { COLUMNS, db, listPhones, migrate, parsePhone, toPhone } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await listPhones());
}

export async function POST(request: Request) {
  const data = parsePhone(await request.json().catch(() => null));
  if (!data) {
    return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
  }
  await migrate();
  const { rows } = await db.execute({
    sql: `INSERT INTO phones (name, phone, type, whatsapp_only) VALUES (?, ?, ?, ?) RETURNING ${COLUMNS}`,
    args: [data.name, data.phone, data.type, data.whatsappOnly ? 1 : 0],
  });
  return NextResponse.json(toPhone(rows[0]), { status: 201 });
}
