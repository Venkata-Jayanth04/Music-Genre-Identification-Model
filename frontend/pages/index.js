// frontend/pages/index.js
import { useState, useRef } from "react";

const CLASS_NAMES = ["blues","classical","country","disco","hiphop","jazz","metal","pop","reggae","rock"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/predict";

export default function Home() {
  const [mode, setMode] = useState("image");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  function clearAll() {
    setFile(null); setPreviewUrl(null); setResult(null); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onFilePicked(f) {
    setError(null); setResult(null);
    setFile(f);
    if (!f) { setPreviewUrl(null); return; }
    if (mode === "image") setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  }

  function onInputChange(e) { onFilePicked(e.target.files[0]); }
  function onDrop(e){ e.preventDefault(); if (e.dataTransfer?.files?.length) onFilePicked(e.dataTransfer.files[0]); }
  function onDragOver(e){ e.preventDefault(); }

  async function handleSubmit(e){
    e.preventDefault();
    setError(null); setResult(null);
    if (!file) { setError("Choose a file first."); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("mode", mode);
      const res = await fetch(API_URL, { method: "POST", body: form });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server responded ${res.status}`);
      }
      const data = await res.json();
      let probs = data.probs || data.probabilities || [];
      probs = probs.map(p => Number(p) || 0);
      const s = probs.reduce((a,b)=>a+b,0);
      if (s>1e-6) probs = probs.map(p => p/s);
      const pred_class = data.pred_class ?? CLASS_NAMES[data.pred_idx ?? 0];
      setResult({ pred_class, probs });
    } catch (err) {
      console.error(err);
      setError(String(err).replace("Error:","").trim());
    } finally { setLoading(false); }
  }

  // compute top3 for details
  let top3 = [];
  if (result && result.probs && result.probs.length === CLASS_NAMES.length) {
    const pairs = result.probs.map((p,i)=>({i,p,className:CLASS_NAMES[i]}));
    pairs.sort((a,b)=>b.p-a.p);
    top3 = pairs.slice(0,3);
  }

  return (
    <>
      <main>
        <div className="hero">
          <div className="hero-left" aria-hidden>
            {/* place your image file at frontend/public/hero.jpg */}
            <img src="/hero.jpg" alt="hero" />
          </div>

          <div className="hero-right">
            <h1 className="title">Music Genre Classifier</h1>

            <p className="lead">
              Upload audio (wav/mp3) or a spectrogram image (png) — prediction shows the top result. Click the arrow for details.
            </p>

            <form onSubmit={handleSubmit} className="panel" onDrop={onDrop} onDragOver={onDragOver}>
              <label className="field-label">Mode</label>
              <select className="select" value={mode} onChange={(e)=>{ setMode(e.target.value); clearAll(); }}>
                <option value="audio">Audio</option>
                <option value="image">Image</option>
              </select>

              <input ref={inputRef} type="file" accept={mode==="audio" ? "audio/*" : "image/*"} onChange={onInputChange} style={{display:"none"}} />

              <div className={`dropzone ${file ? "has-file" : ""}`} onClick={()=>inputRef.current?.click()}>
                {!file ? (
                  <div className="drop-content">
                    <strong>Drag & drop</strong> or click to choose a {mode==="audio" ? "audio file" : "spectrogram image"}
                    <div className="hint">Supported: WAV, MP3, PNG, JPG</div>
                  </div>
                ) : (
                  <div className="filebox">
                    <div className="name">{file.name}</div>
                    {mode==="image" && previewUrl && <div className="thumb"><img src={previewUrl} alt="preview"/></div>}
                  </div>
                )}
              </div>

              <div className="controls">
                <button className="btn primary" type="submit" disabled={loading}>{loading ? "Predicting…" : "Predict"}</button>
                <button type="button" className="btn" onClick={clearAll} disabled={loading}>Reset</button>
              </div>
            </form>

            <div className="result-box">
              <h2 className="result-title">Result</h2>

              {!result && !error && !loading && <div className="no-result">No result yet — submit a file to classify.</div>}

              {loading && <div className="loading">Model is running — this may take a few seconds on first run.</div>}

              {error && <div className="error">{error}</div>}

              {result && (
                <div className="top-result">
                  <div className="top-label">Predicted</div>
                  <div className="pred">{result.pred_class}</div>

                  <details className="details">
                    <summary>Show top 3</summary>
                    <ol className="top3-list">
                      {top3.map((t, idx)=>(
                        <li key={t.i}>
                          <div className="tname">{idx+1}. {t.className}</div>
                          <div className="tval">{Math.round(t.p*100)}%</div>
                        </li>
                      ))}
                    </ol>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        /* ================= USER TWEAKS (change these values) =================
           --hero-width / --hero-height : size of left image box (desktop)
           --hero-gap : gap between left image and right content
           --title-size : main page title size
           --lead-size : subtitle size
           --btn-padding : padding inside buttons
           ===================================================================*/
        :global(:root) {
          --hero-width: 620px;   /* <--- change image width here (desktop) */
          --hero-height: 820px;  /* <--- change image height here (desktop) */
          --hero-gap: 96px;      /* <--- gap between image and text (desktop) */
          --title-size: 48px;    /* <--- main title font-size */
          --lead-size: 16px;     /* <--- subtitle/font size */
          --btn-padding: 12px;   /* <--- button padding */
          --bg: #fafcff;
          --card: #ffffff;
          --muted: #6b7280;
          --accent: #4f46e5;
          --accent-2: #7c3aed;
          --bg-start: #eef2ff;
          --bg-end: #fafaff;
        }

        /* global body */
        :global(body) {
          margin:0;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: linear-gradient(180deg, var(--bg-start), var(--bg-end));
          color: #0f172a;
        }

        main { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:48px 24px; }

        /* layout */
        .hero {
          display:flex;
          gap: var(--hero-gap);
          width:100%;
          max-width:1280px;
          align-items:center;
        }

        /* Left image box */
        .hero-left {
          flex: 0 0 var(--hero-width);
          height: var(--hero-height);
          border-radius:12px;
          overflow:hidden;
          box-shadow: 0 18px 60px rgba(14,20,40,0.10);
          background:#eee;
        }
        .hero-left img { width:100%; height:100%; object-fit:cover; display:block; }

        /* Right content */
        .hero-right { flex:1; display:flex; flex-direction:column; gap:18px; justify-content:center; max-width:640px; }

        .title { font-size: var(--title-size); margin:0 0 6px 0; font-weight:800; letter-spacing:-0.4px; }
        .lead { margin:0; color:var(--muted); font-size: var(--lead-size); line-height:1.5; }

        .panel { margin-top:10px; display:flex; flex-direction:column; gap:12px; align-items:flex-start; padding:0; }

        .field-label { font-size:14px; color:var(--muted); }
        .select { font-size:15px; padding:8px 10px; border-radius:8px; border:1px solid rgba(15,23,42,0.06); background:white; }

        .dropzone { width:100%; border:1px dashed rgba(15,23,42,0.06); border-radius:12px; min-height:140px; display:flex; align-items:center; justify-content:center; padding:22px; cursor:pointer; }
        .dropzone.has-file { justify-content:space-between; padding:16px; }
        .drop-content { text-align:center; color:var(--muted); font-size:15px; }
        .hint { margin-top:8px; font-size:13px; color:#9aa0ad; }

        .filebox { display:flex; align-items:center; gap:12px; width:100%; justify-content:space-between; }
        .thumb { width:180px; height:110px; border-radius:8px; overflow:hidden; background:#f3f6fb; border:1px solid rgba(15,23,42,0.04); }
        .thumb img { width:100%; height:100%; object-fit:cover; display:block; }

        .controls { display:flex; gap:12px; margin-top:8px; }
        .btn { padding: var(--btn-padding) 18px; font-size:16px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:white; cursor:pointer; }
        .btn.primary { background: linear-gradient(90deg,var(--accent),var(--accent-2)); color:white; border:none; box-shadow: 0 12px 36px rgba(79,70,229,0.10); }

        .result-box { margin-top:12px; background: rgba(255,255,255,0.8); padding:14px 16px; border-radius:10px; box-shadow:0 8px 28px rgba(14,20,40,0.05); }
        .result-title { font-size:18px; margin:0 0 8px 0; }

        .no-result { color:var(--muted); font-size:15px; }
        .loading { color:var(--muted); font-size:15px; }
        .error { color:#ef4444; font-weight:700; }

        .top-result { display:flex; flex-direction:column; gap:8px; align-items:flex-start; }
        .top-label { font-size:13px; color:var(--muted); }
        .pred { font-size:24px; font-weight:800; color:var(--accent-2); margin-top:6px; }

        details summary { cursor:pointer; font-weight:700; margin-top:8px; }
        .top3-list { margin:8px 0 0 18px; color:var(--muted); }

        /* responsive: stack on smaller screens and scale sizes down */
        @media (max-width: 1100px) {
          :global(:root) {
            --hero-width: 480px;
            --hero-height: 620px;
            --hero-gap: 48px;
            --title-size: 40px;
          }
          .hero { gap: var(--hero-gap); }
        }

        @media (max-width: 820px) {
          .hero { flex-direction:column; gap:26px; align-items:center; padding-bottom:20px; }
          .hero-left { width:90%; height:420px; flex:0 0 auto; }
          .hero-right { width:90%; max-width:100%; align-items:center; text-align:center; }
        }
      `}</style>
    </>
  );
}
