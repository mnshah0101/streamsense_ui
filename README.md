# StreamSense — clickable demo UI

Mid-fi prototype of the StreamSense review tool, implemented as a clickable React app
for the capstone demo. Styling follows the company design doc in `design_modified.md`
(dark, dense, one red accent, Druk + Siro).

## Run

```sh
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # typecheck + production build into dist/
```

Node 24 (see the sibling repo's `.node-version`).

## What's in the demo

| Route | Screen | Notes |
| --- | --- | --- |
| `/` | Games catalog | Netflix-style rows (Needs review, Live, Recently analyzed, by sport). Search + Sport / Status / Defect / Camera filters switch to a grid. Click a game to open Match Analysis. |
| `/games/:id` | Match Analysis | Run stats, 720-frame timeline, frame detail with defects, heat-map toggle (spatial defects only), Confirm / Dismiss for alerts, and **model feedback**: Correct / Incorrect on a detection, Flag Missed Issue with defect, severity, optional region click and note. Feedback log at the bottom. |
| `/test` | Test a Stream or Clip | Drop zone with type / size validation, full-match run that queues a simulated async job; results stream into the game's timeline as partial results. Reached from the red **+** button in the nav. |
| `/performance` | Model Performance | Run picker, binary KPIs, per-defect table (unavailable where support is low), calibration curve, threshold slider preview + Save, and a Human Feedback panel fed by labels from Match Analysis. |
| sidebar | Alerts | Bell in the nav toggles it; badge counts unseen alerts. Open / Reviewed tabs, Confirm / Dismiss, one alert demonstrates the failed-save + retry branch. Click an alert to jump to its frame. |

Demo behaviors: a new alert arrives on the live game ~25 s after load; alerts, feedback
and the saved threshold persist in `localStorage` (use **Reset demo** in the nav to clear).

All data is synthetic. Frames are drawn SVG placeholders with defect treatments applied so
the demo reads without client footage; heat maps and metrics are illustrative, not inference.

## Fonts

Druk and Siro are licensed. Drop `Druk-Bold.woff2`, `Druk-Medium.woff2`, `Siro-Regular.woff2`
and `Siro-Medium.woff2` into `public/fonts/` and they load automatically; until then the
stacks fall back to Impact / system-ui as the design doc specifies.

## Structure

```
src/
  globals.css        design tokens (@theme) + font-face
  store.tsx          app state: alerts, feedback, jobs, threshold, sidebar
  data/games.ts      game fixtures, deterministic frame generator, seed alerts
  data/types.ts
  components/        Nav, AlertsSidebar, GameCard, Timeline, FrameThumb, ui primitives
  pages/             Home, MatchAnalysis, TestStream, ModelPerformance
```
# streamsense_ui
