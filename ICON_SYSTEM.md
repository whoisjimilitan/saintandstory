# Icon System Specification

**Authoritative source for icon governance across Saint & Story.**

**Purpose:** Prevent icon library fragmentation, emoji creep, and visual inconsistency.

---

## APPROVED ICON LIBRARY

### Primary System: Lucide

**Why Lucide:**
- Minimalist, outline-based design
- Consistent stroke weight (2px)
- Premium aesthetic (not playful)
- Extensive icon set
- Perfect for operational interfaces
- Pairs naturally with brand typography

**Installation:**
```bash
npm install lucide-react
```

**Usage:**
```tsx
import { MapPin, Clock, AlertCircle } from "lucide-react";

<MapPin size={20} strokeWidth={2} />
```

**Size and Stroke Weight:**
- Stroke width: 2px (locked, never change)
- Icon sizes: 16px, 20px, 24px only
- Responsive: use `size={20}` instead of `className="w-5 h-5"`

---

## SECONDARY SYSTEM (If Lucide Insufficient)

### Radix Icons

**Use only if Lucide lacks specific icon.**

Requirements:
- Same stroke weight as Lucide (consistent pairing)
- Same visual weight
- Verify icon exists in Lucide first (likely does)
- Never add without documenting the exception

**Installation:**
```bash
npm install @radix-ui/react-icons
```

---

## PROHIBITED SYSTEMS

❌ Emojis (any context)  
❌ Emoji-style illustrations (Apple, Google, etc.)  
❌ Font Awesome (too heavy, inconsistent weight)  
❌ Feather Icons (no longer maintained)  
❌ Custom SVG icon systems (creates fragmentation)  
❌ Playful icon sets (Doodle, Kawaii, Cartoon)  
❌ Color-filled icon sets (use outline only)  

---

## ICON COLORS

### Rule: Icons Inherit Text Color

Icons are visual support, not accent elements.

Default behavior:
```tsx
<MapPin className="text-[#0D0D0D]" />  // Operational (dark)
<MapPin className="text-[#888888]" />  // Muted
<MapPin className="text-white" />      // Light background
```

### State-Based Colors (Minimal Use)

Green (operational success only):
```tsx
<CheckCircle className="text-green-500" />  // "Complete" or "Active"
```

Red (error/warning only):
```tsx
<AlertCircle className="text-red-500" />  // Validation errors
```

**Rule:** If you're using an icon color outside of text color or {green, red}, you're decoration. Remove it.

### Prohibited Icon Colors

❌ Purple  
❌ Gold  
❌ Blue  
❌ Orange  
❌ Multi-color icons  
❌ Gradient icons  
❌ Rainbow icon palettes  

---

## ICON SIZES

**Only these sizes:**

| Size | Use Case | CSS |
|------|----------|-----|
| 16px | Label icons, badges | `size={16}` |
| 20px | Standard UI, buttons | `size={20}` |
| 24px | Headlines, prominent | `size={24}` |
| 32px | Feature highlights | `size={32}` |

Never:
- 14px (too small, blurry)
- 18px (in-between, ambiguous)
- 28px (odd sizing)
- Custom sizes

---

## ICON USAGE PATTERNS

### Pattern 1: Supporting Text (Most Common)

```tsx
<div className="flex items-center gap-2">
  <MapPin size={16} className="text-[#888888]" />
  <span className="text-xs text-[#888888]">London, UK</span>
</div>
```

Icon supports understanding. Text is primary.

### Pattern 2: Button Icon

```tsx
<button className="flex items-center gap-2 px-4 py-2">
  <Plus size={20} className="text-[#0D0D0D]" />
  <span>Add Job</span>
</button>
```

Icon prepends action text. Never icon-only buttons without tooltip.

### Pattern 3: Status Icon

```tsx
<div className="flex items-center gap-2">
  <CheckCircle size={20} className="text-green-500" />
  <span className="text-sm">Confirmed</span>
</div>
```

Green pulse only for LocationIndicator. Other status: use text + small icon.

### Pattern 4: Navigation Icon

```tsx
<Link href="/dashboard/driver" className="flex items-center gap-3">
  <MapPin size={20} className="text-[#0D0D0D]" />
  <span>Active Jobs</span>
</Link>
```

Icon supports navigation label. Text is discoverable.

### Pattern 5: Empty State Icon (Minimal Use)

```tsx
<div className="text-center">
  <Inbox size={32} className="text-[#E8E8E8] mx-auto mb-4" />
  <p className="text-[#888888]">No jobs yet</p>
</div>
```

Icon size: 32px. Color: border gray (#E8E8E8). Secondary to text.

---

## PROHIBITED USAGE

❌ Icon-only buttons (without text or tooltip)  
❌ Icons as decoration (removable without clarity loss)  
❌ Spinning/animated icons (except loading spinners)  
❌ Color-coded icon systems (use text, not icon color)  
❌ Oversized icons (creates visual noise)  
❌ Multiple icon sources in one component  
❌ Emoji icons (use Lucide)  
❌ Custom-drawn icons (creates fragmentation)  
❌ Icon libraries mixed within same screen  

---

## APPROVED ICONS (Common Uses)

| Icon | Use | Library |
|------|-----|---------|
| MapPin | Location, navigation | Lucide |
| Clock | Time, duration, timeframe | Lucide |
| AlertCircle | Warnings, validation | Lucide |
| CheckCircle | Confirmation, complete | Lucide |
| ArrowRight | Action, next step | Lucide |
| Menu | Navigation toggle | Lucide |
| X | Close, dismiss | Lucide |
| Plus | Add, create | Lucide |
| Settings | Configuration | Lucide |
| User | Profile, account | Lucide |
| Phone | Contact, call | Lucide |
| Mail | Email, messaging | Lucide |
| Inbox | Messages, notifications | Lucide |
| Calendar | Date, scheduling | Lucide |
| DollarSign | Price, cost, earnings | Lucide |

---

## IMPLEMENTATION CHECKLIST

Before using an icon in code:

- [ ] Icon exists in Lucide
- [ ] Icon size is 16px, 20px, 24px, or 32px
- [ ] Icon color is inherited (text color or green/red for state)
- [ ] Icon supports text (not standalone decoration)
- [ ] Icon is removable test: would removing it confuse users?
- [ ] No icon libraries mixed in this component
- [ ] No custom SVG icons

---

## DRIFT PREVENTION

Every 4 weeks, scan codebase for:

1. Non-Lucide icons: `grep -r "fa-\|Material\|Font\|emoji" src/`
2. Prohibited sizes: `grep -r "w-\[17\|18\|28\|36\]" src/`
3. Prohibited colors: `grep -r "text-purple\|text-blue\|text-gold" src/`
4. Icon-only buttons: `grep -r "<button.*{.*Icon.*</button>"` (requires manual review)

If drift detected:
1. Identify component
2. Replace with Lucide + approved size
3. Document in COMPONENT_CATALOG.md if new pattern
4. Audit similar components for same drift

---

## Exceptions

If Lucide lacks a critical icon:

1. Check Radix Icons
2. If still missing, document exception in COMPONENT_CATALOG.md
3. Never add custom SVG without governance review
4. Consider if icon is necessary (usually icons are decoration when Lucide lacks them)

Exception approval:
- Required if icon communicates operational state
- Rejected if icon is decoration
