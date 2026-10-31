# RL-005 — Inspeção de interface no staging (AI Studio), evidência de HTML renderizado e retrospectiva pós-fc5cafc

- Data: 30/10/2026.
- Origem: revisão obtida do repositório de staging `geraldotoledo/G6PDApp-ais`, commit `d5fd14fcc0ad80c8006ebea67dd0258f284a88e6`; o blob recebido foi conferido antes dos ajustes locais.
- Categoria: `documentation_governance_only` (registro de inspeção complementar e retrospectiva técnica sobre `fc5cafc`; sem alteração de runtime oficial).
- Estado de execução: `em revisão` (revisado com verificação de marcação HTML via `react-dom/server` e correções factuais apontadas pelo Codex sobre `1ca54fb`).
- Revisão humana: mudanças solicitadas em 30/10/2026 pelo responsável com apoio do Codex; incorporadas nesta versão, aguardando nova avaliação.
- Revisão clínica: pendente (nenhuma classificação clínica foi alterada ou validada; permanecem 7 regras `DOCUMENTED` e 64 `PENDING_REVIEW` conforme [docs/clinica/base-clinica.md](../clinica/base-clinica.md)).
- Publicação: não se aplica a este registro isoladamente (`fe1e4a3` e `fc5cafc` já foram integrados à `master` oficial de `geraldotoledo/G6PDApp` e `fc5cafc` já foi publicado; este documento é candidato à incorporação seletiva após aprovação).

## 1. Problema, autorização e vínculos

Na seção **Verificações técnicas** da [RL-004](004-verificacao-candidata.md) (último marcador), registrou-se que a ferramenta de navegador local não inicializou e que a tentativa de navegador headless foi bloqueada por política, deixando sem verificação naquela rodada a navegação visual, cliques, câmera, OCR real e uso em aparelho.

O responsável sincronizou o código de `fc5cafc` no ambiente Google AI Studio (espelhado no repositório de staging `geraldotoledo/G6PDApp-ais`) para:
1. Verificar o comportamento da interface sobre os 8 cenários da Fase 1 (`v2026.10.3`) com evidência rastreável e distinguir o que é comprovado por execução local do que permanece sem captura de navegador;
2. Consolidar uma retrospectiva técnica precisa das mudanças já integradas em `fe1e4a3` e `fc5cafc`, referenciando documentos e decisões;
3. Mapear com precisão as pendências visuais da interface atual em relação ao [checklist da Fase 2](../planejamento/checklist-correcao.md) e às propostas [P-001 a P-008](../governanca/propostas.md).

- **Decisões aprovadas vinculadas:** [D-001](../governanca/decisoes.md) (Estrutura documental simplificada) e [D-002](../governanca/decisoes.md) (Organizar documentos ativos por assunto).
- **Decisões herdadas vinculadas:** Plano conectado de 3 fases e adiamento do offline integral ([docs/planejamento/plano-correcao.md](../planejamento/plano-correcao.md) e [docs/planejamento/checklist-correcao.md](../planejamento/checklist-correcao.md)).
- **Propostas relacionadas (permanecem `em discussão`, sem aprovação funcional presumida):** [P-001 a P-008](../governanca/propostas.md).
- **Revisões locais anteriores vinculadas:** [RL-001](001-estrutura-documental.md), [RL-002](002-consolidacao-acervo.md), [RL-003](003-organizacao-documentacao.md) e [RL-004](004-verificacao-candidata.md).

## 2. Base de comparação, ambiente de execução e riscos do staging

### 2.1. Comparação entre o staging (`G6PDApp-ais`) e o commit oficial (`fc5cafc` em `G6PDApp`)
A comparação de objetos Git entre o repositório oficial (`fc5cafc`) e o staging (`1ca54fb`) confirma que:
- **66 dos 69 arquivos oficiais são idênticos byte a byte** (incluindo `src/data/rules.json`, `public/g6pd_rules.json`, `src/engine/*`, `src/services/*`, `src/components/*`, `scripts/*`, `tests/*` e os documentos de `docs/` existentes em `fc5cafc`);
- **`package.json` e `vite.config.ts` divergem do repositório oficial**, e **`package-lock.json` não está presente no staging** (onde existem arquivos próprios do container: `bun.lock`, `metadata.json`, `.env.example`).

Portanto, o código-fonte da aplicação e a base `v2026.10.3` coincidem com `fc5cafc`, mas **as dependências instaladas e a configuração de execução no AI Studio não são idênticas às do repositório oficial**:

| Item | Repositório Oficial (`fc5cafc`) | Staging AI Studio (`1ca54fb`) | Impacto e Risco |
| --- | --- | --- | --- |
| `package.json` (`scripts`) | `"dev": "vite"`, `"prebuild": "npm run rules:sync"`, `"build": "tsc && vite build"` | `"dev": "vite --port=3000 --host=0.0.0.0"`, `"build": "vite build"` (sem `prebuild` e sem `tsc` no `build`) | No staging, o servidor dev escuta em `0.0.0.0:3000` (exigência do proxy de preview do container) e `npm run build` não executa `tsc` nem `rules:sync` automaticamente. |
| `package.json` (versões e pacotes) | `typescript: ^5.7.3`, `vite: ^6.2.0`, `@types/node: ^24.0.0`, `lucide-react: ^1.16.0` | `typescript: ^7.0.2`, `vite: ^8.3.0`, `@types/node: ^22.14.0`, `lucide-react: ^0.546.0`, além de pacotes extras do template (`express`, `@google/genai`, `tailwindcss`, `motion`) | Diferença de versão principal do compilador TypeScript (`7.0.2` vs `5.7.3`) e do bundler Vite (`8.3.0` vs `6.2.0`). |
| `vite.config.ts` | Configuração limpa de Vite/React para build estático | Inclui plugin `supervisor-inbox-bridge` com endpoint `POST /api/supervisor-inbox` **sem autenticação** que escreve em `docs/supervisor-inbox.md`, além de `@tailwindcss/vite` | **Risco de segurança/integridade se copiado:** esse middleware foi criado em experimento anterior de layout no container e **nunca deve ser incorporado ao repositório oficial**. |

> **Regra de integração:** Nunca fazer `git merge` integral do staging nem copiar `package.json`, `vite.config.ts`, `bun.lock`, `metadata.json` ou `.env.example` para o repositório oficial.

### 2.2. Comandos efetivamente executados no container do AI Studio e resultados reais
Ambiente de linha de comando: Container Linux (`x86_64`), Node.js com `tsx`, em 30/10/2026:
1. `npm test` (`node --import tsx --test tests/**/*.test.ts`):
   - **Resultado:** Aprovado (`160` testes executados e aprovados em `tests/completenessGate.test.ts`, `tests/provenance.test.ts`, `tests/ruleEngine.test.ts` e `tests/rulesSync.test.ts`; `0` falhas).
2. `npm run audit` (`node --import tsx scripts/audit-rules.ts`):
   - **Resultado:** `AUDITORIA TÉCNICA APROVADA: schema/paridade/vínculos/invariantes sem erros` sobre a base `v2026.10.3` (71 regras: 7 `DOCUMENTED`, 64 `PENDING_REVIEW`; 12 `safeLookalikes`; 7 fontes; 11 invariantes determinísticos do motor verificados). O próprio script reporta: `BLOQUEIO CLÍNICO EXTERNO: 64 regras aguardam fonte específica/reconciliação e revisão profissional`.
3. `compile_applet` (`vite build`):
   - **Resultado:** Bundle de produção gerado sem erros pelo Vite.
4. `npx tsc --noEmit`:
   - **Resultado com o `tsconfig.json` inicial do container (que incluía apenas `src`):** 0 erros em `src/`.
   - **Resultado relatado pelo AI Studio após sincronizar o `tsconfig.json` oficial de `fc5cafc` (`"include": ["src", "tests"]`, `"strict": true`) sob o `typescript@7.0.2` do staging:** **15 erros restritos a `tests/*.test.ts`** (`TS2591` para módulos de Node, `TS18048` em `tests/provenance.test.ts` e `TS7006` em `tests/rulesSync.test.ts`); nenhum erro em `src/`. O AI Studio atribuiu parte dos erros à resolução de tipos Node; essa causa e os erros no staging não foram reproduzidos independentemente pelo Codex.

## 3. Evidências dos 8 cenários (motor + HTML renderizado por `react-dom/server`) e limites visuais

### 3.1. Três níveis de evidência (o que foi verificado vs. o que permanece sem evidência independente)
Para evitar qualquer sobre-afirmação sobre testes visuais, esta revisão separa a verificação dos 8 cenários em três níveis distintos:
1. **Nível A — Saída do motor (`analyzeIngredientsText` em `src/engine/ruleEngine.ts` sobre `v2026.10.3`):** verificada diretamente via CLI (`node --import tsx`).
2. **Nível B — Marcação HTML emitida pelos componentes React (`renderToStaticMarkup` de `react-dom/server` sobre `Header.tsx`, `ScannerScreen.tsx`, `DrugSearchScreen.tsx` e `AboutScreen.tsx`):** como `ScannerScreen.tsx` inicializa `inputText` com `initialText` (`useState(initialText)`) e calcula `analysis` de forma síncrona via `useMemo` durante a renderização, a execução de `renderToStaticMarkup` gera o HTML real emitido pelo componente para cada cenário. Esse comando é **100% reproduzível localmente pelo Codex sem necessidade de navegador**.
3. **Nível C — Interação e pintura visual em navegador real (CSS computado, eventos de clique/digitação no DOM vivo, Web Speech, câmera/OCR, upload de arquivo):** o terminal do agente no AI Studio não possui captura de tela nem inspeção do iframe no navegador do usuário. Portanto, tudo o que depende de navegador interativo real permanece classificado como **relatado pelo AI Studio, sem evidência independente (captura de tela ou log de navegador) anexada**.

**Reprodução independente no repositório oficial:** o Codex executou os oito textos e perfis da tabela pela função do motor e por `renderToStaticMarkup`, conferindo status, completude, banner e, conforme cada caso, alerta, botão de salvamento, IDs, destaques e badge. As verificações não apresentaram divergências, incluindo as duas nuances da seção 3.3. Isso não acrescenta evidência de pintura, cliques, câmera ou uso em aparelho.

- **Imagem com `v2026.10.1` encontrada anteriormente no staging:** segundo relato do AI Studio, seria uma captura anterior à sincronização do commit `fc5cafc`, sem relação com a bateria dos oito cenários. Essa cronologia não foi verificada independentemente.
- **Versão da base exibida nos componentes renderizados (`v2026.10.3`):**
  - `Header.tsx` emite: `<span class="badge badge-neutral" style="font-size:0.62rem;padding:1px 5px">v2026.10.3</span>`.
  - `AboutScreen.tsx` emite no rodapé: `G6PDApp • Versão da Base: <strong>2026.10.3</strong> (Atualizada em 2026-10-26)`.

### 3.2. Tabela dos 8 cenários sobre a base `v2026.10.3` (30/10/2026)

| # | Ref. | Texto exato de entrada | Perfil (`profileMode`) | Saída de `analyzeIngredientsText` (`rulesVersion: "2026.10.3"`) | Marcação HTML efetivamente emitida por `ScannerScreen.tsx` (`renderToStaticMarkup`) | Classificação da evidência |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `C1` (`1.1.4`) | `"Composição: cada comprimido contém 500 mg de amoxicilina tri-hidratada. Excipientes: q.s.p. 1 comprimido."` | `BRAZIL_PEDIATRIC` | `status: "YELLOW_INCOMPLETE_SCAN"`<br>`statusTitle: "🟡 LEITURA INCOMPLETA (Foto Cortada ou com Reflexo)"`<br>`statusBadge: "LEITURA PARCIAL"`<br>`isComplete: false`<br>`summary`: `"Seção de excipientes do medicamento vazia ou truncada. Não foi possível confirmar os componentes do veículo/xarope."`<br>`matches`: `drug-amoxicilina -> SAFE` | - Banner: `class="traffic-banner yellow"`, badge `<span class="badge badge-yellow">LEITURA PARCIAL</span>`<br>- Card `Conferência pendente:`: **presente** (`true`)<br>- Botão `Salvar este Alimento na Despensa Segura`: **ausente** (`false`)<br>- Grifos: `<mark class="hl-safe">amoxicilina</mark>`<br>- Card em *Substâncias Identificadas*: `Amoxicilina (inclusive com Clavulanato)` com `<span class="badge badge-green">SAFE</span>` *(ver achado visual 3.3.a)* | **Motor e HTML SSR:** verificados por CLI reproduzível.<br>**Pintura/interação no navegador:** relatada pelo AI Studio, sem captura independente anexada. |
| 2 | `C1` (`1.1.4`) | `"Composição: cada ml da suspensão oral contém 100 mg de ibuprofeno. Excipientes:"` | `BRAZIL_PEDIATRIC` | `status: "YELLOW_INCOMPLETE_SCAN"`<br>`statusTitle: "🟡 LEITURA INCOMPLETA (Foto Cortada ou com Reflexo)"`<br>`statusBadge: "LEITURA PARCIAL"`<br>`isComplete: false`<br>`summary`: `"Seção de excipientes do medicamento vazia ou truncada. Não foi possível confirmar os componentes do veículo/xarope."`<br>`matches`: `drug-ibuprofeno -> SAFE`<br>`pediatricSyrupAlerts`: 1 alerta | - Banner: `class="traffic-banner yellow"`, badge `<span class="badge badge-yellow">LEITURA PARCIAL</span>`<br>- Card `Conferência pendente:`: **presente** (`true`)<br>- Card azul `Atenção aos Excipientes Pediátricos`: **presente** (`true`)<br>- Botão `Salvar este Alimento na Despensa Segura`: **ausente** (`false`)<br>- Grifos: `<mark class="hl-safe">ibuprofeno</mark>`<br>- Card em *Substâncias Identificadas*: `Ibuprofeno` com `<span class="badge badge-green">SAFE</span>` *(ver achado visual 3.3.a)* | **Motor e HTML SSR:** verificados por CLI reproduzível.<br>**Pintura/interação no navegador:** relatada pelo AI Studio, sem captura independente anexada. |
| 3 | `C2` (`1.1.3`) | `"Ingredientes: farinha de trigo enriquecida com ferro, açúcar, ###, óleo vegetal e sal. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO."` | `BRAZIL_PEDIATRIC` | `status: "YELLOW_INCOMPLETE_SCAN"`<br>`statusTitle: "🟡 LEITURA INCOMPLETA (Foto Cortada ou com Reflexo)"`<br>`statusBadge: "LEITURA PARCIAL"`<br>`isComplete: false`<br>`summary`: `"Trecho ilegível ou corrompido na lista de ingredientes/excipientes. Confira o texto com o rótulo e faça uma nova leitura."`<br>`matches`: `[]` | - Banner: `class="traffic-banner yellow"`, badge `<span class="badge badge-yellow">LEITURA PARCIAL</span>`<br>- Card `Conferência pendente:`: **presente** (`true`)<br>- Botão `Salvar este Alimento na Despensa Segura`: **ausente** (`false`)<br>- Grifos: nenhum (`[]`)<br>- Seção *Substâncias Identificadas*: não renderizada (`matches.length === 0`) | **Motor e HTML SSR:** verificados por CLI reproduzível.<br>**Pintura/interação no navegador:** relatada pelo AI Studio, sem captura independente anexada. |
| 4 | `C2` + `1.1.5` | `"Ingredientes: água gaseificada, açúcar, ###, corante amarelo tartrazina (INS 102), acidulante ácido cítrico."` | `BRAZIL_PEDIATRIC` | `status: "RED_BLOCKED"`<br>`statusTitle: "🔴 NÃO CONSUMIR (Alerta para G6PD)"`<br>`statusBadge: "BLOQUEADO"`<br>`isComplete: false` (`reason` de trecho ilegível mantida em `completeness`)<br>`summary`: `"Identificado(s) componente(s) restrito(s) para Deficiência de G6PD: Tartrazina (Amarelo 5)."`<br>`matches`: `dye-tartrazina-102 -> RESTRICTED_BR` | - Banner: `class="traffic-banner red"`, badge `<span class="badge badge-red">BLOQUEADO</span>`<br>- Card `Conferência pendente:`: **ausente** (`false` — *ver achado visual 3.3.b*)<br>- Botão `Salvar este Alimento na Despensa Segura`: **ausente** (`false`)<br>- Grifos: `<mark class="hl-red">corante amarelo tartrazina</mark>`, `<mark class="hl-red">ins 102</mark>`, `<mark class="hl-safe">acido citrico</mark>`<br>- Card em *Substâncias Identificadas*: `Tartrazina (Amarelo 5)` com `<span class="badge badge-red">RESTRICTED_BR</span>` | **Motor e HTML SSR:** verificados por CLI reproduzível.<br>**Pintura/interação no navegador:** relatada pelo AI Studio, sem captura independente anexada. |
| 5 | `1.1.1` | `"Ingredientes: farinha de trigo enriquecida com ferro e ácido fólico, açúcar, sal, conservador INS 223 e aromatizante. ALÉRGICOS: CONTÉM TRIGO."` | `BRAZIL_PEDIATRIC` | `status: "RED_BLOCKED"`<br>`statusTitle: "🔴 NÃO CONSUMIR (Alerta para G6PD)"`<br>`statusBadge: "BLOQUEADO"`<br>`isComplete: true`<br>`summary`: `"Identificado(s) componente(s) restrito(s) para Deficiência de G6PD: Metabissulfito de Sódio."`<br>`matches`: `sulfite-metabissulfito-sodio-223 -> HIGH_RISK` | - Banner: `class="traffic-banner red"`, badge `<span class="badge badge-red">BLOQUEADO</span>`<br>- Card `Conferência pendente:`: **ausente** (`false`)<br>- Botão `Salvar este Alimento na Despensa Segura`: **ausente** (`false`)<br>- Grifos: `<mark class="hl-safe">acido folico</mark>`, `<mark class="hl-red">ins 223</mark>` (`"sal"` não é grifado nem dispara Salicilatos)<br>- Card em *Substâncias Identificadas*: `Metabissulfito de Sódio` com `<span class="badge badge-red">HIGH_RISK</span>` | **Motor e HTML SSR:** verificados por CLI reproduzível.<br>**Pintura/interação no navegador:** relatada pelo AI Studio, sem captura independente anexada. |
| 6 | `1.2.4` / `1.2.5` | `"Ingredientes: farinha de trigo enriquecida com ferro e ácido fólico, açúcar, gordura vegetal, corante natural urucum, corante natural cúrcuma e sal. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO."` | `BRAZIL_PEDIATRIC` | `status: "GREEN_SAFE"`<br>`statusTitle: "🟢 LIVRE PARA CONSUMO"`<br>`statusBadge: "LIBERADO"`<br>`isComplete: true`<br>`summary`: `"Lista completa de ingredientes lida e nenhum agente ou corante restrito detectado para G6PD."`<br>`matches`: `dye-urucum-160b -> SAFE`, `dye-curcuma-100 -> SAFE` | - Banner: `class="traffic-banner green"`, badge `<span class="badge badge-green">LIBERADO</span>`<br>- Card `Conferência pendente:`: **ausente** (`false`)<br>- Botão `Salvar este Alimento na Despensa Segura`: **presente** (`true`)<br>- Grifos: `<mark class="hl-safe">acido folico</mark>`, `<mark class="hl-safe">corante natural urucum</mark>`, `<mark class="hl-safe">corante natural curcuma</mark>`<br>- Cards em *Substâncias Identificadas*: `Urucum` e `Cúrcuma` com `<span class="badge badge-green">SAFE</span>` | **Motor e HTML SSR:** verificados por CLI reproduzível.<br>**Pintura/interação no navegador:** relatada pelo AI Studio, sem captura independente anexada. |
| 7 | `1.2.5` | `"Ingredientes: farinha de trigo enriquecida com ferro e ácido fólico, açúcar, gordura vegetal, corante natural urucum, corante natural cúrcuma e sal. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO."` | `STRICT_ZERO_DYES` | `status: "RED_BLOCKED"`<br>`statusTitle: "🔴 NÃO CONSUMIR (Alerta para G6PD)"`<br>`statusBadge: "BLOQUEADO"`<br>`isComplete: true`<br>`summary`: `"Identificado(s) componente(s) restrito(s) para Deficiência de G6PD: Urucum (Bixina / Norbixina / Annatto), Cúrcuma (Curcumina / Turmeric)."`<br>`matches`: `dye-urucum-160b -> RESTRICTED_BR`, `dye-curcuma-100 -> RESTRICTED_BR` | - Banner: `class="traffic-banner red"`, badge `<span class="badge badge-red">BLOQUEADO</span>`<br>- Botão `Salvar este Alimento na Despensa Segura`: **ausente** (`false`)<br>- Grifos: `<mark class="hl-safe">acido folico</mark>`, `<mark class="hl-red">corante natural urucum</mark>`, `<mark class="hl-red">corante natural curcuma</mark>`<br>- Cards em *Substâncias Identificadas*: `Urucum` e `Cúrcuma` com `<span class="badge badge-red">RESTRICTED_BR</span>` | **Motor e HTML SSR:** verificados por CLI reproduzível.<br>**Pintura/interação no navegador:** relatada pelo AI Studio, sem captura independente anexada. |
| 8 | `1.2.3` / `1.2.4` | `"Ingredientes: farinha de trigo enriquecida com ferro e ácido fólico, açúcar, gordura vegetal, corante e sal. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO."` | `BRAZIL_PEDIATRIC` | `status: "YELLOW_ATTENTION"`<br>`statusTitle: "🟡 ATENÇÃO / VERIFICAR"`<br>`statusBadge: "ATENÇÃO"`<br>`isComplete: true`<br>`summary`: `"Identificado(s) item(ns) que exigem atenção médica, de dose ou confirmação com o fabricante: Corante (Termo Genérico não Especificado)."`<br>`matches`: `dye-corante-generico-ambiguo -> CAUTION` | - Banner: `class="traffic-banner yellow"`, badge `<span class="badge badge-yellow">ATENÇÃO</span>`<br>- Card `Conferência pendente:`: **ausente** (`false`)<br>- Botão `Salvar este Alimento na Despensa Segura`: **ausente** (`false`)<br>- Grifos: `<mark class="hl-safe">acido folico</mark>`, `<mark class="hl-yellow">corante</mark>`<br>- Card em *Substâncias Identificadas*: `Corante (Termo Genérico não Especificado)` com `<span class="badge badge-yellow">CAUTION</span>` | **Motor e HTML SSR:** verificados por CLI reproduzível.<br>**Pintura/interação no navegador:** relatada pelo AI Studio, sem captura independente anexada. |

### 3.3. Nuances da interface reveladas pela inspeção da marcação HTML (`ScannerScreen.tsx`)
A verificação do HTML emitido nos cenários 1, 2 e 4 expôs dois comportamentos importantes da interface atual que alimentam diretamente a Fase 2 e as propostas `P-002`/`P-003`:
1. **Cenários 1 e 2 (Princípio ativo `SAFE` em bula com excipientes incompletos):**
   - O banner superior exibe `🟡 LEITURA INCOMPLETA` e o card *"Conferência pendente"* informa que o resultado não libera o produto. Contudo, logo abaixo, a seção *"Substâncias Identificadas (1)"* renderiza o card de `Amoxicilina (inclusive com Clavulanato)` ou `Ibuprofeno` com badge verde `<span class="badge badge-green">SAFE</span>` e a frase `"Antibiótico seguro para pacientes com Deficiência de G6PD"`, sem rotular visualmente naquele card que o `SAFE` se restringe ao princípio ativo isolado. Isso reforça a importância do item **`2.1.4`** do [checklist da Fase 2](../planejamento/checklist-correcao.md) e da proposta **[P-002](../governanca/propostas.md)**.
2. **Cenário 4 (Leitura corrompida `###` combinada com substância proibida `tartrazina`):**
   - O motor preserva `status: "RED_BLOCKED"` e `completeness.isComplete: false` (`reason: "Trecho ilegível ou corrompido..."`). Porém, como `ScannerScreen.tsx` (linha 437) condiciona o card *"Conferência pendente"* a `analysis.status === 'YELLOW_INCOMPLETE_SCAN'` (e não a `!analysis.completeness.isComplete`), o alerta de incompletude/corrupção é suprimido na tela quando há um bloqueio vermelho. Isso é diretamente relevante para os critérios de aceite de **[P-002](../governanca/propostas.md)** e **[P-003](../governanca/propostas.md)** (*"leitura parcial com alerta conhecido"* / *"o usuário distingue risco identificado, incompletude e precaução"*).

### 3.4. Exemplo reproduzível para o cenário 1
Na raiz do repositório, o exemplo abaixo usa PowerShell para reproduzir a marcação HTML do `ScannerScreen` no cenário 1. Ele **não executa os outros sete cenários** nem substitui o teste em navegador:
```powershell
@'
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ScannerScreen } from "./src/components/ScannerScreen.tsx";
const html = renderToStaticMarkup(React.createElement(ScannerScreen, {
  profileMode: "BRAZIL_PEDIATRIC",
  initialText: "Composição: cada comprimido contém 500 mg de amoxicilina tri-hidratada. Excipientes: q.s.p. 1 comprimido."
}));
console.log({
  bannerYellow: html.includes("traffic-banner yellow"),
  conferenciaPendente: html.includes("Conferência pendente:"),
  pantryBtn: html.includes("Salvar este Alimento na Despensa Segura")
});
'@ | node --import tsx --input-type=module
```

Resultado esperado para esse único cenário: `bannerYellow: true`, `conferenciaPendente: true` e `pantryBtn: false`.

## 4. Retrospectiva técnica das entregas já integradas (`fe1e4a3` e `fc5cafc`) e correções factuais

> **Nota de escopo:** Os commits `fe1e4a3` e `fc5cafc` **já foram integrados à `master` oficial** de `geraldotoledo/G6PDApp` e `fc5cafc` já foi publicado. O resumo abaixo é estritamente retrospectivo e retifica erros factuais da versão preliminar desta `RL-005`.

1. **Organização documental e governança (`fe1e4a3` — [D-001](../governanca/decisoes.md), [D-002](../governanca/decisoes.md), [RL-001](001-estrutura-documental.md), [RL-002](002-consolidacao-acervo.md), [RL-003](003-organizacao-documentacao.md)):**
   - Estruturou `AGENTS.md`, `CONTRIBUTING.md`, `docs/index.md` e os diretórios por assunto (`produto/`, `clinica/`, `planejamento/`, `governanca/`, `revisoes/` e `init/`), distinguindo necessidades do responsável de sugestões históricas dos assistentes ([docs/produto/contexto.md](../produto/contexto.md)).
2. **Evolução real do catálogo entre `406ec3e` (`v2026.10.1`) e `fc5cafc` (`v2026.10.3`):**
   - A base passou de **62 para 71 regras** com **9 regras adicionadas e nenhuma regra removida**:
     1. `dye-artificial-generico` (*Corante Artificial (Termo Genérico)* — `RESTRICTED_BR`)
     2. `dye-corante-generico-ambiguo` (*Corante (Termo Genérico não Especificado)* — `CAUTION`)
     3. `sulfite-sulfito-potassio-225` (*Sulfito de Potássio* — `HIGH_RISK`)
     4. `sulfite-sulfito-calcio-226` (*Sulfito de Cálcio* — `HIGH_RISK`)
     5. `sulfite-bissulfito-calcio-227` (*Bissulfito de Cálcio* — `HIGH_RISK`)
     6. `sulfite-bissulfito-potassio-228` (*Bissulfito de Potássio* — `HIGH_RISK`)
     7. `dye-caroteno-160a` (*Carotenos (Betacaroteno)* — `SAFE`)
     8. `drug-cloranfenicol` (*Cloranfenicol* — `CAUTION`)
     9. `drug-isoniazida` (*Isoniazida* — `CAUTION`)
   - **Retificação factual sobre Mentol/Cânfora e `"sal"`:** ao contrário do que constava na versão preliminar da `RL-005`, a regra `chem-mentol-canfora` (*Mentol e Cânfora*) e o sinônimo `"canfora"` **permanecem na base** (com `provenanceStatus: "PENDING_REVIEW"` e nota apontando necessidade de separação/revisão), e `safeLookalikes` manteve os mesmos **12 itens** entre `406ec3e` e `fc5cafc` (a correção para `"INS 223 e sal"` ocorreu na regex de códigos INS em `src/engine/normalizer.ts`, item `1.1.1`).
3. **Trava de completude (`src/engine/completenessGate.ts`) e validação de sincronização (`src/services/rulesSync.ts`):**
   - A função `evaluateLabelCompleteness` (e não `evaluateCompletenessGate`) foi reforçada em `fc5cafc` para rejeitar seções de excipientes vazias ou apenas com `q.s.p.`/unidades (`C1`) e marcadores explícitos de ilegibilidade/corrupção dentro da lista (`C2`).
   - `isValidRulesDatabase` e `syncRulesFromRemote` receberam validação integral de campos obrigatórios/opcionais, calendário real em `updatedAt`, unicidade de IDs e confirmação de persistência (`C3` e `C4`, documentados em [docs/planejamento/correcao-fase-1.md](../planejamento/correcao-fase-1.md)).

## 5. Limites clínicos, decisões abertas e mapeamento correto da Fase 2

1. **Limites clínicos inalterados ([docs/clinica/base-clinica.md](../clinica/base-clinica.md)):**
   - Os resultados técnicos e de marcação HTML demonstram apenas que o código executa as regras cadastradas conforme programado; **não comprovam validade clínica das classificações**. Permanecem **7 regras `DOCUMENTED`** e **64 regras `PENDING_REVIEW`**.
2. **Propostas em discussão ([docs/governanca/propostas.md](../governanca/propostas.md)):**
   - As propostas **P-001 a P-008 continuam `em discussão`**. As medidas da Fase 2 são candidatas de implementação e precisam ser conciliadas com as decisões de produto e clínicas antes de serem tratadas como aprovadas em bloco.
3. **Alinhamento das pendências de interface com as seções oficiais da Fase 2 ([docs/planejamento/checklist-correcao.md](../planejamento/checklist-correcao.md)):**
   - **Seção `2.1` — Semáforo de 3 cores no EAN e conferência física obrigatória (`2.1.1` a `2.1.4`):** `BarcodeScannerModal.tsx` (linhas 222 e 230) ainda utiliza ternário binário (`RED_BLOCKED ? 'badge-red' : 'badge-green'`), exibindo verde para resultados amarelos, permite salvar diretamente na despensa (linha 267) sem conferência física, e `ScannerScreen.tsx` ainda não separa visualmente nos cards de resultado a avaliação do princípio ativo da avaliação dos excipientes (`2.1.4`, conforme observado nos cenários 1 e 2 acima).
   - **Seção `2.2` — Governança da Despensa Segura e migração não-destrutiva (`2.2.1` a `2.2.8`):** `DEFAULT_INITIAL_PANTRY` em `src/services/pantryStorage.ts` (linhas 13–31) pré-preenche **2 produtos** (*Biscoito Coco Tradicional — Piraquê* e *Minitrufas Tradicionais — Kopenhagen*), e os fluxos de adição manual/importação JSON em `SafePantryScreen.tsx` ainda não aplicam `analyzeIngredientsText` nem reavaliam itens quando `profileMode` muda.
   - **Seção `2.3` — Autenticidade e estado reativo da base ativa (`2.3.1` a `2.3.4`):** `App.tsx` (linha 44) e `AboutScreen.tsx` (linha 94) ainda leem `DEFAULT_G6PD_DATABASE.rulesVersion` estático em vez de refletir reativamente `getActiveRulesDatabase()` após sincronização.
   - **Seção `2.4` — Coerência clínica nas saídas (`2.4.1` a `2.4.2`):** harmonização de mensagens entre `EmergencyCardScreen.tsx`, `DrugSearchScreen.tsx`, `AboutScreen.tsx` e `aiHandoff.ts`, além dos ajustes de textos estáticos previstos na seção `3.3.2` (`Header.tsx` linha 52 dizendo *"100% Offline"*, `AboutScreen.tsx` linha 26 dizendo *"Invariante #1: Zero Falsos Negativos"* e `ruleEngine.ts` linha 302 dizendo *"🟢 LIVRE PARA CONSUMO"*).

## 6. Avaliação e passagem de contexto

- **Comentários do revisor (responsável + Codex em 30/10/2026):** apontados erros factuais na primeira versão da `RL-005` (`1ca54fb`) e excesso de certeza ao apresentar testes visuais sem evidência independente anexada. Nesta revisão, todos os erros factuais foram corrigidos, adicionou-se a verificação reproduzível de marcação HTML via `react-dom/server` (`renderToStaticMarkup`) que revelou duas nuances visuais concretas nos cenários 1/2 e 4, e separou-se explicitamente o que é provado por CLI (motor + HTML SSR) do que permanece sem captura independente de navegador.
- **Limites da revisão independente:** os oito cenários de motor e HTML foram reproduzidos pelo Codex; a causa dos erros TypeScript no ambiente de staging e os relatos de interação visual não foram confirmados independentemente.
- **Ações protegidas não realizadas:** nenhuma implementação da Fase 2, nenhum merge no repositório oficial e nenhuma publicação foram executados.
