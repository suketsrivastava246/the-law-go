import { NextResponse } from "next/server";
import { db, User } from "@/lib/dataStore";

export async function GET() {
  const clients = db.users
    .filter((u) => u.role === "client")
    .map((u) => {
      // Find appointments count for this client
      const appCount = db.appointments.filter((a) => a.client_id === u.id).length;
      return {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        is_active: u.is_active,
        appointments_count: appCount,
      };
    });

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, email, phone, password = "password123" } = body;

    if (!full_name || !email) {
      return NextResponse.json({ detail: "Full name and email are required" }, { status: 400 });
    }

    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ detail: "Email is already registered" }, { status: 400 });
    }

    const newClient: User = {
      id: Date.now(),
      full_name,
      email,
      phone: phone || "+1 555-010-0000",
      password_hash: password,
      role: "client",
      is_active: true,
    };

    db.users.push(newClient);

    return NextResponse.json(newClient, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create client" }, { status: 500 });
  }
}
