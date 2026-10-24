import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const lawyer = db.lawyers.find((l) => l.id === numId);

  if (!lawyer) {
    return NextResponse.json({ detail: "Lawyer not found" }, { status: 404 });
  }

  return NextResponse.json(lawyer);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const idx = db.lawyers.findIndex((l) => l.id === numId);

  if (idx === -1) {
    return NextResponse.json({ detail: "Lawyer not found" }, { status: 404 });
  }

  db.lawyers.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
}
