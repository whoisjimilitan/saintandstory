# RESTORE POINT: If James Disappears for 30 Days

**For the person who returns to this project cold**

---

## WHAT IS THIS PROJECT?

Saint & Story is a concierge moving company. James (admin) controls job matching. The B2B pressure intelligence system helps James identify which businesses might buy recurring standing-order services (predictable delivery contracts).

---

## WHERE DO WE STAND?

**Phase 1 Complete**: ✅ Pressure detection system is working and validated

- Built a system that identifies businesses under operational pressure (not explicit pain)
- Tested on 20 Manchester florists
- Ranked them by conversation potential (high/medium/low)
- Generated opening questions for each
- Validated approach beats previous keyword/pain detection methods

**Status**: Ready for James to call the businesses and have conversations

---

## WHAT WAS LEARNED?

**Key Discovery**: Florist reviews are 4.5-5 stars (no complaints), but owner involvement in every order + complexity + seasonal peaks = operational pressure. This pressure is the buying signal, not pain.

**Framework**: 
- Tier 1 (Pressure): Seasonal peaks, wedding complexity, last-minute demand, high volume, speed expectations
- Tier 2 (Constraints): Owner dependent, manual coordination, creative workarounds, limited team
- Tier 3 (Failures): Only look here if Tier 1+2 confirmed

**What Works**:
- Detecting owner involvement (named in reviews)
- Detecting multi-component work (weddings)
- Detecting seasonal pressure (mentioned in context of success)
- Generating focused questions (one question per business, not five)
- Ranking by conversation potential (high/medium/low, not scores)

**What Doesn't Work**:
- ❌ Keyword matching ("delivery" = both praise and complaint)
- ❌ Pain detection (waiting for complaints misses opportunities)
- ❌ Numerical scores (fake precision, can't be explained)
- ❌ Proposals before conversations (guessing at problems)

---

## WHAT SHOULD HAPPEN NEXT?

**Phase 2 (2-4 weeks)**:

1. James calls the high-potential businesses (Northern Flower, Flower Lounge, Flower Potts)
2. He asks the opening question provided by the system
3. He records what he learns
4. We measure: Were our hypotheses correct? Did questions lead to conversations? What % converted?

**Then**: Based on outcomes, refine system and expand to other niches (restaurants, retailers, etc.)

**Do NOT**:
- ❌ Build more features without validation
- ❌ Generate proposals before conversations
- ❌ Create scoring systems
- ❌ Automate outreach

---

## HOW TO TEST IT

```bash
curl http://localhost:3000/api/validate/report?query=florist&location=Manchester
```

Returns JSON with 10 businesses ranked by conversation potential. Each includes:
- Business name, rating, review count
- Pressure hypotheses (what we think is creating operational load)
- Constraint hypotheses (what limits scaling)
- First question to ask
- Why this business ranks where it does

---

## KEY FILES

**To Understand**:
- `docs/PHASE_1_SUMMARY.md` - 5-minute overview
- `docs/DECISIONS.md` - Why we did things this way
- `docs/PRESSURE_FRAMEWORK.md` - The detection model

**To Implement**:
- `lib/revelatory-engine.ts` - Core analysis
- `app/api/validate/report/route.ts` - Validation endpoint

**To Extend**:
- `docs/NEXT_STEPS.md` - What to build when
- `docs/LEARNINGS.md` - What we discovered

---

## ASSUMPTIONS THAT MUST BE TESTED

1. **Pressure detection works**: High-pressure businesses want standing orders
   - Test: Do high-potential businesses convert?

2. **Questions work**: First question opens conversation
   - Test: % of called businesses that answer substantively

3. **Framework generalizes**: Works beyond florists
   - Test: Run on restaurants/retailers, same patterns?

4. **Owner mentions = signal**: Named involvement predicts opportunity
   - Test: Confirmed in conversations?

All of Phase 2 is testing these assumptions.

---

## IF THINGS ARE BROKEN

**System not running**:
- Check `GOOGLE_MAPS_API_KEY` env var is set
- Rebuild: `npm run build`
- Restart dev: `npm run dev`

**Results don't look right**:
- Read `VALIDATION_BASELINE.md` - explains how we got here
- Compare to florist validation results in docs
- Run research endpoint if debugging: `/api/research/florist-evidence`

**Need to change detection logic**:
- Edit `lib/revelatory-engine.ts`
- Follow the Tier 1 / Tier 2 / Tier 3 structure in `PRESSURE_FRAMEWORK.md`
- Remember: Evidence stays permanent, conclusions are temporary

---

## IF YOU'RE EXTENDING THIS

**Adding a new niche**:
1. Run validation on that niche
2. Compare patterns to florist baseline (docs/LEARNINGS.md)
3. Identify what's same, what's different
4. Document findings in LEARNINGS.md

**Improving questions**:
1. Understand PRESSURE_FRAMEWORK.md
2. Edit revelatory-engine.ts
3. Test with validation endpoint
4. Validate James gets better conversation outcomes

**Building Phase 2 (conversation tracking)**:
1. Read NEXT_STEPS.md section 2.1
2. Create conversations table in database
3. Add API endpoint for storing conversation notes
4. Add to dashboard

---

## THE CORE PRINCIPLE

**Evidence compounds. Interpretations expire.**

- Store facts (review snippets, business info) → permanent
- Build hypotheses from facts → temporary
- Test hypotheses through conversation → validation
- Update knowledge based on validation → improve system

Never store conclusions. Always store evidence. Always build conclusions from current evidence.

This is the difference between a system that improves and one that decays.

---

## ONE LAST THING

This project will only succeed if James actually calls the businesses and learns what they need.

The system's job is to help him learn, not to replace his judgment.

Every hypothesis needs validation. Every assumption needs testing.

Until James talks to people, we're just pattern-matching. After James talks to people, we're learning.

Go have conversations.
