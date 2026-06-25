/**
 * B2B Daily Orchestration Service
 *
 * Coordinates autonomous execution of all B2B discovery and fulfillment processes.
 * Does NOT implement business logic - calls existing proven functions only.
 * Failure-isolated: each stage can fail independently without stopping others.
 * Fully idempotent: designed to be safely run multiple times.
 */

import { runFullPipeline } from "./four-layer-pipeline";
import { GooglePlacesSource } from "./discovery/google-places-source";
import { neon } from "@neondatabase/serverless";
import { OrchestrationLogger } from "./orchestration-logger";
import type { Driver } from "./b2b-types";
import type { RawBusinessDiscovery } from "./four-layer-pipeline";

// Lazy-load recognition to avoid initialization errors from Resend
let triggerDriverLeadDiscovery: any;

/**
 * Phase 3: Dynamic discovery configuration
 * Loads from discovery_config table (operator-controlled)
 * Falls back to defaults if no config exists
 */
const DEFAULT_DISCOVERY_PARAMS = [
  { niche: "florists", location: "london" },
  { niche: "florists", location: "manchester" },
  { niche: "florists", location: "sheffield" },
  { niche: "accountants", location: "london" },
  { niche: "accountants", location: "manchester" },
];

async function getDiscoveryParams(
  sql: any
): Promise<Array<{ niche: string; location: string }>> {
  try {
    const configs = (await sql`
      SELECT niche, locations, enabled
      FROM discovery_config
      WHERE enabled = true
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY priority DESC
    `) as Array<{ niche: string; locations: string[]; enabled: boolean }>;

    if (!configs || configs.length === 0) {
      console.log("[orchestration] No discovery_config found, using defaults");
      return DEFAULT_DISCOVERY_PARAMS;
    }

    const params: Array<{ niche: string; location: string }> = [];
    for (const config of configs) {
      const locations = config.locations || [];
      for (const location of locations) {
        params.push({ niche: config.niche, location });
      }
    }

    console.log(`[orchestration] Loaded ${params.length} discovery params from config`);
    return params;
  } catch (error) {
    console.error("[orchestration] Error loading discovery_config:", error);
    return DEFAULT_DISCOVERY_PARAMS;
  }
}

interface OrchestrationResult {
  success: boolean;
  executionId: string;
  timestamp: string;
  stages: {
    discovery: { count: number; skipped: number; errors: string[] };
    driverMatching: { attempted: number; succeeded: number; failed: string[] };
    standingOrders: { created: number; failed: string[] };
    metrics: { calculated: boolean };
  };
  totalDurationMs: number;
}

export async function runDailyB2BOrchestration(): Promise<OrchestrationResult> {
  const logger = new OrchestrationLogger();
  const sql = neon(process.env.DATABASE_URL!);

  const result: OrchestrationResult = {
    success: false,
    executionId: "",
    timestamp: new Date().toISOString(),
    stages: {
      discovery: { count: 0, skipped: 0, errors: [] },
      driverMatching: { attempted: 0, succeeded: 0, failed: [] },
      standingOrders: { created: 0, failed: [] },
      metrics: { calculated: false },
    },
    totalDurationMs: 0,
  };

  // ─────────────────────────────────────────────────────────────
  // STAGE 1: DISCOVERY PIPELINE
  // ─────────────────────────────────────────────────────────────
  const stage1Runner = logger.startStage("Discovery Pipeline").start();

  try {
    let totalDiscovered = 0;
    let totalStored = 0;
    const errors: string[] = [];

    // Phase 3: Load dynamic discovery params
    const discoveryParams = await getDiscoveryParams(sql);

    for (const { niche, location } of discoveryParams) {
      try {
        console.log(`  → Discovering ${niche} in ${location}`);

        // Use Google Places to discover businesses
        const source = new GooglePlacesSource();
        const payloads = await source.discover(niche, location);
        totalDiscovered += payloads.length;

        // Process each business through four-layer pipeline
        let promotedCount = 0;
        for (const payload of payloads) {
          try {
            // Extract category and rating from Google Places details
            const details = payload.rawPayload as any;
            const business: RawBusinessDiscovery = {
              placeId: payload.sourceEntityId,
              name: payload.name,
              address: payload.address || 'address not available',
              postcode: details?.formatted_address?.split(',').pop()?.trim(),
              category: details?.types?.[0] || 'business',
              source: 'discovery',
              reviews: payload.reviews,
              website: payload.website,
              phone: payload.phone,
              rating: details?.rating,
              reviewCount: payload.reviews?.length || 0,
              rawData: payload.rawPayload,
            };

            const pipelineResult = await runFullPipeline(sql, business);
            if (pipelineResult.promoted) {
              promotedCount++;
              totalStored++;
            }
          } catch (businessErr) {
            console.error(`    ✗ Failed to process ${payload.name}:`, businessErr instanceof Error ? businessErr.message : String(businessErr));
          }
        }

        console.log(`    ✓ Discovered ${totalDiscovered} businesses, promoted ${promotedCount} to leads`);
      } catch (err) {
        const errorMsg = `${niche} @ ${location}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(errorMsg);
        console.error(`    ✗ ${errorMsg}`);
      }
    }

    stage1Runner.success(totalDiscovered, totalStored, errors);
    result.stages.discovery = {
      count: totalStored,
      skipped: totalDiscovered - totalStored,
      errors,
    };
  } catch (err) {
    stage1Runner.failure(
      err instanceof Error ? err.message : String(err)
    );
    result.stages.discovery.errors.push(
      err instanceof Error ? err.message : String(err)
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STAGE 2: DRIVER MATCHING & LOCKED TEMPLATE EMAIL GENERATION
  // ─────────────────────────────────────────────────────────────
  // NOW USES: Communication engine (unified with ENRICH page)
  // Uses same 6-layer psychology template for all auto-discovery emails
  // ─────────────────────────────────────────────────────────────
  const stage2Runner = logger.startStage("Driver Matching & Email Generation").start();

  try {
    // Import communication engine (single source of truth for emails)
    const { generateRelationshipCommunication } = await import("./business-relationship-engine");
    const { generateCommunicationRecommendations } = await import("./layer2-reasoning-engine");
    const { Resend } = await import("resend");

    const resend = new Resend(process.env.RESEND_API_KEY);

    const drivers = (await sql`
      SELECT id, full_name as name, email, postcode, latitude, longitude, radius_miles
      FROM drivers
      WHERE b2b_opt_in = true
    `) as Driver[];

    console.log(`  → Found ${drivers.length} B2B opt-in drivers`);

    let succeeded = 0;
    const failed: string[] = [];
    let totalEmailsSent = 0;

    for (const driver of drivers) {
      try {
        console.log(`  → Matching for ${driver.name}`);

        // Find nearby leads (within driver's radius)
        const nearbyLeads = (await sql`
          SELECT id, business_name, city, email, business_category, pain_point
          FROM b2b_leads
          WHERE
            latitude IS NOT NULL
            AND longitude IS NOT NULL
            AND email IS NOT NULL
            AND email_sent_at IS NULL
            AND (
              (6371 * acos(cos(radians(${driver.latitude})) * cos(radians(latitude::float)) *
               cos(radians(longitude::float) - radians(${driver.longitude})) +
               sin(radians(${driver.latitude})) * sin(radians(latitude::float)))) <= ${driver.radius_miles * 1.609}
            )
          ORDER BY engagement_score DESC
          LIMIT 20
        `) as Array<{
          id: string;
          business_name: string;
          city: string;
          email: string;
          business_category?: string;
          pain_point?: string;
        }>;

        if (nearbyLeads.length === 0) {
          console.log(`    ℹ No nearby leads found`);
          continue;
        }

        console.log(`    → Found ${nearbyLeads.length} nearby leads, generating emails...`);

        // Generate emails using LOCKED TEMPLATE for each lead
        let emailsSentForDriver = 0;
        for (const lead of nearbyLeads) {
          try {
            // Generate reasoning context using 8-step engine
            const reasoning = generateRelationshipCommunication({
              name: lead.business_name,
              industry: lead.business_category || "logistics",
              location: lead.city || "UK",
              size: "small" as const,
              contactName: undefined,
              discoveryEvidence: {
                operationalIndicators: [],
                growthSignals: [],
                currentSolutions: [],
                painPoints: lead.pain_point ? [lead.pain_point] : [],
              },
            });

            // Generate 3 ranked recommendations using Layer 2
            const recommendations = generateCommunicationRecommendations(reasoning);
            const topRecommendation = recommendations[0];

            if (!topRecommendation?.email?.fullBody) {
              throw new Error("No email body generated");
            }

            // Format email with greeting and signature (LOCKED TEMPLATE)
            // FIXED: Don't convert "they" - template uses correct pronouns
            // PERMANENTLY LOCKED: "across" (not "to"), city only (no postcode)
            const emailBody = topRecommendation.email.fullBody;

            const subject = `We're expanding across ${lead.city || "your area"} - set up your account`;

            const fullBody = `Hi ${lead.business_name},

${emailBody.trim()}

Best regards,
James
Saint & Story`;

            // Send via Resend (same as manual batch)
            const response = await resend.emails.send({
              from: "recognition@saintandstoryltd.co.uk",
              to: lead.email,
              subject,
              text: fullBody,
              replyTo: "info@saintandstoryltd.co.uk",
              headers: {
                "X-Lead-ID": lead.id,
                "X-Driver-ID": driver.id,
                "X-Source": "auto-discovery-orchestrator",
              },
            });

            if (response.error) {
              throw new Error(response.error.message);
            }

            // Mark lead as emailed
            await sql`
              UPDATE b2b_leads
              SET email_sent_at = NOW()
              WHERE id = ${lead.id}
            `;

            emailsSentForDriver++;
            totalEmailsSent++;
          } catch (leadErr) {
            console.error(
              `    ✗ Failed to send email to ${lead.business_name}:`,
              leadErr instanceof Error ? leadErr.message : String(leadErr)
            );
          }
        }

        if (emailsSentForDriver > 0) {
          succeeded++;
          console.log(
            `    ✓ Sent ${emailsSentForDriver} emails to nearby leads`
          );
        }
      } catch (err) {
        const errorMsg = `Driver ${driver.id}: ${err instanceof Error ? err.message : String(err)}`;
        failed.push(errorMsg);
        console.error(`    ✗ ${errorMsg}`);
      }
    }

    stage2Runner.success(drivers.length, succeeded, failed);
    result.stages.driverMatching = {
      attempted: drivers.length,
      succeeded,
      failed,
    };

    console.log(`[B2B Orchestrator] Total emails sent: ${totalEmailsSent}`);
  } catch (err) {
    stage2Runner.failure(
      err instanceof Error ? err.message : String(err)
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STAGE 3: STANDING ORDER PROCESSING & JOB GENERATION
  // ─────────────────────────────────────────────────────────────
  const stage3Runner = logger.startStage("Standing Order Processing").start();

  try {
    // Get standing orders that need job generation (only from active tiers A/B/C)
    const orders = (await sql`
      SELECT so.id, so.business_name, so.next_scheduled_at
      FROM b2b_standing_orders so
      JOIN b2b_leads bl ON so.lead_id = bl.id
      WHERE so.active = true
        AND (so.next_scheduled_at IS NULL OR so.next_scheduled_at <= NOW())
        AND (bl.lead_tier IS NULL OR bl.lead_tier IN ('A', 'B', 'C'))
    `) as Array<{
      id: string;
      business_name: string;
      next_scheduled_at: string | null;
    }>;

    console.log(`  → Found ${orders.length} standing orders due for processing`);

    let created = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        // Get full order details for job creation
        const fullOrderResult = await sql`
          SELECT * FROM b2b_standing_orders WHERE id = ${order.id}
        `;

        if (fullOrderResult.length === 0) {
          throw new Error("Order not found");
        }

        const fullOrder = fullOrderResult[0] as Record<string, unknown>;
        const pickupPostcode = fullOrder.pickup_postcode as string | null;
        const deliveryPostcode = fullOrder.delivery_postcode as string | null;

        if (!pickupPostcode?.trim() || !deliveryPostcode?.trim()) {
          errors.push(
            `${order.id}: Missing routing postcode (pickup: ${pickupPostcode || "null"}, delivery: ${deliveryPostcode || "null"})`
          );
          console.log(
            `    ⚠ Skipped ${order.business_name} - missing postcode`
          );
          continue;
        }

        // Create job
        const reference = `B2B-${Date.now().toString(36).toUpperCase()}`;
        const trackingToken = Math.random().toString(36).substring(2, 15);

        await sql`
          INSERT INTO jobs (
            id, customer_name, customer_email, customer_phone,
            service_type, postcode_from, postcode_to, status, reference,
            price, notes, timeframe, created_at, updated_at, tracking_token
          ) VALUES (
            gen_random_uuid(),
            ${fullOrder.business_name as string},
            ${(fullOrder.contact_email as string) || null},
            ${(fullOrder.contact_phone as string) || null},
            ${(fullOrder.service_type as string) || "Standing order"},
            ${pickupPostcode},
            ${deliveryPostcode},
            'pending_review',
            ${reference},
            ${(fullOrder.price as number) || null},
            'Recurring: ' || ${fullOrder.frequency as string},
            'Standing order',
            NOW(),
            NOW(),
            ${trackingToken}
          )
        `;

        // Update next scheduled date
        const now = new Date();
        const dayOfWeek = fullOrder.day_of_week as number | null;
        let nextDate: Date;

        if (dayOfWeek != null) {
          const diff = (dayOfWeek - now.getDay() + 7) % 7 || 7;
          nextDate = new Date(now);
          nextDate.setDate(now.getDate() + diff);
          nextDate.setHours(9, 0, 0, 0);
        } else {
          nextDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        await sql`
          UPDATE b2b_standing_orders
          SET last_generated_at = NOW(), next_scheduled_at = ${nextDate.toISOString()}
          WHERE id = ${order.id}
        `;

        created++;
        console.log(`    ✓ Job created for ${order.business_name}`);
      } catch (err) {
        const errorMsg = `${order.id}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(errorMsg);
        console.error(`    ✗ ${errorMsg}`);
      }
    }

    stage3Runner.success(orders.length, created, errors);
    result.stages.standingOrders = { created, failed: errors };
  } catch (err) {
    stage3Runner.failure(
      err instanceof Error ? err.message : String(err)
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STAGE 4: METRICS CALCULATION
  // ─────────────────────────────────────────────────────────────
  const stage4Runner = logger.startStage("Metrics Calculation").start();

  try {
    // Metrics are calculated on-demand by the dashboard API
    // Split: total qualified (learning inventory) vs. active outreach (conversion target)
    const totalLeads = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    const activeLeads = await sql`
      SELECT COUNT(*) as count FROM b2b_leads
      WHERE lead_tier IS NULL OR lead_tier IN ('A', 'B')
    `;
    const jobsCount = await sql`SELECT COUNT(*) as count FROM jobs`;

    console.log(
      `  → Leads: ${activeLeads[0].count} active, ${totalLeads[0].count} total qualified | Jobs: ${jobsCount[0].count}`
    );

    stage4Runner.success();
    result.stages.metrics.calculated = true;
  } catch (err) {
    stage4Runner.failure(
      err instanceof Error ? err.message : String(err)
    );
  }

  // ─────────────────────────────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────────────────────────────
  const report = logger.generateReport();
  logger.logReport(report);

  result.success = report.success;
  result.executionId = report.executionId;
  result.totalDurationMs = report.summary.totalDurationMs;

  return result;
}
