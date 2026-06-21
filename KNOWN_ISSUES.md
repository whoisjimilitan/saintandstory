# Known Issues & Technical Debt

**Date:** 2026-06-21  
**Last Updated:** Post-Phase 1 Verification  
**Total Issues:** 23  

---

## 🔴 Critical (Blocks Phase 2)

None. Phase 1 verified. All blockers cleared.

---

## 🟡 High Priority (Phase 2 Work)

### 1. Hardcoded Data in Morning Brief

**Severity:** 🟡 HIGH  
**File:** `app/operator/page.tsx` (lines 28-100+)  
**Issue:**
- 4 action cards have hardcoded business data
- Metrics show fixed numbers (2, 1, 0, 0)
- Pipeline shows fixed layout with hardcoded counts
- No connection to database

**Impact:**
- Dashboard doesn't reflect real data
- Users see example data, not their data
- Must be fixed before production use

**Root cause:**
- Specification-driven design (started with hardcoded layout)
- API endpoint created but UI not yet wired

**Fix:**
1. Remove `actionDetails` object
2. Remove hardcoded metric values
3. Fetch from `/api/v1/dashboard/morning-brief`
4. Map response to component state
5. Add loading/error/empty states

**Status:** ⏳ In progress  
**Phase:** Phase 2  
**Estimate:** 2-3 hours  
**Blocked by:** Nothing (can start immediately)

---

### 2. No Interactivity on Dashboard Cards

**Severity:** 🟡 HIGH  
**Files:** `app/operator/page.tsx`  
**Issue:**
- Metric cards are not clickable
- Pipeline stages are not clickable
- Action cards open a hardcoded modal
- No navigation between views

**Impact:**
- Dashboard is read-only
- No drill-down capability
- Can't filter/explore data

**Root cause:**
- Interactive features not yet implemented
- Click handlers not wired
- Route navigation not added

**Fix:**
1. Add onClick handlers to metric cards
2. Implement route.push() to filter views
3. Add onClick to pipeline stages
4. Ensure action cards navigate correctly
5. Add Framer Motion hover effects

**Status:** ⏳ Ready to implement  
**Phase:** Phase 2  
**Estimate:** 2-3 hours  
**Blocked by:** Live data wiring (Priority 1)

---

### 3. No Framer Motion Library

**Severity:** 🟡 HIGH  
**Issue:**
- Framer Motion not in dependencies
- Can't implement animations without adding it
- Hover effects planned but not possible yet

**Impact:**
- UI animations missing
- Dashboard feels static

**Root cause:**
- Design system defined but library not added
- Planned for Phase 2 but not yet done

**Fix:**
```bash
npm install framer-motion
```

**Status:** ⏳ Not started  
**Phase:** Phase 2 prep  
**Estimate:** 5 minutes  
**Blocked by:** Nothing

---

### 4. Discover Module Not Started

**Severity:** 🟡 HIGH  
**File:** Route exists (`/operator/discover`) but page is empty  
**Issue:**
- `/operator/discover/page.tsx` doesn't exist
- Morning Brief navigation points to this route
- Navigation will 404

**Impact:**
- Can't drill down from Morning Brief to discover details
- Feature incomplete

**Root cause:**
- Prioritized Morning Brief UI first
- Discover to follow in Phase 2.5

**Fix:**
1. Create `/operator/discover/page.tsx`
2. Implement search UI
3. Wire to `/api/b2b/discover` endpoint
4. Add filtering

**Status:** ⏳ Planned  
**Phase:** Phase 2.5  
**Estimate:** 4-5 hours  
**Blocked by:** Morning Brief live data (Priority 1)

---

### 5. Activity Feed Empty

**Severity:** 🟡 HIGH  
**Database:** `b2b_activity_log` table empty  
**Issue:**
- No activity is being logged
- Activity feed section shows nothing
- `ActivityService.getRecentActivity()` returns empty array

**Impact:**
- Activity feed not useful
- No visibility into what happened

**Root cause:**
- Activity logging endpoints not wired to store events
- B2B modules don't call `ActivityService.logActivity()`

**Fix:**
1. Wire B2B modules to log events
   - Email sent → log `email_sent` event
   - Response received → log `reply_received` event
   - Lead promoted → log state transition event
2. Verify events are created
3. Test activity feed displays them

**Status:** ⏳ Planned  
**Phase:** Phase 2-3  
**Estimate:** 3-4 hours  
**Blocked by:** Live data wiring priority (need to verify core metrics first)

---

### 6. Task Service Returns Empty Array

**Severity:** 🟡 HIGH  
**Database:** `b2b_tasks` table empty  
**Issue:**
- Morning Brief shows `todaysActions: []`
- No tasks are being created
- `TaskService.getTasksDueToday()` returns empty array

**Impact:**
- Today's Actions section not useful
- No pending work visible

**Root cause:**
- Task creation endpoints not wired to modules
- B2B discovery/qualification flows don't create tasks

**Fix:**
1. Identify where tasks should be created
   - After email sent? (action: follow up)
   - After lead discovered? (action: enrich)
   - After lead qualified? (action: schedule call)
2. Wire modules to `TaskService.createTask()`
3. Verify tasks appear in Morning Brief

**Status:** ⏳ Planned  
**Phase:** Phase 2-3  
**Estimate:** 3-4 hours  
**Blocked by:** Decision on task creation logic

---

## 🟠 Medium Priority (After Phase 2)

### 7. No Caching on Morning Brief API

**Severity:** 🟠 MEDIUM  
**File:** `app/api/v1/dashboard/morning-brief/route.ts`  
**Issue:**
- Every request queries database live
- Multiple simultaneous views = multiple queries
- Higher latency for high traffic

**Impact:**
- API slightly slower than optimal
- Database gets more hits than necessary

**Root cause:**
- Designed for correctness first (live data)
- Caching optimization deferred

**Fix:**
1. Add Redis caching
2. Cache TTL: 5 minutes
3. Invalidate on events (if possible)
4. Add `X-Cache: HIT | MISS` header

**Status:** ⏳ Deferred  
**Phase:** Post-Phase 2 optimization  
**Estimate:** 2-3 hours  
**Blocked by:** Nothing (can do after features work)

---

### 8. No Performance Monitoring

**Severity:** 🟠 MEDIUM  
**Issue:**
- No error tracking (Sentry, LogRocket, etc.)
- No APM (application performance monitoring)
- No visibility into production issues

**Impact:**
- Hard to debug production problems
- Don't know if things are breaking
- User issues discovered via complaints

**Root cause:**
- Not prioritized before launch
- Add after MVP is stable

**Fix:**
1. Add Sentry for error tracking
2. Add Vercel Analytics for performance
3. Add custom logging to key endpoints
4. Monitor dashboard for issues

**Status:** ⏳ Planned  
**Phase:** Post-Phase 3 hardening  
**Estimate:** 4-5 hours  
**Blocked by:** Nothing

---

### 9. Schema Changes Not Versioned

**Severity:** 🟠 MEDIUM  
**File:** `prisma/schema.prisma`  
**Issue:**
- Using `prisma db push` (direct sync) instead of migrations
- No version history of schema changes
- No audit trail
- Can't safely replay schema on staging

**Impact:**
- Harder to coordinate team changes
- No rollback capability
- Difficult to troubleshoot schema issues

**Root cause:**
- db push is simpler for initial development
- Migration strategy deferred

**Fix:**
- Adopt Prisma Migrate strategy
- See `SCHEMA_MIGRATION_STRATEGY.md` for implementation
- Create baseline migration of current schema
- Use `migrate:dev` for future changes

**Status:** ⏳ Planned  
**Phase:** Post-Phase 2  
**Estimate:** 4-6 hours (including team training)  
**Blocked by:** Nothing

---

### 10. Legacy Dashboards Still Live

**Severity:** 🟠 MEDIUM  
**Files:** `app/dashboard/admin/*`, `app/dashboard/intelligence/*`  
**Issue:**
- Multiple dashboard routes exist
- Confusion about canonical path
- Legacy code not removed

**Impact:**
- Operators confused which dashboard to use
- Maintenance burden

**Root cause:**
- Operator OS built alongside legacy
- Legacy not deprecated yet

**Fix:**
1. Freeze legacy routes (no new features)
2. Add deprecation banner
3. Redirect to `/operator` after 2 weeks
4. Delete legacy code in Phase 4

**Status:** ⏳ Planned  
**Phase:** Phase 3  
**Estimate:** 2-3 hours  
**Blocked by:** Operator OS fully functional

---

### 11. Email Composer Not in UI

**Severity:** 🟠 MEDIUM  
**Issue:**
- No interface for operators to compose/send emails
- Email generation happens via API only
- Requires backend access to send

**Impact:**
- Operators can't easily send contextual emails
- Workflow interrupted

**Root cause:**
- UI composition complex (psychology types, A/B variants)
- Deferred to Phase 3

**Fix:**
1. Create email composer modal
2. Form for subject, body
3. Pressure type selector
4. A/B variant toggle
5. Integration with `/api/b2b/send`

**Status:** ⏳ Planned  
**Phase:** Phase 3  
**Estimate:** 4-5 hours  
**Blocked by:** Core dashboard features working

---

### 12. No Real-Time Updates

**Severity:** 🟠 MEDIUM  
**Issue:**
- Pusher configured but not used
- Morning Brief doesn't auto-refresh
- Multiple operators don't see each other's actions live

**Impact:**
- Stale data possible
- No collaborative awareness

**Root cause:**
- Real-time is "nice to have"
- Live data sufficient for MVP

**Fix:**
1. Add Pusher subscription to Morning Brief
2. Listen for activity_log events
3. Auto-update dashboard when events occur
4. Show "updated X seconds ago" badge

**Status:** ⏳ Planned  
**Phase:** Phase 4  
**Estimate:** 3-4 hours  
**Blocked by:** Everything else working first

---

## 🔵 Low Priority (Future)

### 13. No Export/Reporting

**Severity:** 🔵 LOW  
**Issue:**
- Data visible but not exportable
- Can't generate reports (CSV, PDF)

**Impact:**
- Limited for external reporting
- Can't share data easily

**Fix:**
- Add "Export" buttons
- Generate CSV from queries
- Optional: PDF generation

**Status:** ⏳ Backlog  
**Phase:** Future  
**Estimate:** 2-3 hours

---

### 14. No Mobile App

**Severity:** 🔵 LOW  
**Issue:**
- Only web-based interface
- No iOS/Android native app

**Impact:**
- Operators can't check dashboard on phone easily

**Fix:**
- React Native app or Flutter
- Sync with Operator OS

**Status:** ⏳ Backlog  
**Phase:** Post-MVP  
**Estimate:** 40-60 hours

---

### 15. No Calendar Integration

**Severity:** 🔵 LOW  
**Issue:**
- Can't schedule calls from dashboard
- No connection to Google Calendar, Outlook

**Impact:**
- Scheduling workflow interrupted

**Fix:**
- Add Google Calendar integration
- Add Outlook integration
- "Schedule meeting" button in action cards

**Status:** ⏳ Backlog  
**Phase:** Future  
**Estimate:** 6-8 hours

---

### 16. No CRM Integration

**Severity:** 🔵 LOW  
**Issue:**
- No Salesforce, Pipedrive, HubSpot sync

**Impact:**
- Operators use separate tools
- Data not unified

**Fix:**
- Add Zapier integration (short term)
- Native integrations (long term)

**Status:** ⏳ Backlog  
**Phase:** Future  
**Estimate:** 8-12 hours per CRM

---

### 17. No User Onboarding

**Severity:** 🔵 LOW  
**Issue:**
- No tutorial or guided tour
- New operators confused about workflows

**Impact:**
- Steeper learning curve

**Fix:**
- Add onboarding wizard
- Interactive product tour
- Help documentation

**Status:** ⏳ Backlog  
**Phase:** Post-launch  
**Estimate:** 6-8 hours

---

### 18. No Bulk Actions

**Severity:** 🔵 LOW  
**Issue:**
- Can't select multiple leads and act on them
- Only single-item workflows

**Impact:**
- Slower for batch operations

**Fix:**
- Add checkboxes to lead lists
- Bulk action menu (archive, email, score, etc.)

**Status:** ⏳ Backlog  
**Phase:** Phase 4  
**Estimate:** 4-5 hours

---

### 19. No Advanced Search

**Severity:** 🔵 LOW  
**Issue:**
- Only basic postcode search
- Can't search by criteria

**Impact:**
- Hard to find specific leads

**Fix:**
- Add search box with filters
- Support: company name, contact, city, category, score
- Save saved searches

**Status:** ⏳ Backlog  
**Phase:** Phase 4  
**Estimate:** 4-6 hours

---

### 20. No Team Collaboration UI

**Severity:** 🔵 LOW  
**Issue:**
- No team workspace features
- Can't assign leads to teammates
- No comments or notes on leads

**Impact:**
- Single-operator only
- Limited team use

**Fix:**
- Add team workspace management
- Lead assignment
- In-app comments
- Activity @mentions

**Status:** ⏳ Backlog  
**Phase:** Future  
**Estimate:** 12-16 hours

---

### 21. No Learning Dashboard

**Severity:** 🔵 LOW  
**Issue:**
- B2B Learning system exists but not visualized
- Operators can't see what the system is learning
- No visibility into AI reasoning

**Impact:**
- Trust issues ("What's the system doing?")
- No feedback loop

**Fix:**
- Create Learning Dashboard page
- Show patterns discovered
- Show outcome predictions
- Show confidence by category

**Status:** ⏳ Backlog  
**Phase:** Future  
**Estimate:** 8-10 hours

---

### 22. No Settings for Pressure Types

**Severity:** 🔵 LOW  
**Issue:**
- Pressure type selection not in UI
- Uses defaults from backend

**Impact:**
- Can't customize email psychology

**Fix:**
- Create settings page
- Pressure type preferences
- Email variant selection
- Notification preferences

**Status:** ⏳ Planned  
**Phase:** Phase 3  
**Estimate:** 3-4 hours

---

### 23. No Analytics Dashboard

**Severity:** 🔵 LOW  
**Issue:**
- KPIs exist in database but not visualized

**Impact:**
- No visibility into performance
- Can't track progress

**Fix:**
- Create analytics page
- Visualize: conversion rate, email effectiveness, response time, revenue
- Filters: date range, category, stage
- Trends over time

**Status:** ⏳ Planned  
**Phase:** Phase 4  
**Estimate:** 6-8 hours

---

## Issue Tracking

### By Priority

| Priority | Count | Phase | Status |
|----------|-------|-------|--------|
| 🔴 Critical | 0 | - | ✅ Resolved |
| 🟡 High | 6 | Phase 2-2.5 | ⏳ In progress |
| 🟠 Medium | 8 | Phase 2-3 | ⏳ Planned |
| 🔵 Low | 9 | Phase 4+ | ⏳ Backlog |

### By Phase

| Phase | Issues | Status |
|-------|--------|--------|
| Phase 2 | 3 | ⏳ In progress (live data, navigation, Framer Motion) |
| Phase 2.5 | 2 | ⏳ Planned (Discover module, task creation) |
| Phase 3 | 5 | ⏳ Planned (Settings, Analytics, Email composer, etc.) |
| Phase 4 | 8 | ⏳ Backlog (Advanced features) |

---

## Resolution Notes

### Resolved Issues (Post-Phase 1)

✅ **tracking_token nullable** — Fixed by making field nullable (commit 12a3897)  
✅ **Schema mismatch** — All new models in production schema  
✅ **API endpoint missing** — Created `/api/v1/dashboard/morning-brief` (commit 8898984)  
✅ **Service layer missing** — Implemented DashboardService + 5 services (commit 8898984)  
✅ **Build pipeline issue** — Removed `prisma db push` from build (commit 16ebe8c)  

---

## How to Report New Issues

1. **Check this list first** — May already be known
2. **Assign severity:**
   - 🔴 Critical: Blocks production use
   - 🟡 High: Blocks phase completion
   - 🟠 Medium: Nice to have soon
   - 🔵 Low: Backlog
3. **Note location** (file, line, function)
4. **Describe impact** (what breaks)
5. **Suggest fix** (if obvious)
6. **Add to this file** under appropriate section

---

## How to Resolve Issues

1. **Pick issue from High priority first**
2. **Estimate time required**
3. **Check blockers** (may depend on other issues)
4. **Create branch:** `fix/issue-name`
5. **Implement fix**
6. **Test thoroughly**
7. **Commit with reference:** "Fixes issue #X: ..."
8. **Update this file** (mark as resolved, move to "Resolved")
9. **Merge to main**

---

**Last Updated:** 2026-06-21  
**Next Review:** After Phase 2 completion  
**Owner:** Development Team
