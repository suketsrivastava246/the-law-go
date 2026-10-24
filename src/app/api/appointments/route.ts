import { NextResponse } from "next/server";
import { db, getUserFromRequest, Appointment } from "@/lib/dataStore";

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req.headers.get("authorization"));
    const body = await req.json();

    const newApp: Appointment = {
      id: db.appointments.length + 1,
      client_id: user ? user.id : 2,
      lawyer_id: body.lawyer_id || 1,
      specialization: body.specialization || "General",
      consultation_type: body.consultation_type || "Video Call",
      date: body.date || new Date().toISOString().split("T")[0],
      time_slot: body.time_slot || "10:00 AM",
      brief_subject: body.brief_subject || "Legal Consultation",
      detailed_description: body.detailed_description || "",
      status: "pending",
    };

    db.appointments.push(newApp);
    return NextResponse.json(newApp, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to book" }, { status: 500 });
  }
}
