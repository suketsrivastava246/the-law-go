import { NextResponse } from "next/server";
import { db } from "@/lib/dataStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get("specialization");
  const location = searchParams.get("location");

  let list = db.lawyers.filter((l) => l.is_verified);

  if (specialization && specialization !== "All") {
    list = list.filter((l) => l.specialization.toLowerCase().includes(specialization.toLowerCase()));
  }
  if (location && location !== "All") {
    list = list.filter((l) => l.location.toLowerCase().includes(location.toLowerCase()));
  }

  return NextResponse.json(list);
}
