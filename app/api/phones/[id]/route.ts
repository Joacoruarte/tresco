import { NextResponse } from "next/server";
import { COLUMNS, db, migrate, parsePhone, toPhone } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/phones/[id]">,
) {
  const { id } = await params;
  const data = parsePhone(await request.json().catch(() => null));
  if (!data) {
    return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
  }
  await migrate();
  const { rows } = await db.execute({
    sql: `UPDATE phones SET name = ?, phone = ?, type = ?, whatsapp_only = ? WHERE id = ? RETURNING ${COLUMNS}`,
    args: [data.name, data.phone, data.type, data.whatsappOnly ? 1 : 0, Number(id)],
  });
  if (!rows[0]) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(toPhone(rows[0]));
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/phones/[id]">,
) {
  const { id } = await params;
  await migrate();
  const { rowsAffected } = await db.execute({
    sql: "DELETE FROM phones WHERE id = ?",
    args: [Number(id)],
  });
  if (!rowsAffected) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
