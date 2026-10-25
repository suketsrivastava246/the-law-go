import { NextResponse } from "next/server";
import { getUserFromRequest, db } from "@/lib/dataStore";

export async function GET(req: Request) {
  const user = getUserFromRequest(req.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  let lawyerId = null;
  let lawyerProfile = null;

  if (user.role === "lawyer") {
    const lawyer = db.lawyers.find(
      (l) => l.user_id === user.id || l.email.toLowerCase() === user.email.toLowerCase()
    );
    if (lawyer) {
      lawyerId = lawyer.id;
      lawyerProfile = lawyer;
    }
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: user.role,
    is_active: user.is_active,
    lawyer_id: lawyerId,
    lawyer_profile: lawyerProfile,
  });
}
