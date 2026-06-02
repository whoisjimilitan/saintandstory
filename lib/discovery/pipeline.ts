/**
 * Discovery Pipeline Orchestrator.
 *
 * Flows:
 * 1. Discover businesses (via IDiscoverySource)
 * 2. Store businesses and reviews
 * 3. Extract patterns from reviews
 * 4. Generate hypotheses from patterns
 * 5. Generate questions from evidence
 * 6. Populate inbox
 *
 * No scoring. No ranking. Auditability at every step.
 */

import { prisma } from "../prisma";
import { extractPatterns } from "../interpretation/patterns";
import { generateHypotheses } from "./hypothesis-generator";
import { generateQuestions } from "../question-engine";
import { getQuestionsForPattern } from "./question-templates";
import { GooglePlacesSource } from "./google-places-source";
import { IDiscoverySource, RawBusinessPayload } from "./source";

export interface PipelineInput {
  niche: string
  location: string
  source?: IDiscoverySource
}

export interface PipelineResult {
  discovered: number
  stored: number
  skipped: number
  evidenceCollected: number
  hypothesesCreated: number
  questionsCreated: number
  inboxReady: number
}

export async function runDiscoveryPipeline(
  input: PipelineInput
): Promise<PipelineResult> {
  const source = input.source || new GooglePlacesSource();
  let discovered = 0;
  let stored = 0;
  let skipped = 0;
  let evidenceCollected = 0;
  let hypothesesCreated = 0;
  let questionsCreated = 0;

  console.log("\n[pipeline] PHASE 1: DISCOVERY");
  const payloads = await source.discover(input.niche, input.location);
  discovered = payloads.length;

  // Phase 2: Upsert businesses
  console.log("\n[pipeline] PHASE 2: BUSINESS INTAKE");
  const businessIds: string[] = [];

  for (const payload of payloads) {
    const existing = await prisma.business.findUnique({
      where: { placeId: payload.sourceEntityId },
    });

    if (existing) {
      skipped++;
      businessIds.push(existing.id);
      console.log(
        `[pipeline] Skipped ${payload.name} (already exists)`
      );
      continue;
    }

    const business = await prisma.business.create({
      data: {
        name: payload.name,
        placeId: payload.sourceEntityId,
        address: payload.address,
        phone: payload.phone,
        website: payload.website,
        niche: input.niche,
        location: input.location,
        sourceType: payload.sourceType,
        sourcePayload: payload.rawPayload,
        pipelineState: "DISCOVERED",
        discoveredAt: new Date(),
      },
    });

    stored++;
    businessIds.push(business.id);
    console.log(`[pipeline] Stored ${payload.name}`);
  }

  // Phase 3: Collect evidence (reviews)
  console.log("\n[pipeline] PHASE 3: EVIDENCE COLLECTION");

  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];
    const businessId = businessIds[i];

    // Delete old reviews
    await prisma.review.deleteMany({ where: { businessId } });

    // Create new reviews
    if (payload.reviews.length > 0) {
      await prisma.review.createMany({
        data: payload.reviews.map((r) => ({
          businessId,
          text: r.text,
          rating: r.rating,
          author: r.author,
          createdAt: new Date(r.time * 1000),
        })),
      });

      evidenceCollected++;
      console.log(
        `[pipeline] Collected ${payload.reviews.length} reviews for ${payload.name}`
      );
    }

    // Update pipeline state
    await prisma.business.update({
      where: { id: businessId },
      data: { pipelineState: "EVIDENCE_COLLECTED" },
    });
  }

  // Phase 4: Extract patterns and create evidence patterns
  console.log("\n[pipeline] PHASE 4: PATTERN EXTRACTION");

  for (const businessId of businessIds) {
    const reviews = await prisma.review.findMany({
      where: { businessId },
    });

    if (reviews.length === 0) continue;

    const patterns = extractPatterns(reviews);

    if (patterns.length === 0) continue;

    // Delete old evidence patterns
    await prisma.evidencePattern.deleteMany({ where: { businessId } });

    // Create new evidence patterns
    await prisma.evidencePattern.createMany({
      data: patterns.map((p) => ({
        businessId,
        patternType: p.description,
        occurrences: p.occurrences,
        examples: JSON.stringify(p.examples),
      })),
    });

    console.log(
      `[pipeline] Extracted ${patterns.length} patterns for business ${businessId}`
    );
  }

  // Phase 5: Generate hypotheses
  console.log("\n[pipeline] PHASE 5: HYPOTHESIS GENERATION");

  for (const businessId of businessIds) {
    const evidencePatterns = await prisma.evidencePattern.findMany({
      where: { businessId },
    });

    if (evidencePatterns.length === 0) continue;

    // Delete old hypotheses
    await prisma.hypothesis.deleteMany({
      where: { businessId, status: "pending" },
    });

    // Generate hypotheses from patterns
    const hypotheses = generateHypotheses(
      evidencePatterns.map((ep) => ({
        description: ep.patternType,
        occurrences: ep.occurrences,
        examples: JSON.parse(ep.examples as string) as string[],
      }))
    );

    // Create hypothesis records
    for (const hypothesis of hypotheses) {
      const pattern = evidencePatterns.find(
        (p) => p.patternType === hypothesis.patternType
      );
      if (!pattern) continue;

      await prisma.hypothesis.create({
        data: {
          businessId,
          evidencePatternId: pattern.id,
          statement: hypothesis.statement,
          evidenceCount: hypothesis.evidenceCount,
          status: "pending",
        },
      });

      hypothesesCreated++;
    }

    console.log(
      `[pipeline] Created ${hypotheses.length} hypotheses for business ${businessId}`
    );

    // Update pipeline state
    await prisma.business.update({
      where: { id: businessId },
      data: { pipelineState: "INVESTIGATED" },
    });
  }

  // Phase 6: Generate questions
  console.log("\n[pipeline] PHASE 6: QUESTION GENERATION");

  for (const businessId of businessIds) {
    const reviews = await prisma.review.findMany({
      where: { businessId },
    });

    if (reviews.length === 0) continue;

    // Delete old pending conversations
    await prisma.conversation.deleteMany({
      where: { businessId, status: "pending" },
    });

    // Get evidence patterns for this business
    const evidencePatterns = await prisma.evidencePattern.findMany({
      where: { businessId },
    });

    const questionsToCreate: string[] = [];

    // Get questions from templates for each pattern
    for (const pattern of evidencePatterns) {
      const templateQuestions = getQuestionsForPattern(pattern.patternType);
      questionsToCreate.push(...templateQuestions);
    }

    // If no template questions, don't create any (no LLM fallback)
    if (questionsToCreate.length === 0) {
      console.log(`[pipeline] No questions generated for business ${businessId}`);
      continue;
    }

    // Create conversation records for each question
    await prisma.conversation.createMany({
      data: questionsToCreate.map((q) => ({
        businessId,
        question: q,
        status: "pending",
      })),
    });

    questionsCreated += questionsToCreate.length;
    console.log(
      `[pipeline] Created ${questionsToCreate.length} questions for business ${businessId}`
    );

    // Update pipeline state to INBOX_READY
    await prisma.business.update({
      where: { id: businessId },
      data: { pipelineState: "INBOX_READY" },
    });
  }

  // Count inbox-ready businesses
  const inboxReady = await prisma.business.count({
    where: { pipelineState: "INBOX_READY" },
  });

  return {
    discovered,
    stored,
    skipped,
    evidenceCollected,
    hypothesesCreated,
    questionsCreated,
    inboxReady,
  };
}
