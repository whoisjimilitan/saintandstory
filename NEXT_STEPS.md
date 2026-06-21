# Next Steps – Immediate Priorities

**Date:** 2026-06-21  
**Current Phase:** Phase 1 Complete, Ready for Phase 2  
**Status:** 🟢 All blockers cleared  

---

## Immediate Actions (Do Now)

### ✅ 1. Commit Project State Documentation

**Status:** This document + PROJECT_STATE.md + KNOWN_ISSUES.md  
**Action:**
```bash
git add PROJECT_STATE.md NEXT_STEPS.md KNOWN_ISSUES.md
git commit -m "docs: Complete project state checkpoint before Phase 2"
git push origin main
```

**Why:** Preserves entire project understanding before continuing development.

---

### ⏳ 2. Wire Morning Brief to Live Data (Phase 2)

**Priority:** 🔴 CRITICAL  
**Time Estimate:** 4-6 hours  
**Status:** Ready to start

**Scope:**
1. Replace hardcoded data in `app/operator/page.tsx`
2. Call `GET /api/v1/dashboard/morning-brief` on component mount
3. Implement loading state (spinner while fetching)
4. Implement error state (error message + retry button)
5. Implement empty state (friendly message when no data)
6. Map API response to component state
7. Display live metrics, pipeline, actions, activity
8. Test with real database queries

**File:** `app/operator/page.tsx`  
**Entry point:**
```typescript
useEffect(() => {
  fetch('/api/v1/dashboard/morning-brief')
    .then(r => r.json())
    .then(data => setMorningBrief(data))
    .catch(error => setError(error.message))
}, [])
```

**Verification:**
- [ ] API returns 200
- [ ] Metrics match database counts
- [ ] Pipeline stage counts correct
- [ ] Actions array shows tasks (or empty array)
- [ ] Activity array shows events (or empty array)
- [ ] Loading state appears while fetching
- [ ] Error state shows on failure
- [ ] Empty state shows when no data

**Blocks:** Everything else (navigation, drill-down, modules)

---

### ⏳ 3. Implement Clickable Navigation (Phase 2)

**Priority:** 🔴 CRITICAL  
**Time Estimate:** 3-4 hours  
**Status:** Ready to start (after live data wired)

**Scope:**
1. Add click handlers to metric cards
2. Navigate to filtered views:
   - New Leads (2) → `/operator/discover?status=new`
   - High Confidence (1) → `/operator/discover?score=80+`
   - In Progress → `/operator/pipeline`
   - Completed → `/operator/completed`
3. Add click handlers to pipeline stages
   - DISCOVER → `/operator/discover?stage=discover`
   - ENRICH → `/operator/discover?stage=enrich`
   - (etc.)
4. Add click handlers to action cards
   - Show detail modal (expand existing modal)
   - Preserve existing action detail UI
5. Add hover effects (Framer Motion)
   - Subtle lift: y: -2px
   - Shadow increase on hover
6. Ensure keyboard navigation
   - Tab cycles through interactive elements
   - Enter activates focused element
   - Escape closes modals

**Interaction examples:**
```typescript
onClick={() => router.push('/operator/discover?status=new')}

// With Framer Motion:
<motion.div whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
  {content}
</motion.div>
```

**Verification:**
- [ ] Clicking metric cards navigates
- [ ] URL contains expected query params
- [ ] Clicking pipeline stages navigates
- [ ] Clicking action cards opens detail
- [ ] Hover effect appears
- [ ] Cursor: pointer on all interactive elements
- [ ] Keyboard navigation works (Tab/Enter)
- [ ] Mobile doesn't have hover (use active state)

**Blocks:** Full-featured dashboard

---

### ⏳ 4. Install Framer Motion

**Priority:** 🟡 HIGH  
**Time Estimate:** 5 minutes

**Action:**
```bash
npm install framer-motion
```

**Why:** Required for animations in steps 3 and beyond

---

## Phase 2 Checklist (Wire & Interact)

Complete these in order:

- [ ] 1. Remove hardcoded data from Morning Brief
- [ ] 2. Fetch live data from `/api/v1/dashboard/morning-brief`
- [ ] 3. Add loading state
- [ ] 4. Add error state
- [ ] 5. Add empty state
- [ ] 6. Install Framer Motion
- [ ] 7. Add hover animations to cards
- [ ] 8. Add click handlers to metrics
- [ ] 9. Add click handlers to pipeline
- [ ] 10. Add click handlers to actions
- [ ] 11. Test keyboard navigation
- [ ] 12. Test on mobile
- [ ] 13. Verify all data displayed correctly

**Exit criteria for Phase 2:**
- Morning Brief displays real data from database
- All interactive elements navigate or show details
- Animations are subtle and smooth
- Keyboard navigation works
- Mobile responsive
- No hardcoded data remaining

---

## Phase 2.5: Prepare Discover Module

**Priority:** 🟡 HIGH (needed for Morning Brief navigation to work)  
**Time Estimate:** 4-5 hours  
**Status:** Design ready, implementation pending

**Scope:**
1. Create `/operator/discover/page.tsx`
2. Build layout:
   - Search/filter bar at top
   - Postcode search input
   - Results list below
   - Filters: category, confidence, stage
3. Implement postcode search
   - Call `/api/b2b/discover?postcode=XX`
   - Show results in card layout
4. Implement filtering
   - Filter by status (new, enriched, qualified, etc.)
   - Filter by score (high-confidence)
   - Filter by stage
5. Add back-to-dashboard button
6. Add animations (Framer Motion)

**Files to create:**
- `app/operator/discover/page.tsx` — Main page
- Optional: `app/operator/discover/components/SearchBar.tsx`
- Optional: `app/operator/discover/components/ResultCard.tsx`

**Verification:**
- [ ] Postcode search works
- [ ] Results display correctly
- [ ] Filters apply
- [ ] Navigation from Morning Brief works
- [ ] Back button returns to dashboard
- [ ] Mobile responsive

**Why needed:** Morning Brief navigation points to `/operator/discover`. Must exist before Phase 2 is "done".

---

## Phase 3: Pipeline & Additional Modules

**Priority:** 🟠 MEDIUM  
**Time Estimate:** 8-10 hours  
**Status:** Design ready, implementation pending

**Modules to create:**
1. Pipeline (`/operator/pipeline`)
   - View leads by stage
   - Count by stage
   - Drill into stage for details
   
2. Settings (`/operator/settings`)
   - Operator preferences
   - Email type selection
   - Notification settings
   
3. Analytics (`/operator/analytics`)
   - KPIs and performance
   - Conversion rates
   - Email effectiveness
   - Learning outcomes

**Note:** Discover module is highest priority (needed for Phase 2 drill-down).

---

## Post-Phase 3: Polish & Optimization

**Priority:** 🟢 LOW  
**Time Estimate:** Variable  
**When:** After core features working

- [ ] Add caching to `/api/v1/dashboard/morning-brief`
- [ ] Implement real-time updates (WebSocket via Pusher)
- [ ] Add observability (error tracking, performance monitoring)
- [ ] Optimize database queries
- [ ] Add comprehensive logging
- [ ] User onboarding / tour
- [ ] Help documentation

---

## Schema Migrations (Start After Phase 2)

**Priority:** 🟡 HIGH  
**Reference:** See `SCHEMA_MIGRATION_STRATEGY.md`

**Action:**
1. After Phase 2 ships and is stable
2. Adopt Prisma Migrate for all future schema changes
3. Set up team approval process
4. Document migration procedures

**This prevents:** Future deployments from breaking due to schema issues.

---

## Testing Checklist Before Each Phase Release

Before considering a phase "done":

### Functionality
- [ ] All features working as designed
- [ ] No console errors
- [ ] No TypeScript errors in build

### Data Integrity
- [ ] Database queries return expected results
- [ ] No N+1 queries or performance issues
- [ ] Data is consistent across views

### UX
- [ ] Smooth animations and transitions
- [ ] No jank or delays
- [ ] Responsive on all breakpoints (mobile, tablet, desktop)
- [ ] Touch-friendly on mobile (tap targets 44px+)

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] No color-only information (e.g., errors in red only)

### Performance
- [ ] Page loads < 2 seconds
- [ ] API responses < 500ms
- [ ] Smooth 60fps animations
- [ ] Mobile performance acceptable (slow 3G)

### Documentation
- [ ] Code comments for complex logic
- [ ] Commit messages clear and descriptive
- [ ] Project state updated

---

## Communication Plan

### Stakeholder Updates

**After Phase 2 (Week 1):**
- Morning Brief displays real data
- Dashboard is interactive
- Drill-down to details works

**After Phase 3 (Week 2):**
- Discover module functional
- Pipeline view working
- Full operator workflows available

**After Phase 4 (Week 3):**
- Analytics dashboard launched
- Team collaboration features
- Learning system visible

---

## Risk Mitigation

### If Phase 2 Breaks Production

**Rollback:**
```bash
git reset --hard ce5cd88  # Return to Morning Brief foundation
git push origin main --force
vercel deploy --prod
```

**Recovery time:** 5 minutes

### If Database Schema Issue Occurs

**Check schema:**
```bash
# Via Neon dashboard or local:
psql $DATABASE_URL -c "\d b2b_tasks"
psql $DATABASE_URL -c "\d b2b_activity_log"
```

**Reference:** SCHEMA_MIGRATION_STRATEGY.md for safe remediation

### If API Performance Degrades

**Debug:**
1. Check Vercel function logs
2. Check database query logs in Neon
3. Identify slow queries
4. Add caching or optimize query

**Reference:** See "Post-Phase 3" optimization section

---

## Success Metrics

### Phase 2 Success
- ✅ Morning Brief shows live data (0% hardcoded)
- ✅ 100% of interactive elements work
- ✅ 0 console errors
- ✅ Response time < 500ms
- ✅ Mobile responsive

### Phase 3 Success
- ✅ Discover module fully functional
- ✅ Pipeline view showing real data
- ✅ All navigation between modules working
- ✅ 0 regressions from Phase 2

### Overall Success
- ✅ Operator OS is the canonical platform (legacy dashboard frozen)
- ✅ All operators using Morning Brief as primary interface
- ✅ No hardcoded data anywhere
- ✅ Extensible architecture for future features

---

## Questions to Answer Before Phase 2

1. **Should Morning Brief auto-refresh?**
   - No (for now). User manually refreshes or navigates.
   - Future: Implement auto-refresh every 5 minutes after stabilization.

2. **Should clicking a metric filter that view?**
   - Yes. Metric click navigates to that filtered view.
   - Back button returns to Morning Brief.

3. **Should email composer be in UI?**
   - No (Phase 2). Email sending via backend API only.
   - Future (Phase 3): Add email composer modal.

4. **How should errors be displayed?**
   - Error banner at top of Morning Brief.
   - Show error message (not just "failed").
   - Provide retry button.

5. **Should empty state be different for each section?**
   - Yes. Each section (metrics, pipeline, actions, activity) has its own empty messaging.
   - E.g., "No high-confidence opportunities yet" vs "No activities today".

---

## Summary

| Phase | Timeline | Status | Next Step |
|-------|----------|--------|-----------|
| Phase 1 | ✅ Complete | Verified | → Phase 2 |
| Phase 2 | ⏳ 4-6 days | Ready to start | Wire live data + navigation |
| Phase 3 | ⏳ Following week | Design ready | Discover/Pipeline modules |
| Phase 4 | ⏳ Week after | Planned | Analytics + advanced features |
| Future | ⏳ Post-MVP | Enhancements | Real-time, mobile app, integrations |

**Ready to begin Phase 2 whenever you are.**

---

**Last Updated:** 2026-06-21  
**Next Review:** After Phase 2 completion  
**Assigned to:** Development Team
