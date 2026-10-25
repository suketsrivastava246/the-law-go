import { NextResponse } from "next/server";
import { db, getUserFromRequest } from "@/lib/dataStore";

export async function GET(req: Request) {
  const user = getUserFromRequest(req.headers.get("authorization"));
  let apps = [...db.appointments];

  if (user) {
    if (user.role === "lawyer") {
      // Find lawyer entry matching this user
      const lawyer = db.lawyers.find(
        (l) => l.user_id === user.id || l.email.toLowerCase() === user.email.toLowerCase()
      );
      const lawyerId = lawyer ? lawyer.id : 1;
      apps = apps.filter((a) => a.lawyer_id === lawyerId || a.lawyer_id === user.id);
    } else if (user.role === "client") {
      apps = apps.filter((a) => a.client_id === user.id);
    }
  }

  // Ensure lawyer details are attached to each appointment
  const formatted = apps.map((a) => {
    const lawyer = db.lawyers.find((l) => l.id === a.lawyer_id) || db.lawyers[0];
    return {
      ...a,
      lawyer: a.lawyer || (lawyer
        ? {
            id: lawyer.id,
            full_name: lawyer.full_name,
            email: lawyer.email,
            phone: lawyer.phone,
            specialization: lawyer.specialization,
            avatar_url: lawyer.avatar_url,
          }
        : {
            full_name: "Adv. Sarah Jenkins",
            specialization: a.specialization || "Family & Marriage Law",
          }),
    };
  });

  return NextResponse.json(formatted);
}
