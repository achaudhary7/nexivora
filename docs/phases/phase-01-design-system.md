# Phase 1 — Design System & Brand Identity

| | |
| --- | --- |
| **Status** | ⬜ Not Started |
| **Depends on** | Phase 0 |
| **Blocks** | Every phase that renders anything |
| **Estimate** | 8 focused hours |
| **Started** | — |
| **Completed** | — |

## Objective

Land the brand and the complete component vocabulary **before** feature pressure starts, so that
every later phase assembles existing pieces instead of inventing new ones. This is the phase that
determines whether the product looks professional or looks like nineteen different people built it.

Reference: `docs/DESIGN-SYSTEM.md`.

## In scope

- The Nexivora logo, in SVG, with every variant, plus the full favicon and PWA icon set
- Verification of the token system from Phase 0 (contrast measured, not assumed)
- The complete UI primitive library
- Layout components and both shells (marketing and application)
- The inline SVG icon set and the SVG illustration set
- The generated SVG avatar and project-cover system
- `/style-guide` as the reference and regression surface

## Out of scope

- Page content (Phase 2) · Data (Phase 3) · Charts (Phase 15)

## Deliverables

### Brand
- [ ] `components/Logo.tsx` — one component, `variant="lockup|stacked|mark"`, `size="sm|md|lg"`,
      props `mono` and `reversed`. Mark and wordmark are paths, not live text.
- [ ] Mark legible at 16px — verified by rendering it at 16px, not by assuming
- [ ] `public/icon.svg`, `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), and the
      192/512 PWA icons — all generated from the one SVG, all on stable URLs
- [ ] `public/manifest.webmanifest` with name, short name, theme colour, icons
- [ ] Brand usage rules written into `docs/DESIGN-SYSTEM.md` (clear space, minimum size, misuse)

### Tokens — verified, not assumed
- [ ] `scripts/check-contrast.mjs` parses `globals.css` and computes WCAG ratios for every
      foreground/background pair in both themes
- [ ] Wired into `npm run check`; **fails the run on any pair below AA**
- [ ] All failures corrected in the token file. Record which pairs failed in the summary — that
      list is genuinely useful information.
- [ ] `ThemeProvider` + `ThemeToggle` (light / dark / system), no flash of wrong theme on load

### UI primitives — `src/components/ui/`
Each with every state (default, hover, focus-visible, active, disabled, loading) and a `/style-guide`
entry.

- [ ] `Button` — variants `primary · secondary · ghost · outline · danger`, sizes `sm · md · lg`,
      `loading`, `iconOnly`, `asChild`
- [ ] `Input`, `Textarea` (auto-resize), `Select`, `Combobox` (searchable, keyboard-navigable),
      `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `DatePicker`
- [ ] `Field` — label, hint, error, required marker, full `aria-describedby` wiring.
      **Every form control is used inside a `Field`.**
- [ ] `Card` + `CardHeader` / `CardBody` / `CardFooter`
- [ ] `Badge`, `Chip` (removable), `StatusPill` (project lifecycle states), `TierBadge`
      (self / evidenced / attested — greyscale-distinguishable)
- [ ] `Avatar` (with generated SVG identicon fallback), `AvatarGroup` (with overflow count)
- [ ] `Tabs`, `Accordion`, `Dialog`, `Sheet` (side drawer), `Popover`, `DropdownMenu`, `Tooltip`,
      `ContextMenu`
- [ ] `Toast` + `useToast`
- [ ] `Table` — sortable headers, sticky header, and a **card fallback below `md`**
- [ ] `Progress` (bar + ring), `Skeleton`, `Spinner`
- [ ] `EmptyState` — illustration, headline, sentence, primary action. **An empty state without an
      action is a dead end and does not pass review.**
- [ ] `ErrorState` with a retry action
- [ ] `Breadcrumbs` — emits `BreadcrumbList` JSON-LD automatically
- [ ] `Pagination` — renders **real `<a href>` links**, not buttons (crawlability, per
      `docs/SEO-CHECKLIST.md` §1)
- [ ] `Stepper`, `Timeline`, `Divider`, `Kbd`, `CopyButton`, `VisuallyHidden`

### Layout — `src/components/layout/`
- [ ] `Container`, `Section`, `PageHeader`, `Prose`
- [ ] `Header` — logo, primary nav, mobile drawer, theme toggle, auth CTAs. Reads
      `config/navigation.ts`; **never links to a route whose `planned` flag is true.**
- [ ] `Footer` — sitemap columns, legal links, social, copyright. One instance, used everywhere.
- [ ] `AppShell` — collapsible sidebar (icon rail at `md`, drawer on mobile), topbar with search,
      notification bell and user menu
- [ ] `CommandPalette` shell (⌘K) — registry-driven, empty for now, filled by later phases and
      **the deterministic fallback for the Phase 18 assistant**
- [ ] `SkipLink` as the first focusable element on every page

### Icons — `src/components/icons/`
- [ ] ~60 inline SVG components on a 24px grid, 1.5px stroke, using `currentColor`
- [ ] Coverage for: navigation, projects, groups, tasks, files, calendar, feed, social, status,
      roles, domains, SDG, editorial. No icon library dependency.
- [ ] `Icon` wrapper handling size and `aria-hidden`

### Illustrations & generated imagery — `src/components/illustrations/`
- [ ] 8 scene illustrations, geometric, theme-aware, built from the logo's visual language:
      empty workspace · empty feed · no results · connection/collaboration · archive ·
      error 404 · error 500 · success
- [ ] `generateAvatar(userId)` — deterministic SVG identicon, a node-graph motif in a hashed hue
- [ ] `generateProjectCover(project)` — SVG cover from domain colour, title and SDG marks.
      **This is why every project card will look intentional with zero upload effort.**
- [ ] `HeroGraphic` — the home page's primary illustration, animated only under
      `prefers-reduced-motion: no-preference`

### The style guide
- [ ] `/style-guide` renders every component, every variant, every state, in both themes
- [ ] Sections: brand · colour · type · spacing · icons · illustrations · primitives · layout ·
      patterns (empty, loading, error) · accessibility notes
- [ ] `noindex`

## Acceptance criteria

1. `/style-guide` renders every component in both themes with no visual defect.
2. `npm run check` passes, including the contrast audit at 100%.
3. The logo mark is legible at 16px and the lockup is legible at 96px wide.
4. Every interactive component is fully operable by keyboard with a visible focus ring.
5. Theme toggle produces no flash of the wrong theme on hard reload.
6. `Header` and `Footer` are used on every page from here on — no page builds its own.
7. CSS bundle under 20 KB gzipped.
8. No raster asset anywhere in `public/` except the two generated PNG icons Apple and Android
   require.
9. `npm run build` clean.

## Key files this phase creates

```
src/components/Logo.tsx              One component, every variant
src/components/ui/*                  ~35 primitives — the vocabulary for 18 more phases
src/components/layout/*              Header, Footer, AppShell, CommandPalette
src/components/icons/*               ~60 inline SVG icons
src/components/illustrations/*       8 scenes + avatar and cover generators
src/app/style-guide/page.tsx         The reference surface
scripts/check-contrast.mjs           The audit that stops contrast silently regressing
public/icon.svg, favicon.ico, …      The full icon set, on stable URLs
```

## Notes & risks

- **Measure contrast, do not eyeball it.** In the reference project four token pairs failed a real
  audit despite looking fine. Expect the same here, and expect `border-strong` and the subtle
  foreground on raised surfaces to be the failures.
- **The `TierBadge` must work in greyscale.** It appears on exported portfolio PDFs, which people
  print. Test it by desaturating a screenshot.
- **`Pagination` renders anchors, not buttons.** This is an SEO requirement, not a preference — a
  button-based pager makes page 2 onwards invisible to a crawler.
- **The `Table` needs a mobile card fallback**, but designing it blind is guesswork. Build the
  desktop table now and note the fallback as a Phase 7 deliverable once there is real data to design
  against.
- Radix is the only component dependency. Do not add a second one, and do not add an icon library —
  the icon set is source code we own.
- The command palette is deliberately built now and left empty. It is the deterministic fallback
  for the AI assistant, and building it in Phase 18 alongside the AI would blur which is which.
- Do not skip the generated avatar and project cover. They are the difference between a product
  that looks alive with seed data and one that looks like a wireframe.

---

## Phase Summary

*Fill this in when the phase is complete.*

**What was built.**

**Key decisions made.**

**Contrast failures found and corrected.**

**Files and directories created.**

**Deviations from the spec above, and why.**

**Anything the next phase must know.**

**Verified by.**

| Check | Result |
| --- | --- |
| | |
