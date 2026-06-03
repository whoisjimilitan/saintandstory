// Types for Prospect Intelligence Pages

export interface ProspectPageBusiness {
  name: string;
  category: string;
  city: string;
  website?: string;
}

export interface Movement {
  type: string;
  briefDescription: string;
  howWeSolveIt: string;
}

export interface ProspectPageData {
  business: ProspectPageBusiness;
  movements: Movement[];
}

export interface FeedbackPayload {
  slug: string;
  feedbackType: "yes" | "partly" | "no";
  referrer?: "email" | "dashboard" | "direct";
  userAgent?: string;
}
