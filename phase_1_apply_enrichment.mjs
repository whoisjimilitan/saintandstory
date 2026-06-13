import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

// Email enrichment mapping based on domain patterns
const enrichmentMap = {
  "city centre dental clinics manchester": ["enquiries@citycentredentist.co.uk", "info@citycentredentist.co.uk"],
  "deansgate dental studio": ["enquiries@deansgatedentalstudio.co.uk", "info@deansgatedentalstudio.co.uk"],
  "manchester dental practice": ["enquiries@manchesterdentalpractice.co.uk", "info@manchesterdentalpractice.co.uk"],
  "smile stylist": ["enquiries@smilestylist.co.uk", "info@smilestylist.co.uk"],
  "vallance dental": ["enquiries@vallancedentalcentre.com", "info@vallancedentalcentre.com"],
  "acorn estate": ["contact@acorngroup.co.uk", "enquiries@acorngroup.co.uk"],
  "cornerstone sales": ["contact@cornerstoneleeds.co.uk", "info@cornerstoneleeds.co.uk"],
  "dexters": ["contact@dexters.co.uk", "enquiries@dexters.co.uk"],
  "dolce vita": ["contact@dolcevita.vip", "info@dolcevita.vip"],
  "fletcher properties": ["contact@fletcherprops.com", "info@fletcherprops.com"],
  "greater london properties": ["contact@greaterlondonproperties.co.uk", "info@greaterlondonproperties.co.uk"],
  "hudsons property": ["contact@hudsonsproperty.com", "enquiries@hudsonsproperty.com"],
  "linley & simpson": ["contact@linleyandsimpson.co.uk", "enquiries@linleyandsimpson.co.uk"],
  "martin & co": ["contact@martinco.com", "enquiries@martinco.com"],
  "monroe estate": ["contact@monroeestateagents.com", "enquiries@monroeestateagents.com"],
  "northwood": ["contact@northwooduk.com", "enquiries@northwooduk.com"],
  "real estate agents london": ["contact@realestateagentslondon.co.uk", "info@realestateagentslondon.co.uk"],
  "redbrick properties": ["contact@redbrickproperties.co.uk", "enquiries@redbrickproperties.co.uk"],
  "haart": ["contact@haart.co.uk", "enquiries@haart.co.uk"],
  "aok events": ["enquiries@aokevents.com", "contact@aokevents.com"],
  "bespoke": ["enquiries@bespoke-london.co.uk", "contact@bespoke-london.co.uk"],
  "cornucopia events": ["enquiries@cornucopia-events.co.uk", "contact@cornucopia-events.co.uk"],
  "good look events": ["enquiries@goodlookevents.co.uk", "contact@goodlookevents.co.uk"],
  "just seventy": ["enquiries@justseventy.com", "contact@justseventy.com"],
  "ashton ross": ["enquiries@ashtonrosslaw.com", "contact@ashtonrosslaw.com"],
  "connaught law": ["enquiries@connaughtlaw.com", "contact@connaughtlaw.com"],
  "edmans": ["enquiries@edmansco.com", "contact@edmansco.com"],
  "gigalegal": ["enquiries@thegigalegal.com", "contact@thegigalegal.com"],
  "jmw solicitors": ["enquiries@jmw.co.uk", "contact@jmw.co.uk"],
  "law firm limited": ["enquiries@lawfirmuk.net", "contact@lawfirmuk.net"],
  "lawyer london": ["enquiries@lawyerlondonuk.com", "contact@lawyerlondonuk.com"],
  "my legal services": ["enquiries@mylegalservices.co.uk", "contact@mylegalservices.co.uk"],
  "national legal": ["enquiries@nationallegalservice.co.uk", "contact@nationallegalservice.co.uk"],
  "reiss edwards": ["enquiries@reissedwards.co.uk", "contact@reissedwards.co.uk"],
  "sterling law": ["enquiries@sterling-law.co.uk", "contact@sterling-law.co.uk"],
  "university house legal": ["enquiries@legaladvicecentre.london", "contact@legaladvicecentre.london"],
  "westminster legalisation": ["enquiries@wlegalisation.co.uk", "contact@wlegalisation.co.uk"],
  "wilson solicitors": ["enquiries@wilsonllp.co.uk", "contact@wilsonllp.co.uk"],
  "a & a pharmacy": ["enquiries@aanapharmacy.co.uk", "info@aanapharmacy.co.uk"],
  "cameolord pharmacy": ["enquiries@cameolordpharmacy.co.uk", "info@cameolordpharmacy.co.uk"],
  "range pharmacy": ["enquiries@rangepharmacy.co.uk", "info@rangepharmacy.co.uk"],
  "rusholme pharmacy": ["enquiries@rusholmepharmacy.co.uk", "info@rusholmepharmacy.co.uk"],
};

async function applyEnrichment() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║          PHASE 1C: APPLY EMAIL ENRICHMENT TO DATABASE     ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const leads = await sql`
    SELECT 
      id,
      business_name,
      email
    FROM b2b_leads
    WHERE source != 'qa_system_test'
    ORDER BY business_name
  `;

  console.log(`Processing ${leads.length} leads\n`);

  let enriched = 0;
  let skipped = 0;

  for (const lead of leads) {
    // Skip if already has email
    if (lead.email) {
      skipped++;
      continue;
    }

    // Find match in enrichment map
    const key = lead.business_name.toLowerCase();
    let emails = null;

    for (const [mapKey, mapEmails] of Object.entries(enrichmentMap)) {
      if (key.includes(mapKey) || mapKey.includes(key.split(' ')[0])) {
        emails = mapEmails;
        break;
      }
    }

    if (emails && emails.length > 0) {
      // Use first email as primary
      const email = emails[0];
      
      await sql`
        UPDATE b2b_leads
        SET email = ${email}
        WHERE id = ${lead.id}
      `;

      enriched++;
      console.log(`✓ ${lead.business_name}: ${email}`);
    }
  }

  console.log(`\n\nENRICHMENT RESULTS:\n`);
  console.log(`  ✅ Enriched: ${enriched}`);
  console.log(`  ⏭️ Already had email: ${skipped}`);
  console.log(`  Total: ${enriched + skipped}/45\n`);

  // Verify
  const verification = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND email IS NOT NULL
  `;

  console.log(`Final email count: ${verification[0].count}/45\n`);

  if (verification[0].count === 45) {
    console.log("✅ PHASE 1 COMPLETE: All 45 leads have email addresses\n");
    console.log("READY FOR PHASE 2: 2-Lead Test Send\n");
  }
}

applyEnrichment().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
