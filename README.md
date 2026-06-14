# XI SAM 2026 · Medicina UNIDAVI — site V3

Site estático (HTML + JSX via Babel no navegador) para o congresso. Deploy no
Vercel: arquivos na raiz + `vercel.json` (`cleanUrls`). Sem build step.

## Páginas
- `index.html` — telão público / programação / pôster no telão
- `telao.html` — telão por estação
- `submissao.html` — submissão de trabalhos (gera o pôster + parecer da IA)
- `curadoria.html` — curadoria (conteúdo + ajuste de layout opcional)

## Motor de diagramação (V3)
- `motor.jsx` — scorer determinístico (gera candidatos, mede fill/vazio/
  proeminência/balance/overflow, escolhe o melhor; refino imperativo do `s`).
- `motor-view.jsx` — `PosterLandscapeV3` (cabeçalho + corpo do motor + rodapé).
- `esquema.js` — campos/âncoras/rótulos por desenho (Relato de caso vs demais).
- `juiz.jsx` — juiz com visão: em produção chama o backend (Gemini); no preview
  Claude usa `window.claude`. Degrada para a escolha do scorer se indisponível.

## `ajuste_layout`
Descritor do layout escolhido — `{"v":3,"template":"lateral","cols":2,"heroFrac":0.46}`.
Flui submissão → curadoria → telão. O backend (Apps Script) só transporta.

## Backend (Apps Script — fora deste repo)
A URL `/exec` está nos arquivos. O juiz de layout precisa do handler Gemini
(`action: "julgar_layout"`) e da `GEMINI_API_KEY` nas Script Properties — ver
`backend-juiz-gemini.gs` (mantido no projeto de origem, não neste deploy).

## A ajustar antes/depois do deploy
- As meta tags `og:image` / `twitter:image` em `index.html` apontam para o
  domínio antigo (`xi-sam-unidavi.vercel.app`). Atualize para o domínio novo.
