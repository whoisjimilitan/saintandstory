/**
 * POST /api/b2b/operator-os/validate-email
 *
 * Validates operator-written email against Human Writing Engine constitution
 * Returns: Pass/Suggest/Fail with confidence score and suggestions
 */

import { validateEmail } from '@/lib/b2b-human-writing-validator';

export async function POST(request: Request) {
  const body = await request.json();

  const { email_subject, email_body, pressure_type, company_name } = body;

  if (!email_subject || !email_body || !pressure_type || !company_name) {
    return Response.json(
      { error: 'Missing required fields: email_subject, email_body, pressure_type, company_name' },
      { status: 400 }
    );
  }

  // Run validation
  const result = validateEmail(email_subject, email_body, pressure_type, company_name);

  return Response.json({
    success: true,
    validation: result,
  });
}
