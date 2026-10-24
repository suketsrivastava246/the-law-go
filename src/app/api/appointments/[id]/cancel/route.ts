import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const app = db.appointments.find((a) => a.id === numId);

  if (!app) {
    return NextResponse.json({ detail: "Appointment not found" }, { status: 404 });
  }

  app.status = "cancelled";
  return NextResponse.json(app);
}
