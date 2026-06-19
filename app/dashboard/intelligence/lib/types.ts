export interface Conversation {
  id: string;
  prospectName: string;
  prospectEmail: string;
  status: "warm" | "contacted" | "new";
  lastActivity?: string;
  messageCount?: number;
}

export interface Signal {
  id: string;
  type: string;
  description: string;
  confidence: number;
  active: boolean;
}

export interface MemoryPattern {
  id: string;
  pattern: string;
  frequency: number;
  lastSeen?: string;
}

export interface RevenueData {
  id: string;
  pattern: string;
  revenue: number;
  roi: number;
}

export interface SystemHealth {
  status: "online" | "offline";
  lastCheck?: string;
  activeAlerts?: number;
}

export type IntelligenceResource = "conversation" | "signal" | "memory" | "revenue" | "observability";
