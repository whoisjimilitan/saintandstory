import { auth } from "@clerk/nextjs/server";
import { getAllConversations } from "@/lib/whatsapp-conversation";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

export async function GET() {
  const { userId, sessionClaims } = await auth();

  if (!userId || !sessionClaims?.email || !ADMIN_EMAILS.includes(sessionClaims.email as string)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const conversations = getAllConversations();

    const activeConversations = conversations.filter((c) => c.status === "active").length;
    const readyToMessage = conversations.filter((c) => c.messages.length === 0 && c.status === "active").length;
    const replied = conversations.filter((c) => c.messages.length > 0).length;
    const standsToday = conversations.filter(
      (c) => c.standingOrderId && new Date(c.createdAt).toDateString() === new Date().toDateString()
    ).length;

    return Response.json({
      activeConversations,
      readyToMessage,
      replied,
      standsToday,
      totalConversations: conversations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[WHATSAPP STATS] Error:", error);
    return Response.json({ error: "Failed to fetch WhatsApp stats" }, { status: 500 });
  }
}
