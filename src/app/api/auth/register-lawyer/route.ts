import { NextResponse } from "next/server";
import { db, User, Lawyer } from "@/lib/dataStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user: userData, lawyer_data } = body;

    if (!userData?.email || !userData?.full_name) {
      return NextResponse.json({ detail: "User data is incomplete" }, { status: 400 });
    }

    if (db.users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return NextResponse.json({ detail: "Email is already registered" }, { status: 400 });
    }

    const userId = Date.now();
    const newUser: User = {
      id: userId,
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone || "",
      password_hash: userData.password || "password123",
      role: "lawyer",
      is_active: true,
    };
    db.users.push(newUser);

    const newLawyer: Lawyer = {
      id: db.lawyers.length + 1,
      user_id: userId,
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone || "",
      specialization: lawyer_data?.specialization || "General Law",
      experience_years: lawyer_data?.experience_years || 1,
      bar_number: lawyer_data?.bar_number || "BAR-" + Math.floor(Math.random() * 900000 + 100000),
      qualifications: lawyer_data?.qualifications || "LL.B.",
      location: lawyer_data?.location || "Remote",
      fee_per_hour: lawyer_data?.fee_per_hour || 150.0,
      about: lawyer_data?.about || "Verified legal professional",
      avatar_url:
        lawyer_data?.avatar_url ||
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
      rating: 5.0,
      reviews_count: 0,
      languages: lawyer_data?.languages || "English",
      is_verified: false, // Requires admin verification
    };
    db.lawyers.push(newLawyer);

    return NextResponse.json({
      message: "Lawyer registered successfully. Pending admin verification.",
      lawyer: newLawyer,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Registration failed" }, { status: 500 });
  }
}
