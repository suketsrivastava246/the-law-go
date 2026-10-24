import { NextResponse } from "next/server";
import { db, HeroSlide } from "@/lib/dataStore";

export async function GET() {
  const activeSlides = db.slides
    .filter((s) => s.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return NextResponse.json(activeSlides);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newSlide: HeroSlide = {
      id: db.slides.length ? Math.max(...db.slides.map((s) => s.id)) + 1 : 1,
      title: body.title || "New Slide",
      subtitle: body.subtitle || "",
      image_url:
        body.image_url ||
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop",
      button_text: body.button_text || "Learn More",
      button_url: body.button_url || "/lawyers",
      sort_order: Number(body.sort_order) || db.slides.length + 1,
      is_active: body.is_active !== undefined ? body.is_active : true,
    };

    db.slides.push(newSlide);
    return NextResponse.json(newSlide, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create slide" }, { status: 500 });
  }
}
