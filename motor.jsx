/* ============================================================
   XI SAM 2026 · V3 — MOTOR DE DIAGRAMAÇÃO DO PÔSTER (landscape)
   ------------------------------------------------------------
   Função-objetivo: PREENCHER e EQUILIBRAR (não só "caber").

   Pipeline determinístico (sem loop de render):
     1. monta blocos de leitura (seções por desenho + figuras + refs)
     2. gera CANDIDATOS (templates × nº de colunas):
          · colunas   — herói inline, K colunas equilibradas
          · faixa     — texto em cima, herói LARGO em faixa cheia embaixo
          · lateral   — herói RETRATO numa coluna ao lado do texto
     3. para cada candidato resolve a escala de fonte `s` ANALITICAMENTE
        (parte fixa = imagens; parte que escala = texto) e refina com
        pouquíssimas medições IMPERATIVAS (offscreen) — nunca via setState.
     4. mede métricas: fill% · maior vazio · proeminência do herói ·
        balance de colunas · overflow → score determinístico
     5. escolhe o melhor; injeta o HTML (medição == render, byte a byte).

   Toda <img> recebe width E height EXPLÍCITOS (do aspecto) → ZERO
   reflow ao carregar. O corpo é string HTML → o que medimos é o que
   renderizamos. `window.SAM_MOTOR.escolher(...)` é puro e reutilizável
   (harness mostra as métricas ao lado do render).
   ============================================================ */
(function () {
  const C = window.C || { azul:"#023E88", azulEsc:"#01285A", ciano:"#00ADEF", cianoClaro:"#E5F6FE", tinta:"#0C1A2B", cinza:"#5B6B7E", cinzaClaro:"#EEF2F6", papel:"#F7F9FB" };
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* ---- tipografia base (escala 1) ---- */
  const FT = { titulo: 20, corpo: 17, legenda: 12.5, refsTit: 13, refsItem: 11.5 };
  const S_MIN = 0.66, S_MAX = 1.26;
  const GAP = 30, PADX = 44, PADY = 22, COLGAP = 30;

  /* ---- aspecto: razão LARGURA/ALTURA (>1 = paisagem) ---- */
  const aspectoDe = (f, mapa) => {
    if (mapa && f && f.ordem != null && mapa[f.ordem]) return mapa[f.ordem];
    if (f && f.aspecto) return f.aspecto;
    return 1.4;
  };

  /* ============ MEDIDOR OFFSCREEN (imperativo, síncrono) ============ */
  let _med = null;
  function medidor() {
    if (_med && document.body.contains(_med)) return _med;
    _med = document.createElement("div");
    _med.setAttribute("aria-hidden", "true");
    Object.assign(_med.style, {
      position: "fixed", left: "-99999px", top: "0", visibility: "hidden",
      pointerEvents: "none", fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      boxSizing: "border-box",
    });
    document.body.appendChild(_med);
    return _med;
  }
  function medeAltura(html, width) {
    const m = medidor();
    m.style.width = width + "px";
    m.innerHTML = html;
    return m.offsetHeight;
  }

  /* ============ HTML DE BLOCOS (medição == render) ============ */
  function tituloHTML(rotulo, s, cor) {
    return `<div style="font-size:${(FT.titulo*s).toFixed(2)}px;font-weight:800;color:${cor};text-transform:uppercase;letter-spacing:.5px;border-bottom:3px solid ${cor}33;padding-bottom:${(5*s).toFixed(1)}px;margin-bottom:${(7*s).toFixed(1)}px;line-height:1.12;display:flow-root">${esc(rotulo)}</div>`;
  }
  function corpoHTML(texto, s) {
    if (!texto) return "";
    const paras = String(texto).split(/\n+/).filter(Boolean);
    return paras.map((p, i) => `<div style="font-size:${(FT.corpo*s).toFixed(2)}px;line-height:1.42;color:${C.tinta};text-align:justify;${i?`margin-top:${(8*s).toFixed(1)}px`:""}">${esc(p)}</div>`).join("");
  }
  function legendaHTML(f, s) {
    const principal = f.principal ? `<span style="font-size:${(10.5*s).toFixed(2)}px;font-weight:800;color:${C.ciano};white-space:nowrap;margin-left:6px">★ PRINCIPAL</span>` : "";
    const tit = f.titulo ? `<strong style="color:${C.tinta}">${esc(f.titulo)}</strong>${f.legenda ? " — " : ""}` : "";
    return `<div style="padding:${(6*s).toFixed(1)}px ${(10*s).toFixed(1)}px;font-size:${(FT.legenda*s).toFixed(2)}px;color:${C.cinza};line-height:1.32"><strong style="color:${C.azul}">Fig ${f.ordem}.</strong> ${tit}${esc(f.legenda || "")}${principal}</div>`;
  }
  /* figura: largura E altura explícitas → sem reflow. `dispW` = largura de exibição. */
  function figHTML(f, s, cor, dispW, mapa, semLegenda) {
    const url = f.url || f.dataUrl;
    const a = aspectoDe(f, mapa);
    const imgW = Math.round(dispW);
    const imgH = Math.round(imgW / a);
    const borda = `2px ${f.principal ? "solid" : "dashed"} ${f.principal ? C.ciano : cor + "55"}`;
    const fundo = f.principal ? C.cianoClaro : C.papel;
    const inner = url
      ? `<img src="${esc(url)}" alt="" style="display:block;width:${imgW}px;height:${imgH}px;object-fit:cover" />`
      : `<div style="width:${imgW}px;height:${Math.round(imgW/1.6)}px;display:flex;align-items:center;justify-content:center;background:#fff;color:${cor};font-size:13px">[figura]</div>`;
    return `<div style="break-inside:avoid;margin:${(4*s).toFixed(1)}px 0 ${(12*s).toFixed(1)}px;border:${borda};border-radius:10px;overflow:hidden;background:${fundo};width:${imgW}px">`
      + `<div style="background:#fff;display:flex;justify-content:center">${inner}</div>`
      + (semLegenda ? "" : legendaHTML(f, s)) + `</div>`;
  }
  /* largura de exibição de uma figura inline (capImgH limita a ALTURA para o
     herói não “engolir” a coluna e travar a fonte no piso) */
  function dispWFig(f, colW, mapa, capImgH) {
    if (!capImgH) return colW;
    const a = aspectoDe(f, mapa);
    return Math.min(colW, Math.round(capImgH * a));
  }
  /* bloco de seção (título + texto + figuras inline) */
  function blocoHTML(b, s, cor, colW, mapa, capImgH) {
    let h = `<div style="margin-bottom:${(13*s).toFixed(1)}px;break-inside:avoid">`;
    if (b.rotulo) h += tituloHTML(b.rotulo, s, cor);
    h += corpoHTML(b.texto, s);
    (b.figs || []).forEach((f) => { h += `<div style="display:flow-root;margin-top:${(8*s).toFixed(1)}px">` + figHTML(f, s, cor, dispWFig(f, colW, mapa, capImgH), mapa) + `</div>`; });
    return h + `</div>`;
  }
  const colunaHTML = (blocos, s, cor, colW, mapa, capImgH) => blocos.map((b) => blocoHTML(b, s, cor, colW, mapa, capImgH)).join("");

  function refsHTML(refs, s, cor, fullW) {
    if (!refs || !refs.length) return "";
    const vis = refs.slice(0, 6);
    const resto = refs.length - vis.length;
    const itens = vis.map((l) => `<li style="font-size:${(FT.refsItem*s).toFixed(2)}px;line-height:1.3;color:${C.cinza};margin-bottom:2px;break-inside:avoid">${esc(l)}</li>`).join("");
    return `<div style="border-top:1px solid #E3EAF2;background:#fff;padding:${(8*s).toFixed(1)}px ${PADX}px ${(9*s).toFixed(1)}px;width:${fullW}px;box-sizing:border-box">`
      + `<div style="font-size:${(FT.refsTit*s).toFixed(2)}px;font-weight:800;color:${cor};text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px">Referências${resto>0?` · 6 de ${refs.length} (completas no QR)`:""}</div>`
      + `<ol style="margin:0;padding-left:16px;column-count:3;column-gap:26px;list-style-position:inside">${itens}</ol></div>`;
  }

  /* ============ MONTAGEM DOS BLOCOS DE LEITURA ============ */
  function refsArr(t) { return (t.referencias || "").split("\n").map((s) => s.trim()).filter(Boolean); }
  function figsOrd(t) { return (Array.isArray(t.figuras) ? t.figuras.slice() : []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0)); }
  function heroDe(t) { const fs = figsOrd(t); return fs.find((f) => f.principal) || fs[0] || null; }

  function montarBlocos(t, heroForaInline) {
    const secoes = (window.SAM_ESQUEMA ? window.SAM_ESQUEMA.secoesDe(t) : [
      { rotulo:"Introdução", chave:"intro", sec:"Introdução" },
      { rotulo:"Objetivo", chave:"objetivos", sec:null },
      { rotulo:"Metodologia", chave:"metodos", sec:"Métodos" },
      { rotulo:"Resultados esperados", chave:"resultados", sec:"Resultados" },
    ]);
    const figs = figsOrd(t);
    const hero = heroDe(t);
    const usadas = new Set(secoes.map((s) => s.sec).filter(Boolean));
    const blocos = [];
    // Blocos em granularidade de PARÁGRAFO → o particionador equilibra as colunas
    // mesmo quando uma seção (ex.: introdução longa) domina. O título acompanha o
    // 1º parágrafo (nunca órfão); parágrafos seguintes fluem como continuação.
    const pushSecao = (rotulo, texto, figsSec) => {
      const paras = String(texto || "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
      figsSec = figsSec || [];
      if (!paras.length && !figsSec.length) return;
      if (!paras.length) { blocos.push({ key: rotulo + ":tf", rotulo, texto: "", figs: figsSec }); return; }
      paras.forEach((p, i) => blocos.push({ key: rotulo + ":" + i, rotulo: i === 0 ? rotulo : "", texto: p, figs: [] }));
      if (figsSec.length) blocos.push({ key: rotulo + ":figs", rotulo: "", texto: "", figs: figsSec });
    };
    secoes.forEach((sx) => {
      const texto = t[sx.chave] || (sx.chave === "intro" ? (t.introducao || "") : "");
      let figsSec = sx.sec ? figs.filter((f) => f.secao === sx.sec) : [];
      if (heroForaInline && hero) figsSec = figsSec.filter((f) => f !== hero);
      pushSecao(sx.rotulo, texto, figsSec);
    });
    // complementares: figuras cuja seção não casa nenhuma seção do desenho
    let comp = figs.filter((f) => !usadas.has(f.secao));
    if (heroForaInline && hero) comp = comp.filter((f) => f !== hero);
    if (comp.length) blocos.push({ key: "__comp", rotulo: "Figuras complementares", texto: "", figs: comp });
    return blocos;
  }

  /* ============ MEDIÇÃO ANALÍTICA DE UM BLOCO ============ */
  // htxt = altura do TEXTO (título+corpo+legendas) à largura colW, s=1.
  // imgH = altura SOMADA das imagens (parte fixa) à largura colW.
  function medeBloco(b, cor, colW, mapa, capImgH) {
    // texto sem imagens (mas com legendas) — escala com s
    let htmlTxt = "";
    if (b.rotulo) htmlTxt += tituloHTML(b.rotulo, 1, cor);
    htmlTxt += corpoHTML(b.texto, 1);
    (b.figs || []).forEach((f) => { htmlTxt += legendaHTML(f, 1); });
    const htxt = medeAltura(`<div style="margin-bottom:13px">${htmlTxt}</div>`, colW);
    // imagens (parte fixa) — não escala com a fonte; respeita o cap de altura
    let imgH = 0;
    (b.figs || []).forEach((f) => { const w = dispWFig(f, colW, mapa, capImgH); imgH += Math.round(w / aspectoDe(f, mapa)) + 6 + 16; }); // img + bordas + margens
    return { htxt, imgH, total1: htxt + imgH };
  }

  /* particiona alturas em k grupos CONTÍGUOS minimizando a coluna mais alta */
  function particiona(hs, k) {
    const n = hs.length;
    if (n === 0) { return Array.from({ length: k }, () => [0, 0]); }
    const pre = [0]; for (let i = 0; i < n; i++) pre.push(pre[i] + hs[i]);
    const sum = (a, b) => pre[b] - pre[a];
    if (n <= k) { const cuts = []; for (let i = 1; i <= n; i++) cuts.push(i); while (cuts.length < k) cuts.push(n); return cutsToGroups(cuts); }
    let best = null;
    const rec = (start, parts, cuts, maxSo) => {
      if (parts === 1) { const m = Math.max(maxSo, sum(start, n)); if (!best || m < best.m) best = { m, cuts: [...cuts, n] }; return; }
      for (let i = start + 1; i <= n - (parts - 1); i++) { const mm = Math.max(maxSo, sum(start, i)); if (best && mm >= best.m) continue; rec(i, parts - 1, [...cuts, i], mm); }
    };
    rec(0, k, [], 0);
    return cutsToGroups(best.cuts);
    function cutsToGroups(cuts) { const g = []; let st = 0; cuts.forEach((c) => { g.push([st, c]); st = c; }); return g; }
  }

  /* ============ AVALIA UM CANDIDATO ============ */
  // template: "colunas" | "faixa" | "lateral"
  function avalia(t, template, cols, bodyW, bodyH, cor, mapa, opts) {
    const hero = heroDe(t);
    const aHero = hero ? aspectoDe(hero, mapa) : 0;
    const heroForaInline = (template === "faixa" || template === "lateral") && !!hero;
    const blocos = montarBlocos(t, heroForaInline);
    const refs = refsArr(t);

    // região útil (descontando refs no pé)
    const refsH = refs.length ? medeAltura(refsHTML(refs, 1, cor, bodyW - PADX * 2) , bodyW - PADX * 2) : 0;
    const usableH = bodyH - PADY * 2 - (refsH ? refsH + GAP * 0.5 : 0);

    let colW, availH, heroBox = null, textRegionW = bodyW - PADX * 2, capImgH = 0;

    if (template === "faixa" && hero) {
      // herói em faixa de LARGURA CHEIA embaixo — só para panorâmicas (largura
      // sempre cheia → sem caixa/faixas cinzas). Inválida se engolir o texto.
      const bandW = textRegionW;
      const bandH = Math.round(bandW / aHero);
      const capH = medeAltura(legendaHTML(hero, 1), bandW);
      heroBox = { tipo: "faixa", f: hero, drawW: bandW, bandH, capH, area: bandW * bandH };
      availH = usableH - bandH - capH - GAP;
      colW = Math.floor((textRegionW - COLGAP * (cols - 1)) / cols);
      if (availH < usableH * 0.32) return null;
    } else if (template === "lateral" && hero) {
      // herói como PAINEL LATERAL — LARGURA = fração do corpo (lever de design).
      // Largo → painel; retrato → coluna estreita. Altura derivada (≤ corpo).
      const fracDefault = aHero >= 1.12 ? 0.50 : aHero <= 0.8 ? 0.28 : 0.40;
      const heroFrac = Math.max(0.22, Math.min(0.60, (opts && opts.heroFrac) || fracDefault));
      const heroW = Math.round(textRegionW * heroFrac);
      const heroH = Math.min(usableH, Math.round(heroW / aHero));
      const capH = medeAltura(legendaHTML(hero, 1), heroW);
      heroBox = { tipo: "lateral", f: hero, heroW, heroH, capH, area: heroW * heroH, heroFrac };
      availH = usableH;
      const restoW = textRegionW - heroW - COLGAP;
      colW = Math.floor((restoW - COLGAP * (cols - 1)) / cols);
    } else {
      // colunas equilibradas — herói inline com ALTURA LIMITADA (capImgH) para
      // não travar a fonte no piso. Vale p/ 0 fig / figuras pequenas.
      availH = usableH;
      colW = Math.floor((textRegionW - COLGAP * (cols - 1)) / cols);
      capImgH = Math.round(availH * 0.46);
      const h = heroDe(t);
      const hw = h ? dispWFig(h, colW, mapa, capImgH) : 0;
      heroBox = h ? { tipo: "inline", f: h, area: hw * Math.round(hw / aHero) } : null;
    }
    if (colW < 150) return null; // colunas estreitas demais

    // mede blocos a colW (herói inline respeita capImgH)
    const med = blocos.map((b) => ({ b, ...medeBloco(b, cor, colW, mapa, capImgH) }));
    const grupos = particiona(med.map((m) => m.total1), cols);
    const colInfo = grupos.map((g) => {
      let TXT = 0, IMG = 0; for (let i = g[0]; i < g[1]; i++) { TXT += med[i].htxt; IMG += med[i].imgH; }
      return { TXT, IMG };
    });

    // resolve s: a coluna que limita é a de maior necessidade
    let s = S_MAX;
    colInfo.forEach((ci) => {
      if (ci.TXT <= 0) return;
      const room = availH - ci.IMG;
      if (room <= 0) { s = S_MIN; return; }
      s = Math.min(s, room / ci.TXT);
    });
    s = Math.max(S_MIN, Math.min(S_MAX, s));

    // alturas reais por coluna no s resolvido + overflow
    let maxColH = 0, minColH = Infinity, overflow = 0;
    const fills = colInfo.map((ci) => {
      const h = ci.TXT * s + ci.IMG;
      maxColH = Math.max(maxColH, h); minColH = Math.min(minColH, h);
      if (h > availH + 1) overflow += (h - availH);
      return Math.min(1.3, h / availH);
    });
    if (!colInfo.length) { minColH = 0; maxColH = 0; fills.push(0); }

    // proeminência do herói (área da imagem / área do corpo)
    const bodyArea = textRegionW * usableH;
    const heroProm = heroBox && heroBox.area ? heroBox.area / bodyArea : 0;

    // métricas
    const meanFill = fills.reduce((a, b) => a + b, 0) / fills.length;
    const minFill = Math.min(...fills);
    const vazio = Math.max(0, (availH - minColH)) / availH; // maior vazio relativo
    const mean = meanFill; const variance = fills.reduce((a, f) => a + (f - mean) ** 2, 0) / fills.length;
    const balance = 1 - Math.min(1, Math.sqrt(variance) * 2);

    // SCORE — preencher + equilibrar + herói com presença, punir overflow / fonte minúscula
    const fillScore = 1 - Math.abs(1 - Math.min(1.08, meanFill));       // perto de 100% é ótimo
    const vazioScore = 1 - Math.min(1, vazio);                           // menos vazio melhor
    // proeminência: ALVO GLOBAL — um herói deve ter presença real (~⅓ do corpo)
    // em QUALQUER template; assim "colunas" não escapa por enterrar a figura.
    const promAlvo = 0.32;
    const promScore = hero ? 1 - Math.min(1, Math.abs(heroProm - promAlvo) / 0.40) : 0.5;
    const sScore = (s - S_MIN) / (S_MAX - S_MIN);                        // fonte maior = mais legível
    const overflowPen = Math.min(1.4, overflow / availH);

    const score = 0.32 * fillScore + 0.18 * vazioScore + 0.20 * promScore + 0.14 * balance + 0.16 * sScore - 0.9 * overflowPen;

    return {
      template, cols, s: Math.round(s * 1000) / 1000, score, aHero,
      heroFrac: (heroBox && heroBox.heroFrac) || 0,
      metrics: {
        fill: Math.round(meanFill * 100), minFill: Math.round(minFill * 100),
        vazio: Math.round(vazio * 100), heroProm: Math.round(heroProm * 100),
        balance: Math.round(balance * 100), overflow: Math.round(overflow),
      },
      _build: { blocos, med, grupos, colInfo, colW, availH, heroBox, textRegionW, refs, refsH, usableH, capImgH },
    };
  }

  /* ============ GERA + ESCOLHE ============ */
  function candidatos(t, bodyW, bodyH, cor, mapa) {
    const hero = heroDe(t);
    const aHero = hero ? aspectoDe(hero, mapa) : 0;
    const out = [];
    const push = (tpl, k, opts) => { const r = avalia(t, tpl, k, bodyW, bodyH, cor, mapa, opts); if (r) out.push(r); };
    for (const k of [2, 3, 4]) push("colunas", k);
    if (hero) {
      // lateral parametrizada por FRAÇÃO de largura do herói — dá ao juiz um
      // contínuo para convergir (nem enterrar, nem dominar a figura).
      const fracs = aHero >= 1.12 ? [0.40, 0.48, 0.56] : aHero <= 0.8 ? [0.24, 0.30, 0.36] : [0.32, 0.40, 0.48];
      for (const k of [2, 3]) for (const fr of fracs) push("lateral", k, { heroFrac: fr });
      if (aHero >= 2.2) for (const k of [2, 3]) push("faixa", k);
    }
    return out;
  }
  /* refinamento IMPERATIVO do vencedor: mede as colunas REAIS no s escolhido e
     ajusta s para zerar overflow (a aproximação linear pode subestimar o reflow).
     Pouquíssimas medições offscreen — nunca via setState. */
  function refinaWinner(cand, cor, mapa) {
    const b = cand && cand._build; if (!b || !b.grupos || !b.grupos.length) return cand;
    const alturas = (s) => b.grupos.map((g) => {
      const bs = []; for (let i = g[0]; i < g[1]; i++) bs.push(b.med[i].b);
      return medeAltura(colunaHTML(bs, s, cor, b.colW, mapa, b.capImgH || 0), b.colW);
    });
    const maxOf = (hs) => Math.max(0, ...hs);
    let s = cand.s, guard = 0;
    // cresce a fonte até a coluna mais alta encostar na base (preenche o vazio
    // do subdimensionamento linear) …
    while (maxOf(alturas(s)) < b.availH * 0.975 && s < S_MAX - 0.001 && guard < 22) { s = Math.round((s + 0.02) * 1000) / 1000; guard++; }
    // … e encolhe se passou (overflow)
    guard = 0;
    while (maxOf(alturas(s)) > b.availH + 1 && s > S_MIN + 0.001 && guard < 22) { s = Math.round((s - 0.02) * 1000) / 1000; guard++; }
    s = Math.max(S_MIN, Math.min(S_MAX, s));
    const hs = alturas(s), mx = maxOf(hs), mn = Math.min(...hs);
    cand.s = s;
    cand.metrics.overflow = Math.max(0, Math.round(mx - b.availH));
    cand.metrics.fill = Math.round(Math.min(1.1, mx / b.availH) * 100);
    cand.metrics.vazio = Math.round(Math.max(0, b.availH - mn) / b.availH * 100);
    const fills = hs.map((h) => Math.min(1.2, h / b.availH));
    const m = fills.reduce((a, x) => a + x, 0) / fills.length;
    const va = fills.reduce((a, f) => a + (f - m) ** 2, 0) / fills.length;
    cand.metrics.balance = Math.round((1 - Math.min(1, Math.sqrt(va) * 2)) * 100);
    return cand;
  }
  function escolher(t, bodyW, bodyH, cor, mapa, ajuste) {
    let cands = candidatos(t, bodyW, bodyH, cor, mapa);
    if (!cands.length) { const r = avalia(t, "colunas", 2, bodyW, bodyH, cor, mapa); cands = r ? [r] : []; }
    cands.sort((a, b) => b.score - a.score || (a.cols - b.cols) || (b.s - a.s));
    // override manual (editor/curadoria)
    let escolhido = cands[0];
    if (ajuste && ajuste.template) {
      const cand = cands.filter((c) => c.template === ajuste.template && (!ajuste.cols || c.cols === ajuste.cols));
      let forc = null;
      if (cand.length) {
        if (ajuste.heroFrac) {
          forc = cand.reduce((a, b) => Math.abs((b.heroFrac || 0) - ajuste.heroFrac) < Math.abs((a.heroFrac || 0) - ajuste.heroFrac) ? b : a);
        } else { forc = cand[0]; }
      }
      if (forc) escolhido = forc;
    }
    if (escolhido) refinaWinner(escolhido, cor, mapa);
    return { escolhido, candidatos: cands };
  }

  /* ============ MONTA O HTML FINAL DO CORPO ============ */
  function corpoHTMLFinal(cand, cor, mapa) {
    const { blocos, med, grupos, colW, availH, heroBox, textRegionW, refs } = cand._build;
    const s = cand.s;
    const capImgH = cand._build.capImgH || 0;
    const colunasHTML = grupos.map((g) => {
      const bs = []; for (let i = g[0]; i < g[1]; i++) bs.push(med[i].b);
      return `<div style="width:${colW}px;display:flex;flex-direction:column">${colunaHTML(bs, s, cor, colW, mapa, capImgH)}</div>`;
    }).join("");

    let regiao = "";
    if (heroBox && heroBox.tipo === "faixa") {
      regiao = `<div style="display:flex;gap:${COLGAP}px;align-items:flex-start;width:${textRegionW}px">${colunasHTML}</div>`
        + `<div style="margin-top:${GAP}px;display:flex;flex-direction:column;align-items:center;width:${textRegionW}px">`
        + figHTML(heroBox.f, s, cor, heroBox.drawW, mapa) + `</div>`;
    } else if (heroBox && heroBox.tipo === "lateral") {
      const heroCol = `<div style="flex-shrink:0;width:${heroBox.heroW}px;display:flex;flex-direction:column;justify-content:center">${figHTML(heroBox.f, s, cor, heroBox.heroW, mapa)}</div>`;
      regiao = `<div style="display:flex;gap:${COLGAP}px;align-items:stretch;width:${textRegionW}px">${heroCol}<div style="display:flex;gap:${COLGAP}px;align-items:flex-start;flex:1">${colunasHTML}</div></div>`;
    } else {
      regiao = `<div style="display:flex;gap:${COLGAP}px;align-items:flex-start;width:${textRegionW}px">${colunasHTML}</div>`;
    }
    const refsBlock = refs.length ? refsHTML(refs, Math.min(1, s + 0.05), cor, textRegionW) : "";
    return `<div style="height:100%;display:flex;flex-direction:column;box-sizing:border-box">`
      + `<div style="flex:1;min-height:0;padding:${PADY}px ${PADX}px 0;overflow:hidden">${regiao}</div>`
      + (refsBlock ? `<div style="flex-shrink:0;margin-top:${Math.round(GAP*0.4)}px">${refsBlock}</div>` : "")
      + `</div>`;
  }

  window.SAM_MOTOR = { escolher, corpoHTMLFinal, heroDe, aspectoDe, montarBlocos, FT, S_MIN, S_MAX, PADX, PADY };
})();
