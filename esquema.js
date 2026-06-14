/* ============================================================
   XI SAM 2026 · V3 — ESQUEMA POR DESENHO (individualização)
   Fonte única de verdade para os campos/âncoras/rótulos que
   mudam conforme o desenho do estudo. Usado pela SUBMISSÃO
   (formulário + âncoras de figura) e pelo MOTOR do pôster.

   IMPORTANTE: as CHAVES DE DADO (intro/objetivos/metodos/
   resultados/conclusao) e os valores internos de `secao`
   (Introdução/Métodos/Resultados/Discussão/Outra) permanecem
   INTACTOS — o backend não muda. Só RÓTULOS e ÂNCORAS mudam.
   ============================================================ */
(function () {
  function ehRelato(desenho) { return /relato de caso/i.test(desenho || ""); }

  // Seções do CORPO do pôster (ordem de leitura). Cada uma liga um
  // RÓTULO visível a uma CHAVE de dado e ao valor interno de `secao`
  // onde as figuras daquela seção se ancoram.
  const SECOES = {
    // Relato de caso → Introdução · Apresentação do caso · Discussão · Conclusões
    relato: [
      { rotulo: "Introdução",           chave: "intro",      sec: "Introdução" },
      { rotulo: "Apresentação do caso", chave: "metodos",    sec: "Métodos" },
      { rotulo: "Discussão",            chave: "resultados", sec: "Resultados" },
      { rotulo: "Conclusões",           chave: "conclusao",  sec: "Discussão" },
    ],
    // Demais desenhos → Introdução · Objetivo · Metodologia · Resultados esperados
    padrao: [
      { rotulo: "Introdução",            chave: "intro",      sec: "Introdução" },
      { rotulo: "Objetivo",              chave: "objetivos",  sec: null },
      { rotulo: "Metodologia",           chave: "metodos",    sec: "Métodos" },
      { rotulo: "Resultados esperados",  chave: "resultados", sec: "Resultados" },
    ],
  };

  function secoesDe(t) {
    return (ehRelato(t && t.desenho) ? SECOES.relato : SECOES.padrao).map((s) => ({ ...s }));
  }

  // Opções de ÂNCORA de figura no formulário (rótulo por desenho;
  // valor de dado `v` em `secao` é estável).
  function ancorasFig(desenho) {
    return ehRelato(desenho)
      ? [
          { v: "Introdução", l: "Introdução" },
          { v: "Métodos",    l: "Apresentação do caso" },
          { v: "Resultados", l: "Discussão" },
          { v: "Discussão",  l: "Conclusões" },
          { v: "Outra",      l: "Outra" },
        ]
      : [
          { v: "Introdução", l: "Introdução" },
          { v: "Métodos",    l: "Metodologia" },
          { v: "Resultados", l: "Resultados" },
          { v: "Discussão",  l: "Discussão" },
          { v: "Outra",      l: "Outra" },
        ];
  }

  // Rótulos dos CAMPOS de texto do formulário, por desenho.
  function camposTexto(desenho) {
    return ehRelato(desenho)
      ? [
          { chave: "intro",      rotulo: "Introdução",           linhas: 3 },
          { chave: "metodos",    rotulo: "Apresentação do caso", linhas: 4 },
          { chave: "resultados", rotulo: "Discussão",            linhas: 3 },
          { chave: "conclusao",  rotulo: "Conclusões",           linhas: 2 },
        ]
      : [
          { chave: "intro",      rotulo: "Introdução",           linhas: 3 },
          { chave: "objetivos",  rotulo: "Objetivo",             linhas: 2 },
          { chave: "metodos",    rotulo: "Metodologia",          linhas: 3 },
          { chave: "resultados", rotulo: "Resultados esperados", linhas: 2 },
        ];
  }

  window.SAM_ESQUEMA = { ehRelato, secoesDe, ancorasFig, camposTexto, SECOES };
})();
