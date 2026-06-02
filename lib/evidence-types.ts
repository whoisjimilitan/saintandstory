// Evidence types — reality that stays forever

export interface ReviewSnippet {
  id: string;
  text: string;
  source: string; // 'google', 'trustpilot', etc.
  timestamp: Date;
  rating?: number;
  author?: string;
}

export interface BusinessFact {
  id: string;
  fact: string;
  source: string; // 'website', 'discovery', 'google'
  timestamp: Date;
}

export interface BusinessEvidence {
  reviews: ReviewSnippet[];
  facts: BusinessFact[];
  extracted_at: Date;
  review_count: number;
  rating_average?: number;
}

export interface BusinessQuestion {
  id: string;
  text: string;
  evidence_gap: string; // What we're missing
  relevance: string; // Why this matters
  generated_at: Date;
}

export interface TimelineEvent {
  date: Date;
  event: string;
  type: string; // 'discovery', 'outreach', 'communication', 'conversion', 'note'
}

export type ConversionReason =
  | 'existing_courier_unreliable'
  | 'seasonal_demand'
  | 'emergency_cover'
  | 'better_pricing'
  | 'personal_relationship'
  | 'fast_response'
  | 'other';

export interface HumanObservation {
  id: string;
  observation: string;
  context: string; // 'phone_call', 'email', 'meeting', 'website'
  confidence: 100; // Human observations are high confidence
  recorded_at: Date;
}

export interface ConversionData {
  lead_id: string;
  reason: ConversionReason;
  standing_order_value: number;
  converted_at: Date;
}
