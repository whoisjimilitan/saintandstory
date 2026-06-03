# PROJECT STATUS

Last Updated: 2026-06-03

## Repository

GitHub:
https://github.com/whoisjimilitan/saintandstory

Local Path:
/Users/jimilitan/Documents/GitHub/saintandstory

Main Branch:
main

---

## Production

Website:
https://saintandstoryltd.co.uk

Hosting:
Vercel

Production Database:
Neon PostgreSQL

Production Database Name:
neondb

---

## Current System Status

Login:
✅ Working

Customer Job Form:
✅ Working

Admin Dashboard:
⚠️ Loads but submitted jobs are not currently appearing

Driver Dashboard:
⚠️ Requires verification

Dispatch Tables:
✅ Restored

Discovery Tables:
✅ Operational

---

## Database Recovery History

Dispatch tables were accidentally removed during Prisma schema work.

Restored tables:

* drivers
* driver_availability
* jobs
* ratings
* earnings
* driver_location_history

Discovery tables retained:

* Assumption
* Business
* Conversation
* EvidencePattern
* Hypothesis
* ObservationEvent
* Outcome
* Review

---

## Latest Important Commits

Dispatch Schema Restore:
6746278

Claude Handoff Document:
6e8e775

---

## Known Open Issue

Customer can submit a job.

Submission appears successful.

Job does not currently appear on admin dashboard.

Priority #1:
Trace customer job submission end-to-end.

Verify:

1. Form submission
2. API endpoint
3. Database insertion
4. Dashboard query
5. Dashboard filters
6. Dashboard rendering

Do not assume job creation is working until a submitted customer job is visible on the admin dashboard.

---

## Driver App Roadmap

Planned:

1. Driver photo proof at collection
2. Driver photo proof at delivery
3. Real-time location sharing
4. ETA updates
5. Driver-generated invoice
6. Fast payment workflow
7. Full PWA-based implementation

Goal:

All functionality should work inside the existing PWA without requiring a separate native mobile app.

---

## Business Development

Priority customer categories include:

* Law firms
* Accountants
* Estate agents
* Pharmacies
* Hospitals
* Dental practices
* Veterinary clinics
* Print shops
* Marketing agencies
* Construction firms
* Manufacturing companies
* E-commerce businesses
* Auction houses
* IT equipment suppliers
* Event companies
* Insurance brokers
* Architects
* Surveyors
* Financial advisers
* Recruitment agencies

See CLAUDE_HANDOFF.md for full business development strategy.

---

## Instructions For Future Claude Sessions

Always read:

1. docs/CLAUDE_HANDOFF.md
2. docs/PROJECT_STATUS.md

before making any code changes.

Do not modify production database schema without:

1. verifying current Neon target
2. creating a safety branch
3. documenting intended changes

Current highest priority:

Fix customer job submissions so they appear on the admin dashboard.
