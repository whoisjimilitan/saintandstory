import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildDevotionalContext } from "@/lib/brand-config";

// Called by Vercel Cron at 07:00 UTC daily.
// Also callable manually via GET /api/daily-word (requires CRON_SECRET header).

const DEVOTIONAL_TOPICS = [
  "carrying something you can't explain to anyone",
  "the weight of an unanswered prayer",
  "waking up and not feeling like yourself",
  "the silence between you and God",
  "grief that comes in waves you didn't expect",
  "the fear that this is just how life will be now",
  "feeling invisible to the people who matter",
  "the distance between who you are and who you thought you'd be",
  "shame that doesn't leave when you ask it to",
  "exhaustion that sleep can't touch",
  "doubt that crept in quietly",
  "the loneliness of being misunderstood",
  "what remains when everything you were sure of is gone",
  "losing someone and not knowing how to talk to God about it",
  "the moment faith feels like a language you've forgotten",
  "the slow return of hope after a long winter",
  "the courage it takes to start over",
  "carrying guilt about something you cannot undo",
  "not knowing how to pray when words won't come",
  "being in-between — not where you were, not yet where you're going",
];

function pickTopic(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DEVOTIONAL_TOPICS[dayOfYear % DEVOTIONAL_TOPICS.length];
}

export async function GET(req: Request) {
  // Verify this is from Vercel Cron or an authorised caller
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topic = pickTopic();
  const systemContext = buildDevotionalContext();

  const openai = new OpenAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  const completion = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content: systemContext,
      },
      {
        role: "user",
        content: `Write a Brother Jimi devotional for today.

TOPIC: "${topic}"

REQUIREMENTS (non-negotiable):
- Anchor in ONE specific Bible verse. One verse. One moment in Scripture. Name it.
- Build around ONE vehicle for truth — a real-life moment, a story, an analogy, a metaphor, a relatable question, or a combination. ONE vehicle.
- Focus on ONE turning point inside that vehicle.
- Do NOT preach. Do NOT explain the moral. Do NOT tell them what to do.
- Let the reader arrive at the truth through what you write, not through what you say.
- Write in flowing paragraphs. Short. Breathing room. Unhurried. No bullet points.
- Optional: close with a benediction — Brother Jimi's specific wish for this reader, crafted from this exact topic. Not a prayer instruction. A gift. ("May you find that...")
- Optional: close with 1–2 further reading verses as a quiet invitation ("If this reached you, there is more here: [verse]")

THE TEST: if someone could summarize it as "the point is X" — it failed. The reader should feel the truth before they can name it.

Format:
VERSE: [book chapter:verse — the full verse text in quotes]
TITLE: [short, quiet — names what they are carrying, not the lesson]
---
[the devotional body — flowing paragraphs, no headers]
---
BENEDICTION: [if you write one]
FURTHER READING: [if you write one]`,
      },
    ],
  });

  const raw = completion.choices[0].message.content ?? "";

  // Parse the structured output
  const verseMatch  = raw.match(/^VERSE:\s*(.+)/m);
  const titleMatch  = raw.match(/^TITLE:\s*(.+)/m);
  const bodyMatch   = raw.match(/---\n([\s\S]+?)---/);
  const beneMatch   = raw.match(/^BENEDICTION:\s*(.+)/m);
  const furtherMatch = raw.match(/^FURTHER READING:\s*(.+)/m);

  const verse         = verseMatch?.[1]?.trim() ?? "";
  const title         = titleMatch?.[1]?.trim() ?? `A word for ${topic}`;
  const body          = bodyMatch?.[1]?.trim() ?? raw;
  const benediction   = beneMatch?.[1]?.trim() ?? null;
  const furtherReading = furtherMatch?.[1]?.trim() ?? null;

  const today = new Date().toISOString().split("T")[0];

  return NextResponse.json({
    date: today,
    topic,
    title,
    verse,
    body,
    benediction,
    furtherReading,
    raw,
  });
}
