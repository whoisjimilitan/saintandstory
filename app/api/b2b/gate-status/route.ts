/**
 * GET /api/b2b/gate-status/:prospect_id
 *
 * Returns current gate status for a prospect
 * Used by: Closed-loop dashboard, operator workflows
 */

import { getGateStatus } from '@/lib/b2b-gate-status';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ prospect_id: string }> }
) {
  try {
    const { prospect_id } = await params;

    if (!prospect_id) {
      return Response.json(
        { error: 'prospect_id is required' },
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
