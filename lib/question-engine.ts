import { BusinessEvidence, BusinessQuestion } from './evidence-types';

// Generate useful questions from evidence
export function generateQuestions(
  evidence: BusinessEvidence,
  niche?: string
): BusinessQuestion[] {
  const questions: BusinessQuestion[] = [];
  let questionId = 1;

  // Check for delivery-related complaints
  const deliveryMentions = evidence.reviews.filter(
    r => r.text.toLowerCase().includes('delivery') ||
         r.text.toLowerCase().includes('courier') ||
         r.text.toLowerCase().includes('shipping')
  );

  if (deliveryMentions.length > 0) {
    questions.push({
      id: `q_${questionId++}`,
      text: 'Do they currently use an external courier or delivery partner?',
      evidence_gap: 'Understanding their current delivery arrangement',
      relevance: 'If they have delivery pain points, knowing their current setup tells us where we fit',
      generated_at: new Date(),
    });
  }

  // Check for seasonal patterns
  const seasonalMentions = evidence.reviews.filter(
    r => /february|valentine|mother.?s day|christmas|holiday|seasonal|peak|busy|rush/i.test(r.text)
  );

  if (seasonalMentions.length > 0) {
    questions.push({
      id: `q_${questionId++}`,
      text: 'How do they currently handle peak seasonal periods?',
      evidence_gap: 'Understanding their capacity management during busy times',
      relevance: 'Seasonal peaks are where standing orders create the most value',
      generated_at: new Date(),
    });
  }

  // Check for urgency/emergency mentions
  const urgencyMentions = evidence.reviews.filter(
    r => /urgent|emergency|last minute|asap|quickly|same.?day|rush/i.test(r.text)
  );

  if (urgencyMentions.length > 0) {
    questions.push({
      id: `q_${questionId++}`,
      text: 'How often do emergency/urgent requests come in that need same-day handling?',
      evidence_gap: 'Frequency and nature of urgent delivery needs',
      relevance: 'Emergency service is a high-margin standing order opportunity',
      generated_at: new Date(),
    });
  }

  // Check for growth signals
  if (evidence.review_count > 10) {
    const recentReviews = evidence.reviews.slice(-5);
    const hasSentimentImprovement = recentReviews.some(r => r.rating && r.rating >= 4);

    if (hasSentimentImprovement) {
      questions.push({
        id: `q_${questionId++}`,
        text: 'Are they expanding or growing their operations?',
        evidence_gap: 'Growth trajectory and expansion plans',
        relevance: 'Growing businesses need reliable logistics partners',
        generated_at: new Date(),
      });
    }
  }

  // Niche-specific questions
  if (niche === 'florists') {
    if (evidence.reviews.some(r => r.text.toLowerCase().includes('wedding') ||
                                    r.text.toLowerCase().includes('event'))) {
      questions.push({
        id: `q_${questionId++}`,
        text: 'Do they handle large event orders or wedding deliveries?',
        evidence_gap: 'Scale and complexity of delivery requirements',
        relevance: 'Event florists have higher-value logistics needs',
        generated_at: new Date(),
      });
    }
  }

  if (niche === 'restaurants') {
    if (evidence.reviews.some(r => r.text.toLowerCase().includes('catering') ||
                                    r.text.toLowerCase().includes('delivery'))) {
      questions.push({
        id: `q_${questionId++}`,
        text: 'Do they do catering and delivery beyond in-house dining?',
        evidence_gap: 'Scope of delivery operations',
        relevance: 'Catering restaurants need reliable delivery partners',
        generated_at: new Date(),
      });
    }
  }

  // General business questions
  if (!evidence.facts.some(f => f.fact.includes('contract') || f.fact.includes('agreement'))) {
    questions.push({
      id: `q_${questionId++}`,
      text: 'What is the current contract/arrangement with their existing provider?',
      evidence_gap: 'Terms, duration, and flexibility of existing arrangements',
      relevance: 'Knowing contract end dates helps timing outreach',
      generated_at: new Date(),
    });
  }

  return questions;
}

// Find the most important questions (ones to ask first)
export function prioritizeQuestions(questions: BusinessQuestion[]): BusinessQuestion[] {
  // Higher priority to questions about:
  // 1. Current arrangements (what are they using now?)
  // 2. Peak periods (when do they need us most?)
  // 3. Growth (are they expanding?)

  const priorityKeywords = {
    high: ['currently', 'current', 'existing', 'peak', 'seasonal', 'expanding', 'growing'],
    medium: ['how often', 'frequency', 'scale', 'complexity'],
    low: ['could', 'might', 'potentially'],
  };

  const scored = questions.map(q => {
    let score = 0;
    const textLower = q.text.toLowerCase();

    for (const keyword of priorityKeywords.high) {
      if (textLower.includes(keyword)) score += 3;
    }
    for (const keyword of priorityKeywords.medium) {
      if (textLower.includes(keyword)) score += 2;
    }

    return { question: q, score };
  });

  return scored.sort((a, b) => b.score - a.score).map(s => s.question);
}
