interface ExtractionResult {
  need: string;
  urgency: "High" | "Medium" | "Low";
  context: string;
  quote: string;
}

/**
 * Extract opportunity data from original statement.
 * Rule-based (no API calls needed).
 * Extracts exactly what is stated, doesn't invent.
 */
export async function extractOpportunityData(
  companyName: string,
  originalWording: string
): Promise<ExtractionResult> {
  // Detect need from keywords
  const need = detectNeed(originalWording);

  // Detect urgency level
  const urgency = detectUrgency(originalWording);

  // Extract first 1-2 sentences as quote (or most relevant statement)
  const quote = extractQuote(originalWording);

  // Build context from company name and statement
  const context = buildContext(companyName, originalWording);

  return {
    need,
    urgency,
    context,
    quote,
  };
}

function detectNeed(statement: string): string {
  const lowerStatement = statement.toLowerCase();

  if (
    lowerStatement.includes("delivery") ||
    lowerStatement.includes("courier") ||
    lowerStatement.includes("transport")
  ) {
    return "Same-day delivery and collection services";
  }

  if (
    lowerStatement.includes("document") ||
    lowerStatement.includes("file") ||
    lowerStatement.includes("collection")
  ) {
    return "Reliable document collection and delivery";
  }

  if (
    lowerStatement.includes("urgent") ||
    lowerStatement.includes("immediately") ||
    lowerStatement.includes("asap")
  ) {
    return "Urgent, time-critical transport solutions";
  }

  if (
    lowerStatement.includes("deadline") ||
    lowerStatement.includes("time-sensitive")
  ) {
    return "Deadline-critical delivery services";
  }

  // Default: generic same-day service
  return "Same-day courier and logistics support";
}

function detectUrgency(statement: string): "High" | "Medium" | "Low" {
  const lowerStatement = statement.toLowerCase();

  // High urgency indicators
  const highUrgencyKeywords = [
    "urgent",
    "immediately",
    "asap",
    "critical",
    "struggling",
    "problem",
    "issue",
    "missing",
    "failing",
    "costing us",
    "impacting",
    "deadline",
    "must",
  ];

  // Low urgency indicators
  const lowUrgencyKeywords = [
    "considering",
    "exploring",
    "looking for",
    "might",
    "could",
    "eventually",
  ];

  const hasHighKeywords = highUrgencyKeywords.some((keyword) =>
    lowerStatement.includes(keyword)
  );

  const hasLowKeywords = lowUrgencyKeywords.some((keyword) =>
    lowerStatement.includes(keyword)
  );

  if (hasHighKeywords) return "High";
  if (hasLowKeywords) return "Low";
  return "Medium";
}

function extractQuote(statement: string): string {
  // Extract first 1-2 sentences as quote
  const sentences = statement.match(/[^.!?]+[.!?]+/g);

  if (!sentences || sentences.length === 0) {
    // If no clear sentence breaks, just use first 100 chars + ellipsis
    return statement.slice(0, 100).trim() + (statement.length > 100 ? "..." : "");
  }

  // Use first sentence(s) up to ~150 chars
  let quote = sentences[0].trim();
  if (sentences.length > 1 && quote.length < 100) {
    quote += " " + sentences[1].trim();
  }

  if (quote.length > 150) {
    quote = quote.slice(0, 150).trim() + "...";
  }

  return quote;
}

function buildContext(companyName: string, statement: string): string {
  const lowerName = companyName.toLowerCase();
  const lowerStatement = statement.toLowerCase();

  // Detect industry from company name
  let industry = "Business";

  if (
    lowerName.includes("solicitor") ||
    lowerName.includes("lawyer") ||
    lowerName.includes("legal")
  ) {
    industry = "Legal practice";
  } else if (
    lowerName.includes("estate agent") ||
    lowerName.includes("realtor") ||
    lowerName.includes("lettings")
  ) {
    industry = "Real estate business";
  } else if (
    lowerName.includes("hospital") ||
    lowerName.includes("clinic") ||
    lowerName.includes("pharmacy") ||
    lowerName.includes("medical")
  ) {
    industry = "Healthcare provider";
  } else if (lowerName.includes("architect")) {
    industry = "Architecture firm";
  } else if (lowerName.includes("accountant")) {
    industry = "Accountancy practice";
  } else if (
    lowerName.includes("construction") ||
    lowerName.includes("builder")
  ) {
    industry = "Construction company";
  } else if (lowerStatement.includes("deadline")) {
    industry = "Time-sensitive operations";
  }

  return `${industry} dealing with time-critical needs`;
}
