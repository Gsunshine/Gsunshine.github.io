// samples.jsx — real-sample viewer
//
// Shows actual decoded text from a 32-step JiT flow trajectory
// (TinyStories AE latents). Left panel scrubs through x0_pred
// at steps 1..32 — the model's evolving clean-latent guess.
// Right panel shows the same model's single-step prediction
// (step=1 x0_pred), the analogue of a 1-shot MeanFlow output.
//
// Diff highlighting: each step is compared to the previous step
// with a token-level LCS. Tokens newly introduced by the current
// JiT readout flash left-to-right, which makes the edit path more
// readable than position-wise replacement.

const { useEffect, useMemo, useRef, useState, useContext } = React;

// Pulls the shared trajectory bundle + selection state from the App-level
// TrajectoryContext. We used to fetch trajectory.json locally; now App owns it.
function useTrajectoryCtx() {
  return useContext(window.TrajectoryContext);
}

// Tokenise text into a list of [word, separator] tuples so we can
// rebuild whitespace/newlines faithfully when rendering. Simple
// regex; preserves paragraph breaks.
function tokenise(text) {
  if (!text) return [];
  const out = [];
  const re = /(\s+)|([^\s]+)/g;
  let m,currentWord = null;
  // We collect words with their trailing separator. To do so we
  // walk word, sep, word, sep …
  let pending = { word: "", sep: "" };
  while ((m = re.exec(text)) !== null) {
    if (m[2] !== undefined) {
      // a word
      if (pending.word) {
        out.push(pending);
        pending = { word: "", sep: "" };
      }
      pending.word = m[2];
    } else if (m[1] !== undefined) {
      pending.sep += m[1];
      if (pending.word) {
        out.push(pending);
        pending = { word: "", sep: "" };
      }
    }
  }
  if (pending.word) out.push(pending);
  return out;
}

function sameToken(a, b) {
  return a?.word === b?.word;
}

// Diff: mark words that are not part of the longest common
// subsequence between prev/current. This avoids the usual shift
// artifact where one insertion makes every later position look new.
function diffTokens(prevTokens, currTokens) {
  if (!currTokens.length) return [];
  if (!prevTokens?.length) {
    return currTokens.map((tk, i) => ({ ...tk, changed: true, changeRank: i }));
  }

  const m = prevTokens.length;
  const n = currTokens.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = sameToken(prevTokens[i], currTokens[j])
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const stableCurr = new Set();
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (sameToken(prevTokens[i], currTokens[j])) {
      stableCurr.add(j);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  let changeRank = 0;
  return currTokens.map((tk, idx) => {
    const changed = !stableCurr.has(idx);
    return {
      ...tk,
      changed,
      changeRank: changed ? changeRank++ : -1
    };
  });
}

// =============================================================
// Sample viewer panel
// =============================================================
function TextSamplePanel({
  variant, title, subtitle, equation, step, stepTotal, t, schedule, oneShot,
  text, prevText, fadeKey, accent, accentSoft, accentTint,
  flashDurMs, flashStaggerMs, revisionKey, playing, stepDurationMs
}) {
  const tokens = useMemo(() => diffTokens(tokenise(prevText || ""), tokenise(text || "")),
  [text, prevText]);
  const changedCount = useMemo(() => tokens.reduce((acc, tk) => acc + (tk.changed ? 1 : 0), 0), [tokens]);

  const flashTiming = useMemo(() => {
    if (!playing || changedCount <= 1) {
      return { durationMs: flashDurMs, staggerMs: flashStaggerMs };
    }
    // During autoplay, the next solver step remounts changed tokens.
    // Keep the entire L→R wave inside the current per-step interval.
    const budgetMs = Math.max(120, stepDurationMs - 24);
    const durationMs = Math.min(flashDurMs, Math.max(90, Math.floor(budgetMs * 0.55)));
    const remainingMs = Math.max(0, budgetMs - durationMs);
    const staggerMs = Math.min(flashStaggerMs, remainingMs / Math.max(1, changedCount - 1));
    return { durationMs, staggerMs };
  }, [playing, changedCount, flashDurMs, flashStaggerMs, stepDurationMs]);

  return (
    <section style={{
      ...sampleStyles.panel,
      borderTop: `2px solid ${accent}`
    }} data-screen-label={variant === "flow" ? "Flow real samples" : "MeanFlow real samples"}>
      <div style={sampleStyles.panelHeader}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: accent }} />
            <h2 style={sampleStyles.h2}>{title}</h2>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            {oneShot ? "1-step" : `step ${step} / ${stepTotal}`}
          </div>
          <div className="mono" style={{ fontSize: 11, color: accent, fontWeight: 500 }}>
            {oneShot ? "t : 1 → 0" : `t = ${t.toFixed(4)}`}
          </div>
        </div>
      </div>

      <StepRibbon stepTotal={stepTotal} current={step} accent={accent} schedule={schedule} oneShot={oneShot} />

      <div style={{
        ...sampleStyles.textBody,
        "--flash-dur": `${flashTiming.durationMs}ms`
        // `fadeKey` triggers a brief fade-in whenever the sample
        // changes (e.g. user picks a new seed)
      }} key={fadeKey}>
        {tokens.length === 0 ?
        <span style={{ color: "var(--ink-3)", fontStyle: "italic" }}>(no readout at this step)</span> :

        tokens.map((tk, i) => {
          const isChanged = tk.changed;
          // Stagger by changed-token rank, not raw position. Stable
          // words do not consume time, but changed words still reveal
          // in their left-to-right order in the current text.
          const delay = `${Math.max(0, tk.changeRank) * flashTiming.staggerMs}ms`;
          const cls = isChanged ? "tok-real changed" : "tok-real stable";
          const key = isChanged
            ? `${revisionKey}-changed-${i}-${tk.word}`
            : `stable-${i}-${tk.word}`;
          return (
            <React.Fragment key={key}>
                <span className={cls} style={{
                // CSS vars drive the per-panel colour scheme
                "--accent": accent,
                "--accent-tint": accentTint,
                animationDelay: delay
              }}>{tk.word}</span>
                {tk.sep && <span className="tok-sep">{tk.sep}</span>}
              </React.Fragment>);

        })
        }
      </div>
    </section>);

}

// Visual ribbon showing all 32 step slots with current highlighted
function StepRibbon({ stepTotal, current, accent, schedule, oneShot }) {
  // For MeanFlow (oneShot): the ribbon is a single solver step,
  // so we render ONE wide bar that transitions from empty → filled
  // when `current` reaches 1. No 32 slots, no progressive shading.
  if (oneShot) {
    const active = current >= 1;
    return (
      <div style={sampleStyles.ribbon}>
        <div style={{
          flex: 1, height: 14, borderRadius: 2,
          background: active ? accent : "var(--rule-2)",
          opacity: active ? 1 : 0.85,
          transition: "background 240ms ease-out",
          position: "relative"
        }}>
          <span className="mono" style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, letterSpacing: 0.6,
            color: active ? "var(--bg)" : "var(--ink-3)",
            textTransform: "uppercase", fontWeight: 500
          }}>
            {active ? "1 step" : "predicting…"}
          </span>
        </div>
      </div>);

  }
  return (
    <div style={sampleStyles.ribbon}>
      <div style={{ display: "flex", gap: 2, alignItems: "stretch", flex: 1 }}>
        {Array.from({ length: stepTotal }, (_, i) => {
          const step = i + 1;
          const passed = step < current;
          const cur = step === current;
          return (
            <div key={i} style={{
              flex: 1,
              height: 14,
              background: cur ? accent : passed ? "var(--ink-2)" : "var(--rule-2)",
              opacity: cur ? 1 : passed ? 0.45 : 1,
              borderRadius: 1,
              transition: "background 120ms, opacity 120ms"
            }} title={`step ${step}, t = ${schedule?.[step]?.toFixed(3) ?? "?"}`} />);

        })}
      </div>
    </div>);

}

// =============================================================
// Main RealSamples component
// =============================================================
function RealSamples() {
  const ctx = useTrajectoryCtx();
  const data = ctx?.data;
  const sampleIdx = ctx?.sampleIdx ?? 0;
  const stepIdx = ctx?.stepIdx ?? 0;
  const setSampleIdx = ctx?.setSampleIdx;
  const setStepIdx = ctx?.setStepIdx;
  const [playing, setPlaying] = useState(true);
  const [stepDurationMs] = useState(200); // fixed export pace; shared by both panels
  // Which decoded state to show on the Flow side:
  //   "x0"  — x̂₀: the model's current clean-latent estimate
  //   "zt"  — z_t: the noisy solver state at that step
  // MF side is unaffected (only the final sample exists).
  const [view] = useState("zt");
  // AR-decoding flash animation knobs — exposed as live sliders so we can
  // dial in the right visual rhythm before locking the defaults.
  const [flashDurMs] = useState(260);
  const [flashStaggerMs] = useState(4);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  // Autoplay step animation — ticks at exactly stepDurationMs per
  // solver step, so wall-clock time is shared between Flow and MF.
  useEffect(() => {
    if (!playing || !data) return;
    let loopTimer = null;
    function step(now) {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const total = data.metadata.jit_num_steps;
      const s = Math.min(total, Math.floor(elapsed / stepDurationMs));
      setStepIdx(s);
      if (s < total) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setPlaying(false);
        loopTimer = setTimeout(() => {
          startRef.current = 0;
          setStepIdx(0);
          setPlaying(true);
        }, 1200);
      }
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (loopTimer) clearTimeout(loopTimer);
      startRef.current = 0;
    };
  }, [playing, stepDurationMs, data]);

  if (!ctx || !data) return <div className="mono" style={{ color: "var(--ink-3)", padding: 20 }}>Loading real samples…</div>;

  const total = data.metadata.jit_num_steps;
  const schedule = data.metadata.schedule; // length total+1
  const sample = data.samples[sampleIdx];

  // Flow side: respect the view toggle. At step 32 only z_t is
  // available (x0_pred is null/empty); we transparently fall back
  // so the panel never goes blank at the endpoint.
  const tCurrent = stepIdx >= 1 ? schedule?.[stepIdx] ?? 0 : 1;
  const trCurr = stepIdx >= 1 ? sample.trajectory[stepIdx - 1] : null;
  const trPrev = stepIdx > 1 ? sample.trajectory[stepIdx - 2] : null;
  function pick(tr) {
    if (!tr) return "";
    if (view === "x0") return tr.x0_pred || tr.z_t || "";
    return tr.z_t || tr.x0_pred || "";
  }
  const flowText = pick(trCurr);
  const prevFlowText = pick(trPrev);

  // MeanFlow side: real one-shot sample. Reveals the moment Flow
  // crosses step 1 — same wall-clock instant — so the speed gap is
  // immediately visible. Stays committed for the rest of the run.
  const meanText = stepIdx >= 1 ? sample.mf_1step || "" : "";
  const meanCommitted = stepIdx >= 1 ? 1 : 0;

  return (
    <section style={sampleStyles.wrap}>
      <div style={sampleStyles.sectionIntro}>
        <h2 style={sampleStyles.sectionH2}>Decoded text trajectory</h2>
        <p style={sampleStyles.sectionLede}>
          Left: a 32-step flow trajectory decoded from the intermediate z_t states. Right: the
          corresponding one-step MeanFlow sample. The left-to-right flash marks words that changed
          from the previous latent state.
        </p>
      </div>
      <div style={sampleStyles.sectionHeader}>
        <SamplePicker
          n={data.samples.length}
          value={sampleIdx}
          onChange={(v) => {
            setSampleIdx(v);
            setStepIdx(0);
            startRef.current = 0;
            setPlaying(true);
          }} />
        <div style={sampleStyles.compactControls}>
          <button
            onClick={() => {
              if (playing) {
                setPlaying(false);
              } else {
                setStepIdx(0);
                startRef.current = 0;
                setPlaying(true);
              }
            }}
            style={{ ...sampleStyles.btn, ...sampleStyles.btnPrimary }}>
            {playing ? "❚❚ pause" : "▶ play"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStepIdx(0);
              startRef.current = 0;
            }}
            style={sampleStyles.btn}>
            ⟲ reset
          </button>
          <span className="mono" style={sampleStyles.stepLabel}>step {stepIdx}/{total}</span>
        </div>
      </div>

      <div style={sampleStyles.grid}>
        <TextSamplePanel
          variant="flow"
          title="Flow Matching (JiT)"
          equation=""
          step={stepIdx} stepTotal={total} t={tCurrent} schedule={schedule}
          text={flowText} prevText={prevFlowText}
          fadeKey={`flow-${sampleIdx}-${view}`}
          revisionKey={`flow-${sampleIdx}-${view}-${stepIdx}`}
          accent="var(--flow)" accentSoft="var(--flow-soft)" accentTint="var(--flow-tint)"
          flashDurMs={flashDurMs} flashStaggerMs={flashStaggerMs}
          playing={playing} stepDurationMs={stepDurationMs} />
        
        <TextSamplePanel
          variant="mean"
          title="MeanFlow"
          equation=""
          oneShot
          step={meanCommitted} stepTotal={1} t={0} schedule={schedule}
          text={meanText} prevText=""
          fadeKey={`mean-${sampleIdx}-${meanCommitted}`}
          revisionKey={`mean-${sampleIdx}-${meanCommitted}`}
          accent="var(--mean)" accentSoft="var(--mean-soft)" accentTint="var(--mean-tint)"
          flashDurMs={flashDurMs} flashStaggerMs={flashStaggerMs}
          playing={playing} stepDurationMs={stepDurationMs} />
        
      </div>
    </section>);

}

function SamplePicker({ n, value, onChange }) {
  const prev = () => onChange((value - 1 + n) % n);
  const next = () => onChange((value + 1) % n);
  return (
    <div style={sampleStyles.stepper} aria-label="sample selector">
      <button onClick={prev} className="mono" style={{ ...sampleStyles.stepperBtn, borderRight: "1px solid var(--rule)" }}>‹</button>
      <div className="mono" style={sampleStyles.stepperCenter}>
        <div style={sampleStyles.stepperLabel}>sample</div>
        <div style={sampleStyles.stepperValue}>{value + 1} <span style={sampleStyles.stepperSlash}>/</span> {n}</div>
      </div>
      <button onClick={next} className="mono" style={{ ...sampleStyles.stepperBtn, borderLeft: "1px solid var(--rule)" }}>›</button>
    </div>);

}

// =============================================================
// Styles
// =============================================================
const sampleStyles = {
  wrap: { marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--rule-2)" },
  sectionIntro: {
    maxWidth: 880,
    marginBottom: 18
  },
  sectionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    gap: 24, marginBottom: 18, flexWrap: "wrap"
  },
  sectionH2: {
    fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500, margin: "6px 0 6px",
    letterSpacing: -0.3, color: "var(--ink)"
  },
  sectionLede: {
    maxWidth: 760, color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.55,
    margin: 0, textWrap: "pretty"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18
  },
  panel: {
    background: "var(--panel)",
    border: "1px solid var(--rule)",
    borderRadius: 6,
    overflow: "hidden",
    display: "flex", flexDirection: "column"
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "16px 18px 14px", borderBottom: "1px solid var(--rule-2)",
    gap: 16
  },
  h2: { fontSize: 18, margin: 0, fontWeight: 500, letterSpacing: -0.1 },

  ribbon: {
    padding: "10px 16px",
    background: "var(--bg-2)",
    borderBottom: "1px solid var(--rule-2)",
    display: "flex", alignItems: "center"
  },

  textBody: {
    padding: "18px 22px 22px",
    fontFamily: "var(--serif)",
    fontSize: 14.5,
    lineHeight: 1.65,
    color: "var(--ink)",
    minHeight: 280,
    maxHeight: 520,
    overflow: "auto",
    whiteSpace: "pre-wrap",
    animation: "fadeIn 280ms ease-out"
  },

  controls: {
    marginTop: 18,
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
  select: {
    fontFamily: "var(--mono)", fontSize: 11, padding: "6px 8px",
    border: "1px solid var(--rule)", borderRadius: 4, background: "var(--panel)", color: "var(--ink)"
  },

  compactControls: {
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"
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
  stepLabel: {
    fontSize: 11, color: "var(--ink-2)", minWidth: 70
  },
  segGroup: {
    display: "inline-flex", border: "1px solid var(--rule)", borderRadius: 5, overflow: "hidden"
  },
  segBtn: {
    fontSize: 12, padding: "6px 14px", color: "var(--ink-2)",
    borderRight: "1px solid var(--rule-2)", background: "var(--panel)"
  },
  segBtnActive: { background: "var(--ink)", color: "var(--bg)" }
};

window.RealSamples = RealSamples;
