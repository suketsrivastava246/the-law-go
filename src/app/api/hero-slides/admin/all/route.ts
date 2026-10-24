import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function GET() {
  const allSlides = [...db.slides].sort((a, b) => a.sort_order - b.sort_order);
  return NextResponse.json(allSlides);
}
