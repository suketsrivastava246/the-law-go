import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function GET() {
  return NextResponse.json(db.siteSettings);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (body.support_email !== undefined) db.siteSettings.support_email = body.support_email;
    if (body.contact_email !== undefined) db.siteSettings.contact_email = body.contact_email;
    if (body.phone !== undefined) db.siteSettings.phone = body.phone;
    if (body.emergency_hotline !== undefined) db.siteSettings.emergency_hotline = body.emergency_hotline;
    if (body.linkedin_url !== undefined) db.siteSettings.linkedin_url = body.linkedin_url;
    if (body.office_address !== undefined) db.siteSettings.office_address = body.office_address;

    return NextResponse.json({
      message: "Site settings updated successfully",
      settings: db.siteSettings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to update site settings" },
      { status: 500 }
    );
  }
}
