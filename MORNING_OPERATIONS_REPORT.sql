-- MORNING OPERATIONS REPORT
-- Run this query each morning to see what autonomy produced overnight
-- Query: SELECT * FROM get_daily_autonomy_report();

CREATE OR REPLACE FUNCTION get_daily_autonomy_report()
RETURNS TABLE (
  last_run_id TEXT,
  started_at TIMESTAMPTZ,
  duration_seconds INT,
  businesses_discovered INT,
  leads_created INT,
  jobs_generated INT,
  drivers_matched INT,
  emails_sent INT,
  standing_orders_processed INT,
  status TEXT,
  failure_count INT,
  failure_details TEXT
) AS $$
SELECT
  r.run_id,
  r.started_at,
  EXTRACT(EPOCH FROM (r.completed_at - r.started_at))::INT,
  r.discovery_count,
  r.leads_created,
  r.jobs_created,
  r.drivers_matched,
  r.emails_sent,
  r.standing_orders_processed,
  r.status,
  COALESCE(array_length(r.failures, 1), 0),
  CASE
    WHEN r.failures IS NULL OR array_length(r.failures, 1) = 0 THEN 'None'
    ELSE array_to_string(r.failures, E'\n')
  END
FROM b2b_orchestration_logs r
WHERE DATE(r.started_at) = CURRENT_DATE
ORDER BY r.started_at DESC
LIMIT 1;
$$ LANGUAGE SQL;

-- QUICK VERSION: Just show the latest run
SELECT
  '═══════════════════════════════════════════════════════' AS "MORNING OPERATIONS REPORT",
  r.run_id AS "Last Run ID",
  r.started_at AT TIME ZONE 'UTC' AS "Started",
  (EXTRACT(EPOCH FROM (r.completed_at - r.started_at)))::INT AS "Duration (sec)",
  '' AS "",
  r.discovery_count AS "Businesses Discovered",
  r.leads_created AS "Leads Created",
  r.jobs_created AS "Jobs Generated",
  r.drivers_matched AS "Drivers Matched",
  r.emails_sent AS "Emails Sent",
  r.standing_orders_processed AS "Standing Orders Processed",
  '' AS "_",
  r.status AS "Status",
  COALESCE(array_length(r.failures, 1), 0) AS "Failure Count",
  CASE
    WHEN r.failures IS NULL OR array_length(r.failures, 1) = 0
      THEN '✅ NONE'
    ELSE '⚠️ See details below'
  END AS "Failures"
FROM b2b_orchestration_logs r
WHERE DATE(r.started_at) = CURRENT_DATE
ORDER BY r.started_at DESC
LIMIT 1;

-- DETAILED VERSION: Show failures if any
SELECT
  unnest(r.failures) AS "Failure Details"
FROM b2b_orchestration_logs r
WHERE DATE(r.started_at) = CURRENT_DATE
  AND r.failures IS NOT NULL
  AND array_length(r.failures, 1) > 0
ORDER BY r.started_at DESC
LIMIT 1;
