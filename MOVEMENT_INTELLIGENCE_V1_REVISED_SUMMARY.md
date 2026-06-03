# MOVEMENT INTELLIGENCE V1 - REVISED APPROACH

## THE CRITICAL CHANGE

**Before**: Couple movement intelligence to discovery (modify discover/route.ts)
**After**: Completely read-only overlay that never touches discovery

---

## THE NEW ARCHITECTURE

```
DISCOVERY SYSTEM (UNCHANGED)
  Search Solicitors in London
  ↓
  Discover 5 businesses
  ↓
  Store in database
  ↓
  Return to dashboard
  
  [NO SIDE EFFECTS, NO MOVEMENT INTELLIGENCE WRITES]

DASHBOARD (ENHANCED)
  View 5 discovered leads
  ↓
  User clicks: "Show Movements" toggle (NEW)
  ↓
  For each lead:
    - Read: business_category
    - Call: getMovementsForBusiness() [pure function]
    - Display: LeadMovementView overlay
  ↓
  Shows possible movements with "First Question to Ask"
  ↓
  User clicks "Hide Movements" → back to normal view
  
  [NO DATABASE WRITES, NO SIDE EFFECTS]
```

---

## WHAT GETS BUILT

### 1. `lib/movement-intelligence.ts` (~300-400 lines)

```typescript
export function getMovementsForBusiness(businessCategory: string): MovementDefinition[] {
  if (businessCategory.includes("Solicitor")) {
    return [
      {
        type: "Court Filing Documents",
        firstQuestion: "How do urgent court filings currently get to court?",
        whyWeBelieveThis: [
          "Business category: Solicitor",
          "Likely litigation practice",
          "Multi-office operation (estimated)"
        ],
        trigger: "Legal deadline",
        frequency: { estimate: "10-20/month", typical_min: 10, typical_max: 20 },
        courierValuePerMove: { low: 150, high: 250 },
        estimatedMonthlyValue: { low: 1500, high: 5000 },
        recommendedAction: "CALL_TODAY",
        confidenceNote: "This is a sales hypothesis based on category, not confirmed by actual company data."
      },
      {
        type: "Signed Legal Contracts",
        firstQuestion: "When contracts are signed, how quickly does the other party receive them?",
        // ...
      },
      // ...
    ];
  }
  // ... more categories
}
```

**Key**: Pure function, no database access, no side effects.

---

### 2. `components/LeadMovementView.tsx` (~200-250 lines)

```typescript
export function LeadMovementView({ lead, movements }: Props) {
  return (
    <div className="movement-overlay">
      <h2>{lead.business_name}</h2>
      <h3>POSSIBLE MOVEMENTS</h3>
      
      {movements.map(movement => (
        <div key={movement.type} className="movement-card">
          <h4>{movement.type}</h4>
          
          <div className="first-question">
            <strong>First Question to Ask:</strong>
            <p>{movement.firstQuestion}</p>
          </div>
          
          <div className="confidence">
            <strong>Why We Think This Might Apply:</strong>
            <ul>
              {movement.whyWeBelieveThis.map(reason => (
                <li key={reason}>✓ {reason}</li>
              ))}
            </ul>
          </div>
          
          <div className="trigger">
            <strong>Trigger:</strong> {movement.trigger}
          </div>
          
          <div className="frequency">
            <strong>Frequency:</strong> {movement.frequency.estimate}
            <br />
            <small>Value per move: £{movement.courierValuePerMove.low}-{movement.courierValuePerMove.high}</small>
            <br />
            <strong>Estimated monthly: £{movement.estimatedMonthlyValue.low}-{movement.estimatedMonthlyValue.high}</strong>
          </div>
          
          <div className="action">
            <strong>Recommended:</strong> {movement.recommendedAction}
          </div>
          
          <div className="disclaimer">
            <em>{movement.confidenceNote}</em>
          </div>
          
          <div className="buttons">
            <button onClick={() => onCall(movement)}>CALL</button>
            <button onClick={() => onEmail(movement)}>EMAIL</button>
            <button onClick={() => onSkip(movement)}>SKIP</button>
          </div>
        </div>
      ))}
      
      <button onClick={onHide}>Hide Movements</button>
    </div>
  );
}
```

**Key**: Read-only presentation, no database access, no writes.

---

### 3. `app/dashboard/admin/b2b/page.tsx` (~5 lines modified)

```typescript
// Add state
const [showMovements, setShowMovements] = useState(false);

// In render:
{showMovements ? (
  <LeadMovementView 
    lead={lead} 
    movements={getMovementsForBusiness(lead.business_category)}
    onHide={() => setShowMovements(false)}
  />
) : (
  <ExistingLeadDisplay lead={lead} /> // UNCHANGED
)}

// Add button
<button onClick={() => setShowMovements(true)}>Show Movements</button>
```

**Key**: Additive only, doesn't change existing view.

---

## WHAT DOES NOT CHANGE

✅ **Discovery system** — Completely untouched  
✅ **Lead creation** — Completely untouched  
✅ **Lead storage** — Completely untouched  
✅ **Database schema** — Completely untouched  
✅ **Dispatch system** — Completely untouched  
✅ **Jobs/Drivers/Earnings** — Completely untouched  
✅ **Existing B2B dashboard view** — Completely untouched  

---

## RISK ASSESSMENT

| Aspect | Risk | Reason |
|--------|------|--------|
| Discovery system | **ZERO** | No changes whatsoever |
| Database | **ZERO** | Read-only layer only, no writes |
| Schema | **ZERO** | No changes, no migrations |
| Production | **MINIMAL** | Pure overlay, can hide with toggle |
| Rollback | **INSTANT** | Remove 2-3 imports, done |

**Overall**: **SAFE TO DEPLOY IMMEDIATELY**

---

## HOW IT WORKS

### Morning: Sales team uses it

```
1. Open B2B dashboard
2. Click "Show Movements" 
3. See:
   "WILSON SOLICITORS
    
    COURT FILING DOCUMENTS
    
    First Question to Ask:
    How do urgent court filings currently get to court?
    
    Why We Believe This:
    ✓ Solicitor (category)
    ✓ Litigation practice (inferred)
    ✓ Multi-office operation (inferred)
    
    Trigger: Legal deadline
    Frequency: 10-20/month
    Estimated monthly value: £1,500-£5,000
    
    Confidence: Sales hypothesis, not confirmed data.
    
    [CALL] [EMAIL] [SKIP]"

4. Sales person calls: 
   "How do urgent court filings currently get to court?"
   
5. Real conversation starts about real problem

6. Result: Better conversion rate on trial offers
```

---

## SUCCESS METRIC

**Not**: "We built a movement intelligence system"  
**But**: "We discovered 50 solicitors. Identified 12 court filing opportunities. Called 12. Got 3 trials. Converted 1 to standing order customer. That's £2,000-£5,000/month recurring."

---

## APPROVAL GATES

✓ No schema changes  
✓ No Prisma changes  
✓ No database migrations  
✓ No dispatch modifications  
✓ No changes to discovery  
✓ No side effects  
✓ Read-only layer only  
✓ Instant rollback capability  
✓ Safe to test in production with feature flag if needed  

---

## FINAL PRINCIPLE

**Protect what's working.**

Discovery is finally working. Don't touch it.

Build the new feature as an isolated read-only layer.

Test in a Neon child branch first.

Deploy with minimal risk.

Validate the concept quickly.

Then expand if it works.

