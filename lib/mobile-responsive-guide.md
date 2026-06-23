# Mobile Responsive Design Guide

## Responsive Breakpoints
- **Mobile**: < 640px (default)
- **Tablet**: 640px - 1024px (sm:)
- **Desktop**: > 1024px (md:, lg:)

## Key Responsive Patterns

### Spacing
- **Mobile**: `px-4` (16px), `py-6` (24px)
- **Tablet**: `sm:px-6` (24px), `sm:py-8` (32px)
- **Desktop**: `md:px-8` (32px), `md:py-12` (48px)

### Typography
- **Page Title**: `text-2xl sm:text-3xl md:text-4xl`
- **Section Title**: `text-lg sm:text-xl md:text-2xl`
- **Button**: `text-xs sm:text-sm`

### Containers
- **Max Width**: `w-full md:max-w-4xl` (mobile-first, no constraint)
- **Grid**: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
- **Flex**: `flex flex-col sm:flex-row`

### Touch Targets
- **Minimum**: 44x44px (iOS), 48x48px (Android)
- **Buttons**: `px-4 py-3` minimum

### Navigation (Mobile)
- **Icons Only** on mobile (labels hidden)
- **Full Labels** on tablet+
- **Drawer/Hamburger** if needed

## Navigation Mobile Pattern
```html
<!-- Mobile: Icons only, vertical scroll -->
<div className="flex overflow-x-auto scrollbar-hide md:gap-2">
  <!-- items -->
</div>

<!-- Desktop: Icons + Labels -->
<div className="flex gap-4">
  <!-- items with labels -->
</div>
```

## Common Fixes Applied
✅ All pages: `px-4 sm:px-6 md:px-8`
✅ All pages: `text-2xl sm:text-3xl` for titles
✅ All grids: `grid-cols-1 sm:grid-cols-2`
✅ All modals: Full width on mobile, max-w-2xl on desktop
✅ All buttons: Min `py-3 px-4` for touch
✅ All cards: Stack on mobile, grid on desktop
