/* ============================================================
   XI SAM 2026 — TELAS: Home, PaginaTrabalho, Telao
   ============================================================ */

/* ---------------- HOME (landing + programa) ---------------- */
/* modo painel (telão da Programação): ?painel=1 → ciclo automático de dias */
function _samPainelAtivo() {
  try { return !!new URLSearchParams(window.location.search).get("painel"); }
  catch (e) { return false; }
}
function _samDiaDeHoje() {
  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, "0");
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  return DIAS.find((d) => d.includes(dd + "/" + mm)) || null;
}
/* Avatar do autor (foto liberada) — placeholder neutro se sem foto */
function AvatarAutor({ url, size = 38 }) {
  return url ? (
    <div style={{ width:size, height:size, borderRadius:"50%", overflow:"hidden", flexShrink:0, border:"2px solid #E3EAF2", background:C.cinzaClaro }}>
      <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
    </div>
  ) : (
    <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:C.cinzaClaro, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <UserRound size={size*0.5} color="#B9C5D3" />
    </div>
  );
}
/* selo discreto “ver pôster/resumo” */
function SeloVer({ t }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11.5, fontWeight:700, color:C.ciano, whiteSpace:"nowrap" }}>
      {Number(t.fase) === 8 ? "ver resumo" : "ver pôster"} <ChevronRight size={13} color={C.ciano} />
    </span>
  );
}
/* aviso discreto de carregamento/erro da lista real */
function StatusTrabalhos({ status, recarregar }) {
  if (status === "carregando") return (
    <Carregando frase="Carregando trabalhos liberados…" style={{ justifyContent:"flex-start", marginBottom:12 }} />
  );
  if (status === "erro") return (
    <div style={{ fontSize:12, color:C.cinza, marginBottom:12, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
      <span>Não foi possível carregar os trabalhos liberados agora.</span>
      <button onClick={recarregar} style={{ border:"1px solid #E3EAF2", background:"#fff", color:C.azul, borderRadius:7, padding:"3px 10px", fontSize:11.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Tentar de novo</button>
    </div>
  );
  return null;
}
function Home() {
  const painel = useMemo(_samPainelAtivo, []);
  // em modo painel, destaca o dia atual primeiro (se o evento estiver acontecendo)
  const [dia, setDia] = useState(() => (painel && _samDiaDeHoje()) || DIAS[0]);
  const [filtro, setFiltro] = useState("Todos");
  const { trabalhos, status, recarregar } = useTrabalhos();
  // modo painel: cicla os dias sozinho (~20s), sem necessidade de toque
  useEffect(() => {
    if (!painel) return;
    const iv = setInterval(() => {
      setDia((atual) => DIAS[(DIAS.indexOf(atual) + 1) % DIAS.length]);
      setFiltro("Todos");
    }, 20000);
    return () => clearInterval(iv);
  }, [painel]);
  const d = PROGRAMA[dia];
  const orais = d.orais.filter((o) => filtro === "Todos" || o.area === filtro);
  const areasDoDia = [...new Set(d.orais.map((o) => o.area))];
  /* Pílula 999px = filtro/seleção (intencional; alternadores de MODO usam retângulo — ver vchip em submissao-app.jsx) */
  const chip = (on, c) => ({ border:"none", borderRadius:999, padding:"12px 15px", fontSize:12, fontWeight:600, cursor:"pointer", background:on?c:"#fff", color:on?"#fff":C.cinza, boxShadow:on?"none":"inset 0 0 0 1px #E3EAF2", whiteSpace:"nowrap" });
  return (
    <div>
      <SiteHeader />
      <div style={{ maxWidth:980, margin:"0 auto", padding:"24px 16px 60px" }}>
        {/* HERO — arte oficial (texto já embutido). Desktop: widescreen · Mobile: quadrada */}
        {/* Contêiner azul-escuro reserva o espaço e segura o fundo enquanto o JPG carrega */}
        <div style={{ background:C.azulEsc, borderRadius:18, overflow:"hidden", boxShadow:"0 10px 30px rgba(2,40,90,0.14)" }}>
          <picture>
            <source media="(max-width: 640px)" srcSet={(window.__resources && window.__resources.heroMobile) || "assets/hero-mobile.jpg"} />
            <img
              src={(window.__resources && window.__resources.heroDesktop) || "assets/hero-desktop.jpg"}
              width="1400" height="775"
              alt="XI Semana Acadêmica da Medicina UNIDAVI · 22 a 26 de junho de 2026 · Auditório Célio Simão Martignago · Rio do Sul/SC"
              style={{ width:"100%", height:"auto", display:"block" }}
            />
          </picture>
        </div>
        {/* Assistir ao vivo no YouTube — Canal UNIDAVI TV */}
        <div style={{ display:"flex", justifyContent:"center", marginTop:14 }}>
          <a href="https://www.youtube.com/@UNIDAVITV" target="_blank" rel="noopener noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:9, background:"#FF0000", color:"#fff", textDecoration:"none", borderRadius:11, padding:"11px 20px", fontWeight:700, fontSize:14.5, boxShadow:"0 4px 14px rgba(255,0,0,0.25)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5C.5 9.4.5 12 .5 12s0 2.6.5 4.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.5.5-4.5s0-2.6-.5-4.5ZM9.8 15.3V8.7l6.2 3.3-6.2 3.3Z"/></svg>
            Assistir ao vivo no YouTube
          </a>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:28, marginBottom:10 }}>
          <CalendarDays size={18} color={C.azul} /><h2 style={{ fontSize:18, fontWeight:800, color:C.tinta, margin:0 }}>Programação</h2>
        </div>
        <StatusTrabalhos status={status} recarregar={recarregar} />
        <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
          {DIAS.map((dd) => (
            <button key={dd} onClick={() => { setDia(dd); setFiltro("Todos"); }} style={{ border:"none", borderRadius:999, padding:"11px 16px", fontSize:13, fontWeight:600, cursor:"pointer", background:dd===dia?C.azul:"#fff", color:dd===dia?"#fff":C.cinza, boxShadow:dd===dia?"none":"inset 0 0 0 1px #E3EAF2" }}>{dd}</button>
          ))}
          {/* Botão “Assistir ao vivo” do DIA — só quando PROGRAMA[dia].youtube tem link */}
          {d.youtube ? (
            <a href={d.youtube} target="_blank" rel="noopener noreferrer"
              style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:7, background:"#FF0000", color:"#fff", textDecoration:"none", borderRadius:999, padding:"9px 15px", fontWeight:700, fontSize:12.5, whiteSpace:"nowrap" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>
              Assistir ao vivo
            </a>
          ) : null}
        </div>

        {d.abertura && (
          <div style={{ background:`linear-gradient(135deg, ${C.azul}, ${C.azulEsc})`, color:"#fff", borderRadius:12, padding:"14px 18px", marginBottom:18, display:"flex", gap:14, alignItems:"center" }}>
            <Award size={24} color={C.ciano} /><div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{d.abertura.label}</div></div><div style={{ fontSize:14, fontWeight:700 }}>{d.abertura.hora}</div>
          </div>
        )}

        {/* ===================== BLOCO 1 — HALL DO AUDITÓRIO ===================== */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:6, marginBottom:12, padding:"4px 0" }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${C.ciano}1A`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><MapPin size={22} color={C.azul} /></div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, letterSpacing:1.5, fontWeight:700, color:C.ciano }}>AMBIENTE 1</div>
            <div style={{ fontSize:17, fontWeight:800, color:C.tinta, lineHeight:1.15 }}>Hall do Auditório</div>
            <div style={{ fontSize:13, color:C.cinza, marginTop:2 }}>Área de exposição dos pôsteres</div>
          </div>
        </div>

        <div style={{ background:"#fff", border:"1px solid #E3EAF2", borderRadius:12, padding:"14px 18px", marginBottom:12, display:"flex", gap:14, alignItems:"center" }}>
          <div style={{ width:42, height:42, borderRadius:11, background:`${C.ambar}1A`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Coffee size={21} color={C.ambar} /></div>
          <div style={{ flex:1, minWidth:0 }}><div style={{ fontWeight:700, color:C.tinta, fontSize:15 }}>Science with Coffee</div><div style={{ fontSize:13, color:C.cinza, marginTop:2 }}>Exposição dos pôsteres, com café e interação</div></div>
          <div style={{ fontSize:14, color:C.azul, fontWeight:700, whiteSpace:"nowrap" }}>{d.sci}</div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <Users size={15} color={C.cinza} /><div style={{ fontWeight:700, color:C.cinza, fontSize:13 }}>Pôsteres expostos</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:10, marginBottom:30 }}>
          {d.posteres.map((p) => {
            const t = casarTrabalho(p, trabalhos);
            const base = { background:"#fff", border:"1px solid #E3EAF2", borderRadius:10, padding:"12px 14px", display:"flex", gap:12, alignItems:"center", textAlign:"left", width:"100%" };
            const badge = (
              <div style={{ width:28, height:28, borderRadius:7, background:`${C.ciano}1A`, color:C.azul, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:11, flexShrink:0 }}>P{p.n}</div>
            );
            if (!t) return (
              <div key={p.n} style={base}>
                <AvatarAutor url={null} size={34} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.tinta, lineHeight:1.3 }}>{p.ap}</div>
                  <div style={{ fontSize:11.5, color:"#9AA8B8", marginTop:3 }}>em breve</div>
                </div>
                {badge}
              </div>
            );
            return (
              <button key={p.n} className="card-link fade-troca" onClick={() => go("#/trabalho/" + t.id)} style={base}>
                <AvatarAutor url={t.foto_autores_url || t.foto_autores_dataUrl} size={34} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.tinta, lineHeight:1.3 }}>{p.ap}</div>
                  <div style={{ marginTop:3 }}><SeloVer t={t} /></div>
                </div>
                {badge}
              </button>
            );
          })}
        </div>

        {/* ===================== BLOCO 2 — AUDITÓRIO ===================== */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:6, marginBottom:12, padding:"4px 0" }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${C.azul}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Mic size={21} color={C.azul} /></div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, letterSpacing:1.5, fontWeight:700, color:C.ciano }}>AMBIENTE 2</div>
            <div style={{ fontSize:17, fontWeight:800, color:C.tinta, lineHeight:1.15 }}>Auditório Célio Simão Martignago</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <Mic size={15} color={C.cinza} /><div style={{ fontWeight:700, color:C.cinza, fontSize:13 }}>Apresentações orais</div>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
          <button onClick={() => setFiltro("Todos")} style={chip(filtro==="Todos", C.azul)}>Todas</button>
          {areasDoDia.map((a) => <button key={a} onClick={() => setFiltro(a)} style={chip(filtro===a, AREA_COR[a]||C.cinza)}>{a}</button>)}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
          {orais.map((o) => {
            const cor = AREA_COR[o.area] || C.cinza;
            const t = casarTrabalho(o, trabalhos);
            const card = { background:"#fff", border:"1px solid #E3EAF2", borderRadius:12, padding:16, display:"flex", gap:14, borderLeft:`4px solid ${cor}`, textAlign:"left", width:"100%" };
            const corpo = (
              <>
                <div style={{ textAlign:"center", minWidth:54 }}>
                  <div style={{ fontSize:11, color:C.cinza, fontWeight:700 }}>{o.tc}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:C.azul, marginTop:4 }}>{o.hora}</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ ...chip(true, cor), padding:"3px 10px", fontSize:11, display:"inline-block", marginBottom:6 }}>{o.area}</span>
                  <div style={{ fontSize:14.5, fontWeight:700, color:C.tinta, lineHeight:1.3, marginBottom:4 }}>{o.titulo}</div>
                  {t ? (
                    <div style={{ display:"flex", alignItems:"center", gap:9, marginTop:7 }}>
                      <AvatarAutor url={t.foto_autores_url || t.foto_autores_dataUrl} size={34} />
                      <span style={{ fontSize:12.5, color:C.cinza, flex:1, minWidth:0 }}>{o.ap}</span>
                      <SeloVer t={t} />
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:9, marginTop:7 }}>
                      <AvatarAutor url={null} size={34} />
                      <span style={{ fontSize:12.5, color:C.cinza, flex:1, minWidth:0 }}>{o.ap}</span>
                      <span style={{ fontSize:11.5, color:"#9AA8B8", whiteSpace:"nowrap" }}>em breve</span>
                    </div>
                  )}
                </div>
                {t && <ChevronRight size={18} color={C.ciano} style={{ alignSelf:"center", flexShrink:0 }} />}
              </>
            );
            return t ? (
              <button key={o.tc} className="card-link fade-troca" onClick={() => go("#/trabalho/" + t.id)} style={card}>{corpo}</button>
            ) : (
              <div key={o.tc} style={card}>{corpo}</div>
            );
          })}
        </div>
        {/* O acesso aos trabalhos é exclusivamente pelo cronograma:
            card casado abre o resumo/pôster. (Galeria pública removida
            por decisão de produto; EstadoVazio segue em uso no Telão.) */}
      </div>
      <footer style={{ textAlign:"center", padding:"24px 16px 40px", color:C.cinza, fontSize:12 }}>XI SAM 2026 · Medicina UNIDAVI</footer>
    </div>
  );
} 

/* ---------------- PÁGINA DO TRABALHO (#/trabalho/{id}) ----------------
   Barra superior fina FIXA (sticky): voltar + título em 1 linha + ID/área.
   O cabeçalho grande (título longo + autores) NÃO é fixo: rola junto.    */
/* Telas de sistema (carregando / erro / não encontrado): mantêm a barra
   azul com identidade + caminho de volta, em vez de texto solto no vácuo. */
function TelaSistema({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:C.papel }}>
      <div style={{ position:"sticky", top:0, zIndex:20, background:C.azul, color:"#fff", boxShadow:"0 2px 10px rgba(2,40,90,0.22)" }}>
        <div style={{ maxWidth:640, margin:"0 auto", padding:"0 8px", height:52, display:"flex", alignItems:"center", gap:6 }}>
          <button onClick={() => go("#/")} aria-label="Voltar à programação" style={{ flexShrink:0, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", border:"none", background:"transparent", color:"#fff", cursor:"pointer", borderRadius:9 }}>
            <ArrowLeft size={22} color="#fff" />
          </button>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, minWidth:0 }}>
            <span style={{ fontSize:15, fontWeight:800, whiteSpace:"nowrap" }}>XI SAM <span style={{ color:C.ciano }}>2026</span></span>
            <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.78)", whiteSpace:"nowrap" }}>Medicina UNIDAVI</span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:640, margin:"16px auto 30px", padding:"0 12px" }}>{children}</div>
    </div>
  );
}
function PaginaTrabalho({ id, tv }) {
  const { trabalhos, status, recarregar } = useTrabalhos();
  // Modo TV (flag na URL #/trabalho/:id/tv): pôster horizontal inteiro, sem rolar.
  // Sem o flag: leitura 1 coluna rolável (monitor e celular).
  const poster = !!tv;
  const t = trabalhoNaLista(trabalhos, id);
  if (!t) {
    if (status === "carregando") return (
      <TelaSistema>
        <Carregando frase="Carregando o trabalho…" style={{ padding:"4px 0 14px" }} />
        <div style={{ background:"#fff", borderRadius:14, padding:18, boxShadow:"0 8px 30px rgba(2,40,90,0.08)", display:"flex", flexDirection:"column", gap:12 }}>
          <div className="skeleton" style={{ height:110, borderRadius:10 }}></div>
          <div className="skeleton" style={{ height:15, width:"85%" }}></div>
          <div className="skeleton" style={{ height:15, width:"70%" }}></div>
          <div className="skeleton" style={{ height:15, width:"78%" }}></div>
          <div className="skeleton" style={{ height:190, borderRadius:10 }}></div>
        </div>
      </TelaSistema>
    );
    if (status === "erro") return (
      <TelaSistema>
        <div style={{ background:"#fff", borderRadius:14, padding:"40px 20px", boxShadow:"0 8px 30px rgba(2,40,90,0.08)", textAlign:"center", color:C.cinza, fontSize:14 }}>
          <div style={{ marginBottom:14 }}>Não foi possível carregar o trabalho agora.</div>
          <button onClick={recarregar} style={{ border:"1px solid #E3EAF2", background:"#fff", color:C.azul, borderRadius:9, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Tentar de novo</button>
          <div style={{ marginTop:14 }}><a href="#/" style={{ color:C.azul, fontSize:13 }}>Voltar à programação</a></div>
        </div>
      </TelaSistema>
    );
    return (
      <TelaSistema>
        <div style={{ background:"#fff", borderRadius:14, padding:"40px 20px", boxShadow:"0 8px 30px rgba(2,40,90,0.08)", textAlign:"center", color:C.cinza, fontSize:14 }}>
          Trabalho não encontrado. <a href="#/" style={{ color:C.azul }}>Voltar à programação</a>
        </div>
      </TelaSistema>
    );
  }
  const cor = AREA_COR[t.area] || C.ciano;

  if (poster) {
    const _aj = (() => { try { const a = JSON.parse(t.ajuste_layout || ""); return (a && a.template) ? a : null; } catch (e) { return null; } })();
    const Land = window.PosterLandscapeV3 || PosterCompletoLandscape;
    return (
      <div style={{ position:"fixed", inset:0, background:"#0A0E13", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <Land t={t} ajuste={_aj} onVoltar={() => go("#/")} />
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.papel }}>
      {/* Barra fina fixa no topo */}
      <div style={{ position:"sticky", top:0, zIndex:20, background:C.azul, color:"#fff", boxShadow:"0 2px 10px rgba(2,40,90,0.22)" }}>
        <div style={{ maxWidth:640, margin:"0 auto", padding:"0 8px", height:52, display:"flex", alignItems:"center", gap:6 }}>
          <button onClick={() => go("#/")} aria-label="Voltar" style={{ flexShrink:0, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", border:"none", background:"transparent", color:"#fff", cursor:"pointer", borderRadius:9 }}>
            <ArrowLeft size={22} color="#fff" />
          </button>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14.5, fontWeight:700, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.titulo}</div>
            <div style={{ fontSize:11.5, lineHeight:1.2, marginTop:1, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color:"rgba(255,255,255,0.82)" }}>
              <span style={{ width:9, height:9, borderRadius:3, background:cor, flexShrink:0, boxShadow:"0 0 0 1px rgba(255,255,255,0.4)" }} />
              <span style={{ fontWeight:700 }}>{t.id}</span>
              <span style={{ opacity:0.6 }}>·</span>
              <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{t.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo rolável sob a barra */}
      <div style={{ maxWidth:640, margin:"16px auto 30px", borderRadius:14, overflow:"hidden", boxShadow:"0 8px 30px rgba(2,40,90,0.08)" }}>
        <TrabalhoLeitura t={t} />
      </div>
    </div>
  );
}
const posterCtrlBtn = { display:"flex", alignItems:"center", gap:7, height:40, padding:"0 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.22)", background:"rgba(255,255,255,0.12)", backdropFilter:"blur(6px)", color:"#fff", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700 };

/* ---------------- TELÃO DA ESTAÇÃO (#/estacao/{n}) ---------------- */
function Telao({ estacao }) {
  const { trabalhos: lista, status, recarregar } = useTrabalhos();
  const [idx, setIdx] = useState(0);
  const [modo, setModo] = useState("galeria");     // 'galeria' | 'apresentacao'
  const [rodando, setRodando] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [pin, setPin] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const PIN_OK = "1234"; // mock — no produto vem da config

  useEffect(() => {
    if (modo !== "galeria" || !rodando || lista.length < 2) return;
    const i = setInterval(() => setIdx((p) => (p + 1) % lista.length), 20000);
    return () => clearInterval(i);
  }, [modo, rodando, lista.length]);

  const t = lista.length ? lista[idx % lista.length] : null;
  return (
    <div style={{ minHeight:"100vh", background:"#0A0E13", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, position:"relative" }}>
      <div style={{ width:"100%", maxWidth:430 }}>
        {t ? (modo === "galeria" ? <PosterVitrine t={t} /> : <PosterCompleto t={t} />) : (
          <div style={{ aspectRatio:"720 / 1280", borderRadius:14, border:"1px dashed #2A3340", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:32, gap:14, color:"#5B6B7E" }}>
            {status === "carregando" && <Carregando escuro frase="Carregando trabalhos…" />}
            {status === "ok" && <EstadoVazio escuro />}
            {status === "erro" && (
              <>
                <div style={{ fontSize:15, lineHeight:1.5, maxWidth:280 }}>Não foi possível carregar os trabalhos agora.</div>
                <button onClick={recarregar} style={{ border:"1px solid #2A3340", background:"#10151C", color:"#8A99AB", borderRadius:9, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Tentar de novo</button>
              </>
            )}
          </div>
        )}
      </div>
      <div style={{ marginTop:16, color:"#5B6B7E", fontSize:13, display:"flex", alignItems:"center", gap:10 }}>
        <Monitor size={15} /> Estação {estacao} · {modo === "galeria" ? "Galeria" : "Apresentação"}{lista.length ? ` · ${(idx % lista.length) + 1}/${lista.length}` : ""}
      </div>

      <button onClick={() => setAdmin(true)} title="Operador" style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:9, border:"1px solid #1E2630", background:"#10151C", color:"#3A4350", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Lock size={15} />
      </button>

      {admin && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, zIndex:50 }} onClick={() => { setAdmin(false); setPin(""); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:360 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontWeight:800, color:C.tinta, fontSize:16 }}>Operador · Estação {estacao}</div>
              <button onClick={() => { setAdmin(false); setPin(""); }} style={{ border:"none", background:"transparent", cursor:"pointer", color:C.cinza }}><X size={18} /></button>
            </div>
            {!autorizado ? (
              <div>
                <div style={{ fontSize:13, color:C.cinza, marginBottom:8 }}>Digite o PIN do operador</div>
                <input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" placeholder="• • • •" style={{ width:"100%", padding:"11px", border:"1px solid #D6DFE9", borderRadius:10, fontSize:18, textAlign:"center", letterSpacing:6, boxSizing:"border-box" }} />
                <button onClick={() => { if (pin === PIN_OK) setAutorizado(true); else setPin(""); }} style={{ width:"100%", marginTop:12, background:C.azul, color:"#fff", border:"none", borderRadius:10, padding:12, fontWeight:700, cursor:"pointer" }}>Entrar</button>
                <div style={{ fontSize:11, color:C.cinza, marginTop:8, textAlign:"center" }}>(protótipo: PIN 1234)</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setModo("galeria")} style={ctrlBtn(modo==="galeria")}>Galeria</button>
                  <button onClick={() => setModo("apresentacao")} style={ctrlBtn(modo==="apresentacao")}>Apresentação</button>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setRodando((r) => !r)} style={ctrlBtn(false)}>{rodando ? <><Pause size={15}/> Pausar</> : <><Play size={15}/> Retomar</>}</button>
                  <button onClick={() => lista.length && setIdx((p) => (p+1) % lista.length)} style={ctrlBtn(false)}><SkipForward size={15}/> Próximo</button>
                </div>
                <div style={{ fontSize:12, color:C.cinza, marginTop:4, marginBottom:4 }}>Fixar trabalho:</div>
                <div style={{ maxHeight:160, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
                  {lista.map((tr, i) => (
                    <button key={tr.id} onClick={() => { setIdx(i); setModo("apresentacao"); }} style={{ textAlign:"left", border:"none", background:i===idx?C.cianoClaro:"#F4F7FA", borderRadius:8, padding:"8px 10px", fontSize:12.5, color:i===idx?C.azul:C.tinta, cursor:"pointer" }}>
                      {tr.id} · {tr.titulo.slice(0,40)}…
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
const ctrlBtn = (on) => ({ flex:1, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", borderRadius:9, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer", background:on?C.azul:"#EEF2F6", color:on?"#fff":C.tinta });

/* ---------------- SOBRE (#/sobre) ---------------- */
function Sobre() {
  const linha = { display:"flex", gap:10, alignItems:"flex-start", fontSize:15, lineHeight:1.5 };
  return (
    <div>
      <SiteHeader />
      <div style={{ maxWidth:760, margin:"0 auto", padding:"30px 16px 70px" }}>
        <div style={{ fontSize:12, letterSpacing:2, fontWeight:700, color:C.ciano, marginBottom:8 }}>SOBRE</div>
        <h1 style={{ fontSize:32, fontWeight:800, color:C.tinta, letterSpacing:-0.6, margin:"0 0 24px", lineHeight:1.1 }}>Sobre a XI SAM</h1>

        <div style={{ fontSize:16.5, lineHeight:1.7, color:C.tinta, display:"flex", flexDirection:"column", gap:18, textWrap:"pretty" }}>
          <p style={{ margin:0 }}>A Semana Acadêmica da Medicina é o momento em que o curso para para olhar o que produziu — e para celebrar quem produziu. Reúne estudantes, professores e a comunidade em torno do que há de mais vivo na formação médica: a pesquisa que nasce das inquietações de cada fase e amadurece até virar conhecimento compartilhado.</p>
          <p style={{ margin:0 }}>Na XI SAM, os estudantes da 8ª fase apresentam seus Trabalhos de Curso já concluídos, em sessões orais; os da 7ª fase trazem seus projetos em pôster — os primeiros passos de pesquisas que seguirão sendo construídas. Entre uma apresentação e outra, há café, conversa e encontro, porque ciência também se faz no intervalo: na pergunta de corredor, na ideia que surge diante do trabalho do colega.</p>
          <p style={{ margin:0 }}>Mais do que uma vitrine, a SAM é formação: aprender a comunicar, a ouvir, a defender uma ideia e a acolher a crítica — ainda na graduação, aquilo que será parte da vida profissional.</p>
        </div>

        {/* Quando e onde */}
        <div style={{ marginTop:28, background:`linear-gradient(135deg, ${C.azul}, ${C.azulEsc})`, color:"#fff", borderRadius:16, padding:"24px 26px" }}>
          <div style={{ ...linha, marginBottom:14 }}>
            <CalendarDays size={20} color={C.ciano} style={{ flexShrink:0, marginTop:1 }} />
            <span style={{ fontSize:16, fontWeight:600 }}>Quando e onde · 22 a 26 de junho de 2026 · Auditório Célio Simão Martignago · Rio do Sul, SC</span>
          </div>
          <div style={{ ...linha, marginBottom:10 }}>
            <Users size={20} color={C.ciano} style={{ flexShrink:0, marginTop:1 }} />
            <span>Pôsteres e Science with Coffee: Hall do Auditório (área de exposição)</span>
          </div>
          <div style={linha}>
            <Mic size={20} color={C.ciano} style={{ flexShrink:0, marginTop:1 }} />
            <span>Apresentações orais: Auditório Célio Simão Martignago</span>
          </div>
        </div>

        {/* Transmissão */}
        <div style={{ marginTop:14, background:"#fff", border:"1px solid #E3EAF2", borderRadius:14, padding:"16px 18px", display:"flex", gap:10, alignItems:"flex-start", fontSize:14.5, color:C.cinza, lineHeight:1.5 }}>
          <Monitor size={18} color={C.azul} style={{ flexShrink:0, marginTop:1 }} />
          <span>Transmissão ao vivo · canal Universo UNIDAVI (YouTube) · o botão “Assistir ao vivo” aparece na programação, junto ao dia, quando a transmissão daquele dia tem link</span>
        </div>
      </div>
      <footer style={{ textAlign:"center", padding:"24px 16px 40px", color:C.cinza, fontSize:12 }}>XI SAM 2026 · Medicina UNIDAVI</footer>
    </div>
  );
}

Object.assign(window, { Home, Sobre, PaginaTrabalho, Telao, ctrlBtn });
