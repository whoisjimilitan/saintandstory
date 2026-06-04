import { type LeadState } from "./lead-state-machine";

export type LeadStatus = "new" | "contacted" | "warm" | "inbound" | "closed" | "dead" | "recognized";

/**
 * Root Lead Type Contract
 *
 * Core required fields that are always present in the system:
 * - id, business_name, business_category: basic identity
 * - email, created_at: core data for operations
 * - status, lead_state: state machine tracking
 * - transitioned_at: audit trail for state changes
 *
 * All other fields optional based on data availability
 */
export interface Lead {
  // Core required fields (always present)
  id: string | number;
  business_name: string;
  business_category: string;
  email: string;
  created_at: string;
  status: LeadStatus;
  lead_state: LeadState;
  transitioned_at: string | null;

  // Extended optional fields
  contact_name?: string;
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
