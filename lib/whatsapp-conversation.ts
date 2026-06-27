/**
 * WhatsApp Conversation Manager
 *
 * Manages conversation state:
 * - Store messages
 * - Add/retrieve messages
 * - Track delivery status
 * - Link to business/standing order context
 */

export interface WhatsAppMessage {
  id: string;
  text: string;
  sender: "user" | "business";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  messageId?: string; // WhatsApp API message ID
}

export interface WhatsAppConversation {
  id: string;
  phoneNumber: string;
  businessName: string;
  businessId?: string; // Link to b2b_leads.id
  messages: WhatsAppMessage[];
  createdAt: Date;
  lastMessageAt: Date;
  status: "active" | "archived" | "completed";
  standingOrderId?: string; // Link to b2b_standing_orders.id
  unreadCount: number;
}

/**
 * In-memory store for conversations (replace with database later)
 */
const conversationStore = new Map<string, WhatsAppConversation>();

/**
 * Create new conversation
 */
export function createConversation(
  phoneNumber: string,
  businessName: string
): WhatsAppConversation {
  const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const conversation: WhatsAppConversation = {
    id,
    phoneNumber,
    businessName,
    messages: [],
    createdAt: new Date(),
    lastMessageAt: new Date(),
    status: "active",
    unreadCount: 0,
  };

  conversationStore.set(id, conversation);
  return conversation;
}

/**
 * Get conversation by ID
 */
export function getConversation(id: string): WhatsAppConversation | null {
  return conversationStore.get(id) || null;
}

/**
 * Get all conversations
 */
export function getAllConversations(): WhatsAppConversation[] {
  return Array.from(conversationStore.values()).sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  );
}

/**
 * Add message to conversation
 */
export function addMessage(
  conversationId: string,
  text: string,
  sender: "user" | "business",
  status: "sent" | "delivered" | "read" = "sent"
): WhatsAppMessage | null {
  const conversation = conversationStore.get(conversationId);
  if (!conversation) return null;

  const message: WhatsAppMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    sender,
    timestamp: new Date(),
    status,
  };

  conversation.messages.push(message);
  conversation.lastMessageAt = new Date();

  if (sender === "business") {
    conversation.unreadCount += 1;
  }

  return message;
}

/**
 * Mark message as delivered
 */
export function markMessageDelivered(
  conversationId: string,
  messageId: string,
  whatsappMessageId?: string
): boolean {
  const conversation = conversationStore.get(conversationId);
  if (!conversation) return false;

  const message = conversation.messages.find((m) => m.id === messageId);
  if (!message) return false;

  message.status = "delivered";
  if (whatsappMessageId) {
    message.messageId = whatsappMessageId;
  }

  return true;
}

/**
 * Mark message as read
 */
export function markMessageRead(
  conversationId: string,
  messageId: string
): boolean {
  const conversation = conversationStore.get(conversationId);
  if (!conversation) return false;

  const message = conversation.messages.find((m) => m.id === messageId);
  if (!message) return false;

  message.status = "read";
  return true;
}

/**
 * Mark all messages as read
 */
export function markConversationRead(conversationId: string): boolean {
  const conversation = conversationStore.get(conversationId);
  if (!conversation) return false;

  conversation.messages.forEach((m) => {
    if (m.sender === "business") {
      m.status = "read";
    }
  });

  conversation.unreadCount = 0;
  return true;
}

/**
 * Get conversation stats
 */
export function getConversationStats() {
  const conversations = Array.from(conversationStore.values());
  const activeCount = conversations.filter(
    (c) => c.status === "active"
  ).length;
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
  const unreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    totalConversations: conversations.length,
    activeConversations: activeCount,
    totalMessages,
    unreadMessages: unreadCount,
  };
}

/**
 * Link conversation to business (b2b_leads)
 */
export function linkConversationToBusiness(
  conversationId: string,
  businessId: string
): boolean {
  const conversation = conversationStore.get(conversationId);
  if (!conversation) return false;

  conversation.businessId = businessId;
  return true;
}

/**
 * Link conversation to standing order
 */
export function linkConversationToStandingOrder(
  conversationId: string,
  standingOrderId: string
): boolean {
  const conversation = conversationStore.get(conversationId);
  if (!conversation) return false;

  conversation.standingOrderId = standingOrderId;
  conversation.status = "completed";
  return true;
}

/**
 * Archive conversation
 */
export function archiveConversation(conversationId: string): boolean {
  const conversation = conversationStore.get(conversationId);
  if (!conversation) return false;

  conversation.status = "archived";
  return true;
}

/**
 * Export all conversations (for testing)
 */
export function exportConversations(): Record<string, WhatsAppConversation> {
  return Object.fromEntries(conversationStore);
}

/**
 * Clear all conversations (for testing)
 */
export function clearAllConversations(): void {
  conversationStore.clear();
}
