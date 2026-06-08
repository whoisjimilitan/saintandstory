import { INDUSTRY_INTELLIGENCE } from "./industry-intelligence";

interface RecognitionEmailParams {
  business_name: string;
  industry: string;
  email: string;
  lead_id: number;
}

function formatTriggerEvent(event: string): string {
  const lower = event.toLowerCase();

  if (lower.includes("deadline") && lower.includes("today")) {
    return `A deadline that arrives today.`;
  }
  if (lower.includes("deadline") && lower.includes("tomorrow")) {
    return `A deadline that arrives tomorrow morning.`;
  }
  if (lower.includes("deadline")) {
    return `A deadline that is approaching.`;
  }

  if (lower.includes("missing") && lower.includes("hours")) {
    return `Materials missing just hours before the work must begin.`;
  }
  if (lower.includes("missing") && lower.includes("before")) {
    const match = event.match(/(\w+(?:\s+\w+)?)\s+missing\s+before\s+(\w+)/i);
    if (match) {
      return `${match[1]} that must arrive before ${match[2].toLowerCase()}.`;
    }
    return `Something critical that is missing and needed urgently.`;
  }

  if (lower.includes("waiting") && lower.includes("missing")) {
    const match = event.match(/(\w+)\s+waiting.*?(\w+)\s+missing/i);
    if (match) {
      return `${match[1]} waiting because ${match[2].toLowerCase()} hasn't arrived.`;
    }
    return `Someone waiting because what they need is missing.`;
  }

  if (lower.includes("documents") && lower.includes("urgent")) {
    return `Documents that must arrive urgently to keep work moving.`;
  }

  if (lower.includes("permits") && lower.includes("missing")) {
    return `Permits that are missing when the contractor arrives.`;
  }

  if (lower.includes("stock") && (lower.includes("critical") || lower.includes("urgent"))) {
    return `Stock levels that have become critical.`;
  }

  if (lower.includes("urgent") || lower.includes("emergency")) {
    if (lower.includes("repair")) {
      return `An equipment failure that requires urgent repair.`;
    }
    if (lower.includes("transport")) {
      return `Time-sensitive materials that require immediate transport.`;
    }
    if (lower.includes("supply")) {
      return `A supply that has become urgently needed.`;
    }
    return `A situation that requires immediate attention.`;
  }

  if (lower.includes("failed") || lower.includes("failure")) {
    return `A delivery or service that has failed when it mattered most.`;
  }

  if (lower.includes("minutes") || lower.includes("hours")) {
    return `A timeline measured in hours, not days.`;
  }

  return event.charAt(0).toUpperCase() + event.slice(1) + ".";
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateRecognitionEmail(params: RecognitionEmailParams) {
  const intelligence = INDUSTRY_INTELLIGENCE[params.industry.toLowerCase().replace(/-/g, ' ')];

  if (!intelligence || !intelligence.triggerEvents.length) {
    return null;
  }

  // Select FIRST trigger event only
  const triggerEvent = intelligence.triggerEvents[0];

  const recognitionStatement = formatTriggerEvent(triggerEvent);

  const replyYesLink = `${process.env.NEXT_PUBLIC_URL || 'https://saintandstory.co.uk'}/prospect/${slugify(params.business_name)}?reply=confirmed&lead_id=${params.lead_id}&trigger=${encodeURIComponent(triggerEvent)}`;

  return {
    to: params.email,
    subject: `${params.business_name} — pattern we're tracking`,
    body: `Hello,

We've been tracking operational patterns in your industry.

We're seeing something specific that affects businesses like ${params.business_name}:

${recognitionStatement}

This is becoming a defining challenge for operations your size. We've documented how this is playing out.

You might find this useful:
[See what we're tracking] → ${replyYesLink}

No pitch. Just observation.

James
Saint & Story`,
    triggerEvent,
    lead_id: params.lead_id,
  };
}
