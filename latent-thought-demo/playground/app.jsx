// app.jsx — top-level shell
//
// Loads trajectory.json once, owns the {sampleIdx, stepIdx} selection,
// and exposes it via TrajectoryContext so both RealSamples (the text
// reader) and LatentPCA (the geometry viewer) stay in sync.

const { useState: appUseState, useEffect: appUseEffect, useCallback: appUseCallback, useMemo: appUseMemo, useRef: appUseRef } = React;

window.TrajectoryContext = React.createContext(null);

function App() {
  const [data, setData] = appUseState(null);
  const [err, setErr] = appUseState(null);
  const [sampleIdx, setSampleIdx] = appUseState(0);
  const [stepIdx, setStepIdx] = appUseState(32);
  const [autoPlaying, setAutoPlaying] = appUseState(true);
  const autoStartRef = appUseRef(0);
  const autoRafRef = appUseRef(null);
  const stepDurationMs = 200;
  const samplePauseMs = 10000;

  appUseEffect(() => {
    fetch("data/trajectory.json")
      .then(r => r.json())
      .then(setData)
      .catch(e => setErr(String(e)));
  }, []);

  const resetAutoClock = appUseCallback(() => {
    autoStartRef.current = 0;
  }, []);

  const restartAutoCycle = appUseCallback(() => {
    resetAutoClock();
    setStepIdx(0);
    setAutoPlaying(true);
  }, [resetAutoClock]);

  const resetAutoCycle = appUseCallback(() => {
    resetAutoClock();
    setStepIdx(0);
    setAutoPlaying(false);
  }, [resetAutoClock]);

  const selectSampleIdx = appUseCallback((idx, play = true) => {
    resetAutoClock();
    setSampleIdx(idx);
    setStepIdx(0);
    if (play) setAutoPlaying(true);
  }, [resetAutoClock]);

  appUseEffect(() => {
    if (!autoPlaying || !data) return;
    const total = data.metadata.jit_num_steps;
    const runMs = total * stepDurationMs;
    const cycleMs = runMs + samplePauseMs;

    function tick(now) {
      if (!autoStartRef.current) autoStartRef.current = now;
      const elapsed = now - autoStartRef.current;
      if (elapsed >= cycleMs) {
        autoStartRef.current = now;
        setSampleIdx(i => (i + 1) % data.samples.length);
        setStepIdx(0);
      } else {
        const s = Math.min(total, Math.floor(elapsed / stepDurationMs));
        setStepIdx(s);
      }
      autoRafRef.current = requestAnimationFrame(tick);
    }

    autoRafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(autoRafRef.current);
    };
  }, [autoPlaying, data, samplePauseMs, stepDurationMs]);

  const ctxValue = appUseMemo(() => {
    if (!data) return null;
    const loadedSampleIds = data.samples.map(s => s.sample_id);
    const total = data.metadata.jit_num_steps;
    return {
      data,
      total,
      loadedSampleIds,
      currentSampleId: data.samples[sampleIdx]?.sample_id ?? null,
      sampleIdx,
      stepIdx,
      setSampleIdx,
      setStepIdx,
      selectSampleIdx,
      autoPlaying,
      setAutoPlaying,
      restartAutoCycle,
      resetAutoCycle,
      stepDurationMs,
      samplePauseMs,
      selectBySampleId: (sid) => {
        const idx = data.samples.findIndex(s => s.sample_id === sid);
        if (idx >= 0) selectSampleIdx(idx, true);
      },
    };
  }, [data, sampleIdx, stepIdx, selectSampleIdx, autoPlaying, restartAutoCycle, resetAutoCycle]);

  if (err) {
    return <div style={appStyles.root}>
      <div className="mono" style={{ color: "var(--ink-3)" }}>Failed to load trajectory.json: {err}</div>
    </div>;
  }
  if (!data) {
    return <div style={appStyles.root}>
      <div className="mono" style={{ color: "var(--ink-3)" }}>Loading…</div>
    </div>;
  }

  return (
    <window.TrajectoryContext.Provider value={ctxValue}>
      <div style={appStyles.root}>
        <RealSamples />
        <LatentPCA />
      </div>
    </window.TrajectoryContext.Provider>
  );
}

const appStyles = {
  root: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "18px 22px 26px",
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
