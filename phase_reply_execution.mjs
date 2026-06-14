import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';

const resend = new Resend(process.env.RESEND_API_KEY);
const sql = neon(process.env.DATABASE_URL);

const FOLLOW_UP_STRATEGY = {
  'Linley & Simpson': {
    subject: 'Student lettings logistics — 2 questions',
    body: `Hi there,

Thanks for your interest in our recent note about student relocations.

I wanted to reach out directly because I think we might have something specific to your business.

Student lettings are high-volume and high-turnover. Managing that without friction is hard. We specialize in making student relocations work smoothly.

Quick question: Would it be useful if I sent you 3 specific ideas for student relocation efficiency?

If yes, we could grab 10 minutes next week to discuss.

Looking forward to hearing from you.

Best,
Saint & Story`,
    category: 'estate_agent'
  },
  'Monroe': {
    subject: 'Alwoodley properties - white-glove relocation standard',
    body: `Hi there,

I've been thinking about your business. Alwoodley clients expect premium service, and that includes how relocations are handled.

High-value clients notice the difference when relocation logistics are seamless.

Would it help if I showed you exactly how we've supported similar premium agents?

If so, could we grab 15 minutes to discuss your specific client profile?

Best,
Saint & Story`,
    category: 'estate_agent'
  },
  'haart': {
    subject: 'Multi-location operational consistency',
    body: `Hi there,

Managing consistent quality across multiple locations is complex. We make it simple.

I'd like to share one specific thing we do differently with multi-location operations.

Quick call next week?

Best,
Saint & Story`,
    category: 'estate_agent'
  },
  'Greater London Properties': {
    subject: 'London luxury - relocation as competitive advantage',
    body: `Hi there,

London luxury agents don't have time for logistics logistics. We handle it.

I have 3 specific ideas for Bloomsbury-area agents. Worth 10 minutes?

Can we schedule for next week?

Best,
Saint & Story`,
    category: 'estate_agent'
  },
  'Cornerstone': {
    subject: 'Multi-location scale — doing it consistently',
    body: `Hi there,

Multi-location operations need operational consistency. Most platforms are one-size-fits-all.

We specialize in making multi-location work without friction.

Would a quick conversation help?

Best,
Saint & Story`,
    category: 'estate_agent'
  },
  'Westpoint Pharmacy': {
    subject: 'Pharmacy customer retention during relocations',
    body: `Hi there,

Thanks for your interest.

We help pharmacies maintain customer relationships when customers relocate. Retention matters in your business.

With your customer base, smooth transitions probably mean a lot.

Would it make sense to chat about how this works?

10 minutes next week?

Best,
Saint & Story`,
    category: 'pharmacy'
  }
};

async function sendFollowUps(prospects) {
  console.log('\n=== REPLY CONVERSION FOLLOW-UP EXECUTION ===\n');

  const results = {
    sent: [],
    failed: [],
    total: prospects.length
  };

  for (const prospect of prospects) {
    const strategy = FOLLOW_UP_STRATEGY[prospect.business_name] || FOLLOW_UP_STRATEGY['Default'];

    if (!prospect.email) {
      console.log(`❌ ${prospect.business_name}: No email address`);
      results.failed.push(prospect.business_name);
      continue;
    }

    try {
      // Send email via Resend
      const response = await resend.emails.send({
        from: 'Saint & Story <hello@saintandstory.com>',
        to: prospect.email,
        subject: strategy.subject,
        text: strategy.body,
        reply_to: 'hello@saintandstory.com'
      });

      if (response.error) {
        console.log(`❌ ${prospect.business_name}: ${response.error.message}`);
        results.failed.push(prospect.business_name);
        continue;
      }

      const messageId = response.data.id;

      // Log outreach to database
      const outreachResult = await sql(`
        INSERT INTO b2b_outreach (lead_id, resend_message_id, email_type, sent_at)
        VALUES (${prospect.id}, '${messageId}', 'reply_followup', NOW())
        RETURNING id;
      `);

      const outreachId = outreachResult[0].id;

      console.log(`✅ ${prospect.business_name}`);
      console.log(`   To: ${prospect.email}`);
      console.log(`   Message ID: ${messageId}`);
      console.log(`   Outreach record: ${outreachId}`);

      results.sent.push({
        business_name: prospect.business_name,
        email: prospect.email,
        message_id: messageId,
        outreach_id: outreachId,
        sent_at: new Date().toISOString()
      });

    } catch (error) {
      console.log(`❌ ${prospect.business_name}: ${error.message}`);
      results.failed.push(prospect.business_name);
    }

    // Rate limiting: 1 second between sends
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

async function getClickedProspects() {
  try {
    const prospects = await sql(`
      SELECT DISTINCT
        l.id,
        l.business_name,
        l.email,
        l.heat_score,
        COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as click_count,
        MAX(e.timestamp) as last_click
      FROM b2b_leads l
      LEFT JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE e.event_type = 'clicked'
      AND l.source != 'qa_system_test'
      GROUP BY l.id, l.business_name, l.email, l.heat_score
      ORDER BY l.heat_score DESC, l.created_at DESC
      LIMIT 8;
    `);

    return prospects;
  } catch (error) {
    console.error('Error fetching prospects:', error);
    return [];
  }
}

async function main() {
  console.log('Fetching clicked prospects...');

  const prospects = await getClickedProspects();

  if (prospects.length === 0) {
    console.log('\n⚠️  No clicked prospects found.');
    console.log('Expected: 8 prospects who clicked but haven\'t replied');
    console.log('Current state: check database for b2b_email_events with event_type="clicked"');
    return;
  }

  console.log(`\nFound ${prospects.length} clicked prospects ready for follow-up.\n`);

  for (const p of prospects) {
    console.log(`- ${p.business_name} (Heat: ${p.heat_score}/100, ${p.click_count} clicks)`);
  }

  const results = await sendFollowUps(prospects);

  console.log('\n=== EXECUTION SUMMARY ===\n');
  console.log(`Sent: ${results.sent.length}/${results.total}`);
  console.log(`Failed: ${results.failed.length}/${results.total}`);
  console.log(`Success rate: ${(results.sent.length / results.total * 100).toFixed(1)}%`);

  if (results.sent.length > 0) {
    console.log('\n✅ FOLLOW-UPS SENT:');
    results.sent.forEach(item => {
      console.log(`   ${item.business_name} (Message: ${item.message_id})`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ FAILED:');
    results.failed.forEach(name => {
      console.log(`   ${name}`);
    });
  }

  console.log('\n📊 NEXT STEPS:');
  console.log('1. Update FIRST_REPLY_TRACKER.md with sent timestamps');
  console.log('2. Monitor inbox for replies (expect within 24 hours)');
  console.log('3. When first reply arrives, execute FIRST_MEETING_PLAYBOOK');
  console.log('4. Track conversion outcome in FIRST_REPLY_TRACKER.md');

  console.log('\n=== END EXECUTION ===\n');
}

main().catch(console.error);
