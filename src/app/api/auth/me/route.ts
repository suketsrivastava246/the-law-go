import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/dataStore";

export async function GET(req: Request) {
  const user = getUserFromRequest(req.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: user.role,
    is_active: user.is_active,
  });
}
