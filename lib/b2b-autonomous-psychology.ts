/**
 * AUTONOMOUS PSYCHOLOGY EMAIL GENERATION
 * Takes discovered prospects, generates psychology emails automatically
 */

import { DiscoveredProspect } from './b2b-autonomous-discovery';

export interface PsychologyEmailGenerated {
  prospect_id: string;
  prospect_name: string;
  pressure_type: string;
  email_subject: string;
  email_body: string;
  confidence: number;
  generated_at: string;
  status: 'generated' | 'validated' | 'sent';
}

/**
 * Generate psychology email for discovered prospect
 */
export function generatePsychologyEmailAutonomous(
  prospect: DiscoveredProspect
): PsychologyEmailGenerated {
  const rrat = buildRRATForProspect(prospect);

  return {
    prospect_id: prospect.id,
    prospect_name: prospect.company_name,
    pressure_type: prospect.detected_pressure_type,
    email_subject: rrat.subject,
    email_body: rrat.body,
    confidence: prospect.confidence,
    generated_at: new Date().toISOString(),
    status: 'generated',
  };
}

/**
 * Build RRAT framework for specific pressure type
 */
function buildRRATForProspect(prospect: DiscoveredProspect): {
  subject: string;
  body: string;
} {
  const type = prospect.detected_pressure_type;
  const name = prospect.company_name;
  const obs = prospect.observations;

  // Service Quality Inconsistency
  if (type === 'service-quality-inconsistency') {
    const variance = obs.find((o) => o.includes('★'));
    return {
      subject: `${name}: Consistent quality across all your locations`,
      body: `Hi ${name},

${variance || 'Your best locations get excellent reviews. Your newest locations lag behind.'}

That's a challenge because you're managing quality variance personally across multiple locations.

We worked with a similar network that grew to ${prospect.employees + 100} employees while maintaining consistency. Variance dropped from 1.8★ to 0.3★ in 8 months.

Does this variance across locations match what you're experiencing?

Looking forward to talking.`,
    };
  }

  // Time-Critical Movement
  if (type === 'time-critical-movement') {
    return {
      subject: `${name}: Making your timeline work`,
      body: `Hi ${name},

You have a deadline coming. Standard implementation takes longer than you have.

That's a challenge because you need systems operational before your move, not after.

We worked with a logistics company relocating in 60 days. Implemented in 42 days. Zero disruption during transition.

When exactly is your timeline?

Let's talk.`,
    };
  }

  // Capacity Overflow
  if (type === 'capacity-overflow') {
    return {
      subject: `${name}: Scaling without the chaos`,
      body: `Hi ${name},

You're growing. More volume means more manual work.

That's a challenge because your processes aren't scaling with your growth. Managing manually becomes impossible at your size.

We worked with a pharmacy network that scaled from ${prospect.employees} to ${prospect.employees + 150} employees. Kept the same team. Automation handled the growth.

Does this scaling challenge match your reality?

Looking forward to talking.`,
    };
  }

  // Default fallback
  return {
    subject: `${name}: A quick question`,
    body: `Hi ${name},

I noticed your company is growing in ${prospect.category}.

I think there might be an opportunity to discuss.

Does that interest you?

Looking forward to talking.`,
  };
}

/**
 * Generate batch of psychology emails
 */
export function generatePsychologyEmailsBatch(
  prospects: DiscoveredProspect[]
): PsychologyEmailGenerated[] {
  return prospects.map((p) => generatePsychologyEmailAutonomous(p));
}

/**
 * Autonomous psychology generation process
 */
export function runAutonomousPsychologyGeneration(
  queuedProspects: DiscoveredProspect[]
): {
  generated: number;
  emails: PsychologyEmailGenerated[];
} {
  console.log(`[Psychology] Generating emails for ${queuedProspects.length} prospects...`);

  const emails = generatePsychologyEmailsBatch(queuedProspects);

  console.log(`[Psychology] Generated ${emails.length} psychology emails`);

  return {
    generated: emails.length,
    emails,
  };
}
