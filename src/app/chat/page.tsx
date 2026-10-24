import { redirect } from "next/navigation";

export default function ChatRedirect() {
  redirect("/dashboard/secure-chat");
}
