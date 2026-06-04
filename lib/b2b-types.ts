import { type LeadState } from "./lead-state-machine";

export type LeadStatus = "new" | "contacted" | "warm" | "inbound" | "closed" | "dead" | "recognized";

export interface Lead {
  id: string | number;
  business_name: string;
  business_category: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  delivery_type?: string;
  delivery_frequency?: string;
  average_deliveries?: string;
  courier_provider?: string;
  delivery_challenge?: string;
  pain_point?: string;
  pain_point_review?: string;
  website?: string;
  notes?: string;
  source?: "inbound" | "manual" | "discovery";
  status: LeadStatus;
  lead_state?: LeadState;
  created_at: string;
  updated_at?: string;
  self_confirmed?: boolean;
  confirmation_source?: string;
  confirmed_at?: string;
  trigger_event_matched?: string;
}

export interface StandingOrder {
  id: string | number;
  lead_id: string | number;
  business_name: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  service_type?: string;
  frequency: string;
  day_of_week?: number;
  preferred_time?: string;
  price?: number;
  notes?: string;
  pickup_postcode?: string;
  next_scheduled_at?: string;
}
