import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractPatterns } from "@/lib/interpretation/patterns";

/**
 * INVESTIGATION: Review evidence and generated hypotheses
 *
 * Shows:
 * - Observed Evidence (review excerpts + raw observations)
 * - Generated Hypotheses (statement + supporting evidence + contradictions)
 * - Generated Questions (associated with hypotheses)
 * - Unknowns (explicit unknowns)
 *
 * Separates: OBSERVED, HYPOTHESIZED, UNKNOWN
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = id;

    const [business, reviews, hypotheses] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
      }),
      prisma.review.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.hypothesis.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const patterns = extractPatterns(reviews);

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
      },
      observed: {
        reviewCount: reviews.length,
        reviewExcerpts: reviews.slice(0, 10).map(r => ({
          id: r.id,
          text: r.text,
          rating: r.rating,
          author: r.author,
          date: r.createdAt,
        })),
        patterns: patterns.map(p => ({
          description: p.description,
          occurrences: p.occurrences,
          examples: p.examples.slice(0, 2),
        })),
      },
      hypothesized: {
        hypotheses: hypotheses.map(h => ({
          id: h.id,
          statement: h.statement,
          status: h.status,
          evidenceCount: h.evidenceCount,
          createdAt: h.createdAt,
          supportingExamples: reviews
            .filter(r => {
              // Simple text matching - in reality would be more sophisticated
              const keywords = h.statement.toLowerCase().split(" ");
              return keywords.some(kw => r.text.toLowerCase().includes(kw));
            })
            .slice(0, 3)
            .map(r => r.text),
        })),
      },
      unknowns: {
        items: [
          hypotheses.length === 0 ? "No hypotheses formulated yet" : null,
          reviews.length === 0 ? "No review data analyzed" : null,
          patterns.length === 0 ? "Patterns not yet visible" : null,
        ].filter(Boolean),
      },
      nextAction: hypotheses.length === 0
        ? { type: "generate_hypotheses", label: "Generate hypotheses from evidence" }
        : { type: "form_question", label: "Formulate question for conversation" },
    });
  } catch (error) {
    console.error("Error fetching investigation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
