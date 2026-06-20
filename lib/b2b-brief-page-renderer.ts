/**
 * BRIEF PAGE RENDERER
 *
 * Generates customized brief pages per pressure type
 * Same prospect journey, different page copy based on their pressure
 */

import { getPressureType } from './pressure-types/pressure-type-schema';

export interface BriefPageContent {
  pressure_type: string;
  prospect_name: string;
  headline: string;
  subheadline: string;
  section_1_title: string;
  section_1_body: string;
  section_2_title: string;
  section_2_body: string;
  section_3_title: string;
  section_3_body: string;
  proof_company: string;
  proof_result: string;
  cta_button_text: string;
  cta_button_url: string;
}

/**
 * Generate personalized brief page for prospect based on pressure type
 */
export async function generateBriefPageContent(input: {
  prospect_id: string;
  prospect_name: string;
  company_name: string;
  pressure_type: string;
  observations?: string;
}): Promise<BriefPageContent> {
  const playbook = getPressureType(input.pressure_type);

  if (!playbook) {
    throw new Error(`Pressure type not found: ${input.pressure_type}`);
  }

  return {
    pressure_type: input.pressure_type,
    prospect_name: input.prospect_name,
    headline: playbook.brief_page.headline,
    subheadline: playbook.brief_page.subheadline,
    section_1_title: 'The Problem',
    section_1_body: playbook.brief_page.section_1,
    section_2_title: 'Our Methodology',
    section_2_body: playbook.brief_page.section_2,
    section_3_title: 'Proof',
    section_3_body: playbook.brief_page.section_3,
    proof_company: playbook.proof_pattern.outcome_example.split(':')[0] || 'Similar company',
    proof_result: playbook.proof_pattern.outcome_example,
    cta_button_text: 'Schedule a conversation',
    cta_button_url: `/contact?prospect=${input.prospect_id}&type=${input.pressure_type}`,
  };
}

/**
 * Render brief page as HTML string
 */
export function renderBriefPageHTML(content: BriefPageContent): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${content.headline}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { margin-bottom: 60px; }
    h1 { font-size: 2.5em; font-weight: 700; margin-bottom: 20px; line-height: 1.2; }
    .subheadline { font-size: 1.2em; color: #666; margin-bottom: 40px; }
    .section { margin-bottom: 50px; }
    .section h2 { font-size: 1.5em; font-weight: 600; margin-bottom: 15px; }
    .section p { color: #555; line-height: 1.8; }
    .proof-box { background: #f5f5f5; border: 1px solid #ddd; padding: 30px; margin: 30px 0; }
    .proof-company { font-weight: 600; color: #333; margin-bottom: 10px; }
    .proof-result { color: #666; font-style: italic; }
    .cta { text-align: center; margin: 60px 0; }
    .cta-button {
      display: inline-block;
      padding: 15px 40px;
      background: #000;
      color: white;
      text-decoration: none;
      font-size: 1.1em;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
    }
    .cta-button:hover { background: #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${content.headline}</h1>
      <p class="subheadline">${content.subheadline}</p>
    </div>

    <div class="section">
      <h2>${content.section_1_title}</h2>
      <p>${content.section_1_body}</p>
    </div>

    <div class="section">
      <h2>${content.section_2_title}</h2>
      <p>${content.section_2_body}</p>
    </div>

    <div class="section">
      <h2>${content.section_3_title}</h2>
      <div class="proof-box">
        <div class="proof-company">${content.proof_company}</div>
        <div class="proof-result">${content.proof_result}</div>
      </div>
    </div>

    <div class="cta">
      <a href="${content.cta_button_url}" class="cta-button">${content.cta_button_text}</a>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate brief pages for all 9 pressure types (demo)
 */
export async function generateAllPressureTypeBriefPages(): Promise<
  Array<{ pressure_type: string; content: BriefPageContent }>
> {
  const types = [
    'service-quality-inconsistency',
    'time-critical-movement',
    'capacity-overflow',
    'geographic-service-gaps',
    'customer-acquisition-friction',
    'customer-churn',
    'delivery-reliability',
    'appointment-scheduling-friction',
    'communication-breakdown',
  ];

  return Promise.all(
    types.map(async (type) => ({
      pressure_type: type,
      content: await generateBriefPageContent({
        prospect_id: `prospect-${type}`,
        prospect_name: 'Example Company',
        company_name: 'Example Company',
        pressure_type: type,
      }),
    }))
  );
}
