// app.jsx — top-level shell
//
// Loads trajectory.json once, owns the {sampleIdx, stepIdx} selection,
// and exposes it via TrajectoryContext so both RealSamples (the text
// reader) and LatentPCA (the geometry viewer) stay in sync.

const { useState: appUseState, useEffect: appUseEffect, useCallback: appUseCallback, useMemo: appUseMemo } = React;

window.TrajectoryContext = React.createContext(null);

function App() {
  const [data, setData] = appUseState(null);
  const [err, setErr] = appUseState(null);
  const [sampleIdx, setSampleIdx] = appUseState(0);
  const [stepIdx, setStepIdx] = appUseState(32);
  const panel = appUseMemo(() => {
    const value = window.__LT_PANEL || new URLSearchParams(window.location.search).get("panel");
    return value === "text" || value === "geometry" ? value : "both";
  }, []);

  appUseEffect(() => {
    fetch("data/trajectory.json")
      .then(r => r.json())
      .then(setData)
      .catch(e => setErr(String(e)));
  }, []);

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
      selectBySampleId: (sid) => {
        const idx = data.samples.findIndex(s => s.sample_id === sid);
        if (idx >= 0) setSampleIdx(idx);
      },
    };
  }, [data, sampleIdx, stepIdx]);

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
      <div style={{
        ...appStyles.root,
        ...(panel === "text" ? appStyles.textRoot : {}),
        ...(panel === "geometry" ? appStyles.geometryRoot : {})
      }}>
        {panel !== "geometry" && <RealSamples />}
        {panel !== "text" && <LatentPCA />}
      </div>
    </window.TrajectoryContext.Provider>
  );
}

const appStyles = {
  root: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "32px 28px 48px",
  },
  textRoot: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  geometryRoot: {
    paddingTop: 8,
    paddingBottom: 20,
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
