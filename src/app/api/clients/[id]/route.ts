import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const client = db.users.find((u) => u.id === numId && u.role === "client");

  if (!client) {
    return NextResponse.json({ detail: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id);
    const client = db.users.find((u) => u.id === numId && u.role === "client");

    if (!client) {
      return NextResponse.json({ detail: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    if (body.full_name !== undefined) client.full_name = body.full_name;
    if (body.email !== undefined) client.email = body.email;
    if (body.phone !== undefined) client.phone = body.phone;
    if (body.is_active !== undefined) client.is_active = Boolean(body.is_active);

    return NextResponse.json(client);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const idx = db.users.findIndex((u) => u.id === numId && u.role === "client");

  if (idx === -1) {
    return NextResponse.json({ detail: "Client not found" }, { status: 404 });
  }

  db.users.splice(idx, 1);

  // Also remove client appointments
  for (let i = db.appointments.length - 1; i >= 0; i--) {
    if (db.appointments[i].client_id === numId) {
      db.appointments.splice(i, 1);
    }
  }

  return new NextResponse(null, { status: 204 });
}
