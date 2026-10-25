import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const lawyer = db.lawyers.find((l) => l.id === numId);

  if (!lawyer) {
    return NextResponse.json({ detail: "Lawyer not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...lawyer,
    user: lawyer.user || {
      id: lawyer.user_id,
      full_name: lawyer.full_name,
      email: lawyer.email,
      phone: lawyer.phone,
      role: "lawyer",
    },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id);
    const lawyer = db.lawyers.find((l) => l.id === numId);

    if (!lawyer) {
      return NextResponse.json({ detail: "Lawyer not found" }, { status: 404 });
    }

    const body = await req.json();

    // Update lawyer fields
    if (body.full_name !== undefined) lawyer.full_name = body.full_name;
    if (body.email !== undefined) lawyer.email = body.email;
    if (body.phone !== undefined) lawyer.phone = body.phone;
    if (body.specialization !== undefined) lawyer.specialization = body.specialization;
    if (body.experience_years !== undefined) lawyer.experience_years = Number(body.experience_years);
    if (body.bar_number !== undefined) lawyer.bar_number = body.bar_number;
    if (body.qualifications !== undefined) lawyer.qualifications = body.qualifications;
    if (body.location !== undefined) lawyer.location = body.location;
    if (body.fee_per_hour !== undefined) lawyer.fee_per_hour = Number(body.fee_per_hour);
    if (body.about !== undefined) lawyer.about = body.about;
    if (body.avatar_url !== undefined) lawyer.avatar_url = body.avatar_url;
    if (body.languages !== undefined) lawyer.languages = body.languages;
    if (body.is_verified !== undefined) lawyer.is_verified = Boolean(body.is_verified);
    if (body.linkedin_url !== undefined) lawyer.linkedin_url = body.linkedin_url;
    if (body.support_email !== undefined) lawyer.support_email = body.support_email;
    if (body.contact_email !== undefined) lawyer.contact_email = body.contact_email;
    if (body.is_publicly_visible !== undefined) lawyer.is_publicly_visible = Boolean(body.is_publicly_visible);

    // Keep lawyer.user in sync
    lawyer.user = {
      id: lawyer.user_id,
      full_name: lawyer.full_name,
      email: lawyer.email,
      phone: lawyer.phone,
      role: "lawyer",
    };

    // Also update corresponding user record if exists
    const userMatch = db.users.find(
      (u) => u.id === lawyer.user_id || u.email.toLowerCase() === lawyer.email.toLowerCase()
    );
    if (userMatch) {
      userMatch.full_name = lawyer.full_name;
      userMatch.phone = lawyer.phone;
    }

    return NextResponse.json(lawyer);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update lawyer profile" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  const idx = db.lawyers.findIndex((l) => l.id === numId);

  if (idx === -1) {
    return NextResponse.json({ detail: "Lawyer not found" }, { status: 404 });
  }

  const deleted = db.lawyers[idx];
  db.lawyers.splice(idx, 1);

  // Also remove user record if exists
  const uIdx = db.users.findIndex((u) => u.id === deleted.user_id || u.email.toLowerCase() === deleted.email.toLowerCase());
  if (uIdx !== -1) {
    db.users.splice(uIdx, 1);
  }

  return new NextResponse(null, { status: 204 });
}
