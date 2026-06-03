# SAINT & STORY PROJECT HANDOFF

## Repository

GitHub:
https://github.com/whoisjimilitan/saintandstory

Local Path:
/Users/jimilitan/Documents/GitHub/saintandstory

Primary Branch:
main

---

## Project Purpose

Saint & Story is a same-day courier and delivery platform.

The platform includes:

* Customer booking flow
* Admin dispatch dashboard
* Driver dashboard
* Driver onboarding
* Driver earnings
* Job management
* Stripe integration
* Email notifications
* Live driver tracking
* Progressive Web App (PWA)

The PWA is the primary driver application.

Do not build a separate driver app unless explicitly instructed.

---

## Production Infrastructure

Website:
saintandstoryltd.co.uk

GitHub Repository:
saintandstory

Database:
Neon PostgreSQL

Production Endpoint:
ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech

Production Database:
neondb

Prisma ORM:
Yes

Vercel:
Yes

Resend:
Yes

Stripe:
Yes

Clerk:
Yes

Pusher:
Yes

---

## Database Architecture

### Dispatch Platform Tables

* drivers
* driver_availability
* jobs
* ratings
* earnings
* driver_location_history

### Discovery System Tables

* Assumption
* Business
* Conversation
* EvidencePattern
* Hypothesis
* ObservationEvent
* Outcome
* Review

Total expected tables:
14

---

## Historical Context

Dispatch tables were accidentally removed during a Prisma schema deployment.

The dispatch platform was reconstructed and restored.

Recovery work included:

* drivers
* jobs
* earnings
* ratings
* driver_availability
* driver_location_history

Recovery commit reference:

6746278

Production deployment completed successfully afterwards.

---

## Current Priorities

### Priority 1

Verify complete dispatch workflow.

Customer submits job
→ Job appears on admin board
→ Admin assigns driver
→ Driver accepts
→ Driver updates status
→ Job completes
→ Earnings created

### Priority 2

Improve Driver PWA.

Required features:

* Collection photo
* Delivery photo
* GPS capture
* ETA updates
* Invoice generation
* Payment workflow

---

## Driver Collection Workflow

Driver arrives at collection.

System records:

* GPS
* Timestamp

Driver taps:

Collected Parcel

Driver uploads collection photo.

Store:

* Image
* Timestamp
* Job ID
* Driver ID

---

## Driver Delivery Workflow

Driver arrives at destination.

System records:

* GPS
* Timestamp

Driver taps:

Delivered

Driver uploads delivery photo.

Store:

* Image
* Timestamp
* Job ID
* Driver ID

Optional:

* Recipient name
* Recipient signature

---

## Invoice Workflow

After successful delivery:

Generate invoice automatically.

Invoice contains:

* Job ID
* Driver
* Collection postcode
* Delivery postcode
* Customer
* Amount
* Completion date

PDF preferred.

Drivers should not manually generate invoices.

The system should generate them.

---

## Payment Workflow

Completed Job
→ Invoice Generated
→ Pending Payment
→ Admin Review
→ Payment Sent
→ Mark Paid

---

## B2B Target Industries

* Solicitors
* Accountants
* Architects
* Engineers
* Estate Agents
* Letting Agents
* Property Managers
* Pharmacies
* Dental Practices
* Private Clinics
* Veterinary Practices
* Laboratories
* Print Shops
* Sign Makers
* Marketing Agencies
* Creative Agencies
* Construction Firms
* Builders Merchants
* Electrical Suppliers
* Plumbing Suppliers
* Manufacturing Companies
* Auto Parts Suppliers
* Retail Chains
* Ecommerce Businesses
* Luxury Retailers
* Florists
* Event Companies
* Universities
* Schools
* Charities
* Churches
* Recruitment Agencies
* Insurance Brokers
* Financial Services Firms
* IT Companies
* Telecom Companies

Continue expanding B2B opportunities.

---

## Development Rules

Before changing databases:

1. Verify DATABASE_URL.
2. Verify Neon endpoint.
3. Verify database name.
4. Create Neon child branch.
5. Test there first.

Never assume.

Always verify.

Never run destructive schema operations without confirmation.

---

## New Session Startup Procedure

First commands:

cd /Users/jimilitan/Documents/GitHub/saintandstory

git pull

Review:

* docs/CLAUDE_HANDOFF.md
* prisma/schema.prisma
* package.json
* docs/*.md

Before making changes:

Provide:

* architecture summary
* production status
* outstanding issues
* recommended next actions
