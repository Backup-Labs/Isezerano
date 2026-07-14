# "Isezerano" Design System Guide

This document defines the visual layout tokens, typography patterns, motion standards, and component interfaces established for "Isezerano" Digital Newspaper Platform.

---

## 1. Color Palette System

The application uses custom CSS custom properties in `globals.css` that map color states. Dark Mode is the default "hero" theme.

| Color Variable | Hex Code | Usage |
|---|---|---|
| `--color-black` | `#0A0B0D` | Primary deep black background (Dark Mode) / Text color (Light Mode) |
| `--color-charcoal` | `#14161A` | Elevated cards and widgets surfaces (Dark Mode) |
| `--color-light-gray` | `#F2F3F5` | Primary light background (Light Mode) |
| `--color-gray-100` | `#E7E9EC` | Card borders, separators, and background grids (Light Mode) |
| `--color-gray-400` | `#9AA0A8` | Secondary sub-headlines, timestamps, view logs, and meta labels |
| `--color-blue` | `#2F6DF6` | Primary brand accent, hyperlinks, active states, and focus grids |
| `--color-blue-glow` | `#5B8CFF` | Hover states, glowing tags, and interactive button overlays |
| `--color-blue-deep` | `#123B99` | Pressed buttons, mesh gradient sources, and dark background highlights |

---

## 2. Glassmorphism Design Rules

Frosted glass panels are reserved for chrome components (Header, breaking news ticker, pills, floating details, modals, and sidebar rails). They must not sit directly under large reading body text to maintain WCAG AA contrast standards.

### Dark Mode Glass Panel
```css
.glass-panel {
  background: rgba(20, 22, 26, 0.6);
  backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

### Light Mode Glass Panel
```css
.light .glass-panel {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
```

---

## 3. Typography Hierarchy

- **Headlines:** Space Grotesk (sans-serif geometric / display). Set high contrast and bold weights (`font-mono tracking-tight font-bold`).
- **Body & Editorial Columns:** Inter (humanist sans-serif / readable). Used on paragraph layouts to optimize reading comfort.
- **System Labels / Meta Info:** Monospace font mapping (`font-mono tracking-wider font-semibold`). Used for timestamps, indices, tags, and console parameters.

---

## 4. Motion & Micro-Interactions

- **Marquee Scrolling:** Infinite looping horizontal ticker for breaking news (`animate-marquee` running linear, pausing on hover).
- **Hover Glare effect:** Image containers zoom slightly (`scale-105`) with a smooth duration transform. Card borders transition to glowing blue (`border-theme-blue/30`) on hover.
- **Transition curves:** Dynamic route slide fades use bezier curves (`transition-all duration-300`).
- **Reduced Motion:** Respects standard hardware preferences (`@media (prefers-reduced-motion)` constraints).

---

## 5. Ad Placements & Layout Shifts (CLS-safe)

To prevent Cumulative Layout Shift (CLS), advertisement spaces are wrapped in reserved aspect-ratio container card placeholders. If an ad campaign is inactive, it displays a standard brand link to the advertising package.

- `header-banner` — Responsive container min-h `250px`.
- `sidebar-rail` — Sticky side panel of `300px` width by `600px` height.
- `in-feed-native` — Grid card item matching default card aspect ratios.
- `in-article-inline` — Content break divider of `336px` by `280px` centered inside paragraphs.
- `footer-banner` — Banner container above footer credits.
