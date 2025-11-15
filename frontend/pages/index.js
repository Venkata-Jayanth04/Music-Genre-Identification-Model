// frontend/pages/index.js
import { useState, useRef } from "react";

const CLASS_NAMES = ["blues","classical","country","disco","hiphop","jazz","metal","pop","reggae","rock"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/predict";

function prettyPercent(v) { return `${Math.round(v * 100)}%`; }

export default function Home() {
  const [mode, setMode] = useState("image"); // "audio" or "image"
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { pred_class, probs }
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false); // details panel
  const inputRef = useRef();

  function resetAll() {
    setFile(null); setPreviewUrl(null); setResult(null); setError(null); setExpanded(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onFilePicked(f) {
    setError(null);
    setResult(null);
    setExpanded(false);
    setFile(f);
    if (!f) { setPreviewUrl(null); return; }
    if (mode === "image") setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  }

  function onInputChange(e) {
    const f = e.target.files[0];
    onFilePicked(f);
  }
  function onDrop(e) { e.preventDefault(); if (e.dataTransfer?.files?.length) onFilePicked(e.dataTransfer.files[0]); }
  function onDragOver(e) { e.preventDefault(); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setExpanded(false);
    if (!file) { setError("Choose a file first."); return; }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("mode", mode);

      const res = await fetch(API_URL, { method: "POST", body: form });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Server responded ${res.status}`);
      }
      const data = await res.json();
      let probs = data.probs || data.probabilities || [];
      probs = probs.map(p => Number(p) || 0);
      const s = probs.reduce((a,b)=>a+b,0);
      if (s > 1e-6) probs = probs.map(p=>p/s);
      const pred_class = data.pred_class ?? CLASS_NAMES[data.pred_idx ?? 0];
      setResult({ pred_class, probs });
      setExpanded(false);
    } catch (err) {
      console.error(err);
      setError(String(err).replace("Error:","").trim());
    } finally {
      setLoading(false);
    }
  }

  // compute top1 and top3 from result.probs
  let top1 = null, top3 = [];
  if (result && result.probs && result.probs.length === CLASS_NAMES.length) {
    const pairs = result.probs.map((p,i)=>({i,p,className:CLASS_NAMES[i]}));
    pairs.sort((a,b)=>b.p - a.p);
    top1 = pairs[0];
    top3 = pairs.slice(0,3);
  }

  return (
    <>
      <main>
        <div className="wrap">
          <header className="header">
            <h1>Music Genre Classifier</h1>
            <p className="subtitle">Upload audio (wav/mp3) or a spectrogram image (png) — prediction shows the top result. Click the arrow for details.</p>
          </header>

          <section className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label className="small-label">Mode</label>
                <select value={mode} onChange={(e)=>{ setMode(e.target.value); resetAll(); }}>
                  <option value="audio">Audio</option>
                  <option value="image">Image</option>
                </select>
              </div>

              <div
                className={`dropzone ${file ? "filled" : ""}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={()=> inputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <input ref={inputRef} type="file" accept={mode==="image" ? "image/*" : "audio/*"} onChange={onInputChange} style={{display:"none"}} />
                {!file ? (
                  <div className="drop-hint">
                    <strong>Drag & drop</strong> or click to choose {mode==="audio" ? "an audio file" : "a spectrogram image"}
                    <div className="muted">Supported: WAV, MP3, PNG, JPG</div>
                  </div>
                ) : (
                  <div className="file-box">
                    <div className="file-left">
                      <div className="file-name">{file.name}</div>
                      <div className="muted">Click Reset to choose another file</div>
                    </div>
                    {mode==="image" && previewUrl && (
                      <div className="thumb">
                        <img src={previewUrl} alt="preview" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="controls">
                <button className="btn primary" type="submit" disabled={loading}>{loading ? "Predicting…" : "Predict"}</button>
                <button type="button" className="btn" onClick={resetAll} disabled={loading}>Reset</button>
              </div>
            </form>
          </section>

          <section className="card result-card">
            <h2 className="result-title">Result</h2>

            {error && <div className="notice error">{error}</div>}

            {!result && !error && !loading && <div className="muted">No result yet — submit a file to classify.</div>}

            {loading && (
              <div className="loading">
                <div className="spinner" aria-hidden />
                <div>Model is running — this may take a few seconds on first run.</div>
              </div>
            )}

            {/* TOP-1 display */}
            {top1 && (
              <div className="top1">
                <div className="left">
                  <div className="label">Predicted</div>
                  <div className="genre">{top1.className}</div>
                </div>

                <div className="right">
                  <div className="percent">{prettyPercent(top1.p)}</div>
                  <div className="mini-bar">
                    <div className="mini-fill" style={{width: `${Math.max(2, top1.p*100)}%`}} />
                  </div>
                  <button className="expand-btn" onClick={()=>setExpanded(s=>!s)} aria-expanded={expanded} aria-label="Show details">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {expanded ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6" />}
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Expandable details: show top-3 only */}
            {expanded && top3.length > 0 && (
              <div className="details">
                <div className="detail-title">Top 3 predictions</div>
                <ol className="top3-list">
                  {top3.map((t,idx)=>(
                    <li key={t.i} className="top3-item">
                      <div className="t-left">
                        <span className="rank">{idx+1}.</span>
                        <span className="name">{t.className}</span>
                      </div>
                      <div className="t-right">
                        <div className="bar-small">
                          <div className="bar-fill" style={{width: `${Math.max(2, t.p*100)}%`}} />
                        </div>
                        <div className="val">{prettyPercent(t.p)}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* If no result and not loading, keep message */}
          </section>

          <footer className="footer">Built with ❤️ · Model: <code>{API_URL}</code></footer>
        </div>
      </main>

<style jsx>{`
  :global(:root) {
    --bg:#f4f7fb;
    --card:#ffffff;
    --muted:#6b7280;
    --accent:#4f46e5;
    --accent-2:#7c3aed;
    --danger:#ef4444;
    --bg-gradient-start:#eef2ff;
    --bg-gradient-end:#fafaff;
  }

  :global(body) {
  margin:0;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: linear-gradient(180deg, var(--bg-gradient-start), var(--bg-gradient-end));
  color: var(--text, #0f172a);
 }

  main {
    padding: 40px 16px;
    min-height: 100vh;
    display: flex;
    justify-content: center;
  }

  .wrap {
    width: 100%;
    max-width: 850px;
  }

  /* ----------------------- HEADER ----------------------- */
  .header {
    text-align: center;
    margin-bottom: 24px;
  }

  .header h1 {
    margin: 0;
    font-size: 40px;         /* BIG TITLE */
    font-weight: 800;
  }

  .subtitle {
    color: var(--muted);
    font-size: 18px;         /* LARGE SUBTEXT */
    margin-top: 10px;
  }

  /* ----------------------- CARD ----------------------- */
  .card {
    background: var(--card);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 30px rgba(18,23,38,0.08);
    margin-bottom: 28px;
  }

  .form-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
  }

  .small-label {
    font-size: 16px;
    color: var(--muted);
  }

  select {
    font-size: 16px;
    padding: 6px 10px;
  }

  /* ----------------------- DROPZONE ----------------------- */
  .dropzone {
    border: 2px dashed rgba(15,23,42,0.10);
    border-radius: 14px;
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 20px;
    transition: transform .12s;
    font-size: 18px;
  }

  .dropzone:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(15,23,42,0.05);
  }

  .file-name {
    font-size: 18px;      /* Larger file name */
    font-weight: 600;
  }

  .thumb {
    width: 240px;
    height: 140px;
  }

  /* ----------------------- BUTTONS ----------------------- */
  .controls {
    display: flex;
    gap: 14px;
    margin-top: 20px;
  }

  .btn {
    padding: 12px 18px;     /* Larger buttons */
    font-size: 18px;
    border-radius: 10px;
    cursor: pointer;
  }

  .btn.primary {
    background: linear-gradient(90deg,var(--accent),var(--accent-2));
    color: white;
    border: none;
  }

  /* ----------------------- RESULT ----------------------- */
  .result-title {
    font-size: 32px;
    text-align: center;
    margin-bottom: 20px;
  }

  .top1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .genre {
    font-size: 40px;    /* BIG PREDICTION */
    font-weight: 900;
    text-align: center;
    width: 100%;
    color: var(--accent-2);
  }

  .percent {
    font-size: 28px;     /* BIG PERCENT */
    font-weight: 800;
  }

  .mini-bar {
    width: 250px;
    height: 14px;        /* BIGGER BAR */
    border-radius: 8px;
  }

  .mini-fill {
    height: 100%;
    background: linear-gradient(90deg,var(--accent),var(--accent-2));
  }

  /* ----------------------- TOP 3 ----------------------- */
  .details {
    margin-top: 20px;
    padding-top: 14px;
  }

  .detail-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 14px;
  }

  .top3-item {
    font-size: 20px;    /* Larger text */
  }

  .bar-small {
    height: 14px;
  }

  .val {
    font-size: 18px;
  }

  /* ----------------------- FOOTER ----------------------- */
  .footer {
    text-align: center;
    margin-top: 20px;
    font-size: 16px;
    color: var(--muted);
  }

  @media (max-width: 600px) {
    .genre {
      font-size: 34px;
    }
    .percent {
      font-size: 24px;
    }
    .top3-item {
      font-size: 18px;
    }
  }
`}</style>

    </>
  );
}
