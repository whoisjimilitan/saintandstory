# Heat Score Ranking - ACTIVATED

**Status**: 🟢 LIVE & OPERATIONAL  
**Date**: 2026-06-13  
**Feature Flag**: `HEAT_SCORE_RANKING_ENABLED = true`  
**Autonomous Behavior**: ❌ NONE (Display layer only)

---

## What's Now Live

### 1. Lead Card Display
- **Where**: `/dashboard/admin/b2b` → Pipeline view
- **What You See**:
  - Prospects sorted by heat score descending (hottest first)
  - Heat score badge on each card: 🔥 HOT, 🔥 WARM, 🟡 COOL, ⚪ COLD
  - Expanded card shows heat score composition:
    - Qualification Score (0-40): Business fit based on category, pain signals, review rating
    - Engagement Score (0-40): Opens, clicks, replies from emails
    - Intent Signals (0-20): Engagement patterns (multiple opens, quick replies, etc)
    - **Total Heat Score (0-100)**

### 2. Lead Ordering
- **Where**: Pipeline view (default)
- **Change**: Prospects now sorted by heat score (descending), not creation date
- **Meaning**: Hottest prospects appear first; you see your best opportunities immediately

### 3. Heat Score Composition Visibility
- **Where**: Click to expand any lead card → see "Heat Score Breakdown" section
- **Shows**:
  ```
  Qualification Score: 24/40  (Business fit)
  Engagement Score: 16/40    (Email opens/clicks)
  Intent Signals:  8/20      (Behavioral patterns)
  ────────────────────────────
  Total Heat Score: 75/100 🔥 HOT
  ```

### 4. Dashboard APIs (New)
```
GET /api/b2b/intelligence/heat-dashboard
GET /api/b2b/intelligence/heat-dashboard?view=top       # Top 20 hottest
GET /api/b2b/intelligence/heat-dashboard?view=heating   # 10 heating up fastest
GET /api/b2b/intelligence/heat-dashboard?view=cooling   # 10 cooling down
GET /api/b2b/intelligence/heat-dashboard?view=distribution  # Heat distribution
GET /api/b2b/intelligence/heat-dashboard?lead_id=X      # Movement for 1 lead
```

### 5. Heat Score Timeline
- **What**: Daily snapshots of heat scores (tracks movement over time)
- **Shows**: Is a prospect heating up (engagement increasing) or cooling down?
- **API**: `GET /api/b2b/intelligence/heat-dashboard?view=heating`
- **Example Data Point**: "Acme Corp went from 45 (cool) → 72 (warm) in 24h 🔥 Heating up"

---

## Heat Score Formula

```
Heat Score = Qualification Score + Engagement Score + Intent Signals

Qualification Score (0-40):
  = opportunity_score * 0.4
  (Based on business category, pain signals, review rating)

Engagement Score (0-40):
  = engagement_score * 0.4
  (Based on email opens, clicks, replies)
  + Opens: +10 each (max 50)
  + Clicks: +20 each (max 30)
  + Reply: +20
  - Bounced/Complained: -100 (disqualified)

Intent Signals (0-20):
  = behavior analysis
  + Multiple opens in 7 days: +10
  + Has clicked link: +5
  + Has replied: +5
  + Quick reply (<24h): +5
```

---

## Heat Score Distribution

With 45 legacy leads + 151 discovered leads = ~196 prospects:

**Expected Distribution** (example):
```
🔥 HOT (75-100):      2-4 prospects   (1-2%)
🔥 WARM (50-74):      15-25 prospects (8-13%)
🟡 COOL (25-49):      40-60 prospects (20-31%)
⚪ COLD (0-24):       125-150 prospects (64-77%)
```

**Why so many cold?**
- Most discoveries are just discovered (no engagement yet)
- No email sent yet, so engagement_score = 0
- Qualification score alone is modest (0-40)
- Heat builds as you engage

---

## What Changed in Your Dashboard

### Before Activation
```
Lead Card:
┌─ Acme Corp          [Status: new]
│  Category: care_home
│  Phone: +44...
│  Created 3 days ago
└─ (sorted by creation date)

→ "First discovered = highest priority"
→ Hottest may be buried below older entries
```

### After Activation
```
Lead Card:
┌─ Acme Corp          [🔥 HOT (75)]
│  Category: care_home  
│  Phone: +44...
│  Heat Score Breakdown:
│    Qualification: 24/40
│    Engagement: 16/40
│    Intent: 8/20
└─ (sorted by heat score, hottest first)

→ "Best opportunities = first in list"
→ You can see why each prospect is ranked where it is
```

---

## Routes to See It

### 1. Pipeline View (Hottest Prospects)
```
https://saintandstory.vercel.app/dashboard/admin/b2b
↓
See all prospects sorted by heat score, hottest first
Click any card to see score breakdown
```

### 2. Heat Score APIs
```bash
# Top 20 hottest
curl https://saintandstory.vercel.app/api/b2b/intelligence/heat-dashboard?view=top

# Heating up fastest (24h movement)
curl https://saintandstory.vercel.app/api/b2b/intelligence/heat-dashboard?view=heating

# Cooling down (losing engagement)
curl https://saintandstory.vercel.app/api/b2b/intelligence/heat-dashboard?view=cooling

# Heat distribution chart data
curl https://saintandstory.vercel.app/api/b2b/intelligence/heat-dashboard?view=distribution
```

---

## What Did NOT Change

✅ **Discovery Targeting**: Unchanged  
✅ **Qualification Scoring**: Unchanged  
✅ **Outreach Rules**: Unchanged  
✅ **Follow-up Timing**: Unchanged  
✅ **Email Generation**: Unchanged  
✅ **Autonomous Behavior**: NONE - Display layer only  

---

## Next Steps (Optional)

### When You're Ready (Not Today)
- **Adaptive Follow-ups**: Show personalized follow-up recommendations based on engagement pattern
- **Command Center**: Full dashboard with hottest prospects, pending follow-ups, recommendations
- **Discovery Learning**: Auto-prioritize high-converting categories (requires business approval)

---

## Summary

**You now have 24/7 visibility into what's hot and what's warming up.**

- Prospects sorted by heat score (highest first)
- Composition visible in every lead card
- Timeline shows if prospects are heating up or cooling down
- APIs available for custom dashboards

**No autonomous behavior activated.** Everything is display-only. All intelligence is operational—you just can finally see it clearly.

---

*Activated: 2026-06-13*  
*Feature Flag: HEAT_SCORE_RANKING_ENABLED = true*  
*Status: Production live, display layer only*
