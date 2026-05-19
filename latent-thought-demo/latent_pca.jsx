// latent_pca.jsx — PCA projection of latent trajectories
//
// Two side-by-side scatter panels that mirror the Flow / MeanFlow
// text panels above:
//   Left  — JiT 32-step trajectory fan (z_t at PCA steps 0,1,2,4,8,16,24,32)
//   Right — MeanFlow 1-step mapping (Gaussian z0 cluster → final z spread)
//
// Two-mode animation:
//
//   1. "Selected sample sync" — when nothing is playing locally, the
//      Flow panel follows the text reader's stepIdx so the selected
//      sample's leading dot moves in lockstep with the AR decode.
//
//   2. "▶ Play evolution" — a dedicated PCA-section control plays
//      ALL 256 particles simultaneously from t=1 (Gaussian) to t=0
//      (data manifold). Flow particles ride their 8-waypoint
//      trajectories with linear interpolation; MF particles fly
//      directly from start to final with a softer ease-out, so the
//      "32 small steps" vs "1 big leap" character is immediately
//      visible side-by-side.

const { useEffect: lpUseEffect, useMemo: lpUseMemo, useRef: lpUseRef, useState: lpUseState, useContext: lpUseContext, useCallback: lpUseCallback } = React;

function useLatentPCAData() {
  const [data, setData] = lpUseState(null);
  const [err, setErr] = lpUseState(null);
  lpUseEffect(() => {
    fetch("data/latent_pca_dense.json").
    then((r) => r.json()).
    then((raw) => setData(filterOutliers(raw))).
    catch((e) => setErr(String(e)));
  }, []);
  return { data, err };
}

// sample_ids whose PCA trajectory is so extreme that it stretches the viewBox
// and makes the rest of the population look squished. Removed at load time
// from every projection so the visualisation auto-rescales.
//   - sid=4: shoots way "up" on screen (data y = -21.23 at step 32)
const OUTLIER_SAMPLE_IDS = new Set([4]);

function filterOutliers(asset) {
  const clean = JSON.parse(JSON.stringify(asset));
  for (const proj of Object.values(clean.projections)) {
    if (Array.isArray(proj.samples)) {
      proj.samples = proj.samples.filter((s) => !OUTLIER_SAMPLE_IDS.has(s.sample_id));
      proj.sample_count = proj.samples.length;
    }
    if (Array.isArray(proj.points)) {
      proj.points = proj.points.filter((p) => !OUTLIER_SAMPLE_IDS.has(p.sample_id));
    }
    if (Array.isArray(proj.segments)) {
      proj.segments = proj.segments.filter((seg) => !OUTLIER_SAMPLE_IDS.has(seg.sample_id));
    }
  }
  return clean;
}

// Dense PCA measurement steps for the JiT panel: 0..32 inclusive (33 states
// counting the Gaussian start). Each step is a real solver step now.
const JIT_PCA_STEPS = Array.from({ length: 33 }, (_, i) => i);

// Viridis-ish palette anchored at 8 stops along the [0, 32] step range.
// For non-anchor steps we linear-interpolate L, C, H in oklch space so
// the dense 32-step trajectory gets a smooth gradient ribbon.
const STEP_COLOR_STOPS = [
{ step: 0, color: "oklch(0.30 0.13 285)" }, // deep purple
{ step: 4, color: "oklch(0.42 0.16 250)" },
{ step: 8, color: "oklch(0.50 0.16 215)" },
{ step: 12, color: "oklch(0.58 0.16 190)" }, // teal
{ step: 16, color: "oklch(0.66 0.16 165)" },
{ step: 20, color: "oklch(0.72 0.17 135)" }, // green
{ step: 26, color: "oklch(0.79 0.17 110)" }, // yellow-green
{ step: 32, color: "oklch(0.86 0.18 92)" } // bright yellow
];
function _parseOklch(s) {
  const m = s.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.-]+)\)/);
  return { L: parseFloat(m[1]), C: parseFloat(m[2]), H: parseFloat(m[3]) };
}
function colorForStep(step) {
  // Exact match: cheap path
  for (const s of STEP_COLOR_STOPS) {
    if (s.step === step) return s.color;
  }
  // Clamp + linear interp between adjacent stops
  if (step <= STEP_COLOR_STOPS[0].step) return STEP_COLOR_STOPS[0].color;
  const last = STEP_COLOR_STOPS[STEP_COLOR_STOPS.length - 1];
  if (step >= last.step) return last.color;
  let lo = STEP_COLOR_STOPS[0],hi = last;
  for (let i = 0; i < STEP_COLOR_STOPS.length - 1; i++) {
    if (step >= STEP_COLOR_STOPS[i].step && step <= STEP_COLOR_STOPS[i + 1].step) {
      lo = STEP_COLOR_STOPS[i];
      hi = STEP_COLOR_STOPS[i + 1];
      break;
    }
  }
  const u = (step - lo.step) / (hi.step - lo.step);
  const a = _parseOklch(lo.color),b = _parseOklch(hi.color);
  const L = a.L + (b.L - a.L) * u;
  const C = a.C + (b.C - a.C) * u;
  let dh = b.H - a.H;
  if (dh > 180) dh -= 360;else
  if (dh < -180) dh += 360;
  const H = a.H + dh * u;
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(2)})`;
}

// Compute SVG viewBox from data bounds with a margin (in data units).
function computeViewBox(pts, marginFrac = 0.06) {
  let xmin = Infinity,xmax = -Infinity,ymin = Infinity,ymax = -Infinity;
  for (const p of pts) {
    if (p.x < xmin) xmin = p.x;
    if (p.x > xmax) xmax = p.x;
    if (p.y < ymin) ymin = p.y;
    if (p.y > ymax) ymax = p.y;
  }
  const w = xmax - xmin;
  const h = ymax - ymin;
  const mx = w * marginFrac;
  const my = h * marginFrac;
  return { x: xmin - mx, y: ymin - my, w: w + 2 * mx, h: h + 2 * my };
}

// Linear interpolation between two {x, y} points.
function lerp(a, b, u) {
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}

// Locate a fractional PCA step on a sample's trajectory.
// Input: traj = [{step, x, y}, ...] sorted by step; pcaStep ∈ [0, 32]
// Output: { x, y } interpolated between the two bracketing waypoints.
function positionAtPcaStep(traj, pcaStep) {
  if (pcaStep <= traj[0].step) return { x: traj[0].x, y: traj[0].y };
  const last = traj[traj.length - 1];
  if (pcaStep >= last.step) return { x: last.x, y: last.y };
  for (let i = 0; i < traj.length - 1; i++) {
    const a = traj[i],b = traj[i + 1];
    if (pcaStep >= a.step && pcaStep <= b.step) {
      const u = (pcaStep - a.step) / (b.step - a.step);
      return lerp(a, b, u);
    }
  }
  return { x: last.x, y: last.y };
}

// Build the polyline string traced by `traj` up to fractional pcaStep.
function pathUpTo(traj, pcaStep) {
  const out = [];
  for (const p of traj) {
    if (p.step <= pcaStep) {
      out.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
    } else {
      // Interpolated head
      const head = positionAtPcaStep(traj, pcaStep);
      out.push(`${head.x.toFixed(2)},${head.y.toFixed(2)}`);
      break;
    }
  }
  return out.join(" ");
}

// easeOutCubic — used for MF "one big leap" so it visually decelerates
function easeOutCubic(u) {
  return 1 - Math.pow(1 - u, 3);
}

// =============================================================
// Flow (JiT) trajectory panel
// =============================================================
// `visibleSteps` is the subset of measurement waypoints to render as
// polyline vertices. Subsampling the 8 measured PCA points gives a
// visual sense of "what would a sparser observation of the same
// 32-step run look like" — NOT a true 8-step solver run; we only
// have PCA for the 32-step solver in this file.
function FlowPCAPanel({ proj, loadedSet, selectedSid, pcaStep, onSelect, total, visibleSteps, dotScale, headScale, bgScale, view }) {
  const viewBox = lpUseMemo(() => computeViewBox(proj.points), [proj]);
  const allSamples = proj.samples;
  const visibleSet = lpUseMemo(() => new Set(visibleSteps), [visibleSteps]);

  const selected = selectedSid != null ?
  allSamples.find((s) => s.sample_id === selectedSid) :
  null;

  // Sub-pixel scale derived from viewBox width (so stroke / dot sizes
  // are proportional to the data extent and don't look "thick" when
  // the panel renders small).
  const W = viewBox.w;
  // Build per-sample subsampled trajectories. We always include first +
  // last waypoint so the path still spans Gaussian → final.
  function visTraj(s) {
    return s.trajectory.filter((p) => visibleSet.has(p.step));
  }
  const fullPath = (s) => visTraj(s).map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  return (
    <section style={lpStyles.panel} data-screen-label="Flow latent PCA">
      <div style={{ ...lpStyles.panelHeader, borderTop: "2px solid var(--flow)" }}>
        <div>
          <div style={lpStyles.headerRow}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--flow)" }} />
            <h3 style={lpStyles.h3}>Flow Matching (JiT)</h3>
          </div>
        </div>
        <div className="mono" style={{ textAlign: "right", fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
          step {Math.round(pcaStep)} / {total}
        </div>
      </div>

      <div style={lpStyles.svgWrap}>
        <svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={lpStyles.svg}>

          {view === "fan" ?
          // =========================================================
          // Color-coded fan: time = colour. Animates by progressively
          // revealing waypoints whose step <= pcaStep, so the fan
          // "grows outward" when ▶ play is pressed (or you scrub).
          // =========================================================
          <g>
              {/* Background ghost — every full trajectory, very faint */}
              <g opacity="0.10">
                {allSamples.map((s) =>
              <polyline key={`ghost-${s.sample_id}`}
              points={fullPath(s)}
              fill="none"
              stroke="var(--ink-3)"
              strokeWidth={W * 0.0006}
              strokeLinejoin="round" />
              )}
              </g>
              {/* Connecting polylines — each segment colored by its TO step,
               only drawn once pcaStep has reached b.step. */}
              <g opacity="0.65">
                {allSamples.map((s) => {
                const traj = visTraj(s);
                return traj.slice(1).map((b, i) => {
                  if (b.step > pcaStep) return null;
                  const a = traj[i];
                  return (
                    <line key={`${s.sample_id}-${a.step}-${b.step}`}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={colorForStep(b.step)}
                    strokeWidth={W * 0.0010 * Math.sqrt(dotScale)}
                    strokeLinecap="round" />);

                });
              })}
              </g>
              {/* Coloured dots at every revealed waypoint */}
              <g>
                {allSamples.map((s) => visTraj(s).
              filter((p) => p.step <= pcaStep).
              map((p) =>
              <circle key={`${s.sample_id}-${p.step}`}
              cx={p.x} cy={p.y}
              r={W * 0.0034 * dotScale}
              fill={colorForStep(p.step)}
              opacity={0.85} />
              ))}
              </g>
              {/* Selected sample on top — same colours but bigger */}
              {selected && (() => {
              const traj = visTraj(selected);
              return (
                <g>
                    {traj.slice(1).map((b, i) => {
                    if (b.step > pcaStep) return null;
                    const a = traj[i];
                    return (
                      <line key={`${selected.sample_id}-${a.step}-${b.step}-sel`}
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={colorForStep(b.step)}
                      strokeWidth={W * 0.0028 * Math.sqrt(dotScale)}
                      strokeLinecap="round" />);

                  })}
                    {traj.filter((p) => p.step <= pcaStep).map((p) =>
                  <circle key={p.step}
                  cx={p.x} cy={p.y}
                  r={W * 0.0062 * dotScale}
                  fill={colorForStep(p.step)}
                  stroke="var(--bg)"
                  strokeWidth={W * 0.0014} />
                  )}
                    {/* Pulsing head at the current frontier */}
                    {(() => {
                    const head = positionAtPcaStep(traj, pcaStep);
                    return (
                      <g>
                          <circle cx={head.x} cy={head.y}
                        r={W * 0.0095 * dotScale * headScale}
                        fill={colorForStep(Math.round(pcaStep))}
                        stroke="var(--bg)"
                        strokeWidth={W * 0.0014} />
                          <circle cx={head.x} cy={head.y}
                        r={W * 0.0095 * dotScale * headScale}
                        fill="none"
                        stroke={colorForStep(Math.round(pcaStep))}
                        opacity="0.7">
                            <animate attributeName="r"
                          values={`${W * 0.0095 * dotScale * headScale};${W * 0.020 * dotScale * headScale};${W * 0.0095 * dotScale * headScale}`}
                          dur="1.8s" repeatCount="indefinite" />
                            <animate attributeName="opacity"
                          values="0.7;0;0.7"
                          dur="1.8s" repeatCount="indefinite" />
                          </circle>
                        </g>);

                  })()}
                  </g>);

            })()}
              {/* Invisible hit areas — all samples clickable in fan view */}
              <g>
                {allSamples.
              filter((s) => s.sample_id !== selectedSid).
              map((s) =>
              <polyline key={s.sample_id}
              points={fullPath(s)}
              fill="none"
              stroke="transparent"
              strokeWidth={W * 0.012}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(s.sample_id)} />
              )}
              </g>
            </g> :

          <React.Fragment>
          {/* Background fan — every sample's full trajectory in faint gray */}
          <g opacity="0.16">
            {allSamples.map((s) =>
              <polyline key={s.sample_id}
              points={fullPath(s)}
              fill="none"
              stroke="var(--ink-3)"
              strokeWidth={W * 0.0008}
              strokeLinejoin="round" />
              )}
          </g>

          {/* Animated heads — 256 particles riding their trajectories */}
          <g>
            {allSamples.map((s) => {
                const p = positionAtPcaStep(visTraj(s), pcaStep);
                const loaded = loadedSet.has(s.sample_id);
                const isSelected = s.sample_id === selectedSid;
                if (isSelected) return null; // drawn last on top
                return (
                  <circle key={s.sample_id}
                  cx={p.x} cy={p.y}
                  r={loaded ? W * 0.0034 * bgScale : W * 0.0022 * bgScale}
                  fill="var(--flow)"
                  opacity={loaded ? 0.95 : 0.55} />);

              })}
          </g>

          {/* 20 loaded samples — visible static trajectories so user can see what's clickable */}
          <g opacity="0.55">
            {allSamples.
              filter((s) => loadedSet.has(s.sample_id) && s.sample_id !== selectedSid).
              map((s) =>
              <g key={s.sample_id}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(s.sample_id)}>
                  <polyline points={fullPath(s)}
                fill="none"
                stroke="var(--ink-2)"
                strokeWidth={W * 0.0011}
                strokeLinejoin="round" />
                  {/* invisible hit area */}
                  <polyline points={fullPath(s)}
                fill="none"
                stroke="transparent"
                strokeWidth={W * 0.012}
                strokeLinejoin="round" />
                </g>
              )}
          </g>

          {/* Selected sample — full Flow accent, with visited/future split */}
          {selected && (() => {
              const traj = visTraj(selected);
              const head = positionAtPcaStep(traj, pcaStep);
              const future = traj.filter((p) => p.step >= Math.floor(pcaStep));
              return (
                <g>
                {future.length > 1 &&
                  <polyline points={future.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="var(--flow)"
                  strokeOpacity="0.32"
                  strokeWidth={W * 0.0022}
                  strokeDasharray={`${W * 0.006},${W * 0.006}`}
                  strokeLinejoin="round" />
                  }
                <polyline points={pathUpTo(traj, pcaStep)}
                  fill="none"
                  stroke="var(--flow)"
                  strokeWidth={W * 0.0034}
                  strokeLinejoin="round" />
                {/* Visited waypoints */}
                {traj.filter((p) => p.step <= pcaStep).map((p) =>
                  <circle key={p.step}
                  cx={p.x} cy={p.y}
                  r={W * 0.0042 * dotScale}
                  fill="var(--flow)" />
                  )}
                {/* Leading head — interpolated, with halo */}
                <circle cx={head.x} cy={head.y}
                  r={W * 0.0095 * dotScale * headScale}
                  fill="var(--flow)"
                  stroke="var(--bg)"
                  strokeWidth={W * 0.0014} />
                <circle cx={head.x} cy={head.y}
                  r={W * 0.0095 * dotScale * headScale}
                  fill="none"
                  stroke="var(--flow)"
                  opacity="0.7">
                  <animate attributeName="r"
                    values={`${W * 0.0095 * dotScale * headScale};${W * 0.020 * dotScale * headScale};${W * 0.0095 * dotScale * headScale}`}
                    dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity"
                    values="0.7;0;0.7"
                    dur="1.8s" repeatCount="indefinite" />
                </circle>
              </g>);

            })()}
          </React.Fragment>
          }
        </svg>
      </div>

      {view === "fan" ?
      <div style={lpStyles.legend}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginRight: 4 }}>step</span>
          {/* Smooth gradient bar + a few numerical anchors */}
          <div style={{
          flex: 1, minWidth: 180, maxWidth: 320, height: 10, borderRadius: 2,
          background: `linear-gradient(to right, ${STEP_COLOR_STOPS.map((s) => `${s.color} ${(s.step / 32 * 100).toFixed(1)}%`).join(", ")})`
        }} />
          {[0, 8, 16, 24, 32].map((s) =>
        <span key={s} className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{s}</span>
        )}
        </div> :

      <div style={lpStyles.legend}>
          <span className="mono" style={lpStyles.legendItem}>
            <span style={{ ...lpStyles.legendSwatch, background: "var(--flow)", opacity: 0.55 }} /> all 256
          </span>
          <span className="mono" style={lpStyles.legendItem}>
            <span style={{ ...lpStyles.legendSwatch, background: "var(--flow)" }} /> selected
          </span>
        </div>
      }
    </section>);

}

// =============================================================
// MF one-step mapping panel
// =============================================================
function MeanPCAPanel({ proj, loadedSet, selectedSid, progress01, onSelect, dotScale, headScale, bgScale, view }) {
  const allPts = lpUseMemo(() => {
    const pts = [];
    for (const s of proj.samples) {pts.push(s.start, s.final);}
    return pts;
  }, [proj]);
  const viewBox = lpUseMemo(() => computeViewBox(allPts), [allPts]);
  const W = viewBox.w;

  // Match left-panel scaling so the swarms read as the same size:
  // when Flow shows the fan view, its bg dots use `dotScale`. So MF
  // should too. In animate view, both use the dedicated `bgScale`.
  const swarmScale = view === "fan" ? dotScale : bgScale;

  // MF "ease" — softer than linear so the leap reads as a single confident motion
  const u = easeOutCubic(Math.max(0, Math.min(1, progress01)));

  const selected = selectedSid != null ?
  proj.samples.find((s) => s.sample_id === selectedSid) :
  null;

  return (
    <section style={lpStyles.panel} data-screen-label="MeanFlow latent PCA">
      <div style={{ ...lpStyles.panelHeader, borderTop: "2px solid var(--mean)" }}>
        <div>
          <div style={lpStyles.headerRow}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--mean)" }} />
            <h3 style={lpStyles.h3}>MeanFlow</h3>
          </div>
        </div>
        <div className="mono" style={{ textAlign: "right", fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
          {u < 0.001 ? "z₀" : u > 0.999 ? "1-step" : "leap"}
        </div>
      </div>

      <div style={lpStyles.svgWrap}>
        <svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={lpStyles.svg}>

          {/* Static guide lines — full mapping in faint gray */}
          <g opacity="0.13">
            {proj.samples.map((s) =>
            <line key={s.sample_id}
            x1={s.start.x} y1={s.start.y}
            x2={s.final.x} y2={s.final.y}
            stroke="var(--ink-3)"
            strokeWidth={W * 0.0008} />
            )}
          </g>

          {/* Static start positions only (Gaussian noise cloud). The
              final-position layer was removed to avoid haloing every
              animated particle once u→1. */}
          <g opacity="0.32">
            {proj.samples.map((s) =>
              <circle key={s.sample_id}
                cx={s.start.x} cy={s.start.y}
                r={W * 0.0024 * dotScale}
                fill="var(--noise)" />
            )}
          </g>

          {/* Animated particles — each rides start→final with eased u */}
          <g>
            {proj.samples.map((s) => {
              const isSelected = s.sample_id === selectedSid;
              if (isSelected) return null; // drawn on top last
              const x = s.start.x + (s.final.x - s.start.x) * u;
              const y = s.start.y + (s.final.y - s.start.y) * u;
              const loaded = loadedSet.has(s.sample_id);
              // In fan view we want uniform dot size across loaded/unloaded
              // (matching Flow's fan dots which are also uniform). In
              // animate view, keep the loaded subset slightly larger so
              // the clickable samples stand out.
              const r = view === "fan"
                ? W * 0.0034 * swarmScale
                : (loaded ? W * 0.0034 * swarmScale : W * 0.0022 * swarmScale);
              return (
                <circle key={s.sample_id}
                cx={x} cy={y}
                r={r}
                fill="var(--mean)"
                opacity={view === "fan" ? 0.85 : (loaded ? 0.95 : 0.55)} />);

            })}
          </g>

          {/* 20 loaded samples — clickable hit areas (overlay lines) */}
          <g>
            {proj.samples.
            filter((s) => loadedSet.has(s.sample_id) && s.sample_id !== selectedSid).
            map((s) =>
            <g key={s.sample_id}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(s.sample_id)}>
                  <line x1={s.start.x} y1={s.start.y}
              x2={s.final.x} y2={s.final.y}
              stroke="var(--ink-2)"
              strokeOpacity="0.42"
              strokeWidth={W * 0.0011} />
                  <line x1={s.start.x} y1={s.start.y}
              x2={s.final.x} y2={s.final.y}
              stroke="transparent"
              strokeWidth={W * 0.012} />
                </g>
            )}
          </g>

          {/* Selected — accent line, animated particle */}
          {selected && (() => {
            const x = selected.start.x + (selected.final.x - selected.start.x) * u;
            const y = selected.start.y + (selected.final.y - selected.start.y) * u;
            return (
              <g>
                <line x1={selected.start.x} y1={selected.start.y}
                x2={selected.final.x} y2={selected.final.y}
                stroke="var(--mean)"
                strokeOpacity="0.6"
                strokeWidth={W * 0.0026} />
                {/* Start marker — enlarged Gaussian noise swatch */}
                <circle cx={selected.start.x} cy={selected.start.y}
                r={W * 0.0055 * dotScale}
                fill="var(--noise)"
                opacity="0.85" />
                {/* Final marker */}
                <circle cx={selected.final.x} cy={selected.final.y}
                r={W * 0.006 * dotScale}
                fill="var(--mean)"
                opacity="0.4" />
                {/* Moving head */}
                <circle cx={x} cy={y}
                r={W * 0.0105 * dotScale * headScale}
                fill="var(--mean)"
                stroke="var(--bg)"
                strokeWidth={W * 0.0014} />
                <circle cx={x} cy={y}
                r={W * 0.0105 * dotScale * headScale}
                fill="none"
                stroke="var(--mean)"
                opacity="0.7">
                  <animate attributeName="r"
                  values={`${W * 0.0105 * dotScale * headScale};${W * 0.022 * dotScale * headScale};${W * 0.0105 * dotScale * headScale}`}
                  dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity"
                  values="0.7;0;0.7"
                  dur="2s" repeatCount="indefinite" />
                </circle>
              </g>);

          })()}
        </svg>
      </div>

      <div style={lpStyles.legend}>
        <span className="mono" style={lpStyles.legendItem}>
          <span style={{ ...lpStyles.legendSwatch, background: "var(--noise)" }} /> Gaussian<sub></sub>
        </span>
        <span className="mono" style={lpStyles.legendItem}>
          <span style={{ ...lpStyles.legendSwatch, background: "var(--mean)" }} /> 1-step final
        </span>
      </div>
    </section>);

}

// =============================================================
// Top-level LatentPCA section
// =============================================================
function LatentPCA() {
  const ctx = lpUseContext(window.TrajectoryContext);
  const { data: pcaData, err } = useLatentPCAData();
  const exportPanel = window.__LT_PANEL || new URLSearchParams(window.location.search).get("panel");
  const standaloneGeometry = exportPanel === "geometry";

  // PCA-section-local "play evolution" state — independent of the text reader.
  // progress01 maps 0..1 → fractional PCA step 0..32.
  const [progress01, setProgress01] = lpUseState(standaloneGeometry ? 0 : 1);
  const [playing, setPlaying] = lpUseState(standaloneGeometry);
  const [durationMs, setDurationMs] = lpUseState(1600);
  // How many Flow solver steps the MF leap takes (in wall-clock units).
  //   1  = MF finishes within ONE Flow step (instant-ish, the lower bound)
  //   4  = MF takes 4 Flow steps to complete its leap (default — visible motion)
  //   32 = MF takes the entire run (matches Flow's pace)
  // Bigger number = slower MF (more visible leap).
  const [mfStepCount, setMfStepCount] = lpUseState(3);
  // Particle size scaling — multiplies all dot radii live so the user
  // can dial in legibility without rebuilding the scene.
  const [dotScale, setDotScale] = lpUseState(3.0);
  // Selected-sample pulse-head size relative to the global dotScale.
  // The pulse head is the moving frontier marker on the selected
  // sample; at headScale=1 it matches its baseline (which is already
  // larger than the static dots). Lower this if it feels too punchy.
  const [headScale, setHeadScale] = lpUseState(0.5);
  // Animate-view background dot scaling (the 256 moving particles in
  // the Flow + MF panels). Separate from dotScale so the global dot
  // size knob doesn't blow up the swarm.
  const [bgScale, setBgScale] = lpUseState(4);
  // 'animate' = play-evolution view (default); 'fan' = static, time-coloured
  const [view, setView] = lpUseState("animate");
  // How many measurement waypoints to display on the Flow trajectory.
  // The dense file gives us all 33 steps; we expose presets that
  // subsample it. The default "log" preset matches the original
  // sparse asset's spacing — denser near t=1 where the trajectory
  // moves fast, coarser later when it's settling.
  const [waypointPreset, setWaypointPreset] = lpUseState("log");
  const VISIBLE_STEPS_BY_PRESET = {
    "log": [0, 1, 2, 4, 8, 16, 24, 32], // default — original asset spacing
    "32": Array.from({ length: 33 }, (_, i) => i), // every step 0..32
    "16": Array.from({ length: 17 }, (_, i) => i * 2), // 0, 2, 4, ..., 32
    "8": Array.from({ length: 9 }, (_, i) => i * 4), // 0, 4, 8, ..., 32
    "4": Array.from({ length: 5 }, (_, i) => i * 8) // 0, 8, 16, 24, 32
  };
  const visibleSteps = VISIBLE_STEPS_BY_PRESET[waypointPreset];
  const rafRef = lpUseRef(null);
  const startRef = lpUseRef(0);
  const loopTimerRef = lpUseRef(null);
  const [localActive, setLocalActive] = lpUseState(standaloneGeometry);

  lpUseEffect(() => {
    if (!playing) return;
    function tick(now) {
      if (!startRef.current) startRef.current = now;
      const u = Math.min(1, (now - startRef.current) / durationMs);
      setProgress01(u);
      if (u < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
        if (standaloneGeometry) {
          loopTimerRef.current = setTimeout(() => {
            startRef.current = 0;
            setProgress01(0);
            setLocalActive(true);
            setPlaying(true);
          }, 1000);
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      startRef.current = 0;
    };
  }, [playing, durationMs, standaloneGeometry]);

  // While the local play is idle, fall back to the text reader's stepIdx
  // so the two views stay coherent. Once user hits ▶ the local progress
  // takes over until it finishes.
  const startLocalPlay = lpUseCallback(() => {
    setProgress01(0);
    setLocalActive(true);
    setPlaying(true);
  }, []);
  const resetLocalPlay = lpUseCallback(() => {
    setPlaying(false);
    setProgress01(0);
    setLocalActive(true);
  }, []);

  // Effective fractional PCA step (Flow) and 0..1 progress (MF).
  //
  // Wall-clock alignment: a single `progress01` in [0,1] maps the
  // FULL total duration, where one Flow solver step = total / 32.
  //   - Flow:       pcaStep    = progress01 * 32 — linear over 32 steps.
  //   - MF leap:    mfProgress = min(1, progress01 * 32 / mfStepCount)
  //                 MF reaches its final after `mfStepCount` Flow steps;
  //                 then sits motionless until Flow catches up.
  const txtStepIdx = ctx?.stepIdx ?? 32;
  const txtTotal = ctx?.total ?? 32;
  const pcaStep = localActive ?
  progress01 * 32 :
  txtStepIdx;
  const mfProgress = localActive ?
  Math.min(1, progress01 * 32 / mfStepCount) :
  txtStepIdx >= 1 ? 1 : 0;

  const loadedSet = lpUseMemo(
    () => new Set(ctx?.loadedSampleIds ?? []),
    [ctx?.loadedSampleIds]
  );

  if (err) return <div className="mono" style={{ color: "var(--ink-3)", padding: 20 }}>Failed to load latent_pca.json: {err}</div>;
  if (!pcaData || !ctx) return <div className="mono" style={{ color: "var(--ink-3)", padding: 20 }}>Loading latent geometry…</div>;

  return (
    <section style={lpStyles.wrap}>
      <div style={lpStyles.sectionHeader}>
        <h2 style={lpStyles.sectionH2}>Latent-space trajectories</h2>
        <p style={lpStyles.lede}>
          Each dot is a generated latent projected into the same PCA plane. The Flow panel shows
          many small updates from Gaussian noise toward the data manifold; MeanFlow tries to make
          the same trip in one learned jump. Read this as a geometry check: does the one-step map
          land in the same region as the multi-step trajectory?
        </p>
      </div>

      <div style={lpStyles.controls}>
        <PCASamplePicker
          n={ctx.loadedSampleIds.length}
          value={ctx.sampleIdx}
          onChange={(v) => {
            ctx.setSampleIdx(v);
            ctx.setStepIdx(0);
            setProgress01(0);
            setLocalActive(true);
            setPlaying(true);
          }} />
        <button onClick={playing ? () => setPlaying(false) : startLocalPlay}
        style={{ ...lpStyles.btn, ...lpStyles.btnPrimary }}>
          {playing ? "❚❚ pause" : "▶ play"}
        </button>
        <button onClick={resetLocalPlay} style={lpStyles.btn}>
          ⟲ reset
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 220 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>progress</span>
          <input type="range" min={0} max={1000} step={1}
          value={Math.round(progress01 * 1000)}
          onChange={(e) => {
            setPlaying(false);
            setLocalActive(true);
            setProgress01(parseInt(e.target.value) / 1000);
          }}
          style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", minWidth: 44 }}>
            {progress01.toFixed(2)}
          </span>
        </div>
        {false && <div style={lpStyles.segGroup}>
          {[
          { key: "animate", label: "▶ animate" },
          { key: "fan", label: "time fan" }].
          map((opt) =>
          <button key={opt.key}
          onClick={() => setView(opt.key)}
          className="mono"
          style={{
            ...lpStyles.segBtn,
            ...(view === opt.key ? lpStyles.segBtnActive : {})
          }}>{opt.label}</button>
          )}
        </div>}
        {false && <>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}
        title="Wall-clock duration for ONE Flow solver step. Total run = 32 × this.">
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>flow / step</span>
          <input type="range" min={50} max={500} step={10}
          value={Math.round(durationMs / 32)}
          onChange={(e) => setDurationMs(parseInt(e.target.value) * 32)}
          style={{ width: 120 }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", minWidth: 72 }}>
            {Math.round(durationMs / 32)}ms · 32×
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--mean)" }}
        title="How many Flow steps the MF leap takes. Lower = snappier MF; higher = MF visibly slower / matches Flow's pace.">
          <span className="mono" style={{ fontSize: 11 }}>mf leap</span>
          <input type="range" min={1} max={32} step={1}
          value={mfStepCount}
          onChange={(e) => setMfStepCount(parseInt(e.target.value))}
          style={{ width: 100, accentColor: "var(--mean)" }} />
          <span className="mono" style={{ fontSize: 11, minWidth: 88 }}>
            {mfStepCount} step{mfStepCount === 1 ? "" : "s"} · {Math.round(durationMs / 32 * mfStepCount)}ms
          </span>
        </div>
        <button onClick={() => {resetLocalPlay();setLocalActive(false);}}
        className="mono"
        style={{ ...lpStyles.btn, fontSize: 11, opacity: localActive ? 1 : 0.5 }}
        title="Stop local playback and re-sync with text reader's step slider">
          sync ↑
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid var(--rule)", paddingLeft: 12 }}>
          <span className="mono"
          style={{ fontSize: 11, color: "var(--ink-3)" }}
          title="How many measurement waypoints to draw on the Flow trajectory polyline. We have PCA only for the 32-step solver run; this is visualization density, not solver NFE.">
            waypoints
          </span>
          {["4", "8", "16", "32", "log"].map((p) =>
          <button key={p}
          onClick={() => setWaypointPreset(p)}
          className="mono"
          style={{
            ...lpStyles.btn,
            fontSize: 11,
            padding: "6px 10px",
            ...(waypointPreset === p ? lpStyles.btnPrimary : {})
          }}>
              {p}
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid var(--rule)", paddingLeft: 12 }}
        title="Scale of every particle / waypoint dot in both panels.">
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>dot size</span>
          <input type="range" min={5} max={50} step={1}
          value={Math.round(dotScale * 10)}
          onChange={(e) => setDotScale(parseInt(e.target.value) / 10)}
          style={{ width: 100 }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", minWidth: 36 }}>
            {dotScale.toFixed(1)}×
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}
        title="Scale of the moving pulse-head on the selected sample, relative to dot size.">
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>head</span>
          <input type="range" min={2} max={20} step={1}
          value={Math.round(headScale * 10)}
          onChange={(e) => setHeadScale(parseInt(e.target.value) / 10)}
          style={{ width: 80 }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", minWidth: 36 }}>
            {headScale.toFixed(1)}×
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}
        title="Scale of the 256 background swarm particles in the animate view (Flow + MF panels).">
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>swarm</span>
          <input type="range" min={2} max={40} step={1}
          value={Math.round(bgScale * 10)}
          onChange={(e) => setBgScale(parseInt(e.target.value) / 10)}
          style={{ width: 80 }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", minWidth: 36 }}>
            {bgScale.toFixed(1)}×
          </span>
        </div>
        </>}
      </div>

      <div style={lpStyles.grid}>
        <FlowPCAPanel
          proj={pcaData.projections.jit_z_t_pca_dense}
          loadedSet={loadedSet}
          selectedSid={ctx.currentSampleId}
          pcaStep={pcaStep}
          total={txtTotal}
          onSelect={ctx.selectBySampleId}
          visibleSteps={visibleSteps}
          dotScale={dotScale}
          headScale={headScale}
          bgScale={bgScale}
          view={view} />
        
        <MeanPCAPanel
          proj={pcaData.projections.mf_on_jit_z_t_pca_dense_basis}
          loadedSet={loadedSet}
          selectedSid={ctx.currentSampleId}
          progress01={mfProgress}
          onSelect={ctx.selectBySampleId}
          dotScale={dotScale}
          headScale={headScale}
          bgScale={bgScale}
          view={view} />
        
      </div>
    </section>);

}

function PCASamplePicker({ n, value, onChange }) {
  const prev = () => onChange((value - 1 + n) % n);
  const next = () => onChange((value + 1) % n);
  return (
    <div style={lpStyles.stepper} aria-label="sample selector">
      <button onClick={prev} className="mono" style={{ ...lpStyles.stepperBtn, borderRight: "1px solid var(--rule)" }}>‹</button>
      <div className="mono" style={lpStyles.stepperCenter}>
        <div style={lpStyles.stepperLabel}>sample</div>
        <div style={lpStyles.stepperValue}>{value + 1} <span style={lpStyles.stepperSlash}>/</span> {n}</div>
      </div>
      <button onClick={next} className="mono" style={{ ...lpStyles.stepperBtn, borderLeft: "1px solid var(--rule)" }}>›</button>
    </div>
  );
}

const lpStyles = {
  wrap: { marginTop: 56, paddingTop: 36, borderTop: "1px solid var(--rule-2)" },
  sectionHeader: { marginBottom: 18 },
  sectionH2: {
    fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500, margin: "6px 0 8px",
    letterSpacing: -0.3, color: "var(--ink)"
  },
  lede: {
    maxWidth: 880, color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.55,
    margin: 0, textWrap: "pretty"
  },

  controls: {
    marginTop: 18, marginBottom: 14,
    display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
    padding: "12px 14px",
    background: "var(--panel)",
    border: "1px solid var(--rule)",
    borderRadius: 8
  },
  btn: {
    fontFamily: "var(--mono)", fontSize: 12, padding: "8px 12px",
    border: "1px solid var(--rule)", borderRadius: 5,
    background: "var(--bg-2)", color: "var(--ink)"
  },
  btnPrimary: {
    background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)"
  },
  stepper: {
    display: "flex", alignItems: "stretch",
    overflow: "hidden",
    background: "var(--panel)", border: "1px solid var(--rule)", borderRadius: 6
  },
  stepperBtn: {
    width: 36, padding: 0,
    fontSize: 18,
    color: "var(--ink-2)", background: "var(--bg-2)"
  },
  stepperCenter: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "0 14px", background: "var(--panel)", textAlign: "center"
  },
  stepperLabel: {
    fontSize: 10, lineHeight: 1.2, color: "var(--ink-3)", letterSpacing: 0.2
  },
  stepperValue: {
    marginTop: 1, fontSize: 14, lineHeight: 1.25, fontWeight: 500, color: "var(--ink)"
  },
  stepperSlash: {
    color: "var(--ink-2)", padding: "0 2px"
  },

  segGroup: {
    display: "inline-flex", border: "1px solid var(--rule)", borderRadius: 5, overflow: "hidden"
  },
  segBtn: {
    fontSize: 12, padding: "7px 14px", color: "var(--ink-2)",
    borderRight: "1px solid var(--rule-2)", background: "var(--panel)"
  },
  segBtnActive: { background: "var(--ink)", color: "var(--bg)" },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },
  panel: {
    background: "var(--panel)",
    border: "1px solid var(--rule)",
    borderRadius: 6,
    overflow: "hidden",
    display: "flex", flexDirection: "column"
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "14px 18px 12px",
    borderBottom: "1px solid var(--rule-2)",
    gap: 16
  },
  headerRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  h3: { fontSize: 16, margin: 0, fontWeight: 500, letterSpacing: -0.1 },
  sub: { color: "var(--ink-3)", fontSize: 11.5, marginTop: 4 },

  svgWrap: { padding: "10px 6px", background: "var(--bg-2)", borderBottom: "1px solid var(--rule-2)" },
  svg: { width: "100%", height: 420, display: "block" },

  legend: {
    padding: "10px 16px",
    display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap"
  },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-2)" },
  legendSwatch: { display: "inline-block", width: 10, height: 10, borderRadius: 2 }
};

window.LatentPCA = LatentPCA;
