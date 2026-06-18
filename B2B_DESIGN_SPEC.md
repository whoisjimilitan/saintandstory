# B2B Dashboard Design Specification

**Status:** NON-NEGOTIABLE LOCKED STANDARD  
**Valid From:** 2026-06-18  
**Authority:** User  
**Last Updated:** 2026-06-18

This is the design standard for all B2B dashboard routes, discovery pages, and operator interfaces. **No exceptions.** Do not propose variations or alternatives. This specification is final.

---

## QUICK REFERENCE

### Fonts
- **Body:** Inter (Google Fonts)
- **Emphasis:** Cormorant Garamond (Google Fonts)

### Color Palette
| Use | Color | Hex |
|-----|-------|-----|
| Primary Text | Deep Black | #0D0D0D |
| Labels | Light Gray | #888888 |
| Supporting | Medium Gray | #666666 |
| Borders | Border Gray | #E8E8E8 |
| Backgrounds | Surface Gray | #F5F5F5 |
| Error | Error Red | #DC2626 |
| Warning | Amber | #F59E0B |
| Links | Brand Blue | #0A66C2 |

### Container
```
className="px-6 py-10 max-w-3xl mx-auto"
```

### Page Title
```
className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight"
```

### Section Label
```
className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]"
```

### Large Metric
```
className="text-5xl font-black text-[#0D0D0D]"
```

### Supporting Text
```
className="text-sm text-[#666666]"
```

---

## SPACING

| Unit | Value | Use |
|------|-------|-----|
| Major sections | mb-16 | Between large sections |
| Subsections | mb-12 | Between related groups |
| Minor sections | mb-8 | Within groups |
| List spacing | space-y-3 or space-y-6 | Between items |
| Padding | px-6 py-10 | Container |
| Card padding | p-6 | Inside blocks |

---

## PATTERNS

### Status Card (Error/Warning)
```jsx
<div className="pl-4 border-l-4 border-[#DC2626] bg-[#FFF5F5] p-6">
  {/* content */}
</div>
```

### Semantic Bar
```jsx
<div className="w-full bg-[#F5F5F5] rounded h-8">
  <div
    className={`h-full ${isBottom ? 'bg-[#888888]' : 'bg-[#0D0D0D]'}`}
    style={{ width: `${percentage}%` }}
  />
</div>
```

### Navigation Pills
```jsx
<div className="flex gap-2 mb-12">
  <Link className="...border border-[#E8E8E8]...">Nav Item</Link>
</div>
```

---

## FORBIDDEN

❌ Do NOT use:
- Colored cards or containers
- Gradients
- Badges
- Icons in UI
- Grid layouts
- Drop shadows
- Multiple background colors
- Decorative elements
- Serif fonts for body
- New colors
- New fonts

---

## EXAMPLES

See code examples in repo:
- `/dashboard/admin/b2b/page.tsx` (Briefing)
- `/dashboard/admin/b2b/pipeline/page.tsx` (Pipeline)
- `/dashboard/admin/b2b/orders/page.tsx` (Orders)

Commit: `c13ae3b` (v2.0-b2b-stable)

---

## VALIDATION CHECKLIST

Before deploying any B2B component:

- [ ] Uses only locked fonts (Inter/Cormorant)
- [ ] Uses only locked colors
- [ ] Uses locked spacing rhythm
- [ ] No cards, grids, or badges
- [ ] Left-border + background for status
- [ ] Typography hierarchy (size/weight, not color)
- [ ] Follows reference code patterns
- [ ] Container is px-6 py-10 max-w-3xl mx-auto

**Fail any item → do not deploy.**

---

For full details, see `B2B_DESIGN_SYSTEM_LOCKED.md` in memory.
