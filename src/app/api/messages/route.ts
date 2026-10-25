import { NextResponse } from "next/server";
import { db, ChatMessage } from "@/lib/dataStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationKey = searchParams.get("conversation_key");
  const lawyerId = searchParams.get("lawyer_id");
  const clientId = searchParams.get("client_id");

  let list = [...db.messages];

  if (conversationKey) {
    list = list.filter((m) => m.conversation_key === conversationKey);
  } else if (lawyerId && clientId) {
    const key = `lawyer-${lawyerId}_client-${clientId}`;
    list = list.filter((m) => m.conversation_key === key);
  }

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      conversation_key = "lawyer-1_client-2",
      appointment_id = 1,
      sender_role = "lawyer",
      sender_name = "Legal Counsel",
      text,
      attachment,
    } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ detail: "Message text is required" }, { status: 400 });
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      conversation_key,
      appointment_id: Number(appointment_id),
      sender_role: sender_role === "client" ? "client" : "lawyer",
      sender_name,
      text: text.trim(),
      created_at: new Date().toISOString(),
      time: timeStr,
      status: "delivered",
      attachment,
    };

    db.messages.push(newMsg);

    return NextResponse.json(newMsg, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to deliver message" },
      { status: 500 }
    );
  }
}
