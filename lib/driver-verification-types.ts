export type VerificationStatus = "pending" | "approved" | "rejected";

export interface DriverVerification {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string;
  verification_status: VerificationStatus;
  verification_submitted_at: string | null;
  verification_approved_at: string | null;
  verification_photo_url: string | null;
  verification_notes: string | null;
  profile_live: boolean;
  created_at: string;
}

export interface JobWithPhotos {
  id: string;
  driver_id: string;
  customer_name: string;
  postcode_from: string;
  postcode_to: string | null;
  status: string;
  pickup_photo_url: string | null;
  pickup_photo_taken_at: string | null;
  delivery_photo_url: string | null;
  delivery_photo_taken_at: string | null;
  job_completion_verified: boolean;
}

export interface PhotoUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  timestamp: string;
}
