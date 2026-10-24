import { NextResponse } from "next/server";
import { db, getUserFromRequest } from "@/lib/dataStore";

export async function GET(req: Request) {
  const user = getUserFromRequest(req.headers.get("authorization"));
  const clientId = user ? user.id : 2; // Default to demo client if unauthenticated

  const apps = db.appointments.filter((a) => a.client_id === clientId || !user);
  return NextResponse.json(apps);
}
