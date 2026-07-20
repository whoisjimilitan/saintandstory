import { BusinessEvidence, BusinessQuestion } from './evidence-types';

export interface ProposalContent {
  observation: string;
  how_we_help: string;
  what_it_looks_like: string;
  next_step: string;
  email_subject: string;
  email_body: string;
}

// Generate proposal content from evidence, questions, and observations
export function generateProposal(
  businessName: string,
  evidence: BusinessEvidence,
  questions: BusinessQuestion[],
  niche?: string
): ProposalContent {
  console.log(`[Proposal Engine] Generating proposal for ${businessName}`);

  // Extract key insights from evidence
  const painPoints = extractPainPoints(evidence);
  const seasonalPatterns = extractSeasonalPatterns(evidence);

  // Build observation (what we noticed)
  const observation = buildObservation(businessName, painPoints, seasonalPatterns, evidence);

  // Build how we help
  const howWeHelp = buildHowWeHelp(painPoints, niche);

  // Build what it looks like
  const whatItLooksLike = buildWhatItLooksLike(seasonalPatterns, painPoints);

  // Build next step
  const nextStep = buildNextStep(questions);

  // Build email
  const emailSubject = buildEmailSubject(businessName);
  const emailBody = buildEmailBody(observation, howWeHelp);

  return {
    observation,
    how_we_help: howWeHelp,
    what_it_looks_like: whatItLooksLike,
    next_step: nextStep,
    email_subject: emailSubject,
    email_body: emailBody,
  };
}

function extractPainPoints(evidence: BusinessEvidence): string[] {
  const painWords = ['late', 'delay', 'issue', 'problem', 'fail', 'urgent', 'emergency', 'shortage', 'missing'];
  const pains: string[] = [];

  evidence.reviews.forEach(review => {
    const textLower = review.text.toLowerCase();
    painWords.forEach(word => {
      if (textLower.includes(word) && !pains.includes(word)) {
        pains.push(word);
      }
    });
  });

  return pains.slice(0, 3); // Top 3 pain points
}


function extractSeasonalPatterns(evidence: BusinessEvidence): string[] {
  const seasonalTerms = ['valentine', 'mother', 'christmas', 'easter', 'peak', 'busy', 'holiday'];
  const patterns: string[] = [];

  evidence.reviews.forEach(review => {
    const textLower = review.text.toLowerCase();
    seasonalTerms.forEach(term => {
      if (textLower.includes(term) && !patterns.includes(term)) {
        patterns.push(term);
      }
    });
  });

  return patterns;
}

function buildObservation(
  businessName: string,
  painPoints: string[],
  seasonalPatterns: string[],
  evidence: BusinessEvidence
): string {
  if (painPoints.length === 0 && seasonalPatterns.length === 0) {
    return `Looking through reviews for ${businessName}, customers seem very happy overall.`;
  }

  const parts: string[] = [];

  if (painPoints.length > 0) {
    parts.push(`Looking through your reviews, a few customers mentioned ${painPoints.join(', ')}.`);
  }

  if (seasonalPatterns.length > 0) {
    parts.push(`It looks like ${seasonalPatterns[0].charAt(0).toUpperCase() + seasonalPatterns[0].slice(1)} must be particularly busy periods for you.`);
  }

  if (evidence.review_count > 20) {
    parts.push(`You've got strong reviews overall — mostly positive feedback about your product quality.`);
  }

  return parts.join(' ');
}

function buildHowWeHelp(
  painPoints: string[],
  niche?: string
): string {
  const parts: string[] = [];

  if (painPoints.includes('delay') || painPoints.includes('late')) {
    parts.push(`We could handle the urgent requests that come in when you're fully booked.`);
  }

  if (painPoints.includes('urgent') || painPoints.includes('emergency')) {
    parts.push(`Our drivers can respond to same-day emergency runs in 15 minutes.`);
  }

  if (niche === 'florists') {
    parts.push(`One of our drivers does regular runs for another florist in your area — they set up a standing order for busy periods.`);
  }

  if (niche === 'restaurants') {
    parts.push(`We handle emergency ingredient runs and catering delivery for restaurants. No surprises on pricing.`);
  }

  if (parts.length === 0) {
    parts.push(`We work with businesses like yours to handle their delivery logistics.`);
  }

  return parts.join(' ');
}

function buildWhatItLooksLike(
  seasonalPatterns: string[],
  painPoints: string[]
): string {
  const parts: string[] = [];

  if (seasonalPatterns.length > 0) {
    parts.push(`Maybe a standing order for your busiest days. Or just emergency runs when you need them.`);
  } else if (painPoints.length > 0) {
    parts.push(`Could be a regular weekly standing order, or just on-call for when you're slammed.`);
  } else {
    parts.push(`Depends what works best for you. Some businesses want a weekly standing order. Others just call when they need us.`);
  }

  parts.push(`Fixed pricing. No hidden charges. Flexible cancellation anytime.`);

  return parts.join(' ');
}

function buildNextStep(questions: BusinessQuestion[]): string {
  if (questions.length === 0) {
    return `If that sounds useful, happy to chat about what pricing might look like.`;
  }

  return `Next step: ${questions[0].text}`;
}

function buildEmailSubject(businessName: string): string {
  const subjects = [
    `Quick thought about ${businessName}`,
    `${businessName} — delivery logistics`,
    `One idea for ${businessName}`,
    `${businessName} + moving capacity`,
  ];

  return subjects[Math.floor(Math.random() * subjects.length)];
}

function buildEmailBody(observation: string, howWeHelp: string): string {
  return `Hi,

${observation}

${howWeHelp}

Rather than trying to explain it all in an email, I put together a few thoughts:

[Proposal link would go here]

No worries if it's not relevant, but I thought I'd send it across.

James
0203 432 3991`;
}
