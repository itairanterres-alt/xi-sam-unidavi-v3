/* ============================================================
   XI SAM 2026 — COMPONENTES
   3 modos: PosterVitrine | PosterCompleto | TrabalhoLeitura
   Telas auxiliares: SiteHeader
   Figuras aparecem NA SEÇÃO escolhida pelo aluno; principal em
   destaque; mais de uma na mesma seção respeita a ordem.
   ============================================================ */
const vbadge = { fontSize: 18, fontWeight: 700, padding: "6px 16px", borderRadius: 999, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.32)", whiteSpace: "nowrap" };
const vbadgeSm = { fontSize: 13.5, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.32)", whiteSpace: "nowrap" };

/* utilidades de figuras (compartilhadas) */
const _autoresStr = (t, sep) => Array.isArray(t.autores) ? t.autores.join(sep) : (t.autores || "");
const _palavrasArr = (t) => Array.isArray(t.palavras) ? t.palavras : (t.palavras ? String(t.palavras).split(",").map(s=>s.trim()).filter(Boolean) : []);
const _refsArr = (t) => (t.referencias || "").split("\n").map(s=>s.trim()).filter(Boolean);
/* 8ª fase apresentada como RESUMO (texto), não como pôster estruturado */
const _ehResumo8 = (t) => Number(t.fase) === 8 && !!t.resumo_completo;

/* ===== AJUSTE AUTOMÁTICO (pôsteres FIT, sem scroll) =====
   ORÇAMENTO com pisos e escada ALTERNADA: figuras e texto cedem em
   rev(ezamento, proporcionalmente à distância de seus pisos (figFrac
   0.88→0.40, texto 1→0.60) — nenhum dos dois é sacrificado até o chão
   enquanto o outro nem começou a ceder. Só com AMBOS nos pisos:
   desliga prioridade da ★ principal → texto até 0.50 → `estourou`
   (sinaliza, recorta limpo, refs na faixa ao pé — sempre visíveis).
   Sobrando espaço, a DEVOLUÇÃO também é alternada e na ordem inversa
   da importância: reativa prioridade da ★ → devolve teto das figuras →
   só então cresce o texto (teto 1.5). Cada devolução que estoura é
   desfeita e trava (anti-oscilação por recurso). */
function useAutoFitTexto(t, pisoTexto = 0.6, pisoMin = 0.5) {
  const ref = React.useRef(null);
  const [st, setSt] = React.useState({ fator: 1, figFrac: 0.88, semPrioridade: false, estourou: false });
  const [altura, setAltura] = React.useState(0);
  const [, reMedir] = React.useState(0);
  const ctl = React.useRef({ teto: 1.5, tetoFig: 0.96, prioTravada: false, ultima: "" });
  React.useLayoutEffect(() => { ctl.current = { teto: 1.5, tetoFig: 0.96, prioTravada: false, ultima: "" }; setSt({ fator: 1, figFrac: 0.88, semPrioridade: false, estourou: false }); }, [t]);
  /* re-mede quando o conteúdo muda de tamanho — ResizeObserver + load das
     imagens + um timeout de segurança (iframes ocultos não disparam RO) */
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bump = () => reMedir((x) => x + 1);
    let ro;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(bump); ro.observe(el.firstElementChild || el); }
    const imgs = Array.from(el.querySelectorAll("img"));
    imgs.forEach((im) => { if (!im.complete) im.addEventListener("load", bump, { once: true }); });
    const tid = setTimeout(bump, 1200);
    return () => { if (ro) ro.disconnect(); clearTimeout(tid); imgs.forEach((im) => im.removeEventListener("load", bump)); };
  }, [t]);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (Math.abs(el.clientHeight - altura) > 1) { setAltura(el.clientHeight); return; }
    const { fator, figFrac, semPrioridade, estourou } = st;
    if (estourou) return; /* esgotado: recorte limpo + sinalização */
    const passo = 0.05;
    const eH = el.scrollWidth > el.clientWidth + 2;
    const eV = el.scrollHeight > el.clientHeight + 2;
    if (eH || eV) {
      if (ctl.current.ultima === "cresceu") {
        /* crescimento de TEXTO causou estouro → desfaz e trava o teto */
        ctl.current.teto = Math.min(ctl.current.teto, fator);
        ctl.current.ultima = "encolheu";
        setSt((s) => ({ ...s, fator: Math.round((s.fator - 0.02) * 100) / 100 }));
        return;
      }
      if (ctl.current.ultima === "cresceuFig") {
        /* devolução de FIGURA causou estouro → desfaz e trava */
        ctl.current.tetoFig = Math.min(ctl.current.tetoFig, figFrac);
        ctl.current.ultima = "fig";
        setSt((s) => ({ ...s, figFrac: Math.round((s.figFrac - 0.08) * 100) / 100 }));
        return;
      }
      if (ctl.current.ultima === "cresceuPrio") {
        /* reativar a prioridade da ★ causou estouro → desfaz e trava */
        ctl.current.prioTravada = true;
        ctl.current.ultima = "prio";
        setSt((s) => ({ ...s, semPrioridade: true }));
        return;
      }
      /* escada alternada: cede quem está mais longe do próprio piso */
      const figProg = (figFrac - 0.4) / (0.88 - 0.4);
      const txtProg = (fator - pisoTexto) / (1.0 - pisoTexto);
      if (figFrac > 0.4 && figProg >= txtProg) {
        ctl.current.ultima = "fig";
        setSt((s) => ({ ...s, figFrac: Math.max(0.4, Math.round((s.figFrac - 0.08) * 100) / 100) }));
      } else if (fator > pisoTexto) {
        ctl.current.ultima = "encolheu";
        setSt((s) => ({ ...s, fator: Math.max(pisoTexto, Math.round((s.fator - passo) * 100) / 100) }));
      } else if (figFrac > 0.4) {
        ctl.current.ultima = "fig";
        setSt((s) => ({ ...s, figFrac: Math.max(0.4, Math.round((s.figFrac - 0.08) * 100) / 100) }));
      } else if (!semPrioridade) {
        /* antes de esconder conteúdo: desliga a prioridade da ★ principal */
        ctl.current.ultima = "prio";
        setSt((s) => ({ ...s, semPrioridade: true }));
      } else if (fator > pisoMin) {
        ctl.current.ultima = "encolheu";
        setSt((s) => ({ ...s, fator: Math.max(pisoMin, Math.round((s.fator - passo) * 100) / 100) }));
      } else {
        ctl.current.ultima = "estourou";
        setSt((s) => ({ ...s, estourou: true }));
      }
      return;
    }
    /* DEVOLUÇÃO alternada enquanto o fim do conteúdo estiver longe do pé da
       última coluna (folga máxima tolerada: 4% da altura): primeiro reativa a
       prioridade da ★, depois devolve teto às figuras, por fim cresce o texto */
    const inner = el.firstElementChild;
    const ultimo = inner && inner.lastElementChild;
    if (ultimo) {
      const a = el.getBoundingClientRect(), b = ultimo.getBoundingClientRect();
      if (a.bottom - b.bottom > a.height * 0.04) {
        if (semPrioridade && !ctl.current.prioTravada) {
          ctl.current.ultima = "cresceuPrio";
          setSt((s) => ({ ...s, semPrioridade: false }));
        } else if (figFrac + 0.08 <= Math.min(0.88, ctl.current.tetoFig - 0.01)) {
          ctl.current.ultima = "cresceuFig";
          setSt((s) => ({ ...s, figFrac: Math.round((s.figFrac + 0.08) * 100) / 100 }));
        } else if (Math.round((fator + 0.02) * 100) / 100 < ctl.current.teto) {
          ctl.current.ultima = "cresceu";
          setSt((s) => ({ ...s, fator: Math.round((s.fator + 0.02) * 100) / 100 }));
        }
      }
    }
  });
  return [ref, st, altura];
}
/* Canvas que PREENCHE o viewport: largura fixa BW, altura derivada do aspecto
   real do container (clamp) — elimina as barras pretas do letterbox. */
function useFillViewport(BW) {
  const ref = React.useRef(null);
  const [dim, setDim] = React.useState(() => {
    const w = window.innerWidth || 1280, h = window.innerHeight || 800;
    const BH0 = Math.round(Math.min(1150, Math.max(660, BW * (h / w))));
    return { scale: Math.min(w / BW, h / BH0), BH: BH0 };
  });
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const medir = () => {
      // viewport REAL (janela) é o alvo do fit — clientWidth/Height do wrapper
      // pode reportar o tamanho do CONTEÚDO (cartão) no 1º layout → scale errado.
      const vw = window.innerWidth, vh = window.innerHeight;
      let w = el.clientWidth, h = el.clientHeight;
      // usa a janela como base; só cai no wrapper se a janela não estiver disponível
      w = vw || w; h = vh || h;
      if (!w || !h) return;
      const BH = Math.round(Math.min(1150, Math.max(660, BW * (h / w))));
      const scale = Math.min(w / BW, h / BH);
      setDim((p) => (Math.abs(p.scale - scale) > 0.002 || p.BH !== BH ? { scale, BH } : p));
    };
    medir();
    const raf = requestAnimationFrame(medir);
    const ts = [setTimeout(medir, 200), setTimeout(medir, 600)];
    const iv = setInterval(medir, 700); const ivStop = setTimeout(() => clearInterval(iv), 8000);
    const ro = new ResizeObserver(medir); ro.observe(el);
    window.addEventListener("resize", medir);
    window.addEventListener("orientationchange", medir);
    return () => { cancelAnimationFrame(raf); ts.forEach(clearTimeout); clearInterval(iv); clearTimeout(ivStop); ro.disconnect(); window.removeEventListener("resize", medir); window.removeEventListener("orientationchange", medir); };
  }, [BW]);
  return [ref, dim.scale, dim.BH];
}
/* Fator de ajuste corrente {fator, altura da coluna em px de layout} —
   consumido pelas figuras para dimensionar tetos proporcionais à coluna */
const FitContext = React.createContext({ fator: 1, altura: 0, figFrac: 0.88, semPrioridade: false, s: 1 });
/* Corpo do pôster com ajuste automático: o wrapper externo segura o espaço
   (flex:1) e recorta; o interno recebe o zoom calculado e ALTURA FIXA com
   columnFill:auto — cada coluna enche completamente antes da próxima (sem
   pé vazio na 1ª coluna). Figuras width:100% mantêm a largura visual da
   coluna em qualquer fator — só o texto muda de tamanho. */
function CorpoAjustavel({ t, style, children, refsFluxo, refsBanda, padX = 0, pisoTexto = 0.6, pisoMin = 0.5 }) {
  const [ref, st, altura] = useAutoFitTexto(t, pisoTexto, pisoMin);
  const alturaCol = altura ? Math.floor(altura / st.fator) : 0;
  const fitVal = React.useMemo(() => ({ fator: st.fator, altura: alturaCol, figFrac: st.figFrac, semPrioridade: st.semPrioridade }), [st.fator, st.figFrac, st.semPrioridade, alturaCol]);
  /* clip-path no fim da ÚLTIMA coluna visível: colunas excedentes começam
     dentro do padding direito — sem o clip, uma tira delas aparece na borda */
  return (
    <>
      <div ref={ref} style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
        <FitContext.Provider value={fitVal}>
          <div style={{ zoom: st.fator, height: alturaCol || "auto", boxSizing: "border-box", columnFill: "balance", clipPath: padX ? `inset(0 ${padX}px 0 0)` : undefined, ...style }}>
            {children}
            {!st.estourou && refsFluxo}
          </div>
        </FitContext.Provider>
        {st.estourou && (
          <div style={{ position: "absolute", right: 16, bottom: 10, background: "#FFF8E6", border: "1px solid #F0DCA8", color: "#7A5C12", borderRadius: 999, padding: "5px 14px", fontSize: 12.5, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            Texto excede o espaço do pôster — conteúdo completo no celular (QR)
          </div>
        )}
      </div>
      {st.estourou && refsBanda}
    </>
  );
}
/* Faixa de referências ao pé (usada quando o texto estourou o orçamento) —
   sempre visível, a menor fonte da página, máx. 6 itens + contador */
function RefsBanda({ t, cor, colunas = 3, pad = "7px 40px 9px" }) {
  const refs = _refsArr(t);
  if (!refs.length) return null;
  const vis = refs.slice(0, 6);
  const resto = refs.length - vis.length;
  return (
    <div style={{ flexShrink: 0, background: "#fff", borderTop: "1px solid #E3EAF2", padding: pad }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: cor, textTransform: "uppercase", letterSpacing: 0.6 }}>
        Referências{refs.length > 6 ? ` · 6 de ${refs.length}` : ""}{resto > 0 ? " (completas no QR)" : ""}
      </span>
      <ol style={{ margin: "3px 0 0", paddingLeft: 16, columnCount: colunas, columnGap: 26 }}>
        {vis.map((l, i) => <li key={i} style={{ fontSize: 10.5, lineHeight: 1.3, color: C.cinza, marginBottom: 2, breakInside: "avoid" }}>{l}</li>)}
      </ol>
    </div>
  );
}
/* Referências NO FLUXO do texto (fim da última coluna) — máx. 6 visíveis */
function RefsInline({ t, cor, max = 6 }) {
  const refs = _refsArr(t);
  if (!refs.length) return null;
  const vis = refs.slice(0, max);
  const resto = refs.length - vis.length;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize:16, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, borderBottom:`3px solid ${cor}33`, paddingBottom:5, marginBottom:7 }}>
        Referências{refs.length > max ? <span style={{ fontWeight:600, color:C.cinza, textTransform:"none", letterSpacing:0 }}> · {max} de {refs.length}</span> : null}
      </div>
      <ol style={{ margin:0, paddingLeft:18 }}>
        {vis.map((l, i) => <li key={i} style={{ fontSize:12.5, lineHeight:1.35, color:C.cinza, marginBottom:4, breakInside:"avoid" }}>{l}</li>)}
      </ol>
      {resto > 0 && <div style={{ fontSize:12, color:C.cinza, marginTop:5, fontStyle:"italic" }}>+{resto} referência{resto>1?"s":""} — lista completa no modo leitura (QR).</div>}
    </div>
  );
}
function figsOrdenadas(t) {
  const arr = Array.isArray(t.figuras) ? t.figuras.slice() : [];
  return arr.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}
function figsPorSecao(t) {
  const figs = figsOrdenadas(t);
  const pega = (secs) => figs.filter((f) => secs.includes(f.secao));
  const usadas = new Set(["Introdução", "Métodos", "Resultados"]);
  return {
    intro: pega(["Introdução"]),
    metodos: pega(["Métodos"]),
    resultados: pega(["Resultados"]),
    conclusao: pega(["Discussão"]),
    outras: figs.filter((f) => !usadas.has(f.secao) && f.secao !== "Discussão"),
  };
}

/* ===== MODO 1 — VITRINE (chamariz fixo escalado, galeria do telão) ===== */
function PosterVitrine({ t }) {
  const BW = 720, BH = 1280;
  const [ref, scale] = useScale(BW);
  const cor = AREA_COR[t.area] || C.azul;
  const figs = figsOrdenadas(t);
  const principal = figs.find((f) => f.principal) || figs[0] || null;
  const figUrl = principal && (principal.url || principal.dataUrl);
  return (
    <div ref={ref} style={{ width:"100%", aspectRatio:`${BW} / ${BH}`, position:"relative", overflow:"hidden", borderRadius:14, background:`linear-gradient(160deg, ${C.azul}, ${C.azulEsc})` }}>
      <div style={{ position:"absolute", top:0, left:0, width:BW, height:BH, transform:`scale(${scale})`, transformOrigin:"top left", color:"#fff", padding:48, display:"flex", flexDirection:"column", boxSizing:"border-box" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <span style={vbadge}>{t.fase}ª FASE</span><span style={vbadge}>{t.desenho}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:22, fontWeight:600 }}>
            <span style={{ width:18, height:18, borderRadius:5, background:cor, border:"2px solid rgba(255,255,255,0.5)" }} />{t.area}
          </div>
        </div>
        <div style={{ fontSize:54, fontWeight:800, lineHeight:1.08, letterSpacing:-0.7, marginBottom:26 }}>{t.titulo}</div>
        <div style={{ fontSize:23, opacity:0.92, marginBottom:36, lineHeight:1.4 }}>
          {_autoresStr(t, " · ")}
          {Number(t.fase) !== 7 && t.orientador ? <><br /><span style={{ opacity:0.75 }}>Orient.: {t.orientador}</span></> : null}
          {t.afiliacao ? <><br /><span style={{ opacity:0.75, fontStyle:"italic" }}>{t.afiliacao}</span></> : null}
        </div>
        <div style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"2px dashed rgba(255,255,255,0.32)", borderRadius:16, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:28, marginBottom:34, minHeight:200, overflow:"hidden" }}>
          {figUrl
            ? <img src={figUrl} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", borderRadius:8 }} />
            : <ImageIcon size={72} color={C.ciano} />}
          {principal && <div style={{ fontSize:20, marginTop:16, opacity:0.92, lineHeight:1.3 }}>{principal.legenda}</div>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:22, marginBottom:24 }}>
          <div style={{ background:"#fff", padding:14, borderRadius:14 }}><QRCode id={t.id} size={150} /></div>
          <div>
            <div style={{ fontSize:26, fontWeight:700, display:"flex", alignItems:"center", gap:10 }}><Smartphone size={26} /> Leia completo</div>
            <div style={{ fontSize:20, opacity:0.9, marginTop:4 }}>no celular</div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.22)", paddingTop:18, display:"flex", alignItems:"center", justifyContent:"flex-end" }}>
          <div style={{ fontSize:21, fontWeight:800, letterSpacing:1, color:C.ciano }}>SAM · MEDICINA UNIDAVI</div>
        </div>
      </div>
    </div>
  );
}

/* figura do pôster completo — DESTAQUE: largura da coluna; teto proporcional
   à coluna. Prioridades RELATIVAS (somadas ao figFrac corrente, então descem
   JUNTO com a escada do orçamento): ★ principal +0.20, vertical (portrait,
   detectada ao carregar) +0.12, principal E vertical +0.30 — fluxogramas
   ganham quase a coluna inteira quando há espaço, e cedem quando não há.
   Em `semPrioridade` (penúltimo degrau) todas valem o figFrac base. */
function FigPoster({ f, cor }) {
  const url = f.url || f.dataUrl;
  const fit = React.useContext(FitContext);
  const s = fit.s || 1;
  // aspecto medido ao carregar: vertical = mais alta que larga; muitoAlta = ≥1,8:1
  const [asp, setAsp] = React.useState(null);   // naturalHeight/naturalWidth
  const vertical = asp != null && asp > 1.0;
  const muitoAlta = asp != null && asp >= 1.8;
  const portrait = vertical;
  const extra = fit.semPrioridade ? 0 : (f.principal ? (portrait ? 0.3 : 0.2) : (portrait ? 0.12 : 0));
  const frac = Math.min(0.92, (fit.figFrac || 0.88) + extra);
  /* portrait com legenda AO LADO não gasta altura embaixo → teto maior */
  const teto = (fit && fit.altura ? Math.max(170, Math.round(fit.altura * frac * s) - (portrait ? 16 : 56)) : Math.round(360 * frac));
  /* Figuras LANDSCAPE são limitadas pela LARGURA — então a escada do orçamento
     precisa encolher a LARGURA para liberar espaço (reduzir só maxHeight não faz
     nada numa figura larga). widthFrac acompanha o figFrac: cheio quando há
     espaço, estreita (centralizada) quando aperta. Figuras PORTRAIT já são
     limitadas pela altura (teto), então ficam na largura cheia. */
  const baseW = (fit.figFrac || 0.88);
  const widthFrac = portrait ? 1 : Math.max(0.5, Math.min(1, (baseW - 0.4) / 0.48 * 0.55 + 0.45) + (f.principal ? 0.08 : 0));
  const onImg = (e) => { const im = e.currentTarget; if (im.naturalWidth) setAsp(im.naturalHeight / im.naturalWidth); };
  const legenda = (vertical) => (
    <div style={{ padding:`${Math.round(7*s)}px ${Math.round(11*s)}px`, fontSize:13*s, color:C.cinza, lineHeight:1.3, ...(vertical ? { alignSelf:"center", borderLeft:`1px solid ${cor}22` } : {}) }}>
      <div style={{ display:"flex", gap:6*s, alignItems:"baseline", flexWrap:"wrap" }}>
        <strong style={{ color:C.azul, whiteSpace:"nowrap" }}>Fig {f.ordem}.</strong>
        <span style={{ flex:1, minWidth:80*s, fontWeight:f.titulo?700:400, color:f.titulo?C.tinta:C.cinza }}>{f.titulo || f.legenda}</span>
        {f.principal && <span style={{ fontSize:11*s, fontWeight:800, color:C.ciano, whiteSpace:"nowrap" }}>★ PRINCIPAL</span>}
      </div>
      {f.titulo && f.legenda ? <div style={{ marginTop:3*s }}>{f.legenda}</div> : null}
    </div>
  );
  const borda = `2px ${f.principal ? "solid" : "dashed"} ${f.principal ? C.ciano : cor + "55"}`;
  const fundo = f.principal ? C.cianoClaro : C.papel;
  /* MUITO ALTA (≥1,8:1): legenda AO LADO — a imagem já é estreita, então pôr a
     legenda ao lado libera altura sem custar largura útil. Portrait moderado
     (2:3) fica melhor com legenda EMBAIXO + largura cheia (mais alto). */
  if (muitoAlta && url) {
    return (
      <div style={{ marginTop:8, marginBottom:10, breakInside:"avoid", display:"flex", alignItems:"stretch", border:borda, borderRadius:10, overflow:"hidden", background:fundo }}>
        <div style={{ background:"#fff", display:"flex", justifyContent:"center", alignItems:"center", flexShrink:0 }}>
          <img src={url} alt="" onLoad={onImg} style={{ maxHeight:teto, maxWidth:"100%", width:"auto", height:"auto", display:"block" }} />
        </div>
        <div style={{ flex:"1 1 34%", minWidth:0, display:"flex" }}>{legenda(true)}</div>
      </div>
    );
  }
  /* LANDSCAPE / sem imagem: legenda embaixo. maxWidth acompanha o widthFrac E a
     escala s — assim a escala do empacotador encolhe também a LARGURA (logo a
     altura) das figuras largas, não só o texto. */
  return (
    <div style={{ marginTop:8, marginBottom:10, breakInside:"avoid", maxWidth:`${Math.min(100, Math.round(widthFrac*s*100))}%`, marginLeft:"auto", marginRight:"auto", border:borda, borderRadius:10, overflow:"hidden", background:fundo }}>
      <div style={{ background:"#fff", display:"flex", justifyContent:"center" }}>
        {url
          ? <img src={url} alt="" onLoad={onImg} style={{ maxWidth:"100%", maxHeight:teto, width:"auto", height:"auto", display:"block" }} />
          : <div style={{ height:f.principal ? 118 : 80, display:"flex", alignItems:"center", justifyContent:"center", width:"100%" }}><ImageIcon size={f.principal ? 40 : 30} color={cor} /></div>}
      </div>
      {legenda(false)}
    </div>
  );
}

/* ===== MODO 2 — PÔSTER COMPLETO (telão apresentação, FIT sem scroll) ===== */
function PosterCompleto({ t }) {
  const BW = 720, BH = 1280;
  const [ref, scale] = useScale(BW);
  const cor = AREA_COR[t.area] || C.azul;
  const fotoUrl = t.foto_autores_url || t.foto_autores_dataUrl;
  const F = figsPorSecao(t);
  const Sec = ({ titulo, texto, figs }) => (texto || (figs && figs.length)) ? (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:22, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, borderBottom:`4px solid ${cor}33`, paddingBottom:6, marginBottom:8 }}>{titulo}</div>
      {texto && <div style={{ fontSize:19, lineHeight:1.42, color:C.tinta, textAlign:"justify" }}>{texto}</div>}
      {figs && figs.map((f, i) => <FigPoster key={i} f={f} cor={cor} />)}
    </div>
  ) : null;
  return (
    <div ref={ref} style={{ width:"100%", aspectRatio:`${BW} / ${BH}`, position:"relative", overflow:"hidden", borderRadius:14, background:"#fff" }}>
      <div style={{ position:"absolute", top:0, left:0, width:BW, height:BH, transform:`scale(${scale})`, transformOrigin:"top left", boxSizing:"border-box", display:"flex", flexDirection:"column" }}>
        <div style={{ background:`linear-gradient(135deg, ${C.azul}, ${C.azulEsc})`, color:"#fff", padding:"26px 36px" }}>
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            <span style={vbadge}>{t.fase}ª FASE</span><span style={vbadge}>{t.desenho}</span><span style={vbadge}>{t.id}</span>
            <span style={{ ...vbadge, background:cor, borderColor:cor }}>{t.area}</span>
          </div>
          <div style={{ fontSize:33, fontWeight:800, lineHeight:1.08, letterSpacing:-0.5 }}>{t.titulo}</div>
          <div style={{ display:"flex", gap:18, alignItems:"flex-end", justifyContent:"space-between", marginTop:12 }}>
            <div style={{ fontSize:18, opacity:0.9, lineHeight:1.35, flex:1, minWidth:0 }}>
              {_autoresStr(t, " · ")}
              {Number(t.fase) !== 7 && t.orientador ? <><br /><span style={{ opacity:0.8 }}>Orient.: {t.orientador}</span></> : null}
              {t.afiliacao ? <><br /><span style={{ opacity:0.8, fontStyle:"italic" }}>{t.afiliacao}</span></> : null}
            </div>
            {fotoUrl && <div style={{ width:120, height:120, borderRadius:12, overflow:"hidden", flexShrink:0, border:"3px solid rgba(255,255,255,0.45)", background:"#fff" }}><img src={fotoUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/></div>}
          </div>
        </div>
        {_ehResumo8(t) ? (
          <CorpoAjustavel t={t} style={{ padding:"24px 36px" }}>
            <Sec titulo="Resumo" texto={t.resumo_completo} />
          </CorpoAjustavel>
        ) : (
        /* fluxo em 2 colunas — texto preenche os vazios; refs no fim do fluxo
           (ou na faixa ao pé, se o orçamento de espaço estourar) */
        <CorpoAjustavel t={t} style={{ padding:"22px 36px", columnCount:2, columnGap:26 }} padX={36}
          refsFluxo={<RefsInline t={t} cor={cor} />}
          refsBanda={<RefsBanda t={t} cor={cor} colunas={2} pad="7px 36px 9px" />}>
          <Sec titulo="Introdução" texto={t.intro || t.introducao} figs={F.intro} />
          <Sec titulo="Objetivo" texto={t.objetivos} />
          <Sec titulo="Metodologia" texto={t.metodos} figs={F.metodos} />
          <Sec titulo={Number(t.fase) === 7 ? "Resultados esperados" : "Resultados"} texto={t.resultados} figs={F.resultados} />
          {Number(t.fase) !== 7 && <Sec titulo="Conclusão" texto={t.conclusao} figs={F.conclusao} />}
          {(Number(t.fase) === 7 ? [...F.conclusao, ...F.outras] : F.outras).length > 0 && <Sec titulo="Figuras complementares" figs={Number(t.fase) === 7 ? [...F.conclusao, ...F.outras] : F.outras} />}
        </CorpoAjustavel>
        )}
        <div style={{ background:C.papel, borderTop:"1px solid #E3EAF2", padding:"18px 36px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", flex:1 }}>
            {_palavrasArr(t).map((p) => <span key={p} style={{ fontSize:14, background:"#fff", border:"1px solid #DCE5EE", borderRadius:999, padding:"5px 14px", color:C.cinza }}>{p}</span>)}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ background:"#fff", padding:7, borderRadius:10, border:`1px solid ${C.cinzaClaro}` }}><QRCode id={t.id} size={78} /></div>
            <div style={{ fontSize:18, fontWeight:800, color:C.azul, letterSpacing:0.5 }}>SAM · MEDICINA UNIDAVI</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== EMPACOTADOR DE COLUNAS BALANCEADAS (pôster landscape FIT) =====
   Mede cada bloco, particiona em N grupos CONTÍGUOS (preserva ordem de leitura)
   minimizando a coluna mais alta, e escala fonte+figuras para a mais alta caber
   na altura disponível. Blocos empilham em colunas flex → SEM vazios internos
   (que o fluxo CSS deixava sob figuras). */
function _particiona(hs, k) {
  const n = hs.length;
  const pre = [0]; for (let i = 0; i < n; i++) pre.push(pre[i] + hs[i]);
  const sum = (a, b) => pre[b] - pre[a];
  if (n <= k) { const c = []; for (let i = 1; i <= n; i++) c.push(i); while (c.length < k) c.push(n); return c; }
  let best = null;
  const rec = (start, parts, cuts, maxSo) => {
    if (parts === 1) { const m = Math.max(maxSo, sum(start, n)); if (!best || m < best.m) best = { m, cuts: [...cuts, n] }; return; }
    for (let i = start + 1; i <= n - (parts - 1); i++) { const mm = Math.max(maxSo, sum(start, i)); if (best && mm >= best.m) continue; rec(i, parts - 1, [...cuts, i], mm); }
  };
  rec(0, k, [], 0);
  return best.cuts;
}
function SecBloco({ titulo, texto, cor }) {
  const fit = React.useContext(FitContext); const s = fit.s || 1;
  if (!texto) return null;
  return (
    <div style={{ breakInside: "avoid" }}>
      <div style={{ fontSize: 19 * s, fontWeight: 800, color: cor, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `3px solid ${cor}33`, paddingBottom: 5 * s, marginBottom: 7 * s }}>{titulo}</div>
      <div style={{ fontSize: 16.5 * s, lineHeight: 1.42, color: C.tinta, textAlign: "justify" }}>{texto}</div>
    </div>
  );
}
function RefsBloco({ t, cor, max = 6 }) {
  const fit = React.useContext(FitContext); const s = fit.s || 1;
  const refs = _refsArr(t); if (!refs.length) return null;
  const vis = refs.slice(0, max); const resto = refs.length - vis.length;
  return (
    <div style={{ breakInside: "avoid" }}>
      <div style={{ fontSize: 16 * s, fontWeight: 800, color: cor, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `3px solid ${cor}33`, paddingBottom: 5 * s, marginBottom: 7 * s }}>
        Referências{refs.length > max ? <span style={{ fontWeight: 600, color: C.cinza, textTransform: "none", letterSpacing: 0 }}> · {max} de {refs.length}</span> : null}
      </div>
      <ol style={{ margin: 0, paddingLeft: 18 * s }}>
        {vis.map((l, i) => <li key={i} style={{ fontSize: 12.5 * s, lineHeight: 1.35, color: C.cinza, marginBottom: 4 * s, breakInside: "avoid" }}>{l}</li>)}
      </ol>
      {resto > 0 && <div style={{ fontSize: 12 * s, color: C.cinza, marginTop: 5 * s, fontStyle: "italic" }}>+{resto} referência{resto > 1 ? "s" : ""} — lista completa no modo leitura (QR).</div>}
    </div>
  );
}
function CorpoPacked({ blocos, refsBloco, refsBanda, bw = 1520, ncols = 3, gap = 28, padX = 40, pisoMin = 0.5, figFrac = 0.42 }) {
  const outerRef = React.useRef(null);
  const measRef = React.useRef(null);
  const visRef = React.useRef(null);
  // largura da coluna DETERMINÍSTICA a partir da largura conhecida do cartão
  // — não depende de clientWidth de um flex item (que pode colapsar e zerar tudo)
  const colW = Math.max(180, Math.round((bw - padX * 2 - gap * (ncols - 1)) / ncols));
  const [availH, setAvailH] = React.useState(600);
  const [groups, setGroups] = React.useState(null);
  const [s, setS] = React.useState(0.9);
  const [estourou, setEstourou] = React.useState(false);
  const [tick, setTick] = React.useState(0);
  const ctl = React.useRef({ ultima: "", chave: "" });
  const all = refsBloco ? [...blocos, { key: "__refs", node: refsBloco }] : blocos;
  /* altura disponível — robusta: ignora leituras colapsadas (<120) */
  React.useLayoutEffect(() => {
    const el = outerRef.current; if (!el) return;
    const medir = () => { const h = el.clientHeight; if (h > 120) setAvailH((p) => (Math.abs(h - p) > 2 ? h : p)); };
    medir(); const ro = new ResizeObserver(medir); ro.observe(el);
    const t1 = setTimeout(medir, 250); const t2 = setTimeout(medir, 800);
    return () => { ro.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  }, []);
  /* re-mede quando as imagens terminam de carregar */
  React.useLayoutEffect(() => {
    const m = measRef.current; if (!m) return;
    const bump = () => setTick((x) => x + 1);
    const imgs = Array.from(m.querySelectorAll("img"));
    imgs.forEach((im) => { if (!im.complete) im.addEventListener("load", bump, { once: true }); });
    const tid = setTimeout(bump, 1200);
    return () => { clearTimeout(tid); imgs.forEach((im) => im.removeEventListener("load", bump)); };
  }, [colW, all.length]);
  /* PARTIÇÃO — só depende de colW (determinístico), então as colunas SEMPRE
     montam, mesmo que availH ainda não tenha medido */
  React.useLayoutEffect(() => {
    const m = measRef.current; if (!m) return;
    const kids = [...m.children]; if (kids.length !== all.length) return;
    const hs = kids.map((k) => k.offsetHeight + 14);
    const cuts = _particiona(hs, ncols);
    const g = []; let start = 0; cuts.forEach((c) => { g.push([start, c]); start = c; });
    const chave = cuts.join(",");
    if (chave !== ctl.current.chave) {
      ctl.current.chave = chave; ctl.current.ultima = "";
      let tallest = 0; start = 0; cuts.forEach((c) => { tallest = Math.max(tallest, hs.slice(start, c).reduce((a, b) => a + b, 0)); start = c; });
      const est = tallest ? Math.max(pisoMin, Math.min(1.1, (availH - 40) * 0.95 / tallest)) : 0.9;
      setGroups(g); setS(est); setEstourou(false);
    } else { setGroups(g); }
  }, [colW, all.length, tick, availH]);
  /* REALIMENTAÇÃO: lê a altura REAL do outer (clientHeight, layout, imúne ao
     transform:scale) a cada passo — nunca depende do estado availH (que pode
     defasar em resize) — e ajusta s até a coluna mais alta caber de fato */
  React.useLayoutEffect(() => {
    const el = outerRef.current, row = visRef.current; if (!el || !row || !groups) return;
    const clientH = el.clientHeight; if (clientH < 80) return;
    const maxH = Math.max(...[...row.children].map((c) => c.offsetHeight));
    const avail = clientH - 8 - (estourou ? 34 : 0);
    if (maxH > avail + 1) {
      if (s > pisoMin) { ctl.current.ultima = "shrink"; setS((v) => Math.max(pisoMin, Math.round((v - 0.015) * 1000) / 1000)); }
      else if (!estourou) setEstourou(true);
    } else if (avail - maxH > clientH * 0.05 && s < 1.1 && ctl.current.ultima !== "shrink") {
      ctl.current.ultima = "grow"; setS((v) => Math.min(1.1, Math.round((v + 0.012) * 1000) / 1000));
    } else if (estourou && maxH <= avail) { setEstourou(false); }
  });
  const blocoStyle = { marginBottom: 12 };
  return (
    <>
      <div ref={outerRef} style={{ flex: 1, minHeight: 0, width: "100%", overflow: "hidden", position: "relative" }}>
        {/* medidor oculto (escala 1, largura de uma coluna determinística) */}
        <div ref={measRef} aria-hidden="true" style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", left: -99999, top: 0, width: colW }}>
          <FitContext.Provider value={{ s: 1, altura: availH, figFrac, semPrioridade: false }}>
            {all.map((b) => <div key={b.key} style={blocoStyle}>{b.node}</div>)}
          </FitContext.Provider>
        </div>
        {/* fallback visível enquanto a partição não montou — NUNCA corpo em branco */}
        {!groups && (
          <div style={{ padding: `18px ${padX}px`, columnCount: ncols, columnGap: gap, height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            <FitContext.Provider value={{ s: 0.82, altura: availH, figFrac, semPrioridade: false }}>
              {all.map((b) => <div key={b.key} style={{ breakInside: "avoid", marginBottom: 12 }}>{b.node}</div>)}
            </FitContext.Provider>
          </div>
        )}
        {groups && (
          <div ref={visRef} style={{ display: "flex", gap, padding: `18px ${padX}px`, paddingBottom: estourou ? 44 : 18, height: "100%", boxSizing: "border-box", alignItems: "flex-start" }}>
            <FitContext.Provider value={{ s, altura: (availH - 28), figFrac, semPrioridade: false }}>
              {groups.map((g, ci) => (
                <div key={ci} style={{ width: colW, display: "flex", flexDirection: "column" }}>
                  {all.slice(g[0], g[1]).filter((b) => !(estourou && b.key === "__refs")).map((b) => <div key={b.key} style={blocoStyle}>{b.node}</div>)}
                </div>
              ))}
            </FitContext.Provider>
          </div>
        )}
        {estourou && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>{refsBanda}</div>
        )}
        {estourou && (
          <div style={{ position: "absolute", right: 16, bottom: 46, background: "#FFF8E6", border: "1px solid #F0DCA8", color: "#7A5C12", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            conteúdo completo no celular (QR)
          </div>
        )}
      </div>
    </>
  );
}

/* ===== LAYOUT “REVISTA” — figuras independentes das colunas =====
   2 super-colunas; dentro de cada seção a figura FLUTUA (float) e o texto
   REBATE ao lado dela — sem vazios sob figuras. Largura do float conforme o
   aspecto da imagem: vertical estreita ~30%, vertical ~38%, horizontal ~52%. */
const RevOptCtx = React.createContext({ shrinks: {} });
function FigFloat({ f, cor, lado, modo, figKey }) {
  const fit = React.useContext(FitContext); const s = fit.s || 1;
  const opt = React.useContext(RevOptCtx);
  const shrink = (opt.shrinks && opt.shrinks[figKey]) || 0;
  const url = f.url || f.dataUrl;
  const [asp, setAsp] = React.useState(null);
  const muitoAlta = asp != null && asp >= 1.8;
  const vertical = asp != null && asp > 1.05;
  const m = Math.round(12 * s);
  /* modo “bloco” (rebaixado pelo otimizador): centralizado após o texto,
     mais largo — não há texto ao lado para aproveitar */
  const bloco = modo === "bloco";
  const base = bloco ? (muitoAlta ? 38 : vertical ? 52 : 74) : (muitoAlta ? 30 : vertical ? 40 : 54);
  const wPct = Math.max(24, base - (bloco ? 0 : shrink * 9));
  const css = bloco
    ? { clear: "both", width: `${wPct}%`, margin: `${m}px auto` }
    : { float: lado, clear: "both" /* escalona: cada float começa abaixo do anterior — nunca dois lado a lado espremendo o texto */, width: `${wPct}%`, margin: lado === "right" ? `4px 0 ${m}px ${m}px` : `4px ${m}px ${m}px 0` };
  return (
    <div data-figkey={figKey} style={{ ...css, border: `2px ${f.principal ? "solid" : "dashed"} ${f.principal ? C.ciano : cor + "55"}`, borderRadius: 10, overflow: "hidden", background: f.principal ? C.cianoClaro : C.papel }}>
      <div style={{ background: "#fff", display: "flex", justifyContent: "center" }}>
        {url
          ? <img src={url} alt="" onLoad={(e) => { const im = e.currentTarget; if (im.naturalWidth) setAsp(im.naturalHeight / im.naturalWidth); }} style={{ width: "100%", height: "auto", display: "block" }} />
          : <div style={{ height: 84, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}><ImageIcon size={30} color={cor} /></div>}
      </div>
      <div style={{ padding: `${Math.round(6 * s)}px ${Math.round(10 * s)}px`, fontSize: 12.5 * s, color: C.cinza, lineHeight: 1.3 }}>
        <strong style={{ color: C.azul }}>Fig {f.ordem}.</strong>{" "}
        <span style={{ fontWeight: f.titulo ? 700 : 400, color: f.titulo ? C.tinta : C.cinza }}>{f.titulo || f.legenda}</span>
        {f.principal && <span style={{ fontSize: 10.5 * s, fontWeight: 800, color: C.ciano, marginLeft: 6, whiteSpace: "nowrap" }}>★ PRINCIPAL</span>}
        {f.titulo && f.legenda ? <div style={{ marginTop: 2 }}>{f.legenda}</div> : null}
      </div>
    </div>
  );
}
function SecRevista({ secKey, titulo, texto, figs, cor }) {
  const fit = React.useContext(FitContext); const s = fit.s || 1;
  /* SEM BFC próprio: o texto da PRÓXIMA seção também rebate ao lado de uma
     figura que sobrou — o fluxo da coluna é contínuo (sem buracos ao lado de
     floats). Título em flow-root para encolher ao lado do float (a borda não
     atravessa a figura). A detecção de desperdício subiu para a COLUNA. */
  if (!texto && !(figs && figs.length)) return null;
  return (
    <div>
      <div style={{ display: "flow-root", fontSize: 19 * s, fontWeight: 800, color: cor, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `3px solid ${cor}33`, paddingBottom: 5 * s, marginBottom: 7 * s }}>{titulo}</div>
      <div style={{ fontSize: 16.5 * s, lineHeight: 1.45, color: C.tinta, textAlign: "justify" }}>
        {(figs || []).map((f, i) => <FigFloat key={"fl" + i} f={f} cor={cor} lado={i % 2 ? "left" : "right"} figKey={secKey + ":" + i} />)}
        {texto}
      </div>
    </div>
  );
}
function CorpoRevista({ secoes, refsBloco, refsBanda, bw = 1520, gap = 36, padX = 40, pisoMin = 0.5 }) {
  const outerRef = React.useRef(null);
  const measRef = React.useRef(null);
  const visRef = React.useRef(null);
  const superW = Math.max(320, Math.round((bw - padX * 2 - gap) / 2));
  const [availH, setAvailH] = React.useState(600);
  const [groups, setGroups] = React.useState(null);
  const [s, setS] = React.useState(0.9);
  const [estourou, setEstourou] = React.useState(false);
  const [tick, setTick] = React.useState(0);
  const [shrinksRev, setShrinksRev] = React.useState({});
  const ctl = React.useRef({ ultima: "", chave: "" });
  const all = refsBloco ? [...secoes, { key: "__refs", node: refsBloco }] : secoes;
  React.useLayoutEffect(() => {
    const el = outerRef.current; if (!el) return;
    const medir = () => { const h = el.clientHeight; if (h > 120) setAvailH((p) => (Math.abs(h - p) > 2 ? h : p)); };
    medir(); const ro = new ResizeObserver(medir); ro.observe(el);
    const t1 = setTimeout(medir, 250); const t2 = setTimeout(medir, 800);
    return () => { ro.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  }, []);
  React.useLayoutEffect(() => {
    const m = measRef.current; if (!m) return;
    const bump = () => setTick((x) => x + 1);
    const imgs = Array.from(m.querySelectorAll("img"));
    const vis = visRef.current ? Array.from(visRef.current.querySelectorAll("img")) : [];
    [...imgs, ...vis].forEach((im) => { if (!im.complete) im.addEventListener("load", bump, { once: true }); });
    const tid = setTimeout(bump, 1200);
    /* watchdog: qualquer reflow nas colunas visíveis (imagem que chegou,
       shrink de float…) re-dispara a realimentação — sem isto o laço para
       de rodar e um overflow tardio fica sem correção */
    let ro = null;
    if (visRef.current) { ro = new ResizeObserver(bump); [...visRef.current.children].forEach((c) => ro.observe(c)); }
    return () => { clearTimeout(tid); ro && ro.disconnect(); [...imgs, ...vis].forEach((im) => im.removeEventListener("load", bump)); };
  }, [superW, all.length, groups]);
  React.useLayoutEffect(() => {
    const m = measRef.current; if (!m) return;
    const kids = [...m.children]; if (kids.length !== all.length) return;
    const hs = kids.map((k) => k.offsetHeight + 16);
    const cuts = _particiona(hs, 2);
    const g = []; let start = 0; cuts.forEach((c) => { g.push([start, c]); start = c; });
    const chave = cuts.join(",");
    if (chave !== ctl.current.chave) {
      ctl.current.chave = chave; ctl.current.ultima = "";
      let tallest = 0; start = 0; cuts.forEach((c) => { tallest = Math.max(tallest, hs.slice(start, c).reduce((a, b) => a + b, 0)); start = c; });
      const est = tallest ? Math.max(pisoMin, Math.min(1.1, (availH - 40) * 0.95 / tallest)) : 0.9;
      setGroups(g); setS(est); setEstourou(false);
    } else { setGroups(g); }
  }, [superW, all.length, tick, availH]);
  React.useLayoutEffect(() => {
    const el = outerRef.current, row = visRef.current; if (!el || !row || !groups) return;
    const clientH = el.clientHeight; if (clientH < 80) return;
    const maxH = Math.max(...[...row.children].map((c) => c.offsetHeight));
    const avail = clientH - 8 - (estourou ? 34 : 0);
    if (maxH > avail + 1) {
      if (s > pisoMin) { ctl.current.ultima = "shrink"; setS((v) => Math.max(pisoMin, Math.round((v - 0.015) * 1000) / 1000)); }
      else if (!estourou) setEstourou(true);
    } else if (avail - maxH > clientH * (ctl.current.ultima === "shrink" ? 0.12 : 0.05) && s < 1.1) {
      ctl.current.ultima = "grow"; setS((v) => Math.min(1.1, Math.round((v + 0.012) * 1000) / 1000));
    } else if (estourou && maxH <= avail) { setEstourou(false); }
  }, [s, groups, estourou, tick, availH]);
  /* OTIMIZADOR de desperdício — nível de COLUNA: se um float desce além do
     fim do conteúdo da coluna em mais de 45% da própria altura (nem a seção
     seguinte preencheu ao lado), ESTREITA esse float em passos. Monotônico. */
  React.useLayoutEffect(() => {
    const row = visRef.current; if (!row || !groups) return;
    let alvo = null, maior = 0;
    [...row.children].forEach((col) => {
      const kids = [...col.children].filter((k) => !k.hasAttribute("data-figkey"));
      if (!kids.length) return;
      const fimConteudo = Math.max(...kids.map((k) => k.offsetTop + k.offsetHeight));
      col.querySelectorAll("[data-figkey]").forEach((el) => {
        if (getComputedStyle(el).float === "none") return;
        const key = el.getAttribute("data-figkey");
        if ((shrinksRev[key] || 0) >= 2) return;
        const waste = el.offsetTop + el.offsetHeight - fimConteudo;
        if (waste > el.offsetHeight * 0.45 && waste > maior) { maior = waste; alvo = key; }
      });
    });
    if (alvo) setShrinksRev((d) => ({ ...d, [alvo]: (d[alvo] || 0) + 1 }));
  }, [s, groups, tick, estourou, shrinksRev]);
  const blocoStyle = { marginBottom: 14 };
  const measStyle = { marginBottom: 14, display: "flow-root" /* mede INCLUINDO o float */ };
  const render = (b) => (b.node ? b.node : <SecRevista secKey={b.key} titulo={b.titulo} texto={b.texto} figs={b.figs} cor={b.cor} />);
  return (
    <div ref={outerRef} style={{ flex: 1, minHeight: 0, width: "100%", overflow: "hidden", position: "relative" }}>
      <RevOptCtx.Provider value={{ shrinks: shrinksRev }}>
      <div ref={measRef} aria-hidden="true" style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", left: -99999, top: 0, width: superW }}>
        <FitContext.Provider value={{ s: 1, altura: availH, figFrac: 0.5, semPrioridade: false }}>
          {all.map((b) => <div key={b.key} style={measStyle}>{render(b)}</div>)}
        </FitContext.Provider>
      </div>
      {!groups && (
        <div style={{ padding: `18px ${padX}px`, display: "flex", gap, height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
          <FitContext.Provider value={{ s: 0.82, altura: availH, figFrac: 0.5, semPrioridade: false }}>
            <div style={{ width: superW }}>{all.slice(0, Math.ceil(all.length / 2)).map((b) => <div key={b.key} style={blocoStyle}>{render(b)}</div>)}</div>
            <div style={{ width: superW }}>{all.slice(Math.ceil(all.length / 2)).map((b) => <div key={b.key} style={blocoStyle}>{render(b)}</div>)}</div>
          </FitContext.Provider>
        </div>
      )}
      {groups && (
        <div ref={visRef} style={{ display: "flex", gap, padding: `18px ${padX}px`, paddingBottom: estourou ? 44 : 18, height: "100%", boxSizing: "border-box", alignItems: "flex-start" }}>
          <FitContext.Provider value={{ s, altura: (availH - 28), figFrac: 0.5, semPrioridade: false }}>
            {groups.map((g, ci) => (
              <div key={ci} style={{ width: superW, display: "flow-root", position: "relative" /* fluxo CONTÍNUO: floats de uma seção recebem o texto da seguinte */ }}>
                {all.slice(g[0], g[1]).filter((b) => !(estourou && b.key === "__refs")).map((b) => <div key={b.key} style={blocoStyle}>{render(b)}</div>)}
              </div>
            ))}
          </FitContext.Provider>
        </div>
      )}
      </RevOptCtx.Provider>
      {estourou && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>{refsBanda}</div>}
      {estourou && (
        <div style={{ position: "absolute", right: 16, bottom: 46, background: "#FFF8E6", border: "1px solid #F0DCA8", color: "#7A5C12", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          conteúdo completo no celular (QR)
        </div>
      )}
    </div>
  );
}

/* ===== MODO 2b — PÔSTER COMPLETO HORIZONTAL (monitor / TV deitada, FIT total sem scroll) ===== */
function PosterCompletoLandscape({ t, onVoltar }) {
  const BW = 1600;
  const [ref, scale, BH] = useFillViewport(BW);
  const cor = AREA_COR[t.area] || C.azul;
  const fotoUrl = t.foto_autores_url || t.foto_autores_dataUrl;
  const F = figsPorSecao(t);
  const fase7 = Number(t.fase) === 7;
  const Sec = ({ titulo, texto, figs }) => (texto || (figs && figs.length)) ? (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:19, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, borderBottom:`3px solid ${cor}33`, paddingBottom:5, marginBottom:7, breakAfter:"avoid" }}>{titulo}</div>
      {texto && <div style={{ fontSize:16.5, lineHeight:1.42, color:C.tinta, textAlign:"justify" }}>{texto}</div>}
      {figs && figs.map((f, i) => <FigPoster key={i} f={f} cor={cor} />)}
    </div>
  ) : null;
  // fluxo em colunas balanceadas: o texto escorre e preenche os espaços
  const complementares = fase7 ? [...F.conclusao, ...F.outras] : F.outras;
  return (
    <div ref={ref} style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      <div style={{ width:BW, height:BH, transform:`scale(${scale})`, transformOrigin:"center center", flexShrink:0, background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", boxSizing:"border-box" }}>
        {/* cabeçalho — concentra TUDO que não é conteúdo: badges, palavras-chave,
            marca, voltar, foto e QR — o corpo fica inteiro para o trabalho */}
        <div style={{ background:`linear-gradient(135deg, ${C.azul}, ${C.azulEsc})`, color:"#fff", padding:"11px 40px", display:"flex", gap:18, alignItems:"center" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap", alignItems:"center" }}>
              {onVoltar && (
                <button onClick={onVoltar} title="Voltar à programação" style={{ ...vbadgeSm, display:"inline-flex", alignItems:"center", gap:5, cursor:"pointer", fontFamily:"inherit", background:"rgba(255,255,255,0.26)", color:"#fff" }}>
                  <ArrowLeft size={13} color="#fff" /> Voltar
                </button>
              )}
              <span style={vbadgeSm}>{t.fase}ª FASE</span><span style={vbadgeSm}>{t.desenho}</span><span style={vbadgeSm}>{t.id}</span>
              <span style={{ ...vbadgeSm, background:cor, borderColor:cor }}>{t.area}</span>
              {_palavrasArr(t).map((p) => <span key={p} style={{ fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:999, border:"1px solid rgba(255,255,255,0.28)", color:"rgba(255,255,255,0.85)", whiteSpace:"nowrap" }}>{p}</span>)}
              <span style={{ marginLeft:"auto", fontSize:13, fontWeight:800, letterSpacing:0.6, color:C.ciano, whiteSpace:"nowrap" }}>SAM · MEDICINA UNIDAVI</span>
            </div>
            <div style={{ fontSize:23, fontWeight:800, lineHeight:1.12, letterSpacing:-0.3 }}>{t.titulo}</div>
            <div style={{ fontSize:12.5, opacity:0.9, lineHeight:1.3, marginTop:5 }}>
              {_autoresStr(t, " · ")}
              {!fase7 && t.orientador ? <span style={{ opacity:0.8 }}> · Orient.: {t.orientador}</span> : null}
              {t.afiliacao ? <span style={{ opacity:0.72, fontStyle:"italic" }}> — {t.afiliacao}</span> : null}
            </div>
          </div>
          {fotoUrl && <div style={{ width:62, height:62, borderRadius:10, overflow:"hidden", flexShrink:0, border:"2px solid rgba(255,255,255,0.45)", background:"#fff" }}><img src={fotoUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/></div>}
          <div style={{ background:"#fff", padding:5, borderRadius:8, flexShrink:0 }}><QRCode id={t.id} size={62} /></div>
        </div>
        {/* corpo — fluxo em 3 colunas; referências no fim do texto.
            Pisos de legibilidade para TV 65" a ~1,5 m: texto ≥ 0,85 (mínimo
            absoluto 0,75) — abaixo disso, sinaliza e manda para o QR. */}
        {_ehResumo8(t) ? (
          <CorpoAjustavel t={t} style={{ padding:"22px 40px", columnCount:2, columnGap:36 }} padX={40} pisoTexto={0.85} pisoMin={0.75}>
            <Sec titulo="Resumo" texto={t.resumo_completo} />
          </CorpoAjustavel>
        ) : (() => {
          /* layout “revista”: 2 super-colunas; figuras flutuam DENTRO das seções
             e o texto rebate ao lado delas (sem vazios sob figuras) */
          const secoes = [];
          const addS = (titulo, texto, figs) => { if (texto || (figs && figs.length)) secoes.push({ key: "s-" + titulo, titulo, texto, figs: figs || [], cor }); };
          addS("Introdução", t.intro || t.introducao, F.intro);
          addS("Objetivo", t.objetivos);
          addS("Metodologia", t.metodos, F.metodos);
          addS(fase7 ? "Resultados esperados" : "Resultados", t.resultados, F.resultados);
          if (!fase7) addS("Conclusão", t.conclusao, F.conclusao);
          if (complementares.length) {
            const ult = secoes[secoes.length - 1];
            if (ult) ult.figs = [...ult.figs, ...complementares]; else addS("Figuras", "", complementares);
          }
          return (
            <CorpoRevista secoes={secoes} bw={BW} gap={36} padX={40} pisoMin={0.5}
              refsBloco={<RefsBloco t={t} cor={cor} />}
              refsBanda={<RefsBanda t={t} cor={cor} colunas={3} />} />
          );
        })()}
      </div>
    </div>
  );
}

/* Referências começam ABERTAS por padrão; só recolhidas se >8 (espaço). */
const REFS_MAX_ABERTO = 8;

/* ===== MODO 3 — LEITURA (celular via QR, fluxo ROLÁVEL) ===== */
function RefsLeitura({ t, cor }) {
  const refs = _refsArr(t);
  /* início ABERTO; recolhido (com contador) só quando há mais de 8 referências */
  const [aberto, setAberto] = React.useState(refs.length > 0 && refs.length <= REFS_MAX_ABERTO);
  if (!refs.length) return null;
  return (
    <div style={{ marginBottom:22, border:"1px solid #E3EAF2", borderRadius:11 }}>
      <button onClick={() => setAberto((a) => !a)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, border:"none", background:"transparent", cursor:"pointer", padding:"12px 14px", fontFamily:"inherit", textAlign:"left" }}>
        <span style={{ fontSize:13, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.6 }}>Referências</span>
        <span style={{ fontSize:12, color:C.cinza }}>({refs.length})</span>
        <span style={{ marginLeft:"auto", fontSize:12, color:C.cinza }}>{aberto ? "recolher ▴" : "abrir ▾"}</span>
      </button>
      {aberto && <ol style={{ margin:0, padding:"0 14px 14px 32px" }}>{refs.map((l, i) => <li key={i} style={{ fontSize:13, lineHeight:1.5, color:C.cinza, marginBottom:6 }}>{l}</li>)}</ol>}
    </div>
  );
}
function TrabalhoLeitura({ t }) {
  const cor = AREA_COR[t.area] || C.azul;
  const fotoUrl = t.foto_autores_url || t.foto_autores_dataUrl;
  const F = figsPorSecao(t);
  const badge = { fontSize:12, fontWeight:700, padding:"4px 11px", borderRadius:999, background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.34)", whiteSpace:"nowrap" };
  const FigLer = ({ f }) => {
    const url = f.url || f.dataUrl;
    return (
      <div style={{ margin:"14px 0", border:`2px ${f.principal ? "solid" : "dashed"} ${f.principal ? C.ciano : cor + "55"}`, borderRadius:12, overflow:"hidden", background:f.principal ? C.cianoClaro : C.papel }}>
        <div style={{ minHeight:120, display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", padding:10 }}>
          {url ? <img src={url} alt="" style={{ width:"100%", borderRadius:8 }} /> : <ImageIcon size={42} color={cor} />}
        </div>
        <div style={{ padding:"10px 14px", fontSize:13.5, color:C.cinza, lineHeight:1.4 }}>
          <div style={{ display:"flex", gap:6, alignItems:"baseline" }}>
            <strong style={{ color:C.azul, whiteSpace:"nowrap" }}>Fig {f.ordem}.</strong>
            <span style={{ flex:1, fontWeight:f.titulo?700:400, color:f.titulo?C.tinta:C.cinza }}>{f.titulo || f.legenda}</span>
            {f.principal && <span style={{ fontSize:11, fontWeight:800, color:C.ciano, whiteSpace:"nowrap" }}>★ PRINCIPAL</span>}
          </div>
          {f.titulo && f.legenda ? <div style={{ marginTop:3 }}>{f.legenda}</div> : null}
        </div>
      </div>
    );
  };
  const Sec = ({ titulo, texto, figs }) => (texto || (figs && figs.length)) ? (
    <div style={{ marginBottom:22 }}>
      <div style={{ fontSize:13, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.6, marginBottom:7 }}>{titulo}</div>
      {texto && <div style={{ fontSize:16, lineHeight:1.6, color:C.tinta, textAlign:"justify", whiteSpace:"pre-wrap" }}>{texto}</div>}
      {figs && figs.map((f, i) => <FigLer key={i} f={f} />)}
    </div>
  ) : null;
  return (
    <div style={{ maxWidth:640, margin:"0 auto", background:"#fff", minHeight:"100%" }}>
      <div style={{ background:`linear-gradient(135deg, ${C.azul}, ${C.azulEsc})`, color:"#fff", padding:"26px 22px" }}>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:14 }}>
          <span style={badge}>{t.fase}ª FASE</span><span style={badge}>{t.desenho}</span>
          <span style={{ ...badge, background:cor, borderColor:cor }}>{t.area}</span>
          <span style={badge}>{t.id}</span>
        </div>
        <h1 style={{ fontSize:23, fontWeight:800, lineHeight:1.22, letterSpacing:-0.3, margin:0 }}>{t.titulo}</h1>
        <div style={{ display:"flex", gap:14, alignItems:"center", marginTop:14 }}>
          {fotoUrl && <div style={{ width:60, height:60, borderRadius:12, overflow:"hidden", flexShrink:0, border:"2px solid rgba(255,255,255,0.4)" }}><img src={fotoUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/></div>}
          <div style={{ fontSize:15, opacity:0.92, lineHeight:1.4 }}>
            {_autoresStr(t, " · ")}
            {Number(t.fase) !== 7 && t.orientador ? <><br /><span style={{ opacity:0.8 }}>Orientação: {t.orientador}</span></> : null}
            {t.afiliacao ? <><br /><span style={{ opacity:0.8, fontStyle:"italic" }}>{t.afiliacao}</span></> : null}
          </div>
        </div>
      </div>
      <div style={{ padding:"24px 22px 8px" }}>
        {_ehResumo8(t) ? (
          /* 8ª fase: o trabalho aparece como TEXTO do resumo submetido à revista */
          <Sec titulo="Resumo" texto={t.resumo_completo} />
        ) : (<>
          <Sec titulo="Introdução" texto={t.intro || t.introducao} figs={F.intro} />
          <Sec titulo="Objetivo" texto={t.objetivos} />
          <Sec titulo="Metodologia" texto={t.metodos} figs={F.metodos} />
          <Sec titulo={Number(t.fase) === 7 ? "Resultados esperados" : "Resultados"} texto={t.resultados} figs={F.resultados} />
          {Number(t.fase) !== 7 && <Sec titulo="Conclusão" texto={t.conclusao} figs={F.conclusao} />}
          {(Number(t.fase) === 7 ? [...F.conclusao, ...F.outras] : F.outras).length > 0 && <Sec titulo="Figuras complementares" figs={Number(t.fase) === 7 ? [...F.conclusao, ...F.outras] : F.outras} />}
        </>)}
        {/* Referências e palavras-chave em largura total ao pé */}
        {!_ehResumo8(t) && <RefsLeitura t={t} cor={cor} />}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
          {_palavrasArr(t).map((p) => <span key={p} style={{ fontSize:13, background:C.papel, border:"1px solid #DCE5EE", borderRadius:999, padding:"6px 13px", color:C.cinza }}>{p}</span>)}
        </div>
      </div>
      <div style={{ borderTop:"1px solid #EEF2F6", padding:"18px 22px 30px", textAlign:"center" }}>
        <div style={{ fontSize:15, fontWeight:800, color:C.azul, letterSpacing:0.5 }}>SAM · MEDICINA UNIDAVI</div>
        <div style={{ fontSize:12, color:C.cinza, marginTop:4 }}>XI Semana Acadêmica da Medicina · 2026</div>
      </div>
    </div>
  );
}

/* ---------------- HEADER DO SITE (não aparece no telão) ---------------- */
function SiteHeader() {
  return (
    <header style={{ background:"#fff", borderBottom:"1px solid #E3EAF2", position:"sticky", top:0, zIndex:10 }}>
      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 16px", display:"flex", alignItems:"center", gap:12, height:60 }}>
        {/* LOGO: UNIDAVI (branca, sobre chip azul) + lockup Medicina UNIDAVI */}
        <div onClick={() => go("#/")} style={{ display:"flex", alignItems:"center", gap:11, cursor:"pointer" }}>
          <div style={{ height:42, padding:"0 12px", borderRadius:10, background:C.azul, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <img src={(window.__resources && window.__resources.logoUnidavi) || "assets/logo-unidavi.png"} alt="UNIDAVI" style={{ height:24, width:"auto", display:"block" }} />
          </div>
          <div style={{ lineHeight:1, paddingLeft:2, borderLeft:"1px solid #E3EAF2", marginLeft:1, paddingTop:1, paddingBottom:1 }}>
            <div style={{ fontWeight:800, fontSize:17, color:C.azul, letterSpacing:-0.3, whiteSpace:"nowrap" }}>SAM <span style={{ color:C.ciano }}>2026</span></div>
            <div style={{ fontSize:11, color:C.cinza, marginTop:2, whiteSpace:"nowrap" }}>Medicina UNIDAVI</div>
          </div>
        </div>
        {(() => {
          const sobre = (window.location.hash || "").includes("sobre");
          const link = (on) => ({ fontSize:14, fontWeight:700, textDecoration:"none", padding:"10px 14px", borderRadius:9, color:on ? "#fff" : C.cinza, background:on ? C.azul : "transparent" });
          return (
            <nav style={{ marginLeft:"auto", display:"flex", gap:4 }}>
              <a href="#/" style={link(!sobre)}>Programação</a>
              <a href="#/sobre" style={link(sobre)}>Sobre</a>
            </nav>
          );
        })()}
      </div>
    </header>
  );
}

Object.assign(window, { PosterVitrine, PosterCompleto, PosterCompletoLandscape, TrabalhoLeitura, SiteHeader, vbadge });
