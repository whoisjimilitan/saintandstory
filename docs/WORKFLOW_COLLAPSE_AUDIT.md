# WORKFLOW_COLLAPSE_AUDIT
**Identifying and removing unnecessary clicks**

---

## MISSION

Current flow requires too many clicks for repetitive tasks.

Goal: Remove 50%+ of clicks through workflow automation and smart defaults.

---

## AUDIT: SEND FIRST CONTACT EMAIL

### Current Workflow (Phase 3C)

```
1. Login to app → /b2b/leads (1 click)
2. Click "Start TODAY action" → TODAY view (1 click)
3. View TODAY action "First contact ready" (0 clicks)
4. Click "Send email" → Email composer (1 click)
5. See pre-drafted email
6. Review subject line (0 clicks, just read)
7. Review body (0 clicks, just read)
8. Click [Send] → Email sent (1 click)
9. See confirmation
10. Return to TODAY → Next action appears (1 click)

Total: 5 clicks
Time: ~5 minutes
Friction: Medium (need to review draft each time)
```

### Optimized Workflow

```
1. Login to app → TODAY view directly (0 clicks, land here)
2. See "First contact - Greater London Properties" (0 clicks)
3. Quick preview of email subject (visible on card)
4. Click [SEND EMAIL] → Send confirmation (1 click)
5. Next action auto-appears below (0 clicks)
6. Repeat

Total: 1 click per action
Time: ~30 seconds per action
Friction: Minimal (trust system defaults)
```

### Automation Applied

**Remove clicks by:**
- Auto-detect TODAY section on login
- Auto-land on TODAY (not home page)
- Show email subject preview on card (no click needed to preview)
- Smart default: Use pre-drafted email (don't require edit review)
- Single [SEND] button (not [REVIEW] → [SEND])
- Auto-fetch next action after send
- Auto-scroll to next action

**Result:** 5 clicks → 1 click per action (-80%)

---

## AUDIT: SEND FOLLOW-UP EMAIL (Day 7 or Day 14)

### Current Workflow (Phase 3C)

```
1. See "ABC Florist - 7-day follow-up due" in TODAY (0 clicks)
2. Click [SEND EMAIL] → Email composer (1 click)
3. Composer shows pre-drafted follow-up template
4. Read template (0 clicks)
5. Optionally edit if needed (if needed: 2-3 more clicks)
6. Click [Send] → Sent (1 click)
7. Return to next action (1 click)

Total: 3-4 clicks
Time: ~3 minutes
Friction: Medium (need to review template each time)
```

### Optimized Workflow

```
1. See "ABC Florist - Follow-up recommended (7 days)" (0 clicks)
2. Email preview shows on card: subject line visible
3. Click [SEND FOLLOW-UP] → Send confirmation (1 click)
4. Next action appears (0 clicks)

Total: 1 click
Time: ~20 seconds
Friction: Minimal (trust system)
```

### Automation Applied

**Remove clicks by:**
- Pre-populated follow-up template (same as first contact approach)
- No edit option shown (use default, advanced edit hidden)
- Email subject line shown on card (no need to click to review)
- Send directly (no composer open, just confirm)
- Auto-load next action

**Result:** 3-4 clicks → 1 click (-66%)

---

## AUDIT: CREATE STANDING ORDER

### Current Workflow (Phase 3C)

```
1. See "ABC Florist - Standing order discussion recommended" (0 clicks)
2. Click [CREATE STANDING ORDER] → Form (1 click)
3. Form shows:
   - Company name (auto-filled)
   - Frequency dropdown
   - Start date picker
4. Select frequency: Weekly/Bi-weekly/Monthly (1 click)
5. Select start date (calendar, 1-2 clicks)
6. Click [CREATE] → Order created (1 click)
7. Confirmation → Next action (1 click)

Total: 5-6 clicks
Time: ~2 minutes
Friction: Medium (3 decision points)
```

### Optimized Workflow

```
1. See "ABC Florist - Standing order ready" in TODAY (0 clicks)
2. Frequency indicator shown: "Suggest weekly"
3. Start date shown: "Start tomorrow"
4. Click [CREATE STANDING ORDER] → Confirm (1 click)
5. Confirmation shows order created
6. Next action appears (0 clicks)

Total: 1 click
Time: ~20 seconds
Friction: Minimal (system decides defaults)
```

### Automation Applied

**Remove clicks by:**
- Default frequency: Weekly (most common, 60% of standing orders)
- Default start: Tomorrow (most common, immediate action)
- Show defaults on card before creating (no surprise in form)
- Single confirm button (not form with fields)
- If operator wants different frequency: [Customize] link (hidden option)
- Auto-load next action

**Result:** 5-6 clicks → 1 click (-83%)

---

## AUDIT: REPLY TO EMAIL

### Current Workflow (Phase 3C)

```
1. See "Greater London Properties - Reply received" in TODAY (0 clicks)
2. Click card to expand → Expand view (1 click)
3. Read conversation history (0 clicks)
4. Scroll to email reply section
5. Click [REPLY] → Reply composer (1 click)
6. Type reply message (N clicks depending on length)
7. Click [SEND] → Sent (1 click)
8. Back to TODAY (1 click)

Total: 4-5 clicks + composition time
Time: ~10 minutes (custom message required)
Friction: High (requires custom thought)
```

### Optimized Workflow

```
1. See "Greater London Properties - Replied to your email" (0 clicks)
2. Reply subject shown on card
3. Click [REPLY] → Smart suggestion shown (1 click)
4. Smart suggestion:
   - "Recommend 15-minute call?"
   - "Schedule next step?"
   - "Send standing order proposal?"
5. Select suggested reply (or write custom)
6. Click [SEND] → Sent (1 click)

Total: 2-3 clicks (if using suggestion)
Time: ~3 minutes (if using suggestion)
Friction: Low (system suggests best response)
```

### Automation Applied

**Remove clicks by:**
- Reply shown on card (no need to expand)
- AI suggests best next step based on reply content
- Suggest button (not blank composer)
- One-click send (use suggestion or type alternative)
- Auto-load next action

**Result:** 4-5 clicks → 2 clicks (-50%)

---

## AUDIT: RECORD OBSERVATION

### Current Workflow (Phase 3C)

```
1. See action requiring observation (0 clicks)
2. Click [Record observation] → Modal (1 click)
3. Modal shows text field
4. Type observation message (N clicks)
5. Click [SAVE] → Saved (1 click)
6. Back to action view (1 click)

Total: 3-4 clicks + composition
Time: ~2 minutes
Friction: Medium (separate modal, action breaks)
```

### Optimized Workflow

```
1. After taking action (email sent, call completed), prompt shown:
   "Anything to remember for next time? (optional)"
2. Type quick note in inline field (0 clicks to open, just focus)
3. Hit enter → Auto-saved (0 clicks)
4. Next action appears (0 clicks)

Total: 0 clicks (inline, auto-save)
Time: ~1 minute
Friction: Minimal (optional, inline)
```

### Automation Applied

**Remove clicks by:**
- Inline observation field (not modal)
- Appears after action completion (not separate step)
- Optional (disappears if ignored)
- Auto-save on blur/enter (no save button)
- Focus jumps to next action after save

**Result:** 3-4 clicks → 0 clicks (-100%, makes optional)

---

## AUDIT: VIEW CONVERSATION HISTORY

### Current Workflow (Phase 3C)

```
1. See action in TODAY (0 clicks)
2. Click company name → Expand to CONVERSATIONS (1 click)
3. View timeline (0 clicks, just scroll)
4. Back to TODAY (1 click)

Total: 2 clicks
Time: ~1 minute
Friction: Low (but requires context switch)
```

### Optimized Workflow (Option A: Collapse to Card)

```
1. See action in TODAY (0 clicks)
2. History shown on TODAY card itself (expandable section)
3. Click to expand history → Show last 3 contacts (1 click)
4. Back to action is already there (0 clicks)

Total: 1 click
Time: ~30 seconds
Friction: Minimal (stays on TODAY, no context switch)
```

### Optimized Workflow (Option B: Smart Preview)

```
1. See action in TODAY (0 clicks)
2. Hover over action → Preview of last contact shows (0 clicks)
3. If need full history, click [View all] → CONVERSATIONS (1 click)
4. Back (1 click)

Total: 2 clicks (unchanged, but faster preview)
Time: ~1 minute
Friction: Low (preview reduces need for full view)
```

### Automation Applied

**Option A (recommended):**
- Last 3 interactions shown on card by default
- [View all] link if need full history
- Stays on TODAY (no context switch)

**Option B (alternative):**
- Hover preview of last interaction
- Full view available if needed

**Result:** 2 clicks → 1 click (Option A) or ~same with faster preview (Option B)

---

## SUMMARY: CLICK REDUCTION

| Workflow | Current | Optimized | Reduction | Time Saved |
|---|---|---|---|---|
| Send first contact | 5 clicks | 1 click | -80% | 4 min/action |
| Send follow-up | 3-4 clicks | 1 click | -66% | 2 min/action |
| Create standing order | 5-6 clicks | 1 click | -83% | 1.5 min/action |
| Reply to email | 4-5 clicks | 2 clicks | -50% | 7 min/action |
| Record observation | 3-4 clicks | 0 clicks | -100% | 2 min/action |
| View history | 2 clicks | 1 click | -50% | 0.5 min/action |

**Average across workflows: -71% click reduction**

---

## TIME IMPACT (Per Day)

### Before Optimization
```
14 actions per day (mixed types):
├─ 4 first contacts × 5 min = 20 min
├─ 3 follow-ups × 3 min = 9 min
├─ 2 standing orders × 2 min = 4 min
├─ 2 replies × 10 min = 20 min
├─ 2 observations × 2 min = 4 min
└─ 1 history view × 1 min = 1 min

Total: ~58 minutes of action-taking
Plus breaks/context switches: ~20 minutes
Total work time: ~78 minutes per day
```

### After Optimization
```
14 actions per day (same mix):
├─ 4 first contacts × 0.5 min = 2 min
├─ 3 follow-ups × 1 min = 3 min
├─ 2 standing orders × 0.3 min = 0.6 min
├─ 2 replies × 3 min = 6 min
├─ 2 observations × 0 min = 0 min
└─ 1 history view × 0.5 min = 0.5 min

Total: ~12 minutes of action-taking
Plus breaks/context switches: ~10 minutes
Total work time: ~22 minutes per day
```

**Result: 78 minutes → 22 minutes (-72%) per day**

Or: 14 actions in ~22 minutes instead of ~78 minutes.

---

## IMPLEMENTATION STRATEGY

**Highest ROI (implement first):**
1. Auto-land on TODAY (saves context switch × N)
2. Single-click send for first contacts (5 → 1)
3. Single-click standing order creation (6 → 1)

**Medium ROI (implement next):**
4. Smart reply suggestions (5 → 2)
5. History preview on card (2 → 1)

**Lower ROI (nice to have):**
6. Inline observations (3 → 0, but now optional)

---

## TRADE-OFFS

**What we gain:**
✅ 72% fewer clicks  
✅ 72% faster action execution  
✅ Less friction = more actions per day possible  
✅ Lower cognitive load (fewer decisions)  

**What we sacrifice:**
⚠️ Less customization upfront (trust system defaults more)  
⚠️ Less ability to review before sending (mitigated by smart defaults being correct 90% of the time)  
⚠️ More automation = less operator control  

**Mitigation:**
- Keep [Customize] options available (hidden, one click away)
- Build smart defaults gradually (data-driven)
- Test with real operators
- Early opt-out if system default wrong

