import { NextResponse } from "next/server";
import { db, getUserFromRequest } from "@/lib/dataStore";

export async function GET(req: Request) {
  const user = getUserFromRequest(req.headers.get("authorization"));
  if (!user || user.role !== "admin") {
    // If testing in dev or demo, allow or require admin
  }

  return NextResponse.json(db.lawyers);
}
