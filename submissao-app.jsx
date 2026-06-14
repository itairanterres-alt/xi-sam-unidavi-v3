/* ============================================================
   XI SAM 2026 — SUBMISSÃO (FUNCIONAL) · rodada 2
   O formulário se RAMIFICA por fase:
   · 7ª fase → pôster do projeto (prévia em 3 modos)
   · 8ª fase → resumo já submetido à revista (sem pôster)
   Edição do aluno: #/editar?id=...&token=... (doGet action=get)
   Rascunho com autosave em localStorage.
   Página autossuficiente (sem imports de módulo / lucide-react).
   ============================================================ */
const { useState, useRef, useLayoutEffect, useEffect, useMemo } = React;

// URL do "App da Web" do Apps Script (implantação ativa):
const API_URL = "https://script.google.com/macros/s/AKfycbwDbJFn3dz7fH8fXIqLPsLiom43aMACkYz-ZPUie5W14c57elu4FRBqCvrPhzwcFSBX/exec";

const C = {
  azul:"#023E88", azulEsc:"#01285A", ciano:"#00ADEF", cianoClaro:"#E5F6FE",
  tinta:"#0C1A2B", cinza:"#5B6B7E", cinzaClaro:"#EEF2F6", papel:"#F7F9FB", erro:"#C0392B",
};
const AREA_COR = {
  "Educação Médica":"#5B6B7E","Neurologia":"#6A4C93","Neurocirurgia":"#5B3A82",
  "Geriatria":"#B07A18","Psiquiatria":"#7A4D9C","Medicina de Família e Comunidade":"#D38F00",
  "Ginecologia e Obstetrícia":"#B23A82","Oncologia":"#2A8A5C","Otorrinolaringologia":"#0080B7",
  "Endocrinologia":"#C4622D","Infectologia":"#3D6E1B","Pediatria":"#00ADEF",
  "Cardiologia":"#A23A1F","Cirurgia Vascular":"#7A2616",
  "Anestesiologia":"#33658A","Cirurgia Geral":"#7A4419","Reumatologia":"#9C3D54",
  "Gastroenterologia":"#946B2D","Dermatologia":"#2F7E78","Ortopedia":"#46537A",
};
const AREAS = Object.keys(AREA_COR).sort((a,b)=>a.localeCompare(b,"pt-BR"));
const DESENHOS = ["Estudo transversal","Estudo de coorte","Caso-controle","Ensaio clínico","Estudo ecológico","Revisão sistemática","Revisão Sistemática e Metanálise","Revisão narrativa","Relato de caso"];
const GUIDANCE = {
  "Estudo transversal":{guia:"STROBE",txt:"Relato recomendado: checklist STROBE (EQUATOR Network)."},
  "Estudo de coorte":{guia:"STROBE",txt:"Relato recomendado: checklist STROBE (EQUATOR Network)."},
  "Caso-controle":{guia:"STROBE",txt:"Relato recomendado: checklist STROBE (EQUATOR Network)."},
  "Ensaio clínico":{guia:"CONSORT",txt:"Relato recomendado: checklist CONSORT (EQUATOR Network)."},
  "Estudo ecológico":{guia:"STROBE",txt:"Relato recomendado: checklist STROBE (EQUATOR Network)."},
  "Revisão sistemática":{guia:"PRISMA",txt:"Relato recomendado: checklist PRISMA (EQUATOR Network)."},
  "Revisão Sistemática e Metanálise":{guia:"PRISMA",txt:"Relato recomendado: checklist PRISMA (EQUATOR Network)."},
  "Revisão narrativa":{guia:"—",txt:"Sem checklist específico na EQUATOR Network para este desenho."},
  "Relato de caso":{guia:"CARE",txt:"Relato recomendado: checklist CARE (EQUATOR Network)."},
};
/* valor de dados (v) preservado; rótulo visível (l) renomeado */
const SECOES_FIG = [
  { v:"Introdução", l:"Introdução" },
  { v:"Métodos", l:"Metodologia" },
  { v:"Resultados", l:"Resultados" },
  { v:"Discussão", l:"Discussão" },
  { v:"Outra", l:"Outra" },
];
const MAX_FIGS = 4;
const RASCUNHO_KEY = "sam2026_rascunho_v2";

/* ---------- Ícones (stroke SVG inline; API: size, color, fill) ---------- */
function SIco({ size = 20, color = "currentColor", sw = 2, children, fill = "none", className, style }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink:0, display:"block", ...style }}>{children}</svg>
  );
}
const Upload      = (p) => <SIco {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></SIco>;
const CheckCircle2= (p) => <SIco {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></SIco>;
const Presentation= (p) => <SIco {...p}><path d="M2 3h20"/><path d="M21 3v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3"/><path d="m7 21 5-5 5 5"/></SIco>;
const Monitor     = (p) => <SIco {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></SIco>;
const CalendarDays= (p) => <SIco {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></SIco>;
const Smartphone  = (p) => <SIco {...p}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></SIco>;
const ImageIcon   = (p) => <SIco {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></SIco>;
const X           = (p) => <SIco {...p}><path d="M18 6 6 18M6 6l12 12"/></SIco>;
const Star        = (p) => <SIco {...p}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></SIco>;
const ArrowUp     = (p) => <SIco {...p}><path d="M12 19V5M5 12l7-7 7 7"/></SIco>;
const ArrowDown   = (p) => <SIco {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></SIco>;
const Trash2      = (p) => <SIco {...p}><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></SIco>;
const Plus        = (p) => <SIco {...p}><path d="M12 5v14M5 12h14"/></SIco>;
const Loader2     = (p) => <SIco {...p}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></SIco>;
const Users       = (p) => <SIco {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></SIco>;
const UserRound   = (p) => <SIco {...p}><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></SIco>;
const FileText    = (p) => <SIco {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></SIco>;
const ListChecks  = (p) => <SIco {...p}><path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/></SIco>;
const ClipboardList=(p) => <SIco {...p}><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/></SIco>;
const PenLine     = (p) => <SIco {...p}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></SIco>;
const ChevronDown = (p) => <SIco {...p}><path d="m6 9 6 6 6-6"/></SIco>;
const ChevronUp   = (p) => <SIco {...p}><path d="m18 15-6-6-6 6"/></SIco>;
const BookOpen    = (p) => <SIco {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></SIco>;
const AlertCircle = (p) => <SIco {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></SIco>;

const miniBtn = (disabled) => ({ width:28, height:26, borderRadius:6, border:"1px solid #E3EAF2", background:"#fff", color:disabled?"#C5D2E0":C.cinza, cursor:disabled?"default":"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center" });

/* ---------- helpers ---------- */
function fileToDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});}
function QRMock({ size=96 }) {
  const n=21;
  const cells=useMemo(()=>{const g=Array.from({length:n},()=>Array(n).fill(false));let s=7;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};
    for(let r=0;r<n;r++)for(let c=0;c<n;c++)g[r][c]=rnd()>0.52;
    const fd=(or,oc)=>{for(let r=0;r<7;r++)for(let c=0;c<7;c++){const e=r===0||r===6||c===0||c===6,co=r>=2&&r<=4&&c>=2&&c<=4;g[or+r][oc+c]=e||co;}};
    fd(0,0);fd(0,n-7);fd(n-7,0);return g;},[]);
  const cell=size/n;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{borderRadius:6,background:"#fff"}}>{cells.map((row,r)=>row.map((on,c)=>on?<rect key={`${r}-${c}`} x={c*cell} y={r*cell} width={cell} height={cell} fill={C.tinta}/>:null))}</svg>;
}
function useScale(BW){const ref=useRef(null);const[w,setW]=useState(BW);
  useLayoutEffect(()=>{const el=ref.current;if(!el)return;setW(el.clientWidth);const ro=new ResizeObserver(e=>setW(e[0].contentRect.width));ro.observe(el);return()=>ro.disconnect();},[]);
  return[ref,w/BW];}
/* rota de edição: #/editar?id=...&token=... */
function parseEditRoute(){
  const h = window.location.hash || "";
  if (!/^#\/?editar/.test(h)) return null;
  const i = h.indexOf("?");
  const q = new URLSearchParams(i >= 0 ? h.slice(i+1) : "");
  const id = q.get("id"), token = q.get("token");
  return (id && token) ? { id, token } : null;
}
const splitRefs = (s) => (s||"").split("\n").map(x=>x.trim()).filter(Boolean);
/* seções do corpo individualizadas por DESENHO (Relato de caso vs demais).
   Usa SAM_ESQUEMA (esquema.js) — chaves de dado e valores de `secao` intactos. */
function secoesPreview(t, tag){
  const esq = window.SAM_ESQUEMA;
  const secoes = esq ? esq.secoesDe(t) : [
    {rotulo:"Introdu\u00e7\u00e3o",chave:"intro",sec:"Introdu\u00e7\u00e3o"},
    {rotulo:"Objetivo",chave:"objetivos",sec:null},
    {rotulo:"Metodologia",chave:"metodos",sec:"M\u00e9todos"},
    {rotulo:"Resultados esperados",chave:"resultados",sec:"Resultados"},
  ];
  const usadas = new Set(secoes.map(s=>s.sec).filter(Boolean));
  const out = secoes.map(sx=>({ rotulo:sx.rotulo, texto: t[sx.chave]||(sx.chave==="intro"?(t.introducao||""):""), figs: sx.sec ? (tag||[]).filter(x=>x.secao===sx.sec) : [] }));
  const complementares = (tag||[]).filter(x=>!usadas.has(x.secao));
  return { secoes: out, complementares };
}

/* ====== PRÉVIA 1: PÔSTER DE APRESENTAÇÃO (telão vertical, a defesa) ======
   O pôster CABE no conteúdo: altura mínima 1080×1920, mas cresce
   junto com o texto/figuras em vez de clipar.                      */
const apBadge={fontSize:20,fontWeight:700,padding:"6px 16px",borderRadius:999,background:"rgba(255,255,255,0.16)",border:"1px solid rgba(255,255,255,0.32)",whiteSpace:"nowrap"};
function RefsPoster({ referencias }) {
  const [aberto, setAberto] = useState(false);
  const linhas = splitRefs(referencias);
  if (!linhas.length) return null;
  return (
    <div style={{ borderTop:"1px solid #E3EAF2", background:C.papel }}>
      <button onClick={()=>setAberto(a=>!a)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, border:"none", background:"transparent", cursor:"pointer", padding:"16px 56px", fontFamily:"inherit", textAlign:"left" }}>
        <BookOpen size={22} color={C.azul}/>
        <span style={{ fontSize:23, fontWeight:800, color:C.azul, letterSpacing:0.5 }}>REFERÊNCIAS</span>
        <span style={{ fontSize:19, color:C.cinza }}>({linhas.length})</span>
        <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:6, fontSize:18, color:C.cinza }}>{aberto?"recolher":"abrir"}{aberto?<ChevronUp size={20}/>:<ChevronDown size={20}/>}</span>
      </button>
      {aberto && (
        <ol style={{ margin:0, padding:"0 56px 22px 86px" }}>
          {linhas.map((l,i)=><li key={i} style={{ fontSize:18, lineHeight:1.4, color:C.cinza, marginBottom:7, textAlign:"justify" }}>{l}</li>)}
        </ol>
      )}
    </div>
  );
}
function PosterApresentacao({ t, figuras, principal }) {
  const BW=1080, BHmin=1920;
  const [ref, scale] = useScale(BW);
  const innerRef = useRef(null);
  const [alt, setAlt] = useState(BHmin);
  useLayoutEffect(()=>{
    const el = innerRef.current; if (!el) return;
    const medir = () => setAlt(Math.max(BHmin, el.offsetHeight));
    medir();
    const ro = new ResizeObserver(medir); ro.observe(el);
    return () => ro.disconnect();
  },[]);
  /* reforço: re-mede a cada render (digitação re-renderiza), caso o
     ResizeObserver demore a entregar — garante pôster sem clipe. */
  useLayoutEffect(()=>{
    const el = innerRef.current; if (!el) return;
    const h = Math.max(BHmin, el.offsetHeight);
    if (Math.abs(h - alt) > 1) setAlt(h);
  });
  const cor = AREA_COR[t.area] || C.azul;
  const fotoUrl = t.foto_autores_dataUrl || t.foto_autores_url;
  const tag = figuras.map((fg,idx)=>({ ...fg, _i:idx }));
  const { secoes:_secs, complementares:_comp } = secoesPreview(t, tag);
  const FigAp = ({ fg }) => (
    <div style={{ marginTop:18, border:`3px ${fg._i===principal?"solid":"dashed"} ${fg._i===principal?C.ciano:"#C9D6E4"}`, borderRadius:16, overflow:"hidden", background:fg._i===principal?C.cianoClaro:C.papel }}>
      <div style={{ height:240, display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", overflow:"hidden" }}>
        {fg.dataUrl ? <img src={fg.dataUrl} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}/> : <ImageIcon size={56} color={C.cinza}/>}
      </div>
      <div style={{ padding:"13px 20px", lineHeight:1.3 }}>
        <div style={{ fontSize:21, color:C.tinta, display:"flex", gap:8, alignItems:"baseline" }}>
          <strong style={{ color:C.azul, whiteSpace:"nowrap" }}>Fig {fg._i+1}.</strong>
          <span style={{ flex:1, fontWeight:fg.titulo?700:400 }}>{fg.titulo || fg.legenda || "título da figura"}</span>
          {fg._i===principal && <span style={{ fontSize:17, fontWeight:800, color:C.ciano, whiteSpace:"nowrap" }}>★ PRINCIPAL</span>}
        </div>
        {fg.titulo && fg.legenda ? <div style={{ fontSize:18, color:C.cinza, marginTop:4 }}>{fg.legenda}</div> : null}
      </div>
    </div>
  );
  const Sec = ({ titulo, texto, figs }) => (texto || (figs && figs.length)) ? (
    <div style={{ marginBottom:26 }}>
      <div style={{ fontSize:26, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, marginBottom:9 }}>{titulo}</div>
      {texto && <div style={{ fontSize:24, lineHeight:1.42, color:C.tinta, textAlign:"justify", hyphens:"auto", WebkitHyphens:"auto" }}>{texto}</div>}
      {figs && figs.map((fg)=><FigAp key={fg._i} fg={fg}/>)}
    </div>
  ) : null;
  return (
    <div ref={ref} style={{ width:"100%", height:alt*scale, position:"relative", overflow:"hidden", borderRadius:14, background:"#fff", boxShadow:"0 18px 50px rgba(2,40,90,0.20)" }}>
      <div ref={innerRef} style={{ position:"absolute", top:0, left:0, width:BW, minHeight:BHmin, transform:`scale(${scale})`, transformOrigin:"top left", display:"flex", flexDirection:"column" }}>
        {/* header (reduzido) */}
        <div style={{ background:`linear-gradient(160deg, ${C.azul}, ${C.azulEsc})`, color:"#fff", padding:"38px 56px 30px" }}>
          <div style={{ display:"flex", gap:12, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
            <span style={apBadge}>{t.fase}ª FASE</span><span style={apBadge}>{t.desenho}</span>
            <span style={{ ...apBadge, background:cor, borderColor:cor }}>{t.area}</span>
          </div>
          <div style={{ fontSize:48, fontWeight:800, lineHeight:1.1, letterSpacing:-0.8, marginBottom:18 }}>{t.titulo || "Título do seu trabalho"}</div>
          <div style={{ display:"flex", gap:28, alignItems:"flex-end", justifyContent:"space-between" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:26, fontWeight:600 }}>{t.autores || "Autores"}</div>
              {t.afiliacao ? <div style={{ fontSize:21, opacity:0.82, marginTop:4, fontStyle:"italic" }}>{t.afiliacao}</div> : null}
            </div>
            {fotoUrl && <div style={{ width:190, height:190, borderRadius:16, overflow:"hidden", flexShrink:0, border:"4px solid rgba(255,255,255,0.45)", background:"#fff" }}><img src={fotoUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/></div>}
          </div>
        </div>
        {/* corpo: 2 colunas; cresce com o conteúdo (sem clipar) */}
        <div style={{ flex:1, padding:"40px 56px 28px", display:"flex", gap:52 }}>
          <div style={{ flex:1, minWidth:0 }}>{_secs.slice(0, Math.ceil(_secs.length/2)).map((s,i)=><Sec key={i} titulo={s.rotulo} texto={s.texto} figs={s.figs}/>)}</div>
          <div style={{ flex:1, minWidth:0 }}>{_secs.slice(Math.ceil(_secs.length/2)).map((s,i)=><Sec key={i} titulo={s.rotulo} texto={s.texto} figs={s.figs}/>)}{_comp.length>0 && <Sec titulo="Figuras complementares" figs={_comp}/>}</div>
        </div>
        {/* referências (seção curta recolhível no pé) */}
        <RefsPoster referencias={t.referencias}/>
        {/* rodapé */}
        <div style={{ background:C.azulEsc, color:"#fff", padding:"26px 56px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:22 }}>
            <div style={{ background:"#fff", padding:12, borderRadius:14 }}><QRMock size={110}/></div>
            <div><div style={{ fontSize:25, fontWeight:700 }}>Leia e aprecie</div><div style={{ fontSize:20, opacity:0.8 }}>no celular</div></div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"flex-end", marginBottom:10 }}>
              {(t.palavras?t.palavras.split(",").map(s=>s.trim()).filter(Boolean):[]).slice(0,4).map(p=><span key={p} style={{ fontSize:18, background:"rgba(255,255,255,0.14)", borderRadius:999, padding:"6px 16px" }}>{p}</span>)}
            </div>
            <div style={{ fontSize:23, fontWeight:800, letterSpacing:1, color:C.ciano }}>SAM · MEDICINA UNIDAVI</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== PRÉVIA 2: VITRINE (chamariz da galeria) ====== */
const vbadge={fontSize:18,fontWeight:700,padding:"6px 16px",borderRadius:999,background:"rgba(255,255,255,0.16)",border:"1px solid rgba(255,255,255,0.32)",whiteSpace:"nowrap"};
function PosterVitrine({ t }) {
  const BW=720, BH=1280;
  const [ref, scale] = useScale(BW);
  const cor = AREA_COR[t.area] || C.azul;
  return (
    <div ref={ref} style={{ width:"100%", aspectRatio:`${BW} / ${BH}`, position:"relative", overflow:"hidden", borderRadius:14, background:`linear-gradient(160deg, ${C.azul}, ${C.azulEsc})`, boxShadow:"0 18px 50px rgba(2,40,90,0.20)" }}>
      <div style={{ position:"absolute", top:0, left:0, width:BW, height:BH, transform:`scale(${scale})`, transformOrigin:"top left", color:"#fff", padding:48, display:"flex", flexDirection:"column", boxSizing:"border-box" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}><span style={vbadge}>{t.fase}ª FASE</span><span style={vbadge}>{t.desenho}</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:22, fontWeight:600 }}><span style={{ width:18, height:18, borderRadius:5, background:cor, border:"2px solid rgba(255,255,255,0.5)" }}/>{t.area}</div>
        </div>
        <div style={{ fontSize:52, fontWeight:800, lineHeight:1.06, letterSpacing:-0.7, marginBottom:22 }}>{t.titulo || "Título do seu trabalho"}</div>
        <div style={{ fontSize:22, opacity:0.92, marginBottom:30, lineHeight:1.35 }}>{t.autores || "Autores"}{t.afiliacao ? <><br/><span style={{ opacity:0.75, fontStyle:"italic" }}>{t.afiliacao}</span></> : null}</div>
        <div style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"2px dashed rgba(255,255,255,0.32)", borderRadius:16, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:24, marginBottom:30, minHeight:180, overflow:"hidden" }}>
          {t.figPrincipalUrl ? <img src={t.figPrincipalUrl} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", borderRadius:8 }}/> : <><ImageIcon size={64} color={C.ciano}/><div style={{ fontSize:19, marginTop:14, opacity:0.92 }}>{t.figTitulo || t.figLegenda || "Figura principal"}</div></>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:22, marginBottom:24 }}>
          <div style={{ background:"#fff", padding:14, borderRadius:14 }}><QRMock size={150}/></div>
          <div><div style={{ fontSize:26, fontWeight:700, display:"flex", alignItems:"center", gap:10 }}><Smartphone size={26}/> Leia e aprecie</div><div style={{ fontSize:20, opacity:0.9, marginTop:4 }}>no celular</div></div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.22)", paddingTop:18, display:"flex", justifyContent:"flex-end" }}>
          <div style={{ fontSize:21, fontWeight:800, letterSpacing:1, color:C.ciano }}>SAM · MEDICINA UNIDAVI</div>
        </div>
      </div>
    </div>
  );
}

/* ====== PRÉVIA 3: CELULAR (leitura rolável) ====== */
function PosterLeitura({ t, figuras, principal }) {
  const cor = AREA_COR[t.area] || C.azul;
  const fotoUrl = t.foto_autores_dataUrl || t.foto_autores_url;
  const [refsAbertas, setRefsAbertas] = useState(false);
  const refs = splitRefs(t.referencias);
  const tag = figuras.map((fg,idx)=>({ ...fg, _i:idx }));
  const { secoes:_secs, complementares:_comp } = secoesPreview(t, tag);
  const FigLe = ({ fg }) => fg.dataUrl ? (
    <div style={{ margin:"10px 0", border:`2px ${fg._i===principal?"solid":"dashed"} ${fg._i===principal?C.ciano:"#C9D6E4"}`, borderRadius:10, overflow:"hidden" }}>
      <img src={fg.dataUrl} alt="" style={{ width:"100%", display:"block" }}/>
      <div style={{ fontSize:11, color:C.cinza, padding:"7px 9px", display:"flex", gap:5 }}><strong style={{ color:C.azul }}>Fig {fg._i+1}.</strong><span style={{ flex:1 }}>{fg.titulo ? <strong style={{ color:C.tinta }}>{fg.titulo}{fg.legenda?" — ":""}</strong> : null}{fg.legenda}</span>{fg._i===principal && <span style={{ fontWeight:800, color:C.ciano }}>★</span>}</div>
    </div>
  ) : (
    <div style={{ margin:"10px 0", border:"2px dashed #C9D6E4", borderRadius:10, padding:14, textAlign:"center", color:C.cinza, fontSize:11 }}><ImageIcon size={24} color={cor}/><div style={{ marginTop:4 }}>Fig {fg._i+1}. {fg.titulo || fg.legenda || "figura"}</div></div>
  );
  const Sec = ({titulo, texto, figs}) => (texto || (figs && figs.length)) ? (<div style={{ marginBottom:16 }}><div style={{ fontSize:11.5, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, marginBottom:5 }}>{titulo}</div>{texto && <div style={{ fontSize:13.5, lineHeight:1.5, color:C.tinta, textAlign:"justify" }}>{texto}</div>}{figs && figs.map((fg)=><FigLe key={fg._i} fg={fg}/>)}</div>) : null;
  return (
    <div style={{ width:"100%", maxWidth:300, margin:"0 auto", border:"9px solid #15171c", borderRadius:32, overflow:"hidden", background:"#fff", height:560, display:"flex", flexDirection:"column" }}>
      <div style={{ background:C.azul, color:"#fff", padding:"14px 16px" }}>
        <div style={{ fontSize:9, opacity:0.85, marginBottom:5, letterSpacing:0.3 }}>{t.fase}ª FASE · {t.desenho} · {t.area}</div>
        <div style={{ fontSize:15.5, fontWeight:800, lineHeight:1.22 }}>{t.titulo || "Título do seu trabalho"}</div>
        <div style={{ display:"flex", gap:10, alignItems:"center", marginTop:8 }}>
          {fotoUrl && <div style={{ width:42, height:42, borderRadius:9, overflow:"hidden", flexShrink:0, border:"2px solid rgba(255,255,255,0.4)" }}><img src={fotoUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/></div>}
          <div style={{ fontSize:11, opacity:0.85, lineHeight:1.35 }}>{t.autores || "Autores"}{t.afiliacao ? <> · <em>{t.afiliacao}</em></> : null}</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {_secs.map((s,i)=><Sec key={i} titulo={s.rotulo} texto={s.texto} figs={s.figs}/>)}
        {_comp.length>0 && <Sec titulo="Figuras complementares" figs={_comp}/>}
        {refs.length>0 && (
          <div style={{ marginBottom:14, border:"1px solid #E3EAF2", borderRadius:9 }}>
            <button onClick={()=>setRefsAbertas(a=>!a)} style={{ width:"100%", display:"flex", alignItems:"center", gap:6, border:"none", background:"transparent", cursor:"pointer", padding:"9px 11px", fontFamily:"inherit", textAlign:"left" }}>
              <span style={{ fontSize:11.5, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5 }}>Referências</span>
              <span style={{ fontSize:10.5, color:C.cinza }}>({refs.length})</span>
              <span style={{ marginLeft:"auto", color:C.cinza }}>{refsAbertas?<ChevronUp size={13}/>:<ChevronDown size={13}/>}</span>
            </button>
            {refsAbertas && <ol style={{ margin:0, padding:"0 11px 10px 26px" }}>{refs.map((l,i)=><li key={i} style={{ fontSize:10.5, lineHeight:1.4, color:C.cinza, marginBottom:4 }}>{l}</li>)}</ol>}
          </div>
        )}
        <button style={{ width:"100%", background:C.ciano, color:"#fff", border:"none", borderRadius:9, padding:"11px", fontSize:13.5, fontWeight:700, marginTop:6 }}>Apreciar este trabalho</button>
      </div>
    </div>
  );
}

/* ====== PRÉVIA 8ª FASE: RESUMO NOS ANAIS (não há pôster) ====== */
function PreviaResumo({ t }) {
  const cor = AREA_COR[t.area] || C.azul;
  const pill = { fontSize:11, fontWeight:700, padding:"4px 11px", borderRadius:999, background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.34)", whiteSpace:"nowrap" };
  return (
    <div style={{ background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 18px 50px rgba(2,40,90,0.20)" }}>
      <div style={{ background:`linear-gradient(135deg, ${C.azul}, ${C.azulEsc})`, color:"#fff", padding:"18px 20px" }}>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:10 }}>
          <span style={pill}>8ª FASE · RESUMO</span>
          <span style={{ ...pill, background:cor, borderColor:cor }}>{t.area}</span>
        </div>
        <div style={{ fontSize:18, fontWeight:800, lineHeight:1.25 }}>{t.titulo || "Título do seu trabalho"}</div>
        <div style={{ fontSize:13, opacity:0.9, marginTop:8, lineHeight:1.4 }}>
          {t.autores || "Autores"}
          {t.afiliacao ? <><br/><span style={{ opacity:0.78, fontStyle:"italic" }}>{t.afiliacao}</span></> : null}
        </div>
      </div>
      <div style={{ padding:"18px 20px 22px" }}>
        <div style={{ fontSize:11.5, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.6, marginBottom:8 }}>Resumo</div>
        <div style={{ fontSize:13.5, lineHeight:1.65, color:t.resumo?C.tinta:C.cinza, textAlign:"justify", whiteSpace:"pre-wrap" }}>
          {t.resumo || "Cole no formulário o resumo exatamente como foi submetido à revista. Ele aparecerá assim nos anais e no programa do evento."}
        </div>
      </div>
    </div>
  );
}

/* ====== ABA: COMO SUBMETER (leitura, mesmo vocabulário visual) ====== */
function ComoSubmeter({ onIr }) {
  const card = { background:"#fff", border:"1px solid #E3EAF2", borderRadius:14, padding:"22px 24px", marginBottom:18 };
  const head = { display:"flex", alignItems:"center", gap:10, marginBottom:14 };
  const ico  = { width:34, height:34, borderRadius:9, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:C.cianoClaro };
  const h    = { fontSize:16.5, fontWeight:800, color:C.azul, letterSpacing:-0.2 };
  const p    = { fontSize:14, lineHeight:1.6, color:C.tinta, margin:0 };
  const muted= { fontSize:13.5, lineHeight:1.6, color:C.cinza };
  const Bullet = ({ children }) => (
    <li style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:14, lineHeight:1.55, color:C.tinta, marginBottom:9 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:C.ciano, flexShrink:0, marginTop:8 }}/>
      <span style={{ flex:1 }}>{children}</span>
    </li>
  );
  const ul = { listStyle:"none", margin:0, padding:0 };
  const checklists = [
    { g:"STROBE",  d:"observacionais" },
    { g:"CONSORT", d:"ensaio clínico" },
    { g:"PRISMA",  d:"revisão sistemática e metanálise" },
    { g:"CARE",    d:"relato de caso" },
  ];
  const passos = [
    <>Escolha a sua <strong>fase</strong> — o formulário se ajusta a ela.</>,
    <>Preencha os campos; na 7ª fase a <strong>prévia</strong> mostra como o pôster ficará.</>,
    <>Envie. Você recebe um e-mail com um <strong>link pessoal</strong> para revisar ou ajustar.</>,
    <>A <strong>curadoria do NPCMed</strong> confere a completude e libera o trabalho, ou o devolve com um comentário para ajuste.</>,
  ];

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"24px 20px 56px" }}>
      {/* Lead */}
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:27, fontWeight:800, color:C.azul, letterSpacing:-0.6, margin:"0 0 12px" }}>Como submeter</h1>
        <p style={{ ...p, fontSize:15.5, color:C.cinza }}>
          A submissão organiza o seu trabalho para o programa, os pôsteres eletrônicos e os anais do evento. O formulário se ajusta à sua fase: na 7ª, <strong style={{ color:C.tinta }}>o sistema gera o pôster do projeto</strong> — você não diagrama nada; na 8ª, você cola o <strong style={{ color:C.tinta }}>resumo já submetido à revista</strong>.
        </p>
      </div>

      {/* Para quem é */}
      <div style={card}>
        <div style={head}><span style={ico}><Users size={18} color={C.ciano}/></span><span style={h}>Para quem é</span></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="cs-2col">
          <div style={{ border:"1px solid #E3EAF2", borderRadius:11, padding:"14px 16px" }}>
            <div style={{ fontSize:12, fontWeight:800, color:C.ciano, textTransform:"uppercase", letterSpacing:0.5, marginBottom:5 }}>7ª fase</div>
            <div style={muted}>Projetos de pesquisa, apresentados como <strong style={{color:C.tinta}}>pôster eletrônico</strong> gerado pelo sistema.</div>
          </div>
          <div style={{ border:"1px solid #E3EAF2", borderRadius:11, padding:"14px 16px" }}>
            <div style={{ fontSize:12, fontWeight:800, color:C.ciano, textTransform:"uppercase", letterSpacing:0.5, marginBottom:5 }}>8ª fase</div>
            <div style={muted}>Trabalhos concluídos, apresentados <strong style={{color:C.tinta}}>oralmente</strong>; nos anais entra o <strong style={{color:C.tinta}}>resumo submetido à revista</strong>.</div>
          </div>
        </div>
      </div>

      {/* Antes de começar */}
      <div style={card}>
        <div style={head}><span style={ico}><ClipboardList size={18} color={C.ciano}/></span><span style={h}>Antes de começar, tenha em mãos</span></div>
        <ul style={ul}>
          <Bullet>Um e-mail válido — usado para a confirmação e o link de edição.</Bullet>
          <Bullet><strong>7ª fase:</strong> as figuras que deseja incluir (PNG ou JPG, até ~2,5 MB cada) e as referências do projeto.</Bullet>
          <Bullet><strong>8ª fase:</strong> o texto do resumo exatamente como foi submetido à revista.</Bullet>
        </ul>
      </div>

      {/* O que você preenche */}
      <div style={card}>
        <div style={head}><span style={ico}><PenLine size={18} color={C.ciano}/></span>
          <span><span style={h}>O que você preenche</span><div style={{ fontSize:12.5, color:C.cinza, marginTop:2 }}>na 7ª fase o sistema gera o pôster; você não diagrama</div></span>
        </div>
        <ul style={ul}>
          <Bullet><strong>Identificação (todos):</strong> título, autores, afiliação, área médica e e-mail.</Bullet>
          <Bullet><strong>7ª fase:</strong> desenho do estudo + resumo estruturado — Introdução, Objetivo, Metodologia e Resultados esperados — além de figuras, palavras-chave e referências.</Bullet>
          <Bullet><strong>8ª fase:</strong> um único campo de resumo, onde você cola o texto submetido à revista, inteiro.</Bullet>
          <Bullet><strong>Extensão sugerida (7ª): 250 a 400 palavras</strong> — um resumo enxuto preserva o ineditismo para a publicação futura do trabalho completo.</Bullet>
        </ul>
      </div>

      {/* Desenho -> checklist */}
      <div style={card}>
        <div style={head}><span style={ico}><ListChecks size={18} color={C.ciano}/></span><span style={h}>Desenho do estudo → checklist <span style={{ fontWeight:600, color:C.cinza }}>(7ª fase)</span></span></div>
        <p style={{ ...muted, marginBottom:14 }}>Ao escolher o desenho, o sistema mostra o checklist internacional correspondente, seguindo a <strong style={{color:C.tinta}}>EQUATOR Network</strong>.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {checklists.map(c=>(
            <div key={c.g} style={{ display:"flex", alignItems:"baseline", gap:8, border:"1px solid #E3EAF2", borderRadius:999, padding:"7px 14px" }}>
              <span style={{ fontSize:13, fontWeight:800, color:C.azul }}>{c.g}</span>
              <span style={{ fontSize:12.5, color:C.cinza }}>{c.d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Figuras */}
      <div style={card}>
        <div style={head}><span style={ico}><ImageIcon size={18} color={C.ciano}/></span><span style={h}>Figuras <span style={{ fontWeight:600, color:C.cinza }}>(7ª fase · até 4)</span></span></div>
        <ul style={ul}>
          <Bullet>Cada figura recebe um <strong>título</strong>, uma <strong>seção</strong> (Introdução, Metodologia, Resultados, Discussão) e uma <strong>legenda</strong>, e aparece nessa seção do pôster.</Bullet>
          <Bullet>Você define a <strong>ordem</strong> e marca uma como <strong>principal</strong> (a de destaque). A sequência é respeitada — nada é embaralhado.</Bullet>
          <Bullet><strong>Tabelas e quadros</strong> entram como figuras (imagem).</Bullet>
        </ul>
      </div>

      {/* Passo a passo */}
      <div style={card}>
        <div style={head}><span style={ico}><ListChecks size={18} color={C.ciano}/></span><span style={h}>Passo a passo</span></div>
        <div>
          {passos.map((node,i)=>(
            <div key={i} style={{ display:"flex", gap:13, alignItems:"flex-start", marginBottom:i===passos.length-1?0:14 }}>
              <span style={{ width:26, height:26, borderRadius:"50%", background:C.azul, color:"#fff", fontSize:13, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
              <span style={{ flex:1, fontSize:14, lineHeight:1.55, color:C.tinta, paddingTop:3 }}>{node}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prazos */}
      <div style={{ background:"#fff", border:"1px solid #E3EAF2", borderRadius:14, padding:"18px 22px", marginBottom:22, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <span style={{ ...ico, background:C.azul }}><CalendarDays size={18} color="#fff"/></span>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ fontSize:12, fontWeight:800, color:C.azul, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>Prazos</div>
          <div style={{ display:"flex", gap:22, flexWrap:"wrap", fontSize:13.5, color:C.tinta }}>
            <span><strong>Abertura</strong> <span style={{ color:C.cinza }}>08/06/2026</span></span>
            <span><strong>Ajustes</strong> <span style={{ color:C.cinza }}>15/06/2026</span></span>
            <span><strong>Encerramento</strong> <span style={{ color:C.cinza }}>20/06/2026</span></span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button onClick={onIr} style={{ width:"100%", background:C.azul, color:"#fff", border:"none", borderRadius:11, padding:"14px", fontSize:14.5, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        <PenLine size={17} color="#fff"/> Começar minha submissão
      </button>
    </div>
  );
}

/* ============================ APP ============================ */
/* Afiliação oficial NPCMed — pré-preenchida (editável) no formulário.
   NÃO mudar a chave de dado `afiliacao`. */
const AFILIACAO_PADRAO = "Núcleo de Pesquisa em Ciências Médicas: investigações em saúde — NPCMed, Faculdade de Medicina, Centro Universitário para o Desenvolvimento do Alto Vale do Itajaí — UNIDAVI.";
/* ===== PONTE PARA O MOTOR V3 (pôster landscape) + JUIZ (Gemini via backend) =====
   Expõe C/AREA_COR globais e os ícones/QR que o motor-view espera, configura o
   juiz para o /exec e monta o objeto `t` do motor a partir do formulário. */
window.C = C; window.AREA_COR = AREA_COR;
const ArrowLeft = (p) => <SIco {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></SIco>;
const QRCode = ({ id, size = 96 }) => <QRMock size={size} />;
if (window.SAM_JUIZ && window.SAM_JUIZ.config) window.SAM_JUIZ.config({ backendUrl: API_URL });
function motorTDe(f, figuras, principal, fotoAutores) {
  return {
    id: "previa", fase: Number(f.fase), desenho: f.desenho, area: f.area,
    titulo: f.titulo || "Título do trabalho",
    autores: (f.autores || "").split(",").map((s) => s.trim()).filter(Boolean),
    orientador: f.orientador, afiliacao: f.afiliacao, palavras: f.palavras,
    intro: f.intro, objetivos: f.objetivos, metodos: f.metodos, resultados: f.resultados, conclusao: f.conclusao,
    referencias: f.referencias, foto_autores_dataUrl: fotoAutores,
    figuras: (figuras || []).map((fg, i) => ({ ordem: i + 1, secao: fg.secao, titulo: fg.titulo, legenda: fg.legenda, principal: i === principal, dataUrl: fg.dataUrl })),
  };
}

/* MODAL: pôster proposto pelo scorer → IA confere (loop ≤3) → confirma e envia.
   O descritor do layout escolhido vira o `ajuste_layout` que segue ao trabalho. */
function ModalPosterFinal({ t, onConfirmar, onCancelar }) {
  const [ajuste, setAjuste] = useState(null);
  const [res, setRes] = useState(null);
  const [log, setLog] = useState([]);
  const [etapa, setEtapa] = useState("propondo"); // propondo | julgando | pronto
  const resRef = useRef(null); resRef.current = res;
  const rodou = useRef(false);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  useEffect(() => {
    if (rodou.current) return; rodou.current = true;
    (async () => {
      await sleep(800);
      if (!window.SAM_JUIZ || !window.SAM_JUIZ.disponivel()) { setEtapa("pronto"); return; }
      setEtapa("julgando");
      const chave = (a) => a ? `${a.template}:${a.cols}:${Math.round((a.heroFrac || 0) * 20)}` : "auto";
      const visto = new Set([chave(null)]); const hist = []; let cur = null;
      for (let i = 1; i <= 3; i++) {
        const node = document.querySelector(".poster-canvas-v3");
        const png = await window.SAM_JUIZ.rasterizar(node, 840);
        const v = await window.SAM_JUIZ.julgar(png, `${t.desenho}; ${(t.figuras || []).length} figura(s)`);
        const esc = resRef.current && resRef.current.escolhido;
        const rec = { i, v }; hist.push(rec); setLog([...hist]);
        if (v.aprovado || !v.acao || v.semVisao || v.erro) break;
        const next = window.SAM_JUIZ.aplicarAcao(cur, esc, v.acao);
        if (visto.has(chave(next))) { rec.oscilou = true; setLog([...hist]); break; }
        visto.add(chave(next)); cur = next; setAjuste(next); await sleep(1100);
      }
      const best = hist.slice().sort((a, b) => ((b.v.aprovado ? 1 : 0) - (a.v.aprovado ? 1 : 0)) || ((b.v.nota || 0) - (a.v.nota || 0)) || a.i - b.i)[0];
      if (best) setAjuste(best.cur);
      setEtapa("pronto");
    })();
  }, []);
  const ult = log[log.length - 1];
  const comIA = window.SAM_JUIZ && window.SAM_JUIZ.disponivel();
  const descritor = () => { const e = resRef.current && resRef.current.escolhido; return e ? JSON.stringify({ v: 3, template: e.template, cols: e.cols, heroFrac: e.heroFrac || 0 }) : ""; };
  const W = "min(96vw,1120px)";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(4,12,20,0.86)", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 18, gap: 12 }}>
      <div style={{ width: W, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Pôster do telão — pré-visualização</div>
          <div style={{ fontSize: 12.5, opacity: 0.82 }}>O sistema diagramou seu pôster{comIA ? " e a IA conferiu o resultado" : ""}. Confira e confirme o envio.</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999, background: etapa === "pronto" ? "#13402A" : "#1B2E48", color: etapa === "pronto" ? "#7CE2A8" : "#9FE6FF" }}>
          {etapa === "propondo" ? "diagramando…" : etapa === "julgando" ? "IA conferindo…" : (ult && ult.v && !ult.v.aprovado ? "layout ajustado" : "layout aprovado")}
        </div>
      </div>
      <div style={{ width: W, aspectRatio: "16/9", background: "#08131E", borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <PosterLandscapeV3 t={t} contido ajuste={ajuste} onLayout={setRes} />
      </div>
      <div style={{ width: W, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: "#C7D6E6", minHeight: 18, flex: 1, minWidth: 200 }}>
          {ult && ult.v && ult.v.problema && !ult.v.erro && !ult.v.semVisao ? <span>Parecer da IA: “{ult.v.problema}”{ult.v.nota != null ? ` · nota ${ult.v.nota}/10` : ""}</span> : (etapa === "pronto" ? <span>Layout pronto para o telão.</span> : <span>Processando…</span>)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancelar} style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 9, padding: "10px 16px", cursor: "pointer", background: "rgba(255,255,255,0.14)", color: "#fff" }}>Voltar e ajustar</button>
          <button disabled={etapa !== "pronto"} onClick={() => onConfirmar(descritor())} style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, border: "none", borderRadius: 9, padding: "10px 20px", cursor: etapa === "pronto" ? "pointer" : "default", background: etapa === "pronto" ? "#00ADEF" : "#33536b", color: "#04121F" }}>Confirmar e enviar</button>
        </div>
      </div>
    </div>
  );
}

const F_INICIAL = {
  email:"", titulo:"", fase:7, desenho:"Estudo transversal", area:"Endocrinologia",
  autores:"", orientador:"", afiliacao:AFILIACAO_PADRAO, intro:"", objetivos:"", metodos:"",
  resultados:"", conclusao:"", palavras:"", referencias:"", resumo:"",
};
function SubmissaoApp() {
  const edicao = useMemo(parseEditRoute, []);
  const [f, setF] = useState(F_INICIAL);
  const [figuras, setFiguras] = useState([]);
  const [principal, setPrincipal] = useState(0);
  const [fotoAutores, setFotoAutores] = useState("");
  const [vista, setVista] = useState("apresentacao");
  const [aba, setAba] = useState(edicao ? "form" : "como");
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [edicaoStatus, setEdicaoStatus] = useState(edicao ? "carregando" : null); // carregando | ok | erro
  const [edicaoErro, setEdicaoErro] = useState("");
  const [rascunhoInfo, setRascunhoInfo] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const g = GUIDANCE[f.desenho] || {};
  const ehFase8 = Number(f.fase) === 8;

  /* ---- edição do aluno: carrega o trabalho via doGet action=get ---- */
  const aplicarTrabalho = (t) => {
    setF(prev=>({ ...prev,
      email: t.email || prev.email,
      titulo: t.titulo || "",
      fase: Number(t.fase) || 7,
      desenho: t.desenho || prev.desenho,
      area: t.area || prev.area,
      autores: Array.isArray(t.autores) ? t.autores.join(", ") : (t.autores || ""),
      orientador: t.orientador || "",
      afiliacao: t.afiliacao || AFILIACAO_PADRAO,
      intro: t.introducao || t.intro || "",
      objetivos: t.objetivos || "",
      metodos: t.metodos || "",
      resultados: t.resultados || "",
      conclusao: t.conclusao || "",
      palavras: Array.isArray(t.palavras) ? t.palavras.join(", ") : (t.palavras || ""),
      referencias: t.referencias || "",
      resumo: t.resumo_completo || "",
    }));
    const figs = Array.isArray(t.figuras) ? t.figuras.map(fg=>({ dataUrl: fg.dataUrl || fg.url || "", secao: fg.secao || "Resultados", legenda: fg.legenda || "", titulo: fg.titulo || "" })) : [];
    setFiguras(figs);
    const fp = Number(t.fig_principal);
    setPrincipal(fp >= 1 && fp <= figs.length ? fp - 1 : 0);
    setFotoAutores(t.foto_autores_dataUrl || t.foto_autores_url || "");
  };
  const carregarEdicao = async () => {
    setEdicaoStatus("carregando"); setEdicaoErro("");
    try {
      const r = await fetch(`${API_URL}?action=get&id=${encodeURIComponent(edicao.id)}&token=${encodeURIComponent(edicao.token)}`);
      const res = await r.json();
      if (!res || res.ok === false || res.erro) throw new Error((res && res.erro) || "Não foi possível carregar o trabalho. Confira se o link do e-mail está completo.");
      aplicarTrabalho(res.trabalho || res.dados || res.data || res);
      setEdicaoStatus("ok");
    } catch (e) {
      setEdicaoErro(String(e && e.message || e));
      setEdicaoStatus("erro");
    }
  };
  useEffect(()=>{ if (edicao) carregarEdicao(); }, []);

  /* ---- autosave do rascunho (localStorage); não roda no modo edição ---- */
  useEffect(()=>{
    if (edicao) return;
    try {
      const raw = localStorage.getItem(RASCUNHO_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (!d || !d.f) return;
      const temAlgo = d.f.titulo || d.f.autores || d.f.intro || d.f.resumo || d.f.objetivos;
      if (!temAlgo) return;
      if (!d.f.afiliacao) d.f.afiliacao = AFILIACAO_PADRAO; // rascunhos antigos sem afiliação ganham o padrão
      setF(prev=>({ ...prev, ...d.f }));
      if (Array.isArray(d.figuras) && d.figuras.length) setFiguras(d.figuras.map(fg=>({ dataUrl: fg.dataUrl || "", secao: fg.secao || "Resultados", legenda: fg.legenda || "", titulo: fg.titulo || "" })));
      if (typeof d.principal === "number") setPrincipal(d.principal);
      if (d.fotoAutores) setFotoAutores(d.fotoAutores);
      setRascunhoInfo(d.semImagens ? "Recuperamos o rascunho salvo neste navegador — anexe as imagens novamente." : "Recuperamos o rascunho salvo neste navegador.");
    } catch (e) {}
  }, []);
  useEffect(()=>{
    if (edicao) return;
    const id = setTimeout(()=>{
      try {
        localStorage.setItem(RASCUNHO_KEY, JSON.stringify({ f, figuras, principal, fotoAutores }));
      } catch (e) {
        try { localStorage.setItem(RASCUNHO_KEY, JSON.stringify({ f, figuras: figuras.map(({ dataUrl, ...r })=>r), principal, semImagens: true })); } catch (e2) {}
      }
    }, 800);
    return ()=>clearTimeout(id);
  }, [f, figuras, principal, fotoAutores]);

  const addFigura = () => { if (figuras.length < MAX_FIGS) setFiguras([...figuras, { dataUrl:"", secao:"Resultados", legenda:"", titulo:"" }]); };
  const onFile = async (i, file) => { if (!file) return; if (file.size > 2.5*1024*1024){ alert("Imagem acima de 2,5 MB. Reduza antes de enviar."); return; } const dataUrl = await fileToDataUrl(file); const arr=[...figuras]; arr[i]={...arr[i],dataUrl}; setFiguras(arr); };
  const onFotoAutores = async (file) => { if (!file) return; if (file.size > 2.5*1024*1024){ alert("Imagem acima de 2,5 MB. Reduza antes de enviar."); return; } const dataUrl = await fileToDataUrl(file); setFotoAutores(dataUrl); };
  const setFig = (i,k,v) => { const arr=[...figuras]; arr[i]={...arr[i],[k]:v}; setFiguras(arr); };
  const mover = (i,dir) => { const j=i+dir; if(j<0||j>=figuras.length) return; const arr=[...figuras]; [arr[i],arr[j]]=[arr[j],arr[i]]; setFiguras(arr); if(principal===i) setPrincipal(j); else if(principal===j) setPrincipal(i); };
  const remover = (i) => { const arr=figuras.filter((_,k)=>k!==i); setFiguras(arr); if(principal===i) setPrincipal(0); else if(principal>i) setPrincipal(principal-1); };
  const figPrincipal = figuras[principal];

  const enviarReal = async (ajusteLayout) => {
    if (API_URL.startsWith("COLE_AQUI")) { alert("Falta colar a URL do Apps Script na constante API_URL."); return; }
    if (!f.email || !f.titulo) { alert("Preencha ao menos o e-mail e o título."); return; }
    if (ehFase8 && !f.resumo.trim()) { alert("Cole o resumo submetido à revista no campo Resumo."); return; }
    setEnviando(true);
    const payload = {
      email:f.email, titulo:f.titulo, fase:Number(f.fase), desenho:f.desenho, area:f.area,
      autores:f.autores, orientador:f.orientador, afiliacao:f.afiliacao,
      introducao:f.intro, objetivos:f.objetivos, metodos:f.metodos, resultados:f.resultados,
      conclusao:f.conclusao, palavras:f.palavras, referencias:f.referencias,
      resumo_completo:f.resumo,
      foto_autores_dataUrl:fotoAutores, fig_principal:principal+1,
      figuras:figuras.map(fg=>({ titulo:fg.titulo||"", secao:fg.secao, legenda:fg.legenda, dataUrl:fg.dataUrl })),
      ajuste_layout: ajusteLayout || "",
    };
    if (edicao) { payload.id = edicao.id; payload.token = edicao.token; }
    try {
      const r = await fetch(API_URL, { method:"POST", headers:{ "Content-Type":"text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
      const res = await r.json();
      if (res.ok) {
        setResultado({ ok:true, id:res.id || (edicao && edicao.id) });
        if (!edicao) { try { localStorage.removeItem(RASCUNHO_KEY); } catch (e) {} }
      } else setResultado({ ok:false, erro:res.erro || "Erro desconhecido." });
    } catch (e) { setResultado({ ok:false, erro:String(e) }); } finally { setEnviando(false); }
  };

  /* abre a confirmação (pôster + parecer IA) antes de enviar; 8ª fase envia direto */
  const abrirConfirmacao = () => {
    if (API_URL.startsWith("COLE_AQUI")) { alert("Falta colar a URL do Apps Script na constante API_URL."); return; }
    if (!f.email || !f.titulo) { alert("Preencha ao menos o e-mail e o t\u00edtulo."); return; }
    if (ehFase8) { if (!f.resumo.trim()) { alert("Cole o resumo submetido \u00e0 revista no campo Resumo."); return; } enviarReal(""); return; }
    setConfirmando(motorTDe(f, figuras, principal, fotoAutores));
  };

  const campo={width:"100%",padding:"9px 11px",border:"1px solid #D6DFE9",borderRadius:9,fontSize:13.5,color:C.tinta,fontFamily:"inherit",background:"#fff",boxSizing:"border-box"};
  const label={fontSize:12,fontWeight:700,color:C.azul,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:0.4};
  const grupo={marginBottom:14};
  /* Retângulo 8px = alternador de MODO (intencional; filtros/seleção usam pílula 999px — ver chip em screens.jsx) */
  const vchip=(on)=>({border:"none",borderRadius:8,padding:"6px 10px",fontSize:11.5,fontWeight:700,cursor:"pointer",background:on?C.azul:"#fff",color:on?"#fff":C.cinza,boxShadow:on?"none":"inset 0 0 0 1px #E3EAF2",display:"inline-flex",alignItems:"center",gap:5});
  const previewT = { ...f, fase:Number(f.fase), foto_autores_dataUrl: fotoAutores, figPrincipalUrl: figPrincipal && figPrincipal.dataUrl, figLegenda: figPrincipal && figPrincipal.legenda, figTitulo: figPrincipal && figPrincipal.titulo };
  const notas = {
    apresentacao:"É assim que seu pôster aparece no telão quando você apresenta ao avaliador. O pôster se ajusta ao conteúdo — nada é cortado.",
    vitrine:"O cartaz resumido que roda na galeria do telão, para atrair quem passa.",
    celular:"Como qualquer visitante lê — e aprecia — seu trabalho no celular, pelo QR.",
  };

  return (
    <div style={{ minHeight:"100vh", background:C.papel, fontFamily:"'IBM Plex Sans', system-ui, sans-serif", color:C.tinta }}>
      <div style={{ background:C.ciano, color:"#fff", fontSize:12, textAlign:"center", padding:"5px 12px", fontWeight:600 }}>VERSÃO DE TESTE · as submissões são gravadas de verdade</div>
      <header style={{ background:"#fff", borderBottom:"1px solid #E3EAF2" }}>
        <div style={{ background:C.azulEsc }}>
          <div style={{ maxWidth:1280, margin:"0 auto", padding:"9px 16px" }}>
            <div style={{ height:42, backgroundImage:`url(${(window.__resources && window.__resources.logoStrip) || "assets/logo-strip.jpeg"})`, backgroundSize:"contain", backgroundRepeat:"no-repeat", backgroundPosition:"center" }} role="img" aria-label="Medicina UNIDAVI · NPCMed · SAM 2026" />
          </div>
        </div>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 16px", display:"flex", gap:4 }}>
          {[{k:"como",ic:<FileText size={15}/>,t:"Como submeter"},{k:"form",ic:<PenLine size={15}/>,t:edicao?"Editar trabalho":"Cadastrar trabalho"}].map(tab=>{
            const on = aba===tab.k;
            return (
              <button key={tab.k} onClick={()=>setAba(tab.k)} style={{ display:"inline-flex", alignItems:"center", gap:7, border:"none", background:"none", cursor:"pointer", padding:"11px 4px", marginRight:18, fontSize:13.5, fontWeight:on?800:600, color:on?C.azul:C.cinza, borderBottom:`2.5px solid ${on?C.ciano:"transparent"}`, fontFamily:"inherit" }}>
                {tab.ic} {tab.t}
              </button>
            );
          })}
        </div>
      </header>

      {aba==="como" && <ComoSubmeter onIr={()=>setAba("form")}/>}

      {aba==="form" && <div style={{ maxWidth:1280, margin:"0 auto", padding:"20px", display:"grid", gridTemplateColumns:"minmax(320px, 1.4fr) minmax(250px, 0.9fr)", gap:22, alignItems:"start" }} className="sub-grid">
        {/* FORM */}
        <div style={{ background:"#fff", border:"1px solid #E3EAF2", borderRadius:14, padding:20 }}>
          {/* banner do modo edição */}
          {edicao && edicaoStatus==="carregando" && (
            <div style={{ background:C.cianoClaro, border:`1px solid ${C.ciano}44`, borderRadius:10, padding:"11px 13px", marginBottom:16, fontSize:13, color:C.azulEsc, display:"flex", gap:9, alignItems:"center" }}>
              <Loader2 size={16} color={C.ciano} className="girando"/> Carregando o trabalho <strong>{edicao.id}</strong>…
            </div>
          )}
          {edicao && edicaoStatus==="erro" && (
            <div style={{ background:"#FBEAE8", border:"1px solid #E8C5C0", borderRadius:10, padding:"11px 13px", marginBottom:16, fontSize:13, color:"#7A2616" }}>
              <div style={{ display:"flex", gap:9, alignItems:"flex-start" }}><AlertCircle size={16} color={C.erro} style={{ marginTop:1 }}/><span style={{ flex:1 }}>{edicaoErro}</span></div>
              <button onClick={carregarEdicao} style={{ marginTop:9, border:"1px solid #E8C5C0", background:"#fff", color:C.erro, borderRadius:8, padding:"6px 13px", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Tentar de novo</button>
            </div>
          )}
          {edicao && edicaoStatus==="ok" && (
            <div style={{ background:C.cianoClaro, border:`1px solid ${C.ciano}44`, borderRadius:10, padding:"11px 13px", marginBottom:16, fontSize:13, color:C.azulEsc, display:"flex", gap:9, alignItems:"flex-start" }}>
              <PenLine size={16} color={C.ciano} style={{ marginTop:1 }}/>
              <span>Você está <strong>editando o trabalho {edicao.id}</strong>. Ajuste o que precisar e clique em “Reenviar trabalho”.</span>
            </div>
          )}
          {!edicao && rascunhoInfo && (
            <div style={{ background:C.cianoClaro, border:`1px solid ${C.ciano}44`, borderRadius:10, padding:"10px 13px", marginBottom:16, fontSize:12.5, color:C.azulEsc, display:"flex", gap:9, alignItems:"center" }}>
              <CheckCircle2 size={15} color={C.ciano}/><span style={{ flex:1 }}>{rascunhoInfo}</span>
              <button onClick={()=>{ try{localStorage.removeItem(RASCUNHO_KEY);}catch(e){} setF(F_INICIAL); setFiguras([]); setPrincipal(0); setFotoAutores(""); setRascunhoInfo(""); }} style={{ border:"none", background:"transparent", color:C.cinza, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline", whiteSpace:"nowrap" }}>descartar</button>
            </div>
          )}

          <div style={{ fontWeight:700, fontSize:16, marginBottom:3 }}>{edicao ? "Editar trabalho" : "Cadastrar trabalho"}</div>
          <div style={{ fontSize:13, color:C.cinza, marginBottom:16 }}>{ehFase8 ? "8ª fase: identifique o trabalho e cole o resumo já submetido à revista." : "Preencha os campos. O pôster é gerado pelo sistema — você não diagrama nada."}</div>

          <div style={grupo}><label style={label}>Seu e-mail (para confirmação e edição)</label><input type="email" style={campo} value={f.email} onChange={set("email")} placeholder="voce@unidavi.edu.br"/></div>
          <div style={grupo}><label style={label}>Título</label><textarea rows={2} style={campo} value={f.titulo} onChange={set("titulo")}/></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={grupo}><label style={label}>Fase</label><select style={campo} value={f.fase} onChange={(e)=>setF({...f,fase:Number(e.target.value)})}><option value={7}>7ª fase (pôster do projeto)</option><option value={8}>8ª fase (resumo)</option></select></div>
            <div style={grupo}><label style={label}>Área médica</label><select style={campo} value={f.area} onChange={set("area")}>{AREAS.map(d=><option key={d}>{d}</option>)}</select></div>
          </div>
          {!ehFase8 && <>
            <div style={grupo}><label style={label}>Desenho do estudo</label><select style={campo} value={f.desenho} onChange={(e)=>setF(prev=>({ ...prev, desenho: e.target.value }))}>{DESENHOS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
            <div style={{ background:C.cianoClaro, borderRadius:9, padding:"10px 12px", marginBottom:14, fontSize:12.5, color:C.azulEsc, display:"flex", gap:8 }}>
              <CheckCircle2 size={16} color={C.ciano} style={{ flexShrink:0, marginTop:1 }}/><div>{g.txt}</div>
            </div>
          </>}
          <div style={grupo}><label style={label}>Autores (separados por vírgula)</label><input style={campo} value={f.autores} onChange={set("autores")}/></div>
          <div style={grupo}><label style={label}>Afiliação</label><input style={campo} value={f.afiliacao} onChange={set("afiliacao")} placeholder="Ex.: Curso de Medicina, UNIDAVI — Rio do Sul/SC"/>
            <div style={{ fontSize:12, color:C.cinza, marginTop:5, lineHeight:1.45 }}>Já vem preenchida com a afiliação NPCMed/UNIDAVI — mantenha se for o seu caso, ou edite/acrescente se houver coautores de outras instituições (ex.: ² HRAV, ³ UNIASSELVI).</div>
          </div>

          {/* ============ RAMO 8ª FASE: resumo colado ============ */}
          {ehFase8 && <>
            <div style={{ background:C.cianoClaro, border:`1px solid ${C.ciano}33`, borderRadius:10, padding:"11px 13px", marginBottom:14, fontSize:12.5, color:C.azulEsc, display:"flex", gap:8 }}>
              <FileText size={15} color={C.ciano} style={{ flexShrink:0, marginTop:1 }}/>
              <div>Na 8ª fase não há pôster: o trabalho já foi submetido à revista e aparece nos anais como <strong>resumo</strong>. Cole abaixo o texto inteiro, exatamente como submetido.</div>
            </div>
            <div style={grupo}>
              <label style={label}>Resumo (cole o texto submetido à revista)</label>
              <textarea rows={14} style={campo} value={f.resumo} onChange={set("resumo")} placeholder="Cole aqui o resumo completo…"/>
            </div>
          </>}

          {/* ============ RAMO 7ª FASE: pôster do projeto ============ */}
          {!ehFase8 && <>
            {/* FOTO DO AUTOR (opcional, separada das figuras científicas).
                Renomeação de RÓTULO apenas — as chaves de dado
                foto_autores_dataUrl / foto_autores_url permanecem intactas. */}
            <div style={{ ...grupo, border:"1px solid #E3EAF2", borderRadius:12, padding:14 }}>
              <label style={{ ...label, marginBottom:6 }}>Foto do autor <span style={{ fontWeight:600, textTransform:"none", letterSpacing:0, color:C.cinza }}>(opcional)</span></label>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <label style={{ width:84, height:84, flexShrink:0, border:"1px dashed #C5D2E0", borderRadius:9, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, cursor:"pointer", overflow:"hidden", background:C.papel, textAlign:"center" }}>
                  {fotoAutores ? <img src={fotoAutores} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <><UserRound size={20} color={C.cinza}/><span style={{ fontSize:10, color:C.cinza, lineHeight:1.1 }}>PNG/JPG</span></>}
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={(e)=>onFotoAutores(e.target.files[0])}/>
                </label>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, color:C.cinza, lineHeight:1.45 }}>A foto aparecerá publicamente no pôster da exibição.</div>
                  {fotoAutores && <button onClick={()=>setFotoAutores("")} style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:5, border:"1px solid #E3EAF2", background:"#fff", color:C.erro, borderRadius:7, padding:"5px 10px", fontSize:12, fontWeight:700, cursor:"pointer" }}><Trash2 size={13}/> Remover foto</button>}
                </div>
              </div>
            </div>

            {(window.SAM_ESQUEMA ? window.SAM_ESQUEMA.camposTexto(f.desenho) : [{chave:"intro",rotulo:"Introdu\u00e7\u00e3o",linhas:3},{chave:"objetivos",rotulo:"Objetivo",linhas:2},{chave:"metodos",rotulo:"Metodologia",linhas:3},{chave:"resultados",rotulo:"Resultados esperados",linhas:2}]).map(c=>(
              <div key={c.chave} style={grupo}><label style={label}>{c.rotulo}</label><textarea rows={c.linhas} style={campo} value={f[c.chave]||""} onChange={set(c.chave)}/></div>
            ))}

            {/* GERENCIADOR DE FIGURAS */}
            <div style={{ marginTop:6, marginBottom:14, border:"1px solid #E3EAF2", borderRadius:12, padding:14 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ ...label, marginBottom:0 }}>Figuras ({figuras.length}/{MAX_FIGS})</span>
                <span style={{ fontSize:11.5, color:C.cinza }}>a ordem abaixo = ordem no pôster</span>
              </div>
              {figuras.length===0 && <div style={{ fontSize:12.5, color:C.cinza, padding:"8px 0" }}>Nenhuma figura ainda. Adicione ao menos a principal.</div>}
              {figuras.map((fg,i)=>(
                <div key={i} style={{ border:`1px solid ${principal===i?C.ciano:"#E3EAF2"}`, borderRadius:10, padding:12, marginBottom:10, background:principal===i?C.cianoClaro:"#fff" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:800, color:C.azul }}>Figura {i+1}</span>
                    <button onClick={()=>setPrincipal(i)} style={{ display:"inline-flex", alignItems:"center", gap:4, border:"none", borderRadius:7, padding:"3px 9px", fontSize:11.5, fontWeight:700, cursor:"pointer", background:principal===i?C.ciano:"#EEF2F6", color:principal===i?"#fff":C.cinza }}><Star size={12} fill={principal===i?"#fff":"none"}/> {principal===i?"Principal":"Tornar principal"}</button>
                    <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
                      <button onClick={()=>mover(i,-1)} disabled={i===0} style={miniBtn(i===0)}><ArrowUp size={14}/></button>
                      <button onClick={()=>mover(i,1)} disabled={i===figuras.length-1} style={miniBtn(i===figuras.length-1)}><ArrowDown size={14}/></button>
                      <button onClick={()=>remover(i)} style={{ ...miniBtn(false), color:C.erro }}><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <label style={{ width:84, height:84, flexShrink:0, border:"1px dashed #C5D2E0", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", background:C.papel }}>
                      {fg.dataUrl ? <img src={fg.dataUrl} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"cover" }}/> : <Upload size={18} color={C.cinza}/>}
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={(e)=>onFile(i, e.target.files[0])}/>
                    </label>
                    <div style={{ flex:1, minWidth:0 }}>
                      <input value={fg.titulo} onChange={(e)=>setFig(i,"titulo",e.target.value)} placeholder="Título da figura" style={{ ...campo, marginBottom:8, padding:"7px 9px" }}/>
                      <select value={fg.secao} onChange={(e)=>setFig(i,"secao",e.target.value)} style={{ ...campo, marginBottom:8, padding:"7px 9px" }}>{(window.SAM_ESQUEMA?window.SAM_ESQUEMA.ancorasFig(f.desenho):SECOES_FIG).map(s=><option key={s.v} value={s.v}>{s.l}</option>)}</select>
                      <input value={fg.legenda} onChange={(e)=>setFig(i,"legenda",e.target.value)} placeholder="Legenda da figura" style={{ ...campo, padding:"7px 9px" }}/>
                    </div>
                  </div>
                </div>
              ))}
              {figuras.length<MAX_FIGS && <button onClick={addFigura} style={{ width:"100%", border:`1px dashed ${C.azul}`, background:"#fff", color:C.azul, borderRadius:9, padding:"9px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><Plus size={15}/> Adicionar figura</button>}
            </div>

            <div style={grupo}><label style={label}>Palavras-chave (separadas por vírgula)</label><input style={campo} value={f.palavras} onChange={set("palavras")}/></div>
            <div style={grupo}>
              <label style={label}>Referências <span style={{ fontWeight:600, textTransform:"none", letterSpacing:0, color:C.cinza }}>(uma por linha)</span></label>
              <textarea rows={4} style={campo} value={f.referencias} onChange={set("referencias")} placeholder={"Ex.: SOUZA, A. B. et al. Título do artigo. Revista, v. 1, 2024.\nUma referência por linha."}/>
              <div style={{ fontSize:11.5, color:C.cinza, marginTop:5 }}>No pôster, as referências ficam numa seção recolhível no pé — abre e fecha sem ocupar espaço.</div>
            </div>
          </>}

          <button onClick={abrirConfirmacao} disabled={enviando} style={{ width:"100%", background:enviando?C.cinza:C.azul, color:"#fff", border:"none", borderRadius:10, padding:"12px", fontSize:14.5, fontWeight:700, cursor:enviando?"default":"pointer", marginTop:6, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>{enviando ? <><Loader2 size={17} className="girando"/> Enviando…</> : (edicao ? "Reenviar trabalho" : "Enviar trabalho")}</button>
          {!edicao && <div style={{ fontSize:11.5, color:C.cinza, textAlign:"center", marginTop:9 }}>Rascunho salvo automaticamente neste navegador enquanto você digita.</div>}
        </div>

        {/* PREVIEW — 7ª: pôster em 3 modos · 8ª: resumo nos anais */}
        <div className="col-preview" style={{ position:"sticky", top:16 }}>
          {!ehFase8 ? <>
            <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
              <button onClick={()=>setVista("apresentacao")} style={vchip(vista==="apresentacao")}><Presentation size={13}/> Apresentação</button>
              <button onClick={()=>setVista("vitrine")} style={vchip(vista==="vitrine")}><Monitor size={13}/> Vitrine</button>
              <button onClick={()=>setVista("celular")} style={vchip(vista==="celular")}><Smartphone size={13}/> Celular</button>
            </div>
            {vista==="apresentacao" && <PosterApresentacao t={previewT} figuras={figuras} principal={principal}/>}
            {vista==="vitrine" && <PosterVitrine t={previewT}/>}
            {vista==="celular" && <PosterLeitura t={previewT} figuras={figuras} principal={principal}/>}
            <div style={{ fontSize:12.5, color:C.cinza, marginTop:10, lineHeight:1.5, background:"#fff", border:"1px solid #E3EAF2", borderRadius:10, padding:"10px 12px" }}>{notas[vista]}</div>
          </> : <>
            <PreviaResumo t={previewT}/>
            <div style={{ fontSize:12.5, color:C.cinza, marginTop:10, lineHeight:1.5, background:"#fff", border:"1px solid #E3EAF2", borderRadius:10, padding:"10px 12px" }}>É assim que o seu resumo aparece nos anais e no programa. Na 8ª fase não há geração de pôster.</div>
          </>}
        </div>
      </div>}

      {/* confirmação: pôster + parecer IA antes de enviar */}
      {confirmando && <ModalPosterFinal t={confirmando} onCancelar={()=>setConfirmando(null)} onConfirmar={(desc)=>{ setConfirmando(null); enviarReal(desc); }} />}

      {/* resultado */}
      {resultado && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, zIndex:50 }} onClick={()=>setResultado(null)}>
          <div onClick={(e)=>e.stopPropagation()} style={{ background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:420, textAlign:"center" }}>
            {resultado.ok ? (<>
              <div style={{ width:56, height:56, borderRadius:"50%", background:`${C.ciano}1A`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><CheckCircle2 size={32} color={C.ciano}/></div>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>{edicao ? "Atualização recebida!" : "Trabalho recebido!"}</div>
              <div style={{ fontSize:14, color:C.cinza, lineHeight:1.5 }}>Código <strong style={{ color:C.tinta }}>{resultado.id}</strong>. {edicao ? "A nova versão substitui a anterior e segue para a curadoria." : "Enviamos um e-mail de confirmação com o link para revisar ou ajustar."}</div>
            </>) : (<>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"#FBEAE8", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><X size={30} color={C.erro}/></div>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>Não foi possível enviar</div>
              <div style={{ fontSize:13.5, color:C.cinza, lineHeight:1.5 }}>{resultado.erro}</div>
            </>)}
            <button onClick={()=>setResultado(null)} style={{ background:C.azul, color:"#fff", border:"none", borderRadius:10, padding:"11px 22px", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:16 }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SubmissaoApp />);
