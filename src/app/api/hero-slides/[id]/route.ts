import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id);
    const slide = db.slides.find((s) => s.id === numId);

    if (!slide) {
      return NextResponse.json({ detail: "Slide not found" }, { status: 404 });
    }

    const body = await req.json();
    Object.assign(slide, body);

    return NextResponse.json(slide);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update slide" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const idx = db.slides.findIndex((s) => s.id === numId);

  if (idx === -1) {
    return NextResponse.json({ detail: "Slide not found" }, { status: 404 });
  }

  db.slides.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
}
