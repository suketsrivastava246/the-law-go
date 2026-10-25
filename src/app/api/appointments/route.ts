import { NextResponse } from "next/server";
import { db, getUserFromRequest, Appointment } from "@/lib/dataStore";

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req.headers.get("authorization"));
    const body = await req.json();

    let clientId = body.client_id;
    let lawyerId = body.lawyer_id;

    if (user?.role === "lawyer") {
      const lawyer = db.lawyers.find(
        (l) => l.user_id === user.id || l.email.toLowerCase() === user.email.toLowerCase()
      );
      lawyerId = lawyer ? lawyer.id : 1;
      const firstClient = db.users.find((u) => u.role === "client");
      clientId = clientId || (firstClient?.id || 2);
    } else if (user) {
      clientId = user.id;
      lawyerId = lawyerId || 1;
    } else {
      clientId = 2;
      lawyerId = lawyerId || 1;
    }

    const newApp: Appointment = {
      id: db.appointments.length + 1,
      client_id: clientId,
      lawyer_id: lawyerId,
      specialization: body.specialization || "General Consultation",
      consultation_type: body.consultation_type || "Video Call",
      date: body.date || new Date().toISOString().split("T")[0],
      time_slot: body.time_slot || "10:00 AM",
      brief_subject: body.brief_subject || "Legal Consultation",
      detailed_description: body.detailed_description || "",
      status: body.status || "confirmed",
    };

    db.appointments.push(newApp);
    return NextResponse.json(newApp, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to book" }, { status: 500 });
  }
}
