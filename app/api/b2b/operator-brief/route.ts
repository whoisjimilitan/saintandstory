/**
 * POST /api/b2b/operator-brief
 *
 * Generate operator brief from prospect reply
 * Used by: Operator workflow when prospect replies
 */

import { generateOperatorBrief } from '@/lib/b2b-operator-response-framework';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      prospect_id,
      prospect_name,
      prospect_reply,
      original_recognition,
      pressure_type,
      observations,
    } = body;

    // Validate required fields
    if (
      !prospect_id ||
      !prospect_name ||
      !prospect_reply ||
      !original_recognition ||
      !pressure_type
    ) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const brief = await generateOperatorBrief({
      prospect_id,
      prospect_name,
      prospect_reply,
      original_recognition,
      pressure_type,
      observations: observations || '',
    });

    // Store brief in database (in operator_brief_context JSON column)
    // For now, just return the generated brief

    return Response.json({
      success: true,
      data: {
        prospect_id,
        brief,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating operator brief:', error);
    return Response.json(
      { error: 'Failed to generate operator brief' },
      { status: 500 }
    );
  }
}
