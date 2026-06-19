/**
 * API Route: Get Observations
 *
 * GET /api/v1/observations?candidate_id={uuid}
 * GET /api/v1/observations/{observation_id}
 *
 * Retrieve stored observations
 */

import { NextRequest, NextResponse } from 'next/server';
import { PostgresObservationRepository } from '@/modules/observation-engine/repository';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  const operationId = `get-obs-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidate_id');
    const observationId = searchParams.get('observation_id');

    if (!candidateId && !observationId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          operationId,
          timestamp: new Date().toISOString(),
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: 'Must provide either candidate_id or observation_id',
            },
          ],
        },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    const repository = new PostgresObservationRepository(sql);

    let observation;

    if (observationId) {
      observation = await repository.get(observationId);
    } else if (candidateId) {
      observation = await repository.getByCandidateId(candidateId);
    }

    if (!observation) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          operationId,
          timestamp: new Date().toISOString(),
          errors: [
            {
              code: 'NOT_FOUND',
              message: 'Observation not found',
            },
          ],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          observation,
        },
        operationId,
        timestamp: new Date().toISOString(),
        errors: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[observations/get] Error:', error);

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
