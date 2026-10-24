import { NextResponse } from "next/server";
import { db, createToken } from "@/lib/dataStore";

export async function POST(req: Request) {
  try {
    let email = "";
    let password = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      email = (form.get("username") as string) || (form.get("email") as string) || "";
      password = (form.get("password") as string) || "";
    } else {
      const body = await req.json();
      email = body.username || body.email || "";
      password = body.password || "";
    }

    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password_hash === password
    );

    if (!user) {
      return NextResponse.json({ detail: "Invalid email or password" }, { status: 400 });
    }

    const token = createToken({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Login failed" }, { status: 500 });
  }
}
