import { type LeadState } from "./lead-state-machine";
import { type BusinessEvidence } from "./evidence-types";

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
  review_rating?: number;
  website?: string;
  google_place_id?: string;
  niche?: string;
  landing_page_url?: string;
  notes?: string;
  source?: "inbound" | "manual" | "discovery";
  updated_at?: string;
  self_confirmed?: boolean;
  confirmation_source?: string;
  confirmed_at?: string;
  trigger_event_matched?: string;
  email_sent_at?: string;
  driver_id?: string;
  latitude?: number;
  longitude?: number;
  human_observations?: Record<string, unknown>[];
  business_evidence?: BusinessEvidence;
  engagement_score?: number;
  last_engagement_at?: string | null;
  opportunity_score?: number;
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

export interface Driver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
  radius_miles: number;
  vehicle_type?: string;
  available_days?: string[];
  created_at: string;
  updated_at?: string;
}
