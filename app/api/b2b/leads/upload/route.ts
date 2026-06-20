/**
 * POST /api/b2b/leads/upload
 *
 * Multi-format file upload (CSV, Excel, Google Docs)
 * Auto-detects pressure types and generates psychology emails
 * Returns: Detected pressure types, psychology emails, brief page links
 */

import { parseFile, normalizeProspects } from '@/lib/b2b-file-parser';
import { detectPressureTypesBatch } from '@/lib/b2b-pressure-type-detector';
import { generatePsychologyEmailBatch } from '@/lib/b2b-psychology-engine-extended';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse file (CSV, Excel, or Google Docs)
    const buffer = Buffer.from(await file.arrayBuffer());
    let prospects = await parseFile(buffer, file.name, file.type);
    prospects = normalizeProspects(prospects);

    // STEP 1: Auto-detect pressure types
    const detections = await detectPressureTypesBatch(prospects);

    // STEP 2: Generate psychology emails for each prospect
    const prospectsWithType = prospects.map((p, i) => ({
      ...p,
      prospect_name: p.prospect_name || p.company_name || `Prospect ${i + 1}`,
      company_name: p.company_name || 'Unknown',
      pressure_type: detections[i].detection.pressure_type,
      detection_confidence: detections[i].detection.confidence,
      detection_reasoning: detections[i].detection.reasoning,
      observations: p.observations || 'Data-driven detection',
    }));

    const emails = await generatePsychologyEmailBatch(
      prospectsWithType.map((p) => ({
        prospect_id: p.prospect_id,
        prospect_name: p.prospect_name,
        company_name: p.company_name,
        pressure_type: p.pressure_type,
        observations: p.observations,
      }))
    );

    // STEP 3: Prepare response
    const result = prospectsWithType.map((prospect, i) => ({
      prospect_id: prospect.prospect_id,
      prospect_name: prospect.prospect_name,
      company_name: prospect.company_name,
      detected_pressure_type: prospect.pressure_type,
      detection_confidence: (prospect.detection_confidence * 100).toFixed(0) + '%',
      detection_reasoning: prospect.detection_reasoning,
      psychology_email: {
        subject: emails[i].email_subject,
        body: emails[i].email_body,
      },
      brief_page: {
        url: emails[i].brief_page_url,
        headline: emails[i].brief_page_headline,
      },
      status: 'ready_to_send',
    }));

    return Response.json({
      success: true,
      total_prospects: result.length,
      results: result,
      summary: {
        pressure_type_distribution: getPressureTypeDistribution(result),
        avg_detection_confidence: (
          result.reduce((sum, r) => sum + parseInt(r.detection_confidence), 0) / result.length
        ).toFixed(0) + '%',
      },
    });
  } catch (error) {
    console.error('Error uploading leads:', error);
    return Response.json({ error: 'Failed to upload leads' }, { status: 500 });
  }
}

function getPressureTypeDistribution(
  results: any[]
): Record<string, number> {
  const dist: Record<string, number> = {};

  results.forEach((r) => {
    dist[r.detected_pressure_type] = (dist[r.detected_pressure_type] || 0) + 1;
  });

  return dist;
}
