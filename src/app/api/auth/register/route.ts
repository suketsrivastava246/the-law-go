import { NextResponse } from "next/server";
import { db, createToken, User } from "@/lib/dataStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, email, phone, password, role = "client" } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ detail: "Full name, email, and password are required" }, { status: 400 });
    }

    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ detail: "Email is already registered" }, { status: 400 });
    }

    const newUser: User = {
      id: Date.now(),
      full_name,
      email,
      phone: phone || "",
      password_hash: password,
      role: role as any,
      is_active: true,
    };

    db.users.push(newUser);

    const token = createToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Registration failed" }, { status: 500 });
  }
}
