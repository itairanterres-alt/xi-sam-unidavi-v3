/* ============================================================
   XI SAM 2026 · V3 — VIEW DO PÔSTER LANDSCAPE (usa SAM_MOTOR)
   Cabeçalho + corpo (HTML do motor, injetado) + rodapé.
   - aspectos das figuras pré-carregados (sem reflow)
   - bodyH medido UMA vez (header/footer) → motor resolve `s`
   - layout calculado em useMemo (medição imperativa síncrona),
     nunca em loop de setState.
   ============================================================ */
const { useState: _uS, useRef: _uR, useLayoutEffect: _uLE, useEffect: _uE, useMemo: _uM } = React;

/* fit do canvas BW×BH ao viewport (ou ao container, se `contido`) */
function useFitV3(BW, contido) {
  const ref = _uR(null);
  const med0 = () => {
    const el = ref.current;
    let w, h;
    if (contido && el && el.clientWidth) { w = el.clientWidth; h = el.clientHeight; }
    else { w = window.innerWidth || 1280; h = window.innerHeight || 800; }
    const BH = Math.round(Math.min(1180, Math.max(720, BW * (h / w))));
    return { scale: Math.min(w / BW, h / BH), BH };
  };
  const [dim, setDim] = _uS(med0);
  _uLE(() => {
    const el = ref.current; if (!el) return;
    const medir = () => {
      let w, h;
      if (contido) { w = el.clientWidth; h = el.clientHeight; }
      else { w = window.innerWidth; h = window.innerHeight; }
      if (!w || !h) return;
      const BH = Math.round(Math.min(1180, Math.max(720, BW * (h / w))));
      const scale = Math.min(w / BW, h / BH);
      setDim((p) => (Math.abs(p.scale - scale) > 0.002 || p.BH !== BH ? { scale, BH } : p));
    };
    medir();
    const raf = requestAnimationFrame(medir);
    const ro = new ResizeObserver(medir); ro.observe(el);
    window.addEventListener("resize", medir); window.addEventListener("orientationchange", medir);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("resize", medir); window.removeEventListener("orientationchange", medir); };
  }, [BW, contido]);
  return [ref, dim.scale, dim.BH];
}

/* aspecto (L/A) por figura — parse de SVG data-url quando possível; senão Image() */
function useAspectos(figuras) {
  const figs = Array.isArray(figuras) ? figuras : [];
  const inicial = _uM(() => {
    const m = {};
    figs.forEach((f) => {
      const url = f.url || f.dataUrl || "";
      const sv = /svg/.test(url) && decodeURIComponent(url).match(/width=['"]?(\d+)['"]?\s+height=['"]?(\d+)/);
      if (sv) m[f.ordem] = (+sv[1]) / (+sv[2]);
      else if (f.aspecto) m[f.ordem] = f.aspecto;
    });
    return m;
  }, [figs.map((f) => (f.url || f.dataUrl || "") + ":" + f.ordem).join("|")]);
  const [mapa, setMapa] = _uS(inicial);
  _uE(() => {
    let vivo = true; const m = { ...inicial };
    figs.forEach((f) => {
      if (m[f.ordem]) return;
      const url = f.url || f.dataUrl; if (!url) return;
      const im = new Image();
      im.onload = () => { if (!vivo) return; if (im.naturalWidth && im.naturalHeight) { m[f.ordem] = im.naturalWidth / im.naturalHeight; setMapa({ ...m }); } };
      im.src = url;
    });
    setMapa(m);
    return () => { vivo = false; };
  }, [inicial]);
  return mapa;
}

const vbadgeV3 = { fontSize: 13.5, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.32)", whiteSpace: "nowrap" };
const _autoresV3 = (t) => Array.isArray(t.autores) ? t.autores.join(" · ") : (t.autores || "");
const _palavrasV3 = (t) => Array.isArray(t.palavras) ? t.palavras : (t.palavras ? String(t.palavras).split(",").map((s) => s.trim()).filter(Boolean) : []);

/* Corpo do pôster: mede bodyH e injeta o HTML do motor. onLayout(cand) reporta
   o candidato escolhido (harness/juiz usam para métricas). `ajuste` força layout. */
function CorpoMotorV3({ t, cor, BW, bodyH, mapa, ajuste, onLayout }) {
  const res = _uM(() => {
    if (!bodyH || bodyH < 120 || !window.SAM_MOTOR) return null;
    try { return window.SAM_MOTOR.escolher(t, BW, bodyH, cor, mapa, ajuste); }
    catch (e) { console.warn("motor", e); return null; }
  }, [t, cor, BW, bodyH, JSON.stringify(mapa), JSON.stringify(ajuste || {})]);
  _uE(() => { if (res && onLayout) onLayout(res); }, [res]);
  const html = res ? window.SAM_MOTOR.corpoHTMLFinal(res.escolhido, cor, mapa) : "";
  return <div style={{ height: bodyH, overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: html }} />;
}

function PosterLandscapeV3({ t, onVoltar, ajuste, onLayout, contido }) {
  const BW = 1600;
  const [ref, scale, BH] = useFitV3(BW, contido);
  const cor = (window.AREA_COR && window.AREA_COR[t.area]) || C.azul;
  const mapa = useAspectos(t.figuras);
  const fotoUrl = t.foto_autores_url || t.foto_autores_dataUrl;
  const headRef = _uR(null), footRef = _uR(null);
  const [chrome, setChrome] = _uS({ h: 168, f: 70 });
  _uLE(() => {
    const hh = headRef.current ? headRef.current.offsetHeight : 168;
    const fh = footRef.current ? footRef.current.offsetHeight : 70;
    setChrome((p) => (Math.abs(p.h - hh) > 1 || Math.abs(p.f - fh) > 1 ? { h: hh, f: fh } : p));
  });
  const bodyH = BH - chrome.h - chrome.f;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#08131E" }}>
      <div className="poster-canvas-v3" style={{ width: BW, height: BH, transform: `scale(${scale})`, transformOrigin: "center center", flexShrink: 0, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        {/* CABEÇALHO */}
        <div ref={headRef} style={{ background: `linear-gradient(135deg, ${C.azul}, ${C.azulEsc})`, color: "#fff", padding: "14px 44px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 9 }}>
            {onVoltar && <button onClick={onVoltar} style={{ ...vbadgeV3, display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", fontFamily: "inherit", background: "rgba(255,255,255,0.26)", color: "#fff" }}><ArrowLeft size={13} color="#fff" /> Voltar</button>}
            <span style={vbadgeV3}>{t.fase}ª FASE</span>
            <span style={vbadgeV3}>{t.desenho}</span>
            <span style={vbadgeV3}>{t.id}</span>
            <span style={{ ...vbadgeV3, background: cor, borderColor: cor }}>{t.area}</span>
            {_palavrasV3(t).slice(0, 5).map((p) => <span key={p} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.28)", color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>{p}</span>)}
            <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 800, letterSpacing: 0.6, color: C.ciano, whiteSpace: "nowrap" }}>SAM · MEDICINA UNIDAVI</span>
          </div>
          <div style={{ display: "flex", gap: 22, alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, letterSpacing: -0.4 }}>{t.titulo}</div>
              <div style={{ fontSize: 16, opacity: 0.92, marginTop: 7, lineHeight: 1.3 }}>
                {_autoresV3(t)}
                {Number(t.fase) !== 7 && t.orientador ? <span style={{ opacity: 0.78 }}> · Orient.: {t.orientador}</span> : null}
                {t.afiliacao ? <div style={{ opacity: 0.72, fontStyle: "italic", fontSize: 13.5, marginTop: 2 }}>{t.afiliacao}</div> : null}
              </div>
            </div>
            {fotoUrl && <div style={{ width: 92, height: 92, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "3px solid rgba(255,255,255,0.45)", background: "#fff" }}><img src={fotoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></div>}
          </div>
        </div>

        {/* CORPO (motor) */}
        <div style={{ flex: 1, minHeight: 0, background: "#fff" }}>
          <CorpoMotorV3 t={t} cor={cor} BW={BW} bodyH={bodyH} mapa={mapa} ajuste={ajuste} onLayout={onLayout} />
        </div>

        {/* RODAPÉ */}
        <div ref={footRef} style={{ background: C.papel, borderTop: "1px solid #E3EAF2", padding: "10px 44px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ background: "#fff", padding: 6, borderRadius: 9, border: `1px solid ${C.cinzaClaro}` }}><QRCode id={t.id} size={48} /></div>
            <div><div style={{ fontSize: 14, fontWeight: 700, color: C.tinta }}>Leia o trabalho completo no celular</div><div style={{ fontSize: 12.5, color: C.cinza }}>aponte a câmera para o QR</div></div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.azul, letterSpacing: 0.5 }}>SAM · MEDICINA UNIDAVI</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PosterLandscapeV3, CorpoMotorV3, useAspectos, useFitV3 });
