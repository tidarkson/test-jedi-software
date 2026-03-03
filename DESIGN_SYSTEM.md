# TestForge Design System Specification

## Overview

A professional, high-density design system for enterprise Test Management Systems. Optimized for QA engineers and engineering managers who need to process large amounts of test data efficiently.

---

## 1. Color Tokens

### Primary Brand Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--primary-50` | `#EEF2FF` | `#1E1B4B` | Subtle backgrounds |
| `--primary-100` | `#E0E7FF` | `#312E81` | Hover states |
| `--primary-200` | `#C7D2FE` | `#3730A3` | Active states |
| `--primary-300` | `#A5B4FC` | `#4338CA` | Borders |
| `--primary-400` | `#818CF8` | `#4F46E5` | Secondary text |
| `--primary-500` | `#6366F1` | `#6366F1` | Primary actions |
| `--primary-600` | `#4F46E5` | `#818CF8` | Hover on primary |
| `--primary-700` | `#4338CA` | `#A5B4FC` | Active on primary |
| `--primary-800` | `#3730A3` | `#C7D2FE` | Text on dark |
| `--primary-900` | `#312E81` | `#E0E7FF` | Headings |
| `--primary-950` | `#1E1B4B` | `#EEF2FF` | Maximum contrast |

### Neutral Scale (Gray)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--neutral-50` | `#F9FAFB` | `#030712` | Page backgrounds |
| `--neutral-100` | `#F3F4F6` | `#111827` | Card backgrounds |
| `--neutral-150` | `#EBEDF0` | `#1A2332` | Subtle dividers |
| `--neutral-200` | `#E5E7EB` | `#1F2937` | Borders |
| `--neutral-300` | `#D1D5DB` | `#374151` | Disabled borders |
| `--neutral-400` | `#9CA3AF` | `#4B5563` | Placeholder text |
| `--neutral-500` | `#6B7280` | `#6B7280` | Secondary text |
| `--neutral-600` | `#4B5563` | `#9CA3AF` | Body text |
| `--neutral-700` | `#374151` | `#D1D5DB` | Primary text |
| `--neutral-800` | `#1F2937` | `#E5E7EB` | Headings |
| `--neutral-900` | `#111827` | `#F3F4F6` | Strong headings |
| `--neutral-950` | `#030712` | `#F9FAFB` | Maximum contrast |

### Semantic Colors

#### Success (Green)
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--success-50` | `#F0FDF4` | `#052E16` |
| `--success-100` | `#DCFCE7` | `#14532D` |
| `--success-500` | `#22C55E` | `#22C55E` |
| `--success-600` | `#16A34A` | `#4ADE80` |
| `--success-700` | `#15803D` | `#86EFAC` |

#### Warning (Amber)
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--warning-50` | `#FFFBEB` | `#451A03` |
| `--warning-100` | `#FEF3C7` | `#78350F` |
| `--warning-500` | `#F59E0B` | `#F59E0B` |
| `--warning-600` | `#D97706` | `#FBBF24` |
| `--warning-700` | `#B45309` | `#FCD34D` |

#### Error (Red)
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--error-50` | `#FEF2F2` | `#450A0A` |
| `--error-100` | `#FEE2E2` | `#7F1D1D` |
| `--error-500` | `#EF4444` | `#EF4444` |
| `--error-600` | `#DC2626` | `#F87171` |
| `--error-700` | `#B91C1C` | `#FCA5A5` |

#### Info (Blue)
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--info-50` | `#EFF6FF` | `#172554` |
| `--info-100` | `#DBEAFE` | `#1E3A8A` |
| `--info-500` | `#3B82F6` | `#3B82F6` |
| `--info-600` | `#2563EB` | `#60A5FA` |
| `--info-700` | `#1D4ED8` | `#93C5FD` |

### Surface Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--surface-base` | `#FFFFFF` | `#0F172A` | Main content area |
| `--surface-raised` | `#FFFFFF` | `#1E293B` | Cards, modals |
| `--surface-overlay` | `#FFFFFF` | `#334155` | Dropdowns, popovers |
| `--surface-sunken` | `#F9FAFB` | `#020617` | Inset areas |
| `--surface-disabled` | `#F3F4F6` | `#1E293B` | Disabled elements |

---

## 2. Typography System

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

### Type Scale

| Token | Size | Line Height | Letter Spacing | Usage |
|-------|------|-------------|----------------|-------|
| `--text-xs` | 11px | 16px (1.45) | 0.01em | Micro labels, timestamps |
| `--text-sm` | 12px | 18px (1.5) | 0.005em | Table cells, metadata |
| `--text-base` | 13px | 20px (1.54) | 0 | Body text, inputs |
| `--text-md` | 14px | 22px (1.57) | 0 | Emphasized body |
| `--text-lg` | 16px | 24px (1.5) | -0.01em | Section headers |
| `--text-xl` | 18px | 28px (1.56) | -0.015em | Card titles |
| `--text-2xl` | 20px | 30px (1.5) | -0.02em | Page section titles |
| `--text-3xl` | 24px | 32px (1.33) | -0.025em | Page titles |
| `--text-4xl` | 30px | 36px (1.2) | -0.03em | Hero headings |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Labels, buttons, table headers |
| `--font-semibold` | 600 | Subheadings, emphasis |
| `--font-bold` | 700 | Headings, strong emphasis |

### Code Typography

```css
--code-font-size: 12px;
--code-line-height: 20px;
--code-letter-spacing: -0.01em;
```

---

## 3. Spacing System (4px Base Grid)

| Token | Value | Pixels |
|-------|-------|--------|
| `--spacing-0` | 0 | 0px |
| `--spacing-px` | 1px | 1px |
| `--spacing-0.5` | 0.125rem | 2px |
| `--spacing-1` | 0.25rem | 4px |
| `--spacing-1.5` | 0.375rem | 6px |
| `--spacing-2` | 0.5rem | 8px |
| `--spacing-2.5` | 0.625rem | 10px |
| `--spacing-3` | 0.75rem | 12px |
| `--spacing-3.5` | 0.875rem | 14px |
| `--spacing-4` | 1rem | 16px |
| `--spacing-5` | 1.25rem | 20px |
| `--spacing-6` | 1.5rem | 24px |
| `--spacing-7` | 1.75rem | 28px |
| `--spacing-8` | 2rem | 32px |
| `--spacing-9` | 2.25rem | 36px |
| `--spacing-10` | 2.5rem | 40px |
| `--spacing-11` | 2.75rem | 44px |
| `--spacing-12` | 3rem | 48px |
| `--spacing-14` | 3.5rem | 56px |
| `--spacing-16` | 4rem | 64px |

---

## 4. Border Radius, Shadows & Elevation

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Sharp corners |
| `--radius-xs` | 2px | Badges, small tags |
| `--radius-sm` | 4px | Buttons, inputs, chips |
| `--radius-md` | 6px | Cards, dropdowns |
| `--radius-lg` | 8px | Modals, larger cards |
| `--radius-xl` | 12px | Feature cards |
| `--radius-2xl` | 16px | Hero sections |
| `--radius-full` | 9999px | Pills, avatars |

### Shadows (Light Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle depth |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Buttons, inputs |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` | Cards |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | Dropdowns |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)` | Modals |
| `--shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.25)` | Floating panels |
| `--shadow-inner` | `inset 0 2px 4px rgba(0,0,0,0.06)` | Inset inputs |

### Shadows (Dark Mode)

| Token | Value |
|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.3)` |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)` |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)` |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.3)` |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.3)` |

### Elevation Layers

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | 0 | Page content |
| Raised | 10 | Cards, sections |
| Dropdown | 50 | Menus, selects |
| Sticky | 100 | Sticky headers |
| Modal | 200 | Dialogs |
| Popover | 300 | Popovers, tooltips |
| Toast | 400 | Notifications |
| Maximum | 9999 | Critical overlays |

---

## 5. Component Specifications

### Button (5 Variants)

#### Size Tokens

| Size | Height | Padding X | Font Size | Icon Size |
|------|--------|-----------|-----------|-----------|
| `xs` | 24px | 8px | 11px | 14px |
| `sm` | 28px | 10px | 12px | 14px |
| `md` | 32px | 12px | 13px | 16px |
| `lg` | 36px | 16px | 14px | 18px |
| `xl` | 44px | 20px | 15px | 20px |

#### Variants

**1. Primary (Solid)**
```
Background: var(--primary-500)
Text: white
Hover: var(--primary-600)
Active: var(--primary-700)
Focus Ring: var(--primary-500) with 3px offset
```

**2. Secondary (Outline)**
```
Background: transparent
Border: 1px solid var(--neutral-300)
Text: var(--neutral-700)
Hover Background: var(--neutral-100)
Active Background: var(--neutral-200)
```

**3. Ghost**
```
Background: transparent
Text: var(--neutral-600)
Hover Background: var(--neutral-100)
Active Background: var(--neutral-200)
```

**4. Danger**
```
Background: var(--error-500)
Text: white
Hover: var(--error-600)
Active: var(--error-700)
```

**5. Success**
```
Background: var(--success-500)
Text: white
Hover: var(--success-600)
Active: var(--success-700)
```

### Input

| Property | Value |
|----------|-------|
| Height | 32px (sm), 36px (md), 40px (lg) |
| Padding X | 10px |
| Border | 1px solid var(--neutral-300) |
| Border Radius | var(--radius-sm) |
| Font Size | 13px |
| Background | var(--surface-base) |
| Focus Border | var(--primary-500) |
| Focus Ring | 0 0 0 3px var(--primary-100) |
| Error Border | var(--error-500) |
| Disabled Background | var(--surface-disabled) |
| Placeholder Color | var(--neutral-400) |

### Select

Same base styles as Input, plus:
| Property | Value |
|----------|-------|
| Dropdown Shadow | var(--shadow-lg) |
| Option Padding | 8px 12px |
| Option Hover | var(--neutral-100) |
| Selected Option | var(--primary-50) with var(--primary-600) text |
| Max Height | 256px (scrollable) |

### Checkbox

| Property | Value |
|----------|-------|
| Size | 16px |
| Border | 1px solid var(--neutral-400) |
| Border Radius | 3px |
| Checked Background | var(--primary-500) |
| Checkmark | white, 2px stroke |
| Focus Ring | 0 0 0 3px var(--primary-100) |
| Disabled Opacity | 0.5 |

### Badge

| Size | Height | Padding X | Font Size |
|------|--------|-----------|-----------|
| `sm` | 18px | 6px | 10px |
| `md` | 22px | 8px | 11px |
| `lg` | 26px | 10px | 12px |

Variants: `default`, `success`, `warning`, `error`, `info`, `neutral`

### Tag

| Property | Value |
|----------|-------|
| Height | 24px |
| Padding | 4px 8px |
| Border Radius | var(--radius-full) |
| Font Size | 12px |
| Font Weight | 500 |
| With Remove Button | +20px width, 14px icon |

### Table

| Property | Value |
|----------|-------|
| Header Height | 36px |
| Row Height | 40px (default), 32px (compact), 48px (comfortable) |
| Header Background | var(--neutral-50) |
| Header Font | 12px, 500 weight, uppercase |
| Cell Padding | 12px |
| Border | 1px solid var(--neutral-200) |
| Hover Row | var(--neutral-50) |
| Selected Row | var(--primary-50) |
| Stripe (alt rows) | var(--neutral-50) |

### Modal

| Size | Width | Max Height |
|------|-------|------------|
| `sm` | 400px | 85vh |
| `md` | 560px | 85vh |
| `lg` | 720px | 85vh |
| `xl` | 900px | 90vh |
| `full` | 95vw | 95vh |

| Property | Value |
|----------|-------|
| Border Radius | var(--radius-lg) |
| Shadow | var(--shadow-xl) |
| Overlay | rgba(0,0,0,0.5) with blur(4px) |
| Header Padding | 16px 20px |
| Body Padding | 20px |
| Footer Padding | 16px 20px |
| Footer Border Top | 1px solid var(--neutral-200) |

### Drawer

| Position | Width/Height |
|----------|--------------|
| Right | 400px width (sm), 560px (md), 720px (lg) |
| Left | Same as Right |
| Top/Bottom | Full width, 50vh height |

| Property | Value |
|----------|-------|
| Shadow | var(--shadow-2xl) |
| Animation Duration | 200ms |
| Animation Easing | cubic-bezier(0.32, 0.72, 0, 1) |

### Tabs

| Property | Value |
|----------|-------|
| Tab Height | 36px |
| Tab Padding X | 12px |
| Tab Font Size | 13px |
| Tab Font Weight | 500 |
| Active Indicator | 2px bottom border, var(--primary-500) |
| Inactive Text | var(--neutral-500) |
| Hover Background | var(--neutral-100) |

### Dropdown Menu

| Property | Value |
|----------|-------|
| Min Width | 160px |
| Max Width | 320px |
| Border Radius | var(--radius-md) |
| Shadow | var(--shadow-lg) |
| Item Height | 32px |
| Item Padding X | 12px |
| Item Font Size | 13px |
| Separator Height | 1px |
| Separator Margin Y | 4px |
| Submenu Indicator | ChevronRight icon, 14px |

### Tooltip

| Property | Value |
|----------|-------|
| Max Width | 280px |
| Padding | 6px 10px |
| Border Radius | var(--radius-sm) |
| Background | var(--neutral-900) |
| Text Color | white |
| Font Size | 12px |
| Arrow Size | 6px |
| Delay | 500ms |

### Toast / Alert

| Property | Value |
|----------|-------|
| Width | 360px (max) |
| Padding | 12px 16px |
| Border Radius | var(--radius-md) |
| Shadow | var(--shadow-lg) |
| Icon Size | 20px |
| Title Font | 13px, 600 weight |
| Description Font | 13px, 400 weight |
| Auto-dismiss | 5000ms (default) |
| Position | Top-right, 16px from edges |
| Stack Gap | 8px |

---

## 6. Icon System (Lucide Icons)

### Recommended Icons by Category

**Navigation:**
- `Home`, `Folder`, `FolderOpen`, `File`, `FileText`
- `ChevronRight`, `ChevronDown`, `ChevronLeft`, `ChevronUp`
- `Menu`, `X`, `MoreHorizontal`, `MoreVertical`

**Test Management:**
- `TestTube`, `TestTube2`, `FlaskConical`, `Beaker`
- `PlayCircle`, `StopCircle`, `PauseCircle`, `RefreshCw`
- `CheckCircle2`, `XCircle`, `AlertCircle`, `Clock`
- `Bug`, `Wand2`, `Sparkles`

**Actions:**
- `Plus`, `Trash2`, `Edit`, `Copy`, `Download`, `Upload`
- `Search`, `Filter`, `SortAsc`, `SortDesc`
- `Eye`, `EyeOff`, `Lock`, `Unlock`

**Status:**
- `Check`, `X`, `AlertTriangle`, `Info`, `HelpCircle`
- `Loader2` (spinner)

### Icon Sizes

| Context | Size |
|---------|------|
| Inline (text) | 14px |
| Button (sm/md) | 16px |
| Button (lg) | 18px |
| Navigation | 18px |
| Empty State | 48px |
| Hero | 64px |

### Icon Styling

- Stroke width: 1.75px (default) or 2px (bold)
- Always use `currentColor` for fills
- Icons should align with text baseline

---

## 7. Test Status Color System

### Status Definitions

| Status | Color Name | Background | Text/Icon | Border | Badge Style |
|--------|------------|------------|-----------|--------|-------------|
| **Passed** | Green | `#DCFCE7` / `#052E16` | `#15803D` / `#86EFAC` | `#86EFAC` / `#14532D` | Solid green bg |
| **Failed** | Red | `#FEE2E2` / `#450A0A` | `#B91C1C` / `#FCA5A5` | `#FCA5A5` / `#7F1D1D` | Solid red bg |
| **Blocked** | Orange | `#FFEDD5` / `#431407` | `#C2410C` / `#FDBA74` | `#FDBA74` / `#7C2D12` | Solid orange bg |
| **Retest** | Yellow | `#FEF9C3` / `#422006` | `#A16207` / `#FDE047` | `#FDE047` / `#713F12` | Solid yellow bg |
| **Skipped** | Gray | `#F3F4F6` / `#1F2937` | `#4B5563` / `#9CA3AF` | `#D1D5DB` / `#374151` | Outline gray |
| **Not Applicable** | Slate | `#F1F5F9` / `#1E293B` | `#475569` / `#94A3B8` | `#CBD5E1` / `#334155` | Outline slate |
| **Deferred** | Purple | `#F3E8FF` / `#3B0764` | `#7C3AED` / `#C4B5FD` | `#C4B5FD` / `#581C87` | Solid purple bg |

### CSS Variables for Status

```css
/* Passed */
--status-passed-bg: #DCFCE7;
--status-passed-text: #15803D;
--status-passed-border: #86EFAC;
--status-passed-icon: #22C55E;

/* Failed */
--status-failed-bg: #FEE2E2;
--status-failed-text: #B91C1C;
--status-failed-border: #FCA5A5;
--status-failed-icon: #EF4444;

/* Blocked */
--status-blocked-bg: #FFEDD5;
--status-blocked-text: #C2410C;
--status-blocked-border: #FDBA74;
--status-blocked-icon: #F97316;

/* Retest */
--status-retest-bg: #FEF9C3;
--status-retest-text: #A16207;
--status-retest-border: #FDE047;
--status-retest-icon: #EAB308;

/* Skipped */
--status-skipped-bg: #F3F4F6;
--status-skipped-text: #4B5563;
--status-skipped-border: #D1D5DB;
--status-skipped-icon: #6B7280;

/* Not Applicable */
--status-na-bg: #F1F5F9;
--status-na-text: #475569;
--status-na-border: #CBD5E1;
--status-na-icon: #64748B;

/* Deferred */
--status-deferred-bg: #F3E8FF;
--status-deferred-text: #7C3AED;
--status-deferred-border: #C4B5FD;
--status-deferred-icon: #8B5CF6;
```

### Status Icons (Lucide)

| Status | Icon | Alternative |
|--------|------|-------------|
| Passed | `CheckCircle2` | `Check` |
| Failed | `XCircle` | `X` |
| Blocked | `Ban` | `ShieldX` |
| Retest | `RefreshCw` | `RotateCcw` |
| Skipped | `SkipForward` | `FastForward` |
| Not Applicable | `Minus` | `MinusCircle` |
| Deferred | `Clock` | `Timer` |

---

## 8. Animation & Transitions

### Timing Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-instant` | 0ms | - | Disable animations |
| `--duration-fast` | 100ms | ease-out | Hover states |
| `--duration-normal` | 200ms | ease-in-out | Most transitions |
| `--duration-slow` | 300ms | ease-in-out | Modals, drawers |
| `--duration-slower` | 500ms | ease-in-out | Page transitions |

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 9. Accessibility Guidelines

### Color Contrast

- Normal text: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio against background
- Focus indicators: minimum 3:1 ratio

### Focus States

- All interactive elements must have visible focus indicators
- Focus ring: 2px offset, 2px width, primary color
- Never use `outline: none` without providing alternative

### Keyboard Navigation

- Tab order must follow visual order
- All interactive elements must be reachable via keyboard
- Escape key closes modals, dropdowns, and popovers
- Arrow keys navigate within menus and lists

---

## 10. Responsive Breakpoints

| Token | Min Width | Target Devices |
|-------|-----------|----------------|
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Laptops, desktops |
| `2xl` | 1536px | Large desktops |

### Layout Patterns

- **Sidebar:** 240px collapsed to 64px on mobile
- **Content Max Width:** 1440px (dashboard), 960px (forms)
- **Table:** Horizontal scroll on mobile, sticky columns
- **Cards:** 1 column mobile, 2 columns tablet, 3-4 columns desktop
