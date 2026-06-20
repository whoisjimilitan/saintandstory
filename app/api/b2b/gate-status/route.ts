/**
 * GET /api/b2b/gate-status
 *
 * Returns current gate status for all prospects
 * Query param: prospect_id (optional)
 * Used by: Closed-loop dashboard, operator workflows
 */

import { getGateStatus } from '@/lib/b2b-gate-status';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prospect_id = searchParams.get('prospect_id');

    if (!prospect_id) {
      return Response.json(
        { error: 'prospect_id query param is required' },
        { status: 400 }
      );
    }

    const status = await getGateStatus(prospect_id);

    return Response.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error fetching gate status:', error);
    return Response.json(
      { error: 'Failed to fetch gate status' },
      { status: 500 }
    );
  }
}
