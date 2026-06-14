# SCHEMA VERIFICATION AUDIT

**Generated**: 2026-06-13T10:05:29.763Z

## VERIFICATION STATUS

❌ **CRITICAL ISSUES FOUND** — Do not proceed with other audits

## TABLES FOUND



## ARCHITECTURAL QUESTIONS ANSWERED

### How is lead_id linked in the event chain?


❌ **Cannot determine lead_id linkage**

This is a critical architectural issue.


## ASSUMPTIONS VERIFIED

(none)

## ASSUMPTIONS VIOLATED

(none)

## CRITICAL ISSUES

❌ Failed to query b2b_leads schema: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).
❌ Failed to query b2b_outreach schema: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).
❌ Failed to query b2b_email_events schema: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).
❌ No way to link events to leads — architecture broken

## NEXT STEPS


❌ **Schema has critical issues**

Do not proceed with other audits until these are resolved:
1. Failed to query b2b_leads schema: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).
2. Failed to query b2b_outreach schema: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).
3. Failed to query b2b_email_events schema: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).
4. No way to link events to leads — architecture broken

After fixing, re-run this audit to verify.



## IMPORTANT FOR AUDIT SCRIPT FIXES

Based on this schema, the audit scripts need to be corrected:

### If lead_id is denormalized on b2b_email_events:
```sql
SELECT e.lead_id, COUNT(*) as click_count
FROM b2b_email_events e
WHERE e.event_type = 'clicked'
GROUP BY e.lead_id;
```

### If lead_id is only on b2b_outreach:
```sql
SELECT o.lead_id, COUNT(*) as click_count
FROM b2b_email_events e
JOIN b2b_outreach o ON e.outreach_id = o.id
WHERE e.event_type = 'clicked'
GROUP BY o.lead_id;
```

Use whichever pattern matches your actual schema.
