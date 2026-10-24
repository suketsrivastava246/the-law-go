import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const resource = db.resources.find((r) => r.id === numId);

  if (!resource) {
    return NextResponse.json({ detail: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json(resource);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id);
    const resource = db.resources.find((r) => r.id === numId);

    if (!resource) {
      return NextResponse.json({ detail: "Resource not found" }, { status: 404 });
    }

    const body = await req.json();
    Object.assign(resource, body);

    return NextResponse.json(resource);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const idx = db.resources.findIndex((r) => r.id === numId);

  if (idx === -1) {
    return NextResponse.json({ detail: "Resource not found" }, { status: 404 });
  }

  db.resources.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
}
