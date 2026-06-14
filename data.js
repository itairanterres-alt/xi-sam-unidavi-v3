/* ============================================================
   XI SAM 2026 — DADOS.
   · PROGRAMA: cronograma oficial, mantido pelo coordenador AQUI.
     Cada item (oral ou pôster) aceita um campo OPCIONAL `id`
     (ex.: id:"T-0012") que liga manualmente ao trabalho liberado,
     vencendo o casamento automático por nome.
   · TRABALHOS: exemplos usados APENAS como fallback de
     desenvolvimento local (ver lib.jsx). Nunca aparecem ao público
     em produção — a lista real vem do backend (curadoria).
   Globais expostos em window para os scripts Babel.
   ============================================================ */

const C = {
  azul: "#023E88", azulEsc: "#01285A",
  ciano: "#00ADEF", cianoClaro: "#E5F6FE",
  tinta: "#0C1A2B", cinza: "#5B6B7E",
  cinzaClaro: "#EEF2F6", papel: "#F7F9FB", ambar: "#B07A18",
};

const AREA_COR = {
  "Educação Médica": "#5B6B7E", "Neurologia": "#6A4C93", "Neurocirurgia": "#5B3A82",
  "Geriatria": "#B07A18", "Psiquiatria": "#7A4D9C", "Medicina de Família e Comunidade": "#D38F00",
  "Ginecologia e Obstetrícia": "#B23A82", "Oncologia": "#2A8A5C", "Otorrinolaringologia": "#0080B7",
  "Endocrinologia": "#C4622D", "Infectologia": "#3D6E1B", "Pediatria": "#00ADEF",
  "Cardiologia": "#A23A1F", "Cirurgia Vascular": "#7A2616",
  "Anestesiologia": "#33658A", "Cirurgia Geral": "#7A4419", "Reumatologia": "#9C3D54",
  "Gastroenterologia": "#946B2D", "Dermatologia": "#2F7E78", "Ortopedia": "#46537A",
};

const DIAS = ["Seg · 22/06", "Ter · 23/06", "Qua · 24/06", "Qui · 25/06", "Sex · 26/06"];

/* TRABALHOS EXEMPLO — fallback de DESENVOLVIMENTO LOCAL apenas (nunca em produção) */
const TRABALHOS = [
  { id:"EX-01", fase:7, desenho:"Estudo transversal", area:"Ginecologia e Obstetrícia",
    titulo:"Adesão ao rastreamento de câncer de colo uterino em unidades de saúde da família do Alto Vale do Itajaí",
    autores:["A. Discente Exemplo","B. Discente Exemplo"], orientador:"Orientadora Exemplo",
    intro:"O câncer de colo uterino permanece como causa evitável de mortalidade feminina. O rastreamento citopatológico é a principal estratégia de detecção precoce na atenção primária.",
    objetivos:"Estimar a adesão ao rastreamento e identificar fatores associados à não realização do exame.",
    metodos:"Estudo transversal com 380 mulheres de 25–64 anos cadastradas em quatro ESF, por amostragem aleatória.",
    resultados:"Resultados esperados: estimativa de cobertura por faixa etária e identificação de barreiras de acesso.",
    conclusao:"O projeto deve orientar estratégias locais de ampliação da cobertura no território.",
    palavras:["Neoplasias do colo do útero","Atenção primária","Programas de rastreamento"],
    figuras:[ {ordem:1,secao:"Métodos",legenda:"Fluxo de seleção das ESF participantes",principal:false}, {ordem:2,secao:"Resultados",legenda:"Distribuição da amostra por faixa etária e ESF",principal:true} ] },
  { id:"EX-02", fase:7, desenho:"Revisão sistemática", area:"Endocrinologia",
    titulo:"Metformina versus intervenção dietética isolada na progressão do pré-diabetes: revisão sistemática",
    autores:["C. Discente Exemplo"], orientador:"Orientador Exemplo",
    intro:"O pré-diabetes representa janela de oportunidade para prevenção. Há debate sobre a melhor estratégia inicial.",
    objetivos:"Comparar a eficácia da metformina e da intervenção dietética isolada na progressão para diabetes tipo 2.",
    metodos:"Revisão sistemática em MEDLINE, Embase e Cochrane seguindo PRISMA.",
    resultados:"Síntese qualitativa e, se houver homogeneidade, meta-análise dos desfechos.",
    conclusao:"A síntese deve orientar a conduta inicial no pré-diabetes na atenção primária.",
    palavras:["Estado pré-diabético","Metformina","Dieta"],
    figuras:[ {ordem:1,secao:"Métodos",legenda:"Fluxograma PRISMA da seleção dos estudos",principal:true} ] },
  { id:"EX-03", fase:7, desenho:"Estudo ecológico", area:"Infectologia",
    titulo:"Tendência temporal das internações por dengue no Alto Vale do Itajaí, 2015–2024",
    autores:["D. Discente Exemplo"], orientador:"Orientadora Exemplo",
    intro:"A dengue impõe carga crescente aos serviços de saúde. A análise de tendências apoia o planejamento.",
    objetivos:"Descrever a tendência temporal das internações por dengue na microrregião em dez anos.",
    metodos:"Estudo ecológico de séries temporais com dados do SIH/SUS, com regressão de Prais-Winsten.",
    resultados:"Resultados esperados: identificação de tendência e padrão sazonal das internações.",
    conclusao:"Os achados devem subsidiar o cronograma de ações de controle vetorial.",
    palavras:["Dengue","Séries temporais","Hospitalização"],
    figuras:[ {ordem:1,secao:"Resultados",legenda:"Série temporal das internações por mês (2015–2024)",principal:true} ] },
  { id:"EX-04", fase:8, desenho:"Relato de caso", area:"Pediatria",
    titulo:"Apresentação atípica de lúpus eritematoso sistêmico de início juvenil: relato de caso",
    autores:["E. Discente Exemplo","F. Discente Exemplo"], orientador:"Orientador Exemplo",
    intro:"O LES juvenil pode cursar com apresentações inespecíficas, retardando o diagnóstico.",
    objetivos:"Relatar caso de LES juvenil com apresentação atípica e revisar a literatura pertinente.",
    metodos:"Caso de adolescente com febre prolongada, poliartralgia e citopenias. Consentimento obtido.",
    resultados:"A investigação evidenciou critérios diagnósticos de LES, com boa resposta ao tratamento.",
    conclusao:"O reconhecimento de apresentações atípicas reduz o atraso diagnóstico.",
    palavras:["Lúpus eritematoso sistêmico","Adolescente","Diagnóstico tardio"],
    resumo_completo:"Introdução: o lúpus eritematoso sistêmico de início juvenil pode cursar com apresentações inespecíficas, retardando o diagnóstico. Objetivo: relatar caso de LES juvenil com apresentação atípica e revisar a literatura pertinente. Método: relato de caso de adolescente com febre prolongada, poliartralgia e citopenias, com consentimento obtido. Resultados: a investigação evidenciou critérios diagnósticos de LES, com boa resposta ao tratamento instituído. Conclusão: o reconhecimento de apresentações atípicas reduz o atraso diagnóstico e melhora o prognóstico.",
    figuras:[ {ordem:1,secao:"Resultados",legenda:"Linha do tempo clínica e laboratorial do caso",principal:true} ] },
  { id:"EX-05", fase:8, desenho:"Estudo transversal", area:"Psiquiatria",
    titulo:"Sintomas de ansiedade e qualidade do sono entre estudantes de Medicina: estudo transversal",
    autores:["G. Discente Exemplo"], orientador:"Orientadora Exemplo",
    intro:"A formação médica é reconhecida fonte de sofrimento psíquico.",
    objetivos:"Estimar a prevalência de sintomas de ansiedade e sua associação com a qualidade do sono.",
    metodos:"Estudo transversal com instrumentos validados (GAD-7 e Pittsburgh) aplicados aos estudantes.",
    resultados:"Prevalência elevada de sintomas ansiosos, com associação significativa à má qualidade do sono.",
    conclusao:"Os achados reforçam a necessidade de programas institucionais de apoio à saúde mental.",
    palavras:["Ansiedade","Sono","Estudantes de medicina"],
    resumo_completo:"Introdução: a formação médica é reconhecida fonte de sofrimento psíquico. Objetivo: estimar a prevalência de sintomas de ansiedade e sua associação com a qualidade do sono entre estudantes de Medicina. Método: estudo transversal com instrumentos validados (GAD-7 e índice de Pittsburgh) aplicados aos estudantes. Resultados: observou-se prevalência elevada de sintomas ansiosos, com associação significativa à má qualidade do sono. Conclusão: os achados reforçam a necessidade de programas institucionais de apoio à saúde mental.",
    figuras:[ {ordem:1,secao:"Resultados",legenda:"Distribuição dos escores de ansiedade (GAD-7)",principal:false}, {ordem:2,secao:"Resultados",legenda:"Associação entre ansiedade e qualidade do sono",principal:true} ] },
  { id:"EX-06", fase:8, desenho:"Estudo de coorte", area:"Cardiologia",
    titulo:"Fatores associados à reinternação em 30 dias após insuficiência cardíaca descompensada",
    autores:["H. Discente Exemplo"], orientador:"Orientador Exemplo",
    intro:"A reinternação precoce por IC é marcador de qualidade assistencial e desfecho evitável.",
    objetivos:"Identificar fatores associados à reinternação em 30 dias após internação por IC descompensada.",
    metodos:"Coorte retrospectiva de pacientes internados por IC, com seguimento de 30 dias.",
    resultados:"Fatores como classe funcional avançada e ausência de conciliação medicamentosa associaram-se a maior risco.",
    conclusao:"Intervenções na transição de cuidado podem reduzir reinternações precoces.",
    palavras:["Insuficiência cardíaca","Readmissão","Transição de cuidado"],
    resumo_completo:"Introdução: a reinternação precoce por insuficiência cardíaca é marcador de qualidade assistencial e desfecho evitável. Objetivo: identificar fatores associados à reinternação em 30 dias após internação por IC descompensada. Método: coorte retrospectiva de pacientes internados por IC, com seguimento de 30 dias. Resultados: fatores como classe funcional avançada e ausência de conciliação medicamentosa associaram-se a maior risco. Conclusão: intervenções na transição de cuidado podem reduzir reinternações precoces.",
    figuras:[ {ordem:1,secao:"Resultados",legenda:"Curva de risco de reinternação em 30 dias",principal:true} ] },
];

/* PROGRAMA REAL — cronograma provisório XI SAM (mantido pelo coordenador).
   Item oral:   { tc, hora, area, ap, titulo, uc, id? }
   Item pôster: { n, ap, id? }
   `id` (opcional) = override manual: liga o item exatamente àquele trabalho.
   `youtube` (por dia) = URL FIXA da transmissão ao vivo daquele dia (transmissões
   oficiais da XI SAM); com link, aparece o botão “▶ Assistir ao vivo” no cabeçalho
   do dia; vazio = sem botão. NÃO esvaziar estes links em regenerações. */
const PROGRAMA = {
  "Seg · 22/06": { sci:"16h45–17h45", youtube:"https://www.youtube.com/watch?v=1QSae8MBEvc", abertura:{ hora:"17h45–18h00", label:"Abertura da XI SAM" },
    orais:[
      { tc:"TC1", hora:"18h00", area:"Educação Médica", ap:"Edson Mendes de Oliveira Filho", titulo:"Percepções sobre práticas em saúde e fontes de informação entre estudantes de medicina", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC2", hora:"18h40", area:"Neurologia", ap:"Julia Leticia Dutra", titulo:"Metilfenidato no manejo da síndrome de desregulação dopaminérgica na doença de Parkinson: série de casos", uc:"Samantha Cristiane Lopes" },
      { tc:"TC3", hora:"19h20", area:"Neurologia", ap:"Ana Clara Esser", titulo:"Preditores de gravidade em crianças com TCE em hospital terciário do Alto Vale: coorte retrospectiva", uc:"Alinne Petris" },
      { tc:"TC4", hora:"20h00", area:"Neurocirurgia", ap:"Angelina Castagna Corrêa", titulo:"Fratura da coluna cervical em paciente com tétano: relato de caso", uc:"Samantha Cristiane Lopes" },
      { tc:"TC5", hora:"20h40", area:"Geriatria", ap:"Leticia Ellen dos Santos", titulo:"Avaliação da sarcopenia em idosos de um Centro de Convivência em Santa Catarina", uc:"Alinne Petris" },
      { tc:"TC6", hora:"21h20", area:"Psiquiatria", ap:"Maria Eduarda Coelho", titulo:"Depressão perinatal e seus impactos no desenvolvimento infantil: revisão sistemática", uc:"Franciani Rodrigues da Rocha" },
    ],
    posteres:[ {n:1,ap:"Milena Goedert"},{n:2,ap:"Ana Luíza Tenfen"},{n:3,ap:"Antonella Gubert Verch"},{n:4,ap:"Augusto Henrique Gamba"},{n:5,ap:"Bruna Gonzales Nejm"},{n:6,ap:"Carl Zolet Jonck"} ] },
  "Ter · 23/06": { sci:"17h00–18h00", youtube:"https://www.youtube.com/watch?v=pc-VW8XK82Y",
    orais:[
      { tc:"TC1", hora:"18h00", area:"Medicina de Família e Comunidade", ap:"Larissa Yamaoka Piske", titulo:"Critérios de introdução da dapagliflozina na atenção primária em DM2: coorte retrospectiva", uc:"Samantha Cristiane Lopes" },
      { tc:"TC2", hora:"18h40", area:"Medicina de Família e Comunidade", ap:"Isabela Lamin Klegin", titulo:"Relação entre estresse e IMC em crianças de 10 a 12 anos em escola do Alto Vale", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC3", hora:"19h20", area:"Ginecologia e Obstetrícia", ap:"Kauana Decker", titulo:"Insensibilidade androgênica completa de diagnóstico pré-natal: relato de hospital terciário", uc:"Samantha Cristiane Lopes" },
      { tc:"TC4", hora:"20h00", area:"Oncologia", ap:"Clarice Grasmück", titulo:"Galectina-3 sérica e perfil imunohistoquímico no carcinoma mamário ductal invasivo", uc:"Alinne Petris" },
      { tc:"TC5", hora:"20h40", area:"Otorrinolaringologia", ap:"Yasmim de Abreu Heinz", titulo:"Adenotonsilectomia versus conduta expectante na apneia obstrutiva do sono infantil: revisão sistemática", uc:"Alinne Petris" },
    ],
    posteres:[ {n:1,ap:"Élton Léo Junglos"},{n:2,ap:"Emanuela Tenfen"},{n:3,ap:"Emily Martins Arruda"},{n:4,ap:"Fernando Lima Nogueira"},{n:5,ap:"Gabriel Borella Rosado"},{n:6,ap:"Gabriela Lucia Imhoff"} ] },
  "Qua · 24/06": { sci:"17h00–18h00", youtube:"https://www.youtube.com/watch?v=WGu-ALY8jBM",
    orais:[
      { tc:"TC1", hora:"18h00", area:"Endocrinologia", ap:"Beatriz Meinicke da Silva", titulo:"Parâmetros associados a piores desfechos em internações por cetoacidose diabética", uc:"Samantha Cristiane Lopes" },
      { tc:"TC2", hora:"18h40", area:"Endocrinologia", ap:"Isabella Schiestl Grudtner", titulo:"Impacto do diabetes gestacional nos desfechos materno-fetais: coorte retrospectiva", uc:"Samantha Cristiane Lopes" },
      { tc:"TC3", hora:"19h20", area:"Endocrinologia", ap:"Nicolas Vendrame Crippa", titulo:"Apresentação síncrona de três subtipos de carcinoma tireoidiano: relato de caso", uc:"Samantha Cristiane Lopes" },
      { tc:"TC4", hora:"20h00", area:"Endocrinologia", ap:"Yasmim Antunes Rodrigues", titulo:"Deficiência isolada de GH diagnosticada precocemente e evolução terapêutica: relato de caso", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC5", hora:"20h40", area:"Endocrinologia", ap:"Laila Maria Longen", titulo:"Preservação de células beta no diabetes autoimune latente do adulto (LADA): relato de caso", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC6", hora:"21h20", area:"Endocrinologia", ap:"Maiara Letícia Willers Carrard", titulo:"IA na classificação de nódulos tireoidianos indeterminados: revisão sistemática", uc:"Samantha Cristiane Lopes" },
    ],
    posteres:[ {n:1,ap:"Gabriela Luiza Cezar"},{n:2,ap:"Gabriela Tambosi Catafesta"},{n:3,ap:"Graciane Zemke"},{n:4,ap:"Gercino de Matos Neto"},{n:5,ap:"Henrique de Moraes Andrade"},{n:6,ap:"Jaqueline Klagemberg"} ] },
  "Qui · 25/06": { sci:"17h00–18h00", youtube:"https://www.youtube.com/watch?v=SowwQ5Z28Ow",
    orais:[
      { tc:"TC1", hora:"18h00", area:"Infectologia", ap:"Luísa Rodrigues Bagatoli", titulo:"Internação por neutropenia febril em hospital do interior de SC (2020–2025): coorte retrospectiva", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC2", hora:"18h40", area:"Pediatria", ap:"Ana Julia Barpi", titulo:"Fatores de risco para sepse neonatal em hospital terciário: análise e prevenção", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC3", hora:"19h20", area:"Pediatria", ap:"Isadora Rosa Mergener de Bortolo", titulo:"Perfil das internações por bronquiolite aguda no Alto Vale (2020–2025): estudo transversal", uc:"Alinne Petris" },
      { tc:"TC4", hora:"20h00", area:"Infectologia", ap:"Joana Rosa de Jesus", titulo:"Conhecimento dos médicos da atenção primária sobre hanseníase: coorte prospectiva", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC5", hora:"20h40", area:"Infectologia", ap:"Gabriela Luiza de Andrade Muller", titulo:"Infecções por multirresistentes em internados: perfil epidemiológico e microbiológico", uc:"Alinne Petris" },
      { tc:"TC6", hora:"21h20", area:"Pediatria", ap:"Yasmin dos Prazeres Araujo", titulo:"Síndrome de DRESS após pneumonia necrotizante em paciente pediátrico: relato de caso", uc:"Alinne Petris" },
    ],
    posteres:[ {n:1,ap:"Jaqueline Vansuita"},{n:2,ap:"Kalessa Pereira Menegusse"},{n:3,ap:"Kaylaine Rodrigues Almeida Andrade"},{n:4,ap:"Leandro Iomes de Souza"},{n:5,ap:"Luísa Fronza Gomes"},{n:6,ap:"Manuella Knop Dos Passos"},{n:7,ap:"Maria Luísa Ceolin Xavier da Silveira"} ] },
  "Sex · 26/06": { sci:"16h20–17h20", youtube:"https://www.youtube.com/watch?v=KfSxB-WxbVw",
    orais:[
      { tc:"TC2", hora:"18h00", area:"Cirurgia Vascular", ap:"Rafaela Fritsche", titulo:"Estratégias terapêuticas na doença arterial obstrutiva periférica no Alto Vale: coorte retrospectiva", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC3", hora:"18h40", area:"Cardiologia", ap:"Ana Paula Deluca", titulo:"Valor prognóstico de biomarcadores e escore clínico no IAM com supra de ST", uc:"Alinne Petris" },
      { tc:"TC4", hora:"19h20", area:"Cardiologia", ap:"Carlos Gabriel Maiberg", titulo:"Internações e óbitos por IAM no Brasil antes, durante e após a pandemia: estudo ecológico", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC5", hora:"20h00", area:"Cardiologia", ap:"Milena Dal Witt de Souza", titulo:"Betabloqueadores na IC com fração de ejeção preservada: revisão sistemática e meta-análise", uc:"Samantha Cristiane Lopes" },
      { tc:"TC6", hora:"20h40", area:"Cardiologia", ap:"Marcel Felipe Alves", titulo:"Disfunção diastólica do VE induzida por quimioterapia à ecocardiografia: revisão e meta-análise", uc:"Alinne Petris" },
      { tc:"TC7", hora:"21h20", area:"Neurologia", ap:"Fábio Valerio Borelli", titulo:"Tirofiban na recanalização de primeira passagem em trombectomia no AVC agudo: revisão e meta-análise", uc:"Samantha Cristiane Lopes" },
    ],
    posteres:[ {n:1,ap:"Milena Ferreira de Souza"},{n:2,ap:"Abraham Lincoln Galdino Costa"},{n:3,ap:"Millena Laurindo"},{n:4,ap:"Rodrigo Voigt Filho"},{n:5,ap:"Sofia Venturi"},{n:6,ap:"Suelen Dias Clasen"},{n:7,ap:"Victória Gabriela Wetzstein"} ] },
};

/* trabalhoById: resolve nos EXEMPLOS — uso interno/dev. As telas públicas
   resolvem na lista real via useTrabalhos()/trabalhoNaLista (lib.jsx). */
const trabalhoById = (id) => TRABALHOS.find((t) => t.id === id);
const go = (h) => { window.location.hash = h; };

Object.assign(window, { C, AREA_COR, DIAS, TRABALHOS, PROGRAMA, trabalhoById, go });
