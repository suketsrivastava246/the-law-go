import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function GET() {
  const formatted = db.lawyers.map((l) => ({
    ...l,
    user: l.user || {
      id: l.user_id,
      full_name: l.full_name,
      email: l.email,
      phone: l.phone,
      role: "lawyer",
    },
  }));
  return NextResponse.json(formatted);
}
