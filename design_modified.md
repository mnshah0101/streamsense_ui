# DESIGN.md

> Read this **before** generating any UI. Every token, scale, and component
> below carries an **intent** and a **boundary** — what it's for, what it
> forbids. When in doubt, ask before inventing.

---

## 0. Product brief

A benchmarking and pipeline tool for sports video analysis. Engineers and
the exec committee use it to compare models on play detection, run
multi-stage video breakdown pipelines, and inspect cost / latency /
accuracy across runs. The UI's core job is **showing dense quantitative
data with confidence** — tables of model results, status of long-running
pipelines, side-by-side ground-truth comparisons.

**Anti-goals:**
- Not a marketing site. No heroes, no illustrations, no decorative
  imagery.
- Not a consumer app. No playful motion, no celebratory animation, no
  emoji as UI.
- Not Material / iOS native. Don't reach for those component libraries.

---

## 1. Visual theme & atmosphere

- **Mood:** instrument-panel. Dark, dense, broadcast-room. Black background
  with one saturated red accent.
- **Density:** compact. Internal tool — users live in this app and want
  more on screen, not more whitespace.
- **Personality:** **Siro** does the work in body text. One accent color does all the heavy lifting.
- **References (do):** Linear, Vercel dashboard, Stripe dashboard,
  broadcast scorebugs.
- **References (don't):** Material, iOS, anything skeuomorphic, anything
  pastel.

---

## 2. Color

> Dark mode is the only mode. `<html className="dark">` is set at the root
> and is not optional. Don't add a light theme; don't add a theme toggle.

Tokens live in `src/app/globals.css` under `@theme inline`. Tailwind v4
generates the utility classes — reach for the CSS variable directly
(`bg-[var(--color-bg-card)]`) until tokens get short aliases.

### Surfaces

```css
--color-bg-primary:    #0a0a0a;  /* page background. The default. */
--color-bg-card:       #1a1a1a;  /* cards, panels, nav, modals.
                                    Exactly one elevation step above
                                    the page. Don't stack two cards. */
--color-bg-card-hover: #222222;  /* hover on interactive surfaces
                                    (rows, ghost buttons). Never a
                                    resting background. */
--color-border-subtle: #2a2a2a;  /* all dividers and card borders.
                                    Also used as a faint inline
                                    separator dot · between metadata. */
```

### Accent

```css
--color-accent:       #e31837;   /* primary CTAs, active nav, the active
                                    step in a progress bar, focus ring.
                                    ONE per visual region. Never a fill
                                    behind body text. Never decorative. */
--color-accent-hover: #ff2244;   /* hover/pressed on accent only. */
```

> The accent communicates "this is the action." If two things on screen
> are accent-red, neither reads as primary. Demote one to ghost.

### Text

```css
--color-text-primary:   #f5f5f5;  /* default body, headings, KPI values */
--color-text-secondary: #999999;  /* supporting metadata, inactive
                                     nav, default state of ghost
                                     buttons */
--color-text-muted:     #666666;  /* labels, captions, timestamps,
                                     placeholder text. Never actionable. */
```

### Status (semantic — reserved)

Status communicates state. Never decorative. Always paired with a label.

| Use                       | Class                                  | When                                           |
|---------------------------|----------------------------------------|------------------------------------------------|
| In-progress / pending     | `text-yellow-400`                      | downloading, detecting, cutting, "Processing…" |
| Success / complete        | `text-green-400` / `bg-green-500/20`   | completed runs, ✓ states, "Imported" badge     |
| Error / failure           | `text-red-400`                         | failed jobs, "No video available", error msgs  |
| Active progress step      | `bg-[var(--color-accent)]`             | current step in a multi-step progress bar      |
| Past progress step        | `bg-green-500`                         | completed steps in a progress bar              |
| Future / inactive step    | `bg-[var(--color-border-subtle)]`      | upcoming steps                                 |

### Model series palette (categorical)

For charts, table swatches, and run-vs-run visualizations. Pick by index
in a stable order — same model gets the same color across pages.

```css
--color-model-0: #14b8a6;  /* teal */
--color-model-1: #f97316;  /* orange */
--color-model-2: #a855f7;  /* purple */
--color-model-3: #22c55e;  /* green */
--color-model-4: #3b82f6;  /* blue */
--color-model-5: #ec4899;  /* pink */
--color-model-6: #eab308;  /* yellow */
--color-model-7: #06b6d4;  /* cyan */
--color-ground-truth: #fbbf24;  /* amber — always reserved for human
                                   ground-truth lines/markers. Never
                                   reassign. */
```

### Color rules

- ❌ Never use the accent for borders, large backgrounds, or text fills
  longer than a button label.
- ❌ Never invent a new color. If you need a new semantic role, add a
  token to `globals.css` and this file in the same change.
- ❌ Never communicate status with color alone — always pair with a word
  or icon. Colorblind users + dark mode reds and greens blur.
- ❌ No gradients anywhere.
- ✅ The model-series palette is **categorical only**. Don't use it for
  status, never use a status color for a model series.

---

## 3. Typography

**Two families, no third.**

```css
--font-family-display: "Druk", Impact, sans-serif;     /* headlines, KPIs, brand */
--font-family-body:    "Siro", system-ui, sans-serif;  /* everything else */
```

Druk loads as Bold (700) and Medium (500). Siro loads as Regular (400) and
Medium (500). Other weights are not licensed in — don't write `font-light`
or `font-black`.

```tsx
<h1 className="font-[family-name:var(--font-family-display)] text-xl font-bold uppercase tracking-wide">
  Benchmark
</h1>

<p className="font-[family-name:var(--font-family-display)] text-3xl font-bold">
  {kpiValue}
</p>
```

### When to use Siro (body)

Everything else. Body, table cells, button labels, form fields, metadata.

### Scale

| Class               | Use                                                              | Don't use for                          |
|---------------------|------------------------------------------------------------------|----------------------------------------|
| `text-3xl font-bold` (Druk) | KPI values on summary cards                              | Anything that isn't a single number    |
| `text-xl font-bold` (Druk)  | Nav brand title                                          | Section headings                       |
| `text-base font-bold` (Druk) | Entity titles on cards (team name, model name)          | Body text                              |
| `text-sm font-medium` | Buttons, primary inline labels, active nav                     | Long-form reading                      |
| `text-sm`           | Default body, table cells                                        | Marketing prose                        |
| `text-xs`           | Dense tables, secondary buttons, form labels, status pills      | Things the user must click             |
| `text-[11px]`       | Tags, metadata pills ("Imported", "12 plays")                   | Anything actionable                    |
| `text-[10px] uppercase tracking-wide` | KPI labels above the value, section eyebrows  | Body or button text                    |
| `text-[9px] uppercase tracking-wide`  | Progress-bar step labels                       | Anything else — this is the floor      |

### Typography rules

- ❌ Never mix three weights on a screen. Pick two from {400, 500, 700}.
- ❌ Never use Druk for body text or long labels — it's condensed and
  loses legibility below 14px lowercase.
- ❌ Never use lowercase Druk.
- ✅ Tabular numerics in tables (`font-variant-numeric: tabular-nums`)
  for any column the user will compare row-to-row.
- ✅ KPI values use Druk and are always paired with a `text-[10px]
  uppercase tracking-wide text-muted` eyebrow label above.

---

## 4. Spacing & layout

**4px base, Tailwind defaults.** Don't write arbitrary pixel values.

```
gap-1   4px    intra-component (icon ↔ label)
gap-2   8px    between buttons in a row
gap-3   12px   inside a card between elements
gap-4   16px   default grid gap, between siblings in a row
gap-5   20px   card internal padding (p-5 on dense control panels)
gap-6   24px   between major sections within a page
```

**Page chrome**

- Root layout wraps content in `<main className="px-6 py-6">`. Page-level
  horizontal padding is `px-6`, not `px-4` or `px-8`.
- Top nav: `h-12` (48px). Don't grow it.
- Default card padding: `p-4`. Dense control panels use `p-5`. Summary
  KPI cards use `p-4`.
- Card corner radius: **`rounded-xl`** (12px). Buttons: **`rounded-lg`**
  (8px). Status pills: **`rounded-full`**.

**Grid**

- Summary KPI strip: `grid-cols-3 gap-4 lg:grid-cols-6` — 3-up on
  narrow, 6-up on `lg`.
- Game card grids: 3-up on `lg`, 2-up on `md`, 1-up below. (Don't go
  4-up — cards become unreadable.)

**Layout rules**

- ✅ Snap to the spacing scale. No `padding: 13px`.
- ✅ Left-align all text including KPI values (broadcast-style, not
  centered).
- ❌ Never center body copy. Never center-align table columns of text.
- ❌ No `max-w-prose` reading containers — this is a tool, not an
  article.

---

## 5. Components

### Card (the workhorse)

The default container. Used for game cards, KPI cards, control panels,
detail panels.

```tsx
<div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-4">
  {/* content */}
</div>
```

Interactive variant (game card, clickable row card) adds:
`transition-colors hover:border-[var(--color-text-muted)]`. Hover
brightens the border, **not** the background — background hover is
reserved for menu rows and table rows.

- ❌ Never put a card inside a card. If you need a nested grouping, use a
  border or a section divider, not another card.
- ❌ Never add a drop shadow. Elevation is communicated by surface color
  + border, not by shadow.

### Buttons

Three variants, that's it.

```tsx
// Primary — the single most important action in a region.
<button className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed">
  View Pipeline
</button>

// Ghost / secondary — supporting actions, "import this", "cancel", row actions.
<button className="rounded-lg border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)] disabled:opacity-40 disabled:cursor-not-allowed">
  Import Game
</button>

// Destructive — for irreversible actions only. Always confirms first.
<button className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30">
  Delete
</button>
```

Sizes (pick by context, not preference):

| Context                                    | Padding         | Text   |
|--------------------------------------------|-----------------|--------|
| Main CTA on a card / page                  | `px-4 py-2`     | `text-sm` |
| Inline / toolbar / pipeline controls       | `px-4 py-1.5`   | `text-xs` |
| Row-action / table-action                  | `px-3 py-1`     | `text-xs` |

- ✅ One `primary` per visual region. The dashboard has many primary
  buttons total — but only one per card / panel.
- ✅ Loading state replaces the label with an inline spinner; the button
  keeps its width so the layout doesn't shift.
- ❌ No icon-only buttons without an `aria-label`.
- ❌ Disabled ≠ "user shouldn't do this." Disabled means "this action
  would fail right now" (e.g., no video available, pipeline busy).

### Status pills (badges)

```tsx
<span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-[11px] font-medium text-green-400">
  Imported
</span>
```

- Soft tint background (`/20`), text in the same status color (`-400`).
- Always paired with a word, never icon-only.
- `text-[11px]` for pills sitting alongside a card title.

### Inputs & selects

```tsx
<select className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-3 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]">
  …
</select>
```

- Background is `--color-bg-primary` (sunken into the card), not
  `--color-bg-card`.
- Focus ring: **1px**, accent red. No 2-pixel rings, no offset.
- Labels go **above** the field, never as placeholders. Label style:
  `text-xs text-[var(--color-text-muted)] uppercase tracking-wide`.

### Progress bar (multi-phase pipeline)

The pipeline pattern in `pipeline-controls.tsx` is the canonical
multi-step indicator:

- Equal-flex segments, `h-2 rounded-sm`, `gap-1` between.
- Past = `bg-green-500`; current = `bg-[var(--color-accent)]`;
  future = `bg-[var(--color-border-subtle)]`.
- Tiny `text-[9px] uppercase tracking-wide text-muted` labels under each.

### Spinner

```tsx
<span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
```

Wrap in `text-yellow-400` when it represents in-progress work. Always
accompanied by a word (`"Processing…"`, `"Loading…"`). No naked spinners.

### Table

- Dense, `text-xs` or `text-sm`. No striping.
- Sticky `<thead>` with `bg-[var(--color-bg-card)]` and a
  `border-b border-[var(--color-border-subtle)]`.
- Numeric columns: **right-aligned**, **tabular-nums**.
- Text columns: left-aligned.
- Row hover: `hover:bg-[var(--color-bg-card-hover)]`.
- Sortable header: cursor pointer + chevron icon, no underline.

### Card vs. table row vs. list row — when to reach for which

This is the choice agents get wrong most often.

- **Table** — default for any collection of structured comparable data
  (models, runs, plays). The user is scanning columns.
- **List row** (no card per item) — when content is variable-height and
  rows aren't compared column-by-column (e.g., chunk plays modal,
  detection list).
- **Card** — when items are *destinations* the user might click into
  with mixed content (image/title/badge/metadata/action). Game cards,
  clip cards. Don't card-ify simple lists.

### Empty / loading / error states (required)

Every data-bound view defines all four. If you only design the happy
path, the agent ships broken UI.

- **Loading:** skeleton matching the eventual layout — same `rounded-xl`
  card shells with `bg-[var(--color-bg-card-hover)]` blocks where text
  goes. Don't fill the screen with a spinner.
- **Empty (first time):** centered in the container,
  `text-sm text-[var(--color-text-muted)]`, one CTA below in ghost-button
  style. Say what *will* be here.
- **Empty (filtered):** "No results match {filter}." + clear-filters
  ghost button.
- **Error:** what failed + what the user can do + retry. Use
  `text-red-400` and a ghost retry button. Never show raw stack traces
  in the UI — log them, surface a short message.

---

## 6. Depth & elevation

There is no shadow system. Elevation is communicated by surface color
and border:

1. `--color-bg-primary` (page) → flat.
2. `--color-bg-card` + `border-subtle` (card) → one level up.
3. `--color-bg-card-hover` (hovered row, hovered ghost button) → focus
   indicator.

Modals are an exception: they sit on a black `/60` backdrop. No drop
shadow on the modal itself — the backdrop is the elevation.

- ❌ No `shadow-*` Tailwind utilities anywhere.
- ❌ No "glassmorphism" / backdrop-blur effects.

---

## 7. Iconography

- **Library:** none yet. Inline SVG or text symbols (`·`, `×`, `↑`)
  where needed.
- If you reach for a library, **Lucide** at stroke 1.5. Pick one and
  don't mix.
- Icon sizing: `h-3 w-3` (inline with `text-xs`), `h-4 w-4` (inline with
  `text-sm` / buttons), `h-5 w-5` (standalone).
- Color: `currentColor`. Never hard-coded — the icon should match the
  surrounding text's color and state.
- ❌ No emoji as UI. Emoji is fine in copy where it's deliberate (rare).

---

## 8. Motion

```
transition-colors    color/bg state changes (default — almost all hovers)
animate-spin         loading spinner only
duration-150         the implicit Tailwind default; don't override
```

- ✅ `transition-colors` on every interactive element so hover state
  doesn't pop.
- ❌ No layout animation. Don't animate `width`, `height`, `padding`.
- ❌ No bounce / elastic curves. Linear or ease.
- ❌ No celebratory animation on completion. Status updates from yellow
  to green; that's the whole story.

---

## 9. Responsive

This is a desktop-first internal tool. Mobile is not a target — but pages
should at least be readable on a laptop down to ~1024px.

- Default to `grid-cols-3 lg:grid-cols-6` style ladders.
- Don't add hamburger menus or off-canvas drawers; the nav is fine
  horizontal at any width we care about.
- Tables can horizontal-scroll at narrow widths — don't collapse them
  to cards.

---

## 10. Voice & copy

- **Title Case** for navigation and primary buttons (`View Pipeline`,
  `Import Game`, `Detect All`). This matches what's in the codebase
  today.
- **UPPERCASE for Druk-set titles and eyebrow labels** — done by
  `uppercase tracking-wide`, not by writing capital letters in JSX.
- Action button labels: verb-first (`Detect All`, `Import Game`, `Cut
  All`). When a count is helpful, append in parens: `Download All (4)`.
- Status copy: lowercase verbs with counts —
  `3 downloading`, `5 detected`, `1 failed`. Don't title-case status.
- Numbers in copy: token formatting — `1.2K`, `3.4M`, `$0.42`, `2.3s`.
  See `formatTokens` in `dashboard/summary-cards.tsx`. Don't render raw
  large integers.
- Empty / error copy: state the fact, then the fix.
  > "No detections in this chunk yet. Run `Detect All` to start."
- ❌ No "Oops!", no exclamation marks, no "Whoops we couldn't…", no
  blaming the user.

---

## 11. Accessibility

This is dark-on-dark which is a contrast minefield. Verify, don't guess.

- Body text on `--color-bg-card`: contrast ratio ≥ 4.5:1.
  - `#f5f5f5` on `#1a1a1a` = 16.5:1 ✓
  - `#999` on `#1a1a1a` = 5.4:1 ✓
  - `#666` on `#1a1a1a` = 2.7:1 — **muted text is metadata-only**, never
    used for sentences the user has to read.
- Focus ring is **always** visible: `focus:ring-1
  focus:ring-[var(--color-accent)]`. Never `focus:outline-none` without
  a replacement ring.
- Every interactive element has an accessible name. Icon-only buttons
  get `aria-label`.
- Status communicated via color is always also communicated via text or
  icon — count of "3 downloading" reads aloud even if yellow doesn't
  render.

---

## 12. Do's and don'ts

**Do**

- ✅ Use one accent-red primary button per region.
- ✅ Use Druk uppercase for entity titles and KPI values; Siro for
  everything else.
- ✅ Snap to the spacing scale; `rounded-xl` cards, `rounded-lg`
  buttons, `rounded-full` pills.
- ✅ Pair every status color with a word.
- ✅ Tabular-nums for numerics-in-columns.
- ✅ Define empty / loading / error for every data-bound component.

**Don't**

- ❌ No drop shadows. No gradients. No backdrop-blur.
- ❌ No card-in-card.
- ❌ No new colors invented inline — touch `globals.css` and this file.
- ❌ No lowercase Druk.
- ❌ No light mode, no theme toggle.
- ❌ No animation of layout properties.
- ❌ No icon-only buttons without `aria-label`.
- ❌ No raw stack traces in the UI.
- ❌ No emoji as UI.

---

## 13. Agent prompt guide

When generating UI for this codebase, paste this into the prompt:

```
Before writing code:

1. Read /design.md in full. Treat its constraints as hard rules.
2. Use tokens from src/app/globals.css (--color-bg-card, --color-accent,
   etc.). Never introduce new colors or fonts.
3. Pick the tightest applicable container: table > list row > card.
   Don't card-ify everything.
4. Define empty, loading, and error states for every data-bound view.
5. One primary (accent-red) button per region.
6. Druk uppercase tracking-wide for entity titles and KPI values; Siro
   for everything else.
7. Self-check against §12 (Do's and Don'ts) before returning.
```

---

## 14. Heuristics

- If two designs look equally good, pick the **denser** one. This is a
  tool, not a brochure.
- If a screen has more than one accent-red primary button per region,
  re-scope before re-styling.
- If you can't justify a token from §0 (Product brief), don't use it.
- If you need a font weight, color, radius, or size not in this file,
  **stop and propose an addition** — don't invent it inline.
