import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const lawyer = db.lawyers.find((l) => l.id === numId);

  if (!lawyer) {
    return NextResponse.json({ detail: "Lawyer not found" }, { status: 404 });
  }

  lawyer.is_verified = true;
  return NextResponse.json(lawyer);
}
