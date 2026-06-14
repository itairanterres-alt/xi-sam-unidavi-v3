/* ============================================================
   XI SAM 2026 · V3 — JUIZ COM VISÃO (progressive enhancement)
   ------------------------------------------------------------
   O scorer determinístico é o motor de PRODUÇÃO (sempre roda).
   Este juiz é uma CAMADA opcional: existe só onde window.claude
   está disponível (ambiente Claude / tela de submissão assistida).
   Em produção (Vercel estático) window.claude não existe → o
   loop simplesmente não roda e vale a escolha do scorer.

   Fluxo: rasteriza o RENDER → modelo com visão julga a IMAGEM
   (não as métricas) → aprova ou devolve uma AÇÃO de readequação
   → re-render via `ajuste` → repete até aprovar (teto de iterações).
   A AÇÃO aprovada vira o `ajuste_layout` que segue com o trabalho.
   ============================================================ */
(function () {
  const TEM_VISAO = !!(window.claude && window.claude.complete);
  const TEM_RASTER = () => !!window.htmlToImage;
  // URL do /exec do Apps Script V3 (produção). O backend faz a chamada ao
  // Gemini Flash com a chave guardada nas Script Properties. Definida pelo
  // app via SAM_JUIZ.config({ backendUrl }).
  let BACKEND_URL = window.SAM_API_URL || "";
  let backendQuebrado = false; // vira true se o /exec não roteia 'julgar_layout'
  function config(o) { if (o && o.backendUrl) BACKEND_URL = o.backendUrl; }
  // Em produção (Vercel) window.claude NÃO existe → usa o backend.
  // No preview Claude, usa window.claude como stand-in (sem chave Gemini aqui).
  const disponivel = () => TEM_VISAO || !!BACKEND_URL;

  /* rasteriza o cartão do pôster (1600×BH) em JPEG reduzido p/ a visão.
     JPEG + largura menor mantêm o request < 256 KB (limite do helper). */
  async function rasterizar(node, alvoW) {
    if (!TEM_RASTER() || !node) return null;
    const w = node.offsetWidth || 1600, h = node.offsetHeight || 900;
    const ratio = (alvoW || 840) / w;
    const opts = { pixelRatio: ratio, backgroundColor: "#ffffff", width: w, height: h, style: { transform: "none", margin: "0" }, cacheBust: true, quality: 0.72 };
    try {
      return await window.htmlToImage.toJpeg(node, opts);
    } catch (e) { console.warn("raster", e); return null; }
  }

  function extrairJSON(txt) {
    if (!txt) return null;
    const m = String(txt).match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
    // tolerante a JSON truncado (MAX_TOKENS): salva os campos por regex
    const ap = /"aprovado"\s*:\s*(true|false)/i.exec(txt);
    const ac = /"acao"\s*:\s*"([a-z_]+)"/i.exec(txt);
    const nt = /"nota"\s*:\s*(\d+)/.exec(txt);
    const pr = /"problema"\s*:\s*"([^"]*)/.exec(txt);
    if (!ap && !ac && !pr) return null;
    return { aprovado: ap ? ap[1] === "true" : true, acao: ac ? ac[1] : null, nota: nt ? +nt[1] : null, problema: pr ? pr[1] : "" };
  }

  const RUBRICA =
    "RESPONDA APENAS COM UM OBJETO JSON VÁLIDO, começando com '{' — NÃO escreva nenhuma análise, título ou texto fora do JSON. " +
    "Você é editor-chefe de pôsteres científicos de um congresso de Medicina, avaliando um pôster eletrônico em formato TV (paisagem). " +
    "ESTE é um pôster DENSO e legítimo: o formato esperado é uma FIGURA principal ocupando cerca de um terço e o TEXTO em colunas justificadas preenchendo o resto. Isso é CORRETO, não um defeito. " +
    "APROVE (aprovado:true, acao:null) sempre que o pôster estiver limpo e legível para o telão — mesmo que sobre uma faixa modesta de respiro no rodapé das colunas. " +
    "Só peça readequação para defeitos GROSSEIROS e inequívocos: " +
    "(a) a figura principal está como MINIATURA (bem menos de um quinto do corpo) e há uma GRANDE área vazia → destacar_figura; " +
    "(b) a figura DOMINA a ponto de o texto ficar ilegível/espremido em tiras → reduzir_figura; " +
    "(c) uma coluna inteira está praticamente VAZIA enquanto outra transborda → menos_colunas; " +
    "(d) o texto está CORTADO/transbordando para fora da borda → reduzir_figura. " +
    "Na dúvida, APROVE. Responda SOMENTE um JSON, sem comentários nem markdown; o campo 'problema' deve ter NO MÁXIMO 6 palavras: " +
    '{"aprovado": true|false, "nota": 0-10, "problema": "frase curta", "acao": "nenhuma"|"destacar_figura"|"reduzir_figura"|"mais_colunas"|"menos_colunas"}.';

  const _ACOES = ["destacar_figura", "reduzir_figura", "mais_colunas", "menos_colunas"];
  function normVeredito(v) {
    if (!v || typeof v !== "object") return { aprovado: true, acao: null, problema: "parser" };
    if (!_ACOES.includes(v.acao)) v.acao = null;       // "nenhuma"/inválido → null
    if (v.aprovado === undefined) v.aprovado = !v.acao; // sem ação = aprovado
    return v;
  }

  /* julga via BACKEND (produção): POST do JPEG ao /exec → Gemini Flash → JSON */
  async function julgarBackend(b64, media, contexto) {
    const url = BACKEND_URL + (BACKEND_URL.indexOf("?") >= 0 ? "&" : "?") + "action=julgar_layout";
    const r = await fetch(url, {
      method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "julgar_layout", media_type: media, imagem_b64: b64, contexto: contexto || "", rubrica: RUBRICA }),
    });
    const res = await r.json();
    if (res && res.veredito) {
      let v = res.veredito;
      if ((!v || v.problema === "sem parecer" || v.problema === "parser") && res._raw) { const t = extrairJSON(res._raw); if (t) v = t; }
      return normVeredito(v);
    }
    if (res && (res.aprovado !== undefined || res.acao !== undefined)) return normVeredito(res);
    if (res && res.texto) return normVeredito(extrairJSON(res.texto));
    if (res && res.id && res.token) { backendQuebrado = true; const e = new Error("backend não roteia 'julgar_layout' (tratou como submissão " + res.id + ")"); e.code = "MISROUTE"; throw e; }
    throw new Error((res && res.erro) || "resposta inválida do backend");
  }

  /* julga via window.claude (PREVIEW/stand-in): visão local do ambiente Claude */
  async function julgarLocal(b64, media, contexto) {
    const ctx = contexto ? `Contexto: ${contexto}. ` : "";
    const r = await window.claude.complete({
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: media, data: b64 } },
        { type: "text", text: ctx + RUBRICA },
      ] }],
    });
    const v = normVeredito(extrairJSON(r));
    v.bruto = r;
    return v;
  }

  /* julga UMA imagem → veredito {aprovado, nota, problema, acao}.
     Em produção usa o backend; no preview, window.claude. */
  async function julgar(pngDataUrl, contexto) {
    if (!disponivel()) return { aprovado: true, nota: null, problema: "", acao: null, semVisao: true };
    if (!pngDataUrl) return { aprovado: true, nota: null, problema: "sem raster", acao: null };
    const b64 = pngDataUrl.split(",")[1];
    const media = /^data:image\/jpe?g/.test(pngDataUrl) ? "image/jpeg" : "image/png";
    try {
      // produção: backend Gemini (não depende de window.claude, roda no Vercel)
      if (BACKEND_URL && !backendQuebrado && !window.__SAM_JUIZ_LOCAL) return await julgarBackend(b64, media, contexto);
      if (TEM_VISAO) return await julgarLocal(b64, media, contexto);
      if (BACKEND_URL && !backendQuebrado) return await julgarBackend(b64, media, contexto);
      return { aprovado: true, nota: null, problema: "", acao: null, semVisao: true };
    } catch (e) {
      if (TEM_VISAO) { try { return await julgarLocal(b64, media, contexto); } catch (e2) {} }
      const misroute = e && e.code === "MISROUTE";
      return { aprovado: true, nota: null, problema: (misroute ? "juiz não configurado no backend" : "erro IA: " + (e && e.message || e)), acao: null, erro: true, semVisao: misroute };
    }
  }

  /* traduz a AÇÃO da IA num novo `ajuste` para o scorer — opera num CONTÍNUO
     (fração de largura do herói) para convergir, não só alternar template. */
  function aplicarAcao(ajusteAtual, escolhido, acao) {
    const a = { ...(ajusteAtual || {}) };
    const tpl = (escolhido && escolhido.template) || a.template || "colunas";
    const cols = (escolhido && escolhido.cols) || a.cols || 2;
    const aHero = (escolhido && escolhido.aHero) || 1.4;
    const fr = (escolhido && escolhido.heroFrac) || (aHero >= 1.12 ? 0.48 : aHero <= 0.8 ? 0.30 : 0.40);
    const fracMed = aHero >= 1.12 ? 0.46 : aHero <= 0.8 ? 0.30 : 0.40;
    if (acao === "destacar_figura") {
      if (tpl !== "lateral") { a.template = aHero >= 2.6 ? "faixa" : "lateral"; a.cols = Math.min(cols, 3); a.heroFrac = fracMed; }
      else { a.template = "lateral"; a.cols = cols; a.heroFrac = Math.min(0.58, fr + 0.08); }
    } else if (acao === "reduzir_figura") {
      if (tpl === "lateral") {
        const nf = fr - 0.08;
        if (nf < 0.30) { a.template = "colunas"; a.cols = Math.min(cols, 3); delete a.heroFrac; }
        else { a.template = "lateral"; a.cols = cols; a.heroFrac = nf; }
      } else { a.template = "colunas"; a.cols = cols; delete a.heroFrac; }
    } else if (acao === "mais_colunas") { a.template = tpl; a.cols = Math.min(4, cols + 1); if (tpl === "lateral") a.heroFrac = fr; }
    else if (acao === "menos_colunas") { a.template = tpl; a.cols = Math.max(2, cols - 1); if (tpl === "lateral") a.heroFrac = fr; }
    return a;
  }

  window.SAM_JUIZ = { TEM_VISAO, disponivel, config, rasterizar, julgar, julgarBackend, julgarLocal, aplicarAcao, extrairJSON, get BACKEND_URL() { return BACKEND_URL; } };
})();
