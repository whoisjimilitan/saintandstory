/**
 * API Route: Generate Observation
 *
 * POST /api/v1/observations/generate
 *
 * Generates structured evidence for a discovered business
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateObservations } from '@/modules/observation-engine/orchestrator';
import { PostgresObservationRepository } from '@/modules/observation-engine/repository';
import { neon } from '@neondatabase/serverless';

export const maxDuration = 30; // 30 second timeout

export async function POST(request: NextRequest) {
  const operationId = `obs-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  try {
    const body = await request.json();

    const { candidate_id, business_name, google_place_id, address } = body;

    // Validate required fields
    if (!candidate_id || !business_name || !google_place_id || !address) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          operationId,
          timestamp: new Date().toISOString(),
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: 'Missing required fields: candidate_id, business_name, google_place_id, address',
            },
          ],
        },
        { status: 400 }
      );
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          operationId,
          timestamp: new Date().toISOString(),
          errors: [
            {
              code: 'CONFIG_ERROR',
              message: 'Google Maps API key not configured',
            },
          ],
        },
        { status: 500 }
      );
    }

    // Generate observations batch
    const batch = await generateObservations({
      candidate_id,
      business_name,
      google_place_id,
      address,
      google_api_key: googleApiKey,
    });

    // Save to database
    if (batch.observations.length > 0) {
      try {
        const sql = neon(process.env.DATABASE_URL!);
        const repository = new PostgresObservationRepository(sql);
        await repository.saveBatch(batch.observations);
      } catch (dbErr) {
        console.error('[observations/generate] Database save failed:', dbErr);
        batch.warnings.push('database_save_failed');
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          observations: batch.observations,
          observation_coverage: batch.observation_coverage,
          sources_used: batch.sources_used,
          warnings: batch.warnings,
          execution_time_ms: batch.execution_time_ms,
        },
        operationId,
        timestamp: new Date().toISOString(),
        errors: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[observations/generate] Error:', error);

    return NextResponse.json(
      {
        success: false,
        data: null,
        operationId,
        timestamp: new Date().toISOString(),
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      },
      { status: 500 }
    );
  }
}
