import { NextResponse } from "next/server";
import { db, LegalResource } from "@/lib/dataStore";

export async function GET() {
  return NextResponse.json(db.resources);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRes: LegalResource = {
      id: db.resources.length ? Math.max(...db.resources.map((r) => r.id)) + 1 : 1,
      title: body.title || "Untitled Document",
      category: body.category || "General",
      summary: body.summary || "",
      content: body.content || "",
      author: body.author || "Legal Desk",
      read_time: body.read_time || "5 min read",
      jurisdiction: body.jurisdiction || "National",
      created_at: new Date().toISOString(),
    };

    db.resources.push(newRes);
    return NextResponse.json(newRes, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create resource" }, { status: 500 });
  }
}
