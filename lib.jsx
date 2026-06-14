/* ============================================================
   XI SAM 2026 — LIB: ícones (SVG inline, substitui lucide-react),
   QR real (qrcode-generator), hooks (useScale, useHashRoute).
   ============================================================ */
const { useState, useRef, useLayoutEffect, useEffect, useMemo } = React;

/* ---------- Ícones (stroke SVG, API: size, color) ---------- */
function Ico({ size = 20, color = "currentColor", sw = 2, children, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block" }}>{children}</svg>
  );
}
const Monitor   = (p) => <Ico {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></Ico>;
const Smartphone= (p) => <Ico {...p}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></Ico>;
const CalendarDays=(p)=> <Ico {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></Ico>;
const ChevronLeft=(p)=> <Ico {...p}><path d="M15 18l-6-6 6-6"/></Ico>;
const ChevronRight=(p)=><Ico {...p}><path d="M9 18l6-6-6-6"/></Ico>;
const MapPin    = (p) => <Ico {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></Ico>;
const Microscope= (p) => <Ico {...p}><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6h4v4a2 2 0 0 1-2 2ZM12 6V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3"/></Ico>;
const Stethoscope=(p)=> <Ico {...p}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></Ico>;
const ImageIcon = (p) => <Ico {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></Ico>;
const Coffee    = (p) => <Ico {...p}><path d="M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12ZM17 8h1a3 3 0 0 1 0 6h-1"/></Ico>;
const Mic       = (p) => <Ico {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/></Ico>;
const Users     = (p) => <Ico {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Ico>;
const UserRound = (p) => <Ico {...p}><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></Ico>;
const Award     = (p) => <Ico {...p}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></Ico>;
const ArrowLeft = (p) => <Ico {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></Ico>;
const Lock      = (p) => <Ico {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Ico>;
const Play      = (p) => <Ico {...p}><path d="M6 3l14 9-14 9V3Z"/></Ico>;
const Pause     = (p) => <Ico {...p}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></Ico>;
const SkipForward=(p)=> <Ico {...p}><path d="M5 4l10 8-10 8V4ZM19 5v14"/></Ico>;
const X         = (p) => <Ico {...p}><path d="M18 6 6 18M6 6l12 12"/></Ico>;
const Upload    = (p) => <Ico {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></Ico>;

/* ---------- QR real (aponta para a URL pública do trabalho) ---------- */
function qrUrlFor(id) {
  // Base = origin + pathname atual (sem o hash). Funciona em hospedagem estática.
  const base = window.location.origin + window.location.pathname;
  return `${base}#/trabalho/${id}`;
}
function QRCode({ id, size = 96, fg = "#0C1A2B", bg = "#fff", quiet = 2 }) {
  const url = qrUrlFor(id);
  const { path, n } = useMemo(() => {
    try {
      const qr = window.qrcode(0, "M");
      qr.addData(url);
      qr.make();
      const count = qr.getModuleCount();
      let d = "";
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
        }
      }
      return { path: d, n: count };
    } catch (e) {
      return { path: "", n: 21 };
    }
  }, [url]);
  const total = n + quiet * 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges" style={{ borderRadius: 6, background: bg, display: "block" }}>
      <rect x="0" y="0" width={total} height={total} fill={bg} />
      <g transform={`translate(${quiet} ${quiet})`}>
        <path d={path} fill={fg} />
      </g>
    </svg>
  );
}

/* ---------- Hooks ---------- */
function useHashRoute() {
  const [hash, setHash] = useState(typeof window !== "undefined" ? (window.location.hash || "#/") : "#/");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}
function useScale(BW) {
  const ref = useRef(null);
  const [w, setW] = useState(BW);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver((e) => setW(e[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w / BW];
}
/* true quando a viewport é larga o bastante para o layout de 2 colunas */
function useWide(bp = 1000) {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.innerWidth >= bp);
  useEffect(() => {
    const on = () => setWide(window.innerWidth >= bp);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [bp]);
  return wide;
}
/* Regra da rota #/trabalho/:id:
   MODO TV (flag explícito na URL: #/trabalho/:id/tv ou ?tv) → pôster
   horizontal INTEIRO na tela, sem rolagem, com piso de legibilidade elevado
   (TV 65" a ~1,5 m). Sem o flag (monitor, notebook, celular) → modo leitura
   1 coluna, rolável. (usePosterMode mantido para compatibilidade.) */
function usePosterMode(minW = 900) {
  const calc = () => typeof window !== "undefined"
    && window.matchMedia("(orientation: landscape)").matches
    && window.innerWidth >= minW;
  const [poster, setPoster] = useState(calc);
  useEffect(() => {
    const on = () => setPoster(calc());
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => { window.removeEventListener("resize", on); window.removeEventListener("orientationchange", on); };
  }, [minW]);
  return poster;
}
/* escala um canvas BW×BH para CABER (contain) na largura E altura do container — sem rolagem */
function useFit(BW, BH) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const medir = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w && h) setScale(Math.min(w / BW, h / BH));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    window.addEventListener("resize", medir);
    return () => { ro.disconnect(); window.removeEventListener("resize", medir); };
  }, [BW, BH]);
  return [ref, scale];
}

/* ============================================================
   PROVEDOR DE DADOS — trabalhos liberados pela curadoria.
   GET na API (sem parâmetros) → { ok:true, trabalhos:[...] }.
   Busca UMA vez por carregamento de página; cache compartilhado.
   TRABALHOS (data.js) é fallback APENAS em desenvolvimento local.
   ============================================================ */
const SAM_API_URL = "https://script.google.com/macros/s/AKfycbwDbJFn3dz7fH8fXIqLPsLiom43aMACkYz-ZPUie5W14c57elu4FRBqCvrPhzwcFSBX/exec";
const SAM_DEV = /^(localhost|127\.|0\.0\.0\.0)/.test(window.location.hostname) || window.location.protocol === "file:";

const _samStore = {
  status: "carregando",        // carregando | ok | erro
  trabalhos: [],
  promessa: null,
  ouvintes: new Set(),
};
function _samNotifica() { _samStore.ouvintes.forEach((fn) => fn()); }
function _samBuscar() {
  _samStore.status = "carregando"; _samNotifica();
  _samStore.promessa = fetch(SAM_API_URL)
    .then((r) => r.json())
    .then((res) => {
      if (!res || res.ok === false || !Array.isArray(res.trabalhos)) throw new Error("resposta inválida");
      _samStore.trabalhos = res.trabalhos;
      _samStore.status = "ok";
    })
    .catch(() => {
      if (SAM_DEV && Array.isArray(window.TRABALHOS)) {
        // fallback de desenvolvimento local — nunca em produção
        _samStore.trabalhos = window.TRABALHOS;
        _samStore.status = "ok";
      } else {
        _samStore.trabalhos = [];
        _samStore.status = "erro";
      }
    })
    .finally(_samNotifica);
  return _samStore.promessa;
}
/* Re-busca SILENCIOSA — telões ficam ligados horas exibindo programação e
   vitrine sem ninguém interagir. Atualiza em segundo plano SEM piscar
   "carregando"; em caso de falha, MANTÉM os dados atuais na tela (um telão
   público nunca troca conteúdo por mensagem de erro). */
function _samRefrescarSilencioso() {
  return fetch(SAM_API_URL)
    .then((r) => r.json())
    .then((res) => {
      if (!res || res.ok === false || !Array.isArray(res.trabalhos)) throw new Error("resposta inválida");
      _samStore.trabalhos = res.trabalhos;
      _samStore.status = "ok";
      _samNotifica();
    })
    .catch(() => { /* silencioso: preserva o que já está na tela */ });
}
const SAM_REFRESH_MS = 5 * 60 * 1000; // 5 minutos
if (typeof window !== "undefined" && !window.__samRefreshTimer) {
  window.__samRefreshTimer = setInterval(_samRefrescarSilencioso, SAM_REFRESH_MS);
}
/* Hook compartilhado: { trabalhos, status, recarregar } */
function useTrabalhos() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    _samStore.ouvintes.add(fn);
    if (!_samStore.promessa) _samBuscar();
    return () => _samStore.ouvintes.delete(fn);
  }, []);
  return {
    trabalhos: _samStore.trabalhos,
    status: _samStore.status,
    recarregar: () => _samBuscar(),
  };
}
const trabalhoNaLista = (lista, id) => (lista || []).find((t) => String(t.id) === String(id));

/* ============================================================
   CASAMENTO DE NOMES — programa × trabalhos liberados.
   Tolerante a acento, pontuação, nome do meio, ordem trocada e
   pequenos erros de digitação. Na dúvida (empate), NÃO casa.
   ============================================================ */
function normalizaNome(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // remove diacríticos
    .replace(/[^a-z0-9\s]/g, " ")                          // remove pontuação
    .replace(/\s+/g, " ").trim();                           // colapsa espaços
}
function _bigramas(s) {
  const t = s.replace(/\s+/g, " ");
  const out = [];
  for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
  return out;
}
/* coeficiente de Dice sobre bigramas */
function similaridadeNomes(a, b) {
  const A = _bigramas(normalizaNome(a)), B = _bigramas(normalizaNome(b));
  if (!A.length || !B.length) return 0;
  const mapa = new Map();
  A.forEach((g) => mapa.set(g, (mapa.get(g) || 0) + 1));
  let inter = 0;
  B.forEach((g) => { const n = mapa.get(g) || 0; if (n > 0) { inter++; mapa.set(g, n - 1); } });
  return (2 * inter) / (A.length + B.length);
}
const SAM_LIMIAR_NOME = 0.82; // ajustável
function _autoresTexto(t) {
  const a = Array.isArray(t.autores) ? t.autores.join(" ") : (t.autores || "");
  return normalizaNome(a);
}
/* Casa um item do PROGRAMA ({ap, id?}) com um trabalho liberado.
   Retorna o trabalho ou null. Ambiguidade não se chuta. */
function casarTrabalho(item, lista) {
  if (!item || !Array.isArray(lista) || !lista.length) return null;
  // 1) override manual por id
  if (item.id) return trabalhoNaLista(lista, item.id) || null;
  const nome = normalizaNome(item.ap);
  if (!nome) return null;
  const tokens = nome.split(" ").filter(Boolean);
  // 2) todos os tokens do apresentador contidos nos autores
  const porTokens = lista.filter((t) => {
    const aut = _autoresTexto(t);
    return tokens.every((tk) => aut.includes(tk));
  });
  if (porTokens.length === 1) return porTokens[0];
  if (porTokens.length > 1) return null; // empate → não casa
  // 3) similaridade (Dice de bigramas) contra cada autor individual;
  //    casa só se EXATAMENTE UM trabalho atingir o limiar (≥ 0.82)
  const pontuados = lista.map((t) => {
    const autores = Array.isArray(t.autores) ? t.autores : String(t.autores || "").split(",");
    const score = Math.max(0, ...autores.map((a) => similaridadeNomes(item.ap, a)));
    return { t, score };
  }).filter((x) => x.score >= SAM_LIMIAR_NOME);
  if (pontuados.length === 1) return pontuados[0].t;
  return null; // 4) nada atingiu o limiar, ou dois+ empatados acima dele
}

/* ============================================================
   ESTADOS COMPARTILHADOS — um único padrão de “carregando” e de
   “vazio” para Home, Galeria, Telão e Página do trabalho.
   ============================================================ */
function Carregando({ frase = "Carregando…", escuro = false, style }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:9, color:escuro?"#8A99AB":C.cinza, fontSize:13, ...style }}>
      <span className="sam-spin" style={{ width:15, height:15, borderRadius:"50%", border:`2px solid ${escuro?"#2A3340":"#D6DFE9"}`, borderTopColor:escuro?"#8A99AB":C.azul, flexShrink:0, display:"inline-block" }}></span>
      <span>{frase}</span>
    </div>
  );
}
const FRASE_SEM_TRABALHOS = "Os trabalhos liberados aparecerão aqui durante a Semana.";
function EstadoVazio({ escuro = false, style }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, textAlign:"center", color:escuro?"#5B6B7E":C.cinza, ...style }}>
      <Microscope size={36} color={escuro?"#2A3340":"#C5D2E0"} />
      <div style={{ fontSize:14.5, lineHeight:1.5, maxWidth:300 }}>{FRASE_SEM_TRABALHOS}</div>
    </div>
  );
}

Object.assign(window, {
  Ico, Monitor, Smartphone, CalendarDays, ChevronLeft, ChevronRight, MapPin,
  Microscope, Stethoscope, ImageIcon, Coffee, Mic, Users, UserRound, Award, ArrowLeft,
  Lock, Play, Pause, SkipForward, X, Upload, QRCode, qrUrlFor, useHashRoute, useScale, useWide, useFit, usePosterMode,
  SAM_API_URL, useTrabalhos, trabalhoNaLista, normalizaNome, similaridadeNomes, casarTrabalho,
  Carregando, EstadoVazio, FRASE_SEM_TRABALHOS,
});
