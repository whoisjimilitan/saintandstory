import { neon } from "@neondatabase/serverless";

/**
 * Category Conversion Analytics
 *
 * Tracks which business categories actually convert
 * Enables: Discovery prioritization, mission ROI, category ranking
 *
 * DORMANT: Data collection only. No automated behavior changes.
 */

export interface CategoryStats {
  category: string;
  discovered_count: number;
  qualified_count: number;
  leads_created_count: number;
  converted_count: number;
  revenue_generated: number;
  conversion_rate: number; // converted / leads_created
  qualification_rate: number; // qualified / discovered
  lead_creation_rate: number; // leads_created / qualified
  average_days_to_conversion: number;
  engagement_score_avg: number;
  opportunity_score_avg: number;
}

/**
 * Get conversion statistics for all categories
 */
export async function getCategoryConversionStats(
  sql: any
): Promise<CategoryStats[]> {
  try {
    const categories = await sql`
      SELECT DISTINCT business_category
      FROM b2b_leads
      WHERE business_category IS NOT NULL
      ORDER BY business_category
    `;

    const stats = await Promise.all(
      categories.map(async (row: any) =>
        getCategoryStats(sql, row.business_category)
      )
    );

    return stats.filter((s) => s !== null) as CategoryStats[];
  } catch (error) {
    console.error("[CATEGORY-ANALYTICS] Error getting category stats:", error);
    return [];
  }
}

/**
 * Get statistics for a specific category
 */
export async function getCategoryStats(
  sql: any,
  category: string
): Promise<CategoryStats | null> {
  try {
    const [discovered, qualified, created, converted, revenue, engagementAvg, scoreAvg, daysToConversion] =
      await Promise.all([
        // Discovered (via discovery missions)
        sql`
          SELECT COUNT(*) as count
          FROM discovered_businesses
          WHERE category = ${category}
        `,

        // Qualified
        sql`
          SELECT COUNT(*) as count
          FROM qualified_businesses qb
          JOIN discovered_businesses db ON qb.discovered_business_id = db.id
          WHERE db.category = ${category}
        `,

        // Leads created (promoted to b2b_leads)
        sql`
          SELECT COUNT(*) as count
          FROM b2b_leads
          WHERE business_category = ${category}
        `,

        // Converted (standing orders)
        sql`
          SELECT COUNT(DISTINCT l.id) as count
          FROM b2b_leads l
          JOIN b2b_standing_orders so ON l.id = so.lead_id
          WHERE l.business_category = ${category}
        `,

        // Revenue generated
        sql`
          SELECT COALESCE(SUM(so.price), 0) as total
          FROM b2b_standing_orders so
          JOIN b2b_leads l ON so.lead_id = l.id
          WHERE l.business_category = ${category}
        `,

        // Average engagement score
        sql`
          SELECT COALESCE(AVG(engagement_score), 0) as avg
          FROM b2b_leads
          WHERE business_category = ${category}
        `,

        // Average opportunity score
        sql`
          SELECT COALESCE(AVG(opportunity_score), 0) as avg
          FROM b2b_leads
          WHERE business_category = ${category}
        `,

        // Average days to conversion
        sql`
          SELECT COALESCE(
            EXTRACT(DAY FROM AVG(so.created_at - l.created_at)),
            0
          ) as avg_days
          FROM b2b_standing_orders so
          JOIN b2b_leads l ON so.lead_id = l.id
          WHERE l.business_category = ${category}
        `,
      ]);

    const discoveredCount = (discovered[0] as any).count || 0;
    const qualifiedCount = (qualified[0] as any).count || 0;
    const createdCount = (created[0] as any).count || 0;
    const convertedCount = (converted[0] as any).count || 0;
    const revenueGenerated = parseFloat((revenue[0] as any).total || 0);
    const engagementAvgValue = parseFloat((engagementAvg[0] as any).avg || 0);
    const scoreAvgValue = parseFloat((scoreAvg[0] as any).avg || 0);
    const daysAvgValue = parseFloat((daysToConversion[0] as any).avg_days || 0);

    return {
      category,
      discovered_count: discoveredCount,
      qualified_count: qualifiedCount,
      leads_created_count: createdCount,
      converted_count: convertedCount,
      revenue_generated: revenueGenerated,
      conversion_rate:
        createdCount > 0 ? convertedCount / createdCount : 0,
      qualification_rate:
        discoveredCount > 0 ? qualifiedCount / discoveredCount : 0,
      lead_creation_rate:
        qualifiedCount > 0 ? createdCount / qualifiedCount : 0,
      average_days_to_conversion: daysAvgValue,
      engagement_score_avg: engagementAvgValue,
      opportunity_score_avg: scoreAvgValue,
    };
  } catch (error) {
    console.error(
      `[CATEGORY-ANALYTICS] Error getting stats for ${category}:`,
      error
    );
    return null;
  }
}

/**
 * Get categories ranked by conversion performance
 * DORMANT: Used for analysis only, not for automatic prioritization
 */
export async function getCategoriesByConversionPerformance(
  sql: any
): Promise<CategoryStats[]> {
  try {
    const allStats = await getCategoryConversionStats(sql);

    // Filter to only categories with meaningful data
    const meaningful = allStats.filter(
      (s) => s.leads_created_count >= 3 // Need at least 3 leads for reliability
    );

    // Sort by conversion rate (highest first)
    return meaningful.sort((a, b) => b.conversion_rate - a.conversion_rate);
  } catch (error) {
    console.error(
      "[CATEGORY-ANALYTICS] Error ranking by performance:",
      error
    );
    return [];
  }
}

/**
 * Get categories that are underperforming
 * May be candidates for pausing discovery missions
 */
export async function getUnderperformingCategories(
  sql: any,
  conversionRateThreshold: number = 0.05 // 5% conversion rate
): Promise<CategoryStats[]> {
  try {
    const allStats = await getCategoryConversionStats(sql);

    // Filter to categories with data but low conversion
    return allStats.filter(
      (s) =>
        s.leads_created_count >= 5 &&
        s.conversion_rate < conversionRateThreshold
    );
  } catch (error) {
    console.error("[CATEGORY-ANALYTICS] Error getting underperformers:", error);
    return [];
  }
}

/**
 * Get category performance insights for dashboard
 */
export async function getCategoryPerformanceInsights(
  sql: any
): Promise<{
  top_performers: CategoryStats[];
  underperformers: CategoryStats[];
  summary: {
    total_categories: number;
    overall_conversion_rate: number;
    highest_converting_category: string | null;
    recommendation: string;
  };
}> {
  try {
    const allStats = await getCategoryConversionStats(sql);
    const performers = await getCategoriesByConversionPerformance(sql);
    const underperformers = await getUnderperformingCategories(sql);

    const topPerformers = performers.slice(0, 5);
    const totalConverted = allStats.reduce((sum, s) => sum + s.converted_count, 0);
    const totalLeads = allStats.reduce((sum, s) => sum + s.leads_created_count, 0);
    const overallConversionRate = totalLeads > 0 ? totalConverted / totalLeads : 0;

    let recommendation =
      "Continue current discovery strategy. Monitor underperformers.";
    if (topPerformers.length > 0 && underperformers.length > 0) {
      const top = topPerformers[0];
      const bottom = underperformers[0];
      recommendation = `${top.category} converts at ${(top.conversion_rate * 100).toFixed(1)}%. Consider prioritizing it and deprioritizing ${bottom.category} (${(bottom.conversion_rate * 100).toFixed(1)}%).`;
    }

    return {
      top_performers: topPerformers,
      underperformers,
      summary: {
        total_categories: allStats.length,
        overall_conversion_rate: overallConversionRate,
        highest_converting_category:
          topPerformers.length > 0 ? topPerformers[0].category : null,
        recommendation,
      },
    };
  } catch (error) {
    console.error("[CATEGORY-ANALYTICS] Error getting insights:", error);
    return {
      top_performers: [],
      underperformers: [],
      summary: {
        total_categories: 0,
        overall_conversion_rate: 0,
        highest_converting_category: null,
        recommendation: "Error loading insights",
      },
    };
  }
}
