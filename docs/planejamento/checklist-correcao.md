# Checklist de implementação e controle de execução (3 fases — escopo conectado)

> **Documento de Referência Base:** [`docs/planejamento/plano-correcao.md`](plano-correcao.md)<br>
> **Instruções ao Agente Executor:**
> 1. Execute **uma fase por vez** na sequência estrita: **Fase 1 $\rightarrow$ Fase 2 $\rightarrow$ Fase 3**.
> 2. Ao concluir cada item, marque `[x]` neste arquivo e preencha o bloco **Registro de Evidências e Passagem de Contexto** correspondente à fase.
> 3. **Restrições Operacionais:** Ambiente Windows sem privilégios de Administrador e com Windows Defender ativo. Não instale pacotes globais (`-g`), não instale Android SDK local, e não faça `git commit` / `git push` automático sem autorização.
> 4. **Escopo Adiado (Por Decisão do Usuário):** Os Achados `#10` (primeiro OCR sem rede / empacotamento local de WASM e idioma) e `#11` (pré-cache offline completo / modo avião) estão **fora do escopo desta entrega** e não devem ser marcados como resolvidos.

---

## Fase 1 — Núcleo de Segurança, Catálogo Clínico e Validação Estrutural da Base
**Achados Cobertos:** `#1`, `#2`, `#3`, `#6` e `#18` (parte de catálogo/proveniência).

### 1.1. Normalização e Trava de Completude
**Arquivos:** [`src/engine/normalizer.ts`](../../src/engine/normalizer.ts), [`src/engine/completenessGate.ts`](../../src/engine/completenessGate.ts), [`src/engine/ruleEngine.ts`](../../src/engine/ruleEngine.ts), [`src/engine/types.ts`](../../src/engine/types.ts)

- [x] **1.1.1 (Achado #1):** Corrigir a regex de códigos INS em `src/engine/normalizer.ts` para nunca incorporar a conjunção portuguesa `"e"` ao número (garantir que `"INS 223 e sal"` normalize para `"ins 223 e sal"` e seja bloqueado como `RED_BLOCKED`, preservando sufixos legítimos como `INS 150d` e homóglifos como `INS 15O d`).
- [x] **1.1.2 (Achado #2a):** Delimitar em `src/engine/completenessGate.ts` o conteúdo real entre a âncora de início e a âncora de fim, rejeitando listas vazias ou sem caracteres alfabéticos de ingredientes entre elas (ex.: `"Ingredientes: Alérgicos: contém trigo"` $\rightarrow$ `isComplete: false` / `YELLOW_INCOMPLETE_SCAN`).
- [x] **1.1.3 (Achado #2b):** Impedir em `src/engine/completenessGate.ts` que marcadores explícitos de ilegibilidade (`???`, `??`, `\uFFFD` ou sequências de símbolos corrompidos) no interior da lista sejam diluídos pela razão global de tokens (`unreadableRatio`), forçando `isComplete: false` (`YELLOW_INCOMPLETE_SCAN`).
- [x] **1.1.4 (Achado #2c):** Separar em `src/engine/completenessGate.ts` a leitura do princípio ativo (`Composição:`) da leitura dos excipientes (`Excipientes:` / `Veículo:`), garantindo que um ponto após o princípio ativo (ex.: `"Composição: amoxicilina. Excipientes:"`) **não** valide uma seção de excipientes vazia ou truncada.
- [x] **1.1.5:** Separar no contrato do `src/engine/ruleEngine.ts` e `src/engine/types.ts` o status do princípio ativo reconhecido da aprovação da apresentação completa, mantendo o bloqueio imediato (`RED_BLOCKED`) sempre que qualquer substância restrita aparecer mesmo em leitura parcial.

### 1.2. Catálogo de Regras, Ambiguidade Contextual e Proveniência Clínica
**Arquivos:** [`src/data/rules.json`](../../src/data/rules.json), [`public/g6pd_rules.json`](../../public/g6pd_rules.json), [`src/engine/ruleEngine.ts`](../../src/engine/ruleEngine.ts), [`scripts/audit-rules.ts`](../../scripts/audit-rules.ts), [`docs/clinica/base-clinica.md`](../clinica/base-clinica.md)

- [x] **1.2.1 (Achado #3a):** Adicionar e referenciar os sulfitos documentados faltantes (**INS 225** Sulfito de Potássio, **INS 226** Sulfito de Cálcio, **INS 227** Bissulfito de Cálcio, **INS 228** Bissulfito de Potássio) na base de regras.
- [ ] **1.2.2 (Achado #3b):** Cloranfenicol e isoniazida foram adicionados com `CAUTION`, mas a sustentação clínica dessa classificação permanece pendente: fontes recuperadas apresentam divergências. Evidências e decisões faltantes estão individualizadas em `docs/clinica/base-clinica.md`; não considerar a classificação validada.
- [x] **1.2.3 (Achado #3c):** Adicionar regra para `"corante artificial"` / `"colorido artificialmente"` (segundo o perfil aplicável) e regra de ambiguidade (`isAmbiguous: true`, `CAUTION`) para `"corante"` / `"corantes"` sem especificação.
- [x] **1.2.4:** Implementar precedência contextual por posição (span) em `src/engine/ruleEngine.ts`:
  - Uma ocorrência específica permitida pelo perfil (ex.: `"corante natural de urucum"` ou `"corante caramelo I"` no modo `BRAZIL_PEDIATRIC`) **não** deve disparar o alerta genérico naquela mesma posição.
  - Uma segunda ocorrência genérica independente no mesmo rótulo (ex.: `"corante natural de urucum, açúcar e corante"`) **não** deve ser suprimida e deve disparar `YELLOW_ATTENTION`.
- [x] **1.2.5:** Preservar as correspondências de regras `SAFE` em `result.matches` (mantendo compatibilidade com o Teste #2 existente), mas separar sua representação visual (`type: 'SAFE_LOOKALIKE'` em `highlightSpans` e estilização verde nos cards/consumidores) para não exibir itens `SAFE` como alerta amarelo/laranja.
- [ ] **1.2.6 (Achado #18a):** Estrutura e vínculo documental implementados para as 71 regras (`sourceRef`, `evidenceKind`, estado e nota de proveniência). Há 7 DOCUMENTED e 64 PENDING_REVIEW na v2026.10.3. Faltam fontes/reconciliação profissional para fechar a proveniência clínica integral; detalhes em `docs/clinica/base-clinica.md`.
- [x] **1.2.7:** Garantir fonte única autoritativa (`src/data/rules.json`) com geração/sincronização automatizada para `public/g6pd_rules.json` (via script/auditor) para impedir divergência entre base embutida e pública.
- [x] **1.2.8:** Ampliar `scripts/audit-rules.ts` para validar cobertura documental e integridade de campos sem rotular checagem estrutural como validação médica.

### 1.3. Validação Estrutural de Schema e Ativação Segura
**Arquivos:** [`src/services/rulesSync.ts`](../../src/services/rulesSync.ts), [`src/engine/types.ts`](../../src/engine/types.ts), [`scripts/audit-rules.ts`](../../scripts/audit-rules.ts)

- [x] **1.3.1 (Achado #6):** Endurecer `isValidRulesDatabase` em `src/services/rulesSync.ts` para validar individualmente 100% das regras e `safeLookalikes`:
  - `schemaVersion` suportado, `rulesVersion` bem formada e `updatedAt` válido;
  - Identificadores (`id`) únicos e não vazios;
  - `riskLevel` pertencente estritamente a `['HIGH_RISK', 'RESTRICTED_BR', 'CAUTION', 'SAFE']`;
  - `category` e `protocolSource` pertencentes aos respectivos enums válidos;
  - `synonyms` como array não vazio de strings não vazias.
- [x] **1.3.2:** Aplicar `isValidRulesDatabase` tanto na leitura do `localStorage` (`getActiveRulesDatabase`) quanto no payload baixado (`syncRulesFromRemote`), preservando a última base válida em qualquer falha de rede, validação ou `localStorage.setItem`.

### 1.4. Verificação Obrigatória de Saída da Fase 1
- [x] **1.4.1:** Adicionar testes unitários em [`tests/ruleEngine.test.ts`](../../tests/ruleEngine.test.ts) cobrindo todos os cenários da tabela da Fase 1 (`INS 223 e sal`, lista vazia, `???`, `Composição: amoxicilina. Excipientes:`, medicamento seguro com excipiente restrito, corante natural identificado vs. outra ocorrência genérica no mesmo rótulo, e rejeição de base sem `riskLevel`/`synonyms`).
- [x] **1.4.2:** Executar `npm test`, `npm run audit` e `npx tsc --noEmit` com **0 erros**.
- [x] **1.4.3:** Preencher o bloco da Fase 1 na tabela **Registro de Execução** ao final deste arquivo e em `docs/planejamento/plano-correcao.md`.

---

## Fase 2 — EAN, Despensa Segura, Sincronização e Consistência da Interface
**Achados Cobertos:** `#4`, `#5`, `#8`, `#9`, `#13`, `#14`, `#18` (apresentação) e `#6` (autenticidade).

### 2.1. Semáforo de 3 Cores no EAN e Conferência Física Obrigatória
**Arquivos:** [`src/services/openFoodFacts.ts`](../../src/services/openFoodFacts.ts), [`src/components/BarcodeScannerModal.tsx`](../../src/components/BarcodeScannerModal.tsx), [`src/components/ScannerScreen.tsx`](../../src/components/ScannerScreen.tsx), [`src/components/DrugSearchScreen.tsx`](../../src/components/DrugSearchScreen.tsx)

- [ ] **2.1.1 (Achado #5):** Corrigir `evaluateProduct` em `src/services/openFoodFacts.ts` e a UI de `BarcodeScannerModal.tsx` para tratar separadamente `RED_BLOCKED` (vermelho), `YELLOW_ATTENTION` / `YELLOW_INCOMPLETE_SCAN` (amarelo, ex.: `"corante caramelo"`) e `GREEN_SAFE` (verde), nunca exibindo estado amarelo como `"🟢 Aparentemente seguro"`.
- [ ] **2.1.2 (Achado #8a):** Remover do `BarcodeScannerModal.tsx` o botão que salva diretamente o resultado online na Despensa como aprovado; substituir pela ação que envia os ingredientes para o Scanner para conferência com a embalagem física em mãos.
- [ ] **2.1.3 (Achado #8b):** Adicionar no `ScannerScreen.tsx` um checkbox/confirmação humana explícita (*"Confirmo que comparei este texto com o rótulo físico completo da embalagem em mãos"*) antes de habilitar o salvamento na Despensa Segura, resetando essa confirmação sempre que `inputText` mudar.
- [ ] **2.1.4:** Exibir claramente no `ScannerScreen.tsx` a distinção entre a avaliação do princípio ativo e a avaliação dos excipientes quando aplicável.

### 2.2. Governança da Despensa Segura e Migração Não-Destrutiva
**Arquivos:** [`src/services/pantryStorage.ts`](../../src/services/pantryStorage.ts), [`src/components/SafePantryScreen.tsx`](../../src/components/SafePantryScreen.tsx), [`src/components/ScannerScreen.tsx`](../../src/components/ScannerScreen.tsx), [`src/App.tsx`](../../src/App.tsx)

- [ ] **2.2.1 (Achado #4a):** Iniciar a despensa real vazia (`[]`) em novas instalações, mantendo exemplos de teste fora da lista real de aprovados.
- [ ] **2.2.2 (Achado #4b):** Estender `PantryItem` para registrar `origin` (`'SCANNER_PHYSICAL'` | `'MANUAL'` | `'IMPORTED'` | `'LEGACY'`), `verifiedDate`, `approvedProfileMode`, `approvedRulesVersion` e `physicalLabelConfirmed: boolean`.
- [ ] **2.2.3:** Migrar de forma não-destrutiva itens antigos já salvos no `localStorage` que não possuam evidência completa para o estado *"Pendente de conferência física"*, preservando os dados da família.
- [ ] **2.2.4 (Achado #4c):** Aplicar a validação do motor a todo cadastro manual, importação JSON e salvamento via Scanner, impedindo que produtos com substâncias restritas (ex.: `fava`, `tartrazina`) sejam salvos ou exibidos como aprovados.
- [ ] **2.2.5 (Achado #9):** Passar `profileMode` e `activeRulesVersion` para `SafePantryScreen.tsx`, recalculando dinamicamente a elegibilidade de cada item quando o perfil ou a base mudarem (ex.: destacar como restrito/atenção um item com corante natural quando o usuário mudar para `STRICT_ZERO_DYES`).
- [ ] **2.2.6:** Em `generatePantryWhatsAppText`, compartilhar como aprovados **apenas** os itens com conferência física confirmada e elegíveis no perfil/base ativos, listando separadamente itens pendentes ou bloqueados.
- [ ] **2.2.7:** Propagar erros de `localStorage.setItem` / validação de importação JSON para a interface, evitando mensagens falsas de sucesso.
- [ ] **2.2.8 (Achado #13):** Em `lookupProductByBarcode` (`src/services/openFoodFacts.ts`), consultar primeiro a Despensa local pelo código EAN antes de chamar a API pública, identificando a origem local e respeitando o status de conferência/perfil.

### 2.3. Autenticidade e Estado Reativo da Base Ativa
**Arquivos:** [`src/services/rulesSync.ts`](../../src/services/rulesSync.ts), [`src/App.tsx`](../../src/App.tsx), [`src/components/Header.tsx`](../../src/components/Header.tsx), [`src/components/AboutScreen.tsx`](../../src/components/AboutScreen.tsx)

- [ ] **2.3.1 (Achado #6b):** Implementar verificação de assinatura criptográfica (WebCrypto Ed25519/ECDSA com chave pública embutida) sobre os metadados/conteúdo da atualização remota em `src/services/rulesSync.ts`, rejeitando assinaturas inválidas antes da ativação e registrando qualquer dependência de chave privada externa de CI.
- [ ] **2.3.2 (Achado #14a):** Disparar verificação automática não-bloqueante de atualização na inicialização conectada do `App.tsx`.
- [ ] **2.3.3 (Achado #14b):** Manter a base ativa em estado reativo no `App.tsx`, propagando `rulesVersion`, `updatedAt` e `sources` reais da base ativa para `Header.tsx`, `AboutScreen.tsx`, `ScannerScreen.tsx`, `DrugSearchScreen.tsx` e `SafePantryScreen.tsx` (recalculando resultados abertos imediatamente após ativação de nova base).
- [ ] **2.3.4:** Distinguir na interface a data de revisão clínica da base (`updatedAt`), a última tentativa de sincronização e a última verificação bem-sucedida.

### 2.4. Coerência Clínica nas Saídas
**Arquivos:** [`src/components/EmergencyCardScreen.tsx`](../../src/components/EmergencyCardScreen.tsx), [`src/components/DrugSearchScreen.tsx`](../../src/components/DrugSearchScreen.tsx), [`src/components/AboutScreen.tsx`](../../src/components/AboutScreen.tsx), [`src/services/aiHandoff.ts`](../../src/services/aiHandoff.ts)

- [ ] **2.4.1 (Achado #18b):** Harmonizar a apresentação do **AAS / Aspirina** e demais substâncias entre `DrugSearchScreen.tsx`, `EmergencyCardScreen.tsx` (tela, impressão e WhatsApp) e `AboutScreen.tsx`, identificando explicitamente o protocolo representado e removendo promessas absolutas como `"100% seguro"`.
- [ ] **2.4.2:** Exibir na UI as referências/fontes estruturadas definidas na Fase 1 e garantir que o prompt em `aiHandoff.ts` permaneça estritamente consultivo, sem substituir o veredito determinístico.

### 2.5. Verificação Obrigatória de Saída da Fase 2
- [ ] **2.5.1:** Adicionar testes automatizados para `openFoodFacts.ts` (EAN amarelo preservado + busca local na Despensa), `pantryStorage.ts` (bloqueio de fava, migração de itens legados, reavaliação por perfil e filtro no texto de WhatsApp) e `rulesSync.ts` (rejeição de assinatura/schema inválidos).
- [ ] **2.5.2:** Executar `npm test`, `npm run audit` e `npm run build` com **0 erros**.
- [ ] **2.5.3:** Preencher o bloco da Fase 2 na tabela **Registro de Execução** ao final deste arquivo e em `docs/planejamento/plano-correcao.md`.

---

## Fase 3 — Captura Conectada, Pipeline Android e Aceitação Integrada
**Achados Cobertos:** `#7`, `#12`, `#15`, `#16`, `#17` e Alinhamento Documental (`Achados #10 e #11` permanecem explicitamente adiados).

### 3.1. Contraste Matemático da Imagem, OCR Conectado, Fallback de Barras e Voz
**Arquivos:** [`src/services/imageOcr.ts`](../../src/services/imageOcr.ts), [`src/services/voiceAssistant.ts`](../../src/services/voiceAssistant.ts), [`src/components/ScannerScreen.tsx`](../../src/components/ScannerScreen.tsx), [`src/components/BarcodeScannerModal.tsx`](../../src/components/BarcodeScannerModal.tsx)

- [ ] **3.1.1 (Achado #7):** Corrigir a equação de contraste em `preprocessLabelImage` (`src/services/imageOcr.ts`) usando escala positiva (`contrastOffset = 45` $\rightarrow \text{factor} \approx +1,42386$), preservando ordem não-decrescente de luminância (preto permanece mais escuro que cinza e branco, eliminando a inversão negativa `-8,21655`).
- [ ] **3.1.2:** Limpar o resultado/texto anterior no `ScannerScreen.tsx` no instante em que uma nova foto é selecionada, garantindo que em caso de cancelamento, erro de rede ou OCR vazio o veredito da análise anterior **nunca** permaneça na tela parecendo pertencer à nova foto.
- [ ] **3.1.3 (Achado #12):** Implementar fallback funcional de leitura óptica de código de barras em `src/services/imageOcr.ts` / `BarcodeScannerModal.tsx` para navegadores que não possuem `window.BarcodeDetector` nativo (ex.: biblioteca leve compatível como `@zxing/library` ou equivalente), mantendo a digitação como opção adicional e não como substituto.
- [ ] **3.1.4:** Em `voiceAssistant.ts` e `ScannerScreen.tsx`, informar claramente a dependência de conexão de rede e o suporte do navegador para transcrição/síntese de voz.

### 3.2. Integração Android Nativa e Saneamento da Pipeline CI/CD
**Arquivos:** [`package.json`](../../package.json), [`capacitor.config.ts`](../../capacitor.config.ts), [`.github/workflows/build-android-and-pages.yml`](../../.github/workflows/build-android-and-pages.yml)

- [ ] **3.2.1 (Achado #15):** Configurar integração Capacitor e roteamento explícito em `src/services/imageOcr.ts` para OCR e leitura de código de barras nativos quando em ambiente Android Capacitor, preservando o caminho web no navegador e tratando permissões negadas sem simular leitura.
- [ ] **3.2.2 (Achado #16):** Remover supressões de erro (`|| true` / `continue-on-error`) das etapas de preparação e Gradle em `.github/workflows/build-android-and-pages.yml` e **nunca** incluir `dist/` no upload do artefato Android (exigir a presença real do binário `.apk`/`.aab` para que o job Android passe).
- [ ] **3.2.3 (Achado #17):** Configurar no workflow `.github/workflows/build-android-and-pages.yml` a geração separada de APK e AAB release condicionados aos segredos de assinatura do CI (`ANDROID_KEYSTORE_BASE64`, etc.), mantendo o deploy do GitHub Pages em job separado e independente.

### 3.3. Alinhamento Documental e Verificação Integrada
**Arquivos:** [README](../../README.md), [arquitetura atual](../produto/arquitetura.md), [base clínica](../clinica/base-clinica.md), [índice](../index.md), [histórico inicial](../init/README.md) e [`public/sw.js`](../../public/sw.js).

- [ ] **3.3.1:** Garantir que o cache web conectado (`public/sw.js`) não misture HTML e bundles incompatíveis entre atualizações.
- [ ] **3.3.2:** Atualizar textos de interface (`Header.tsx`, `AboutScreen.tsx`, `index.html`, `manifest.webmanifest`), README, arquitetura atual e documentos vigentes pertinentes para refletir o escopo conectado, sem prometer offline integral ou zero falsos negativos. Manter o histórico inicial identificado como tal.
- [ ] **3.3.3:** Adicionar teste automatizado de monotonicidade de luminância para o pré-processamento de contraste (`preto < cinza < branco`) e executar a suíte completa: `npm test`, `npm run audit` e `npm run build`.
- [ ] **3.3.4:** Preencher o bloco da Fase 3 na tabela **Registro de Execução** abaixo e em `docs/planejamento/plano-correcao.md`, listando explicitamente quaisquer validações dependentes de aparelho Android físico, segredos de CI ou revisão médica externa.

---

## Registro de Execução e Passagem de Contexto

| Fase | Estado | Implementação | Evidências Exercitadas | Pendências / Bloqueios Externos |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1 — Núcleo, Catálogo e Validação** | **C1–C4 corrigidos e verificados; C5 clínico pendente** | Segunda correção registrada em `docs/planejamento/correcao-fase-1.md`; completude de excipientes como âncora inicial, corrupção interna, schema integral e persistência coerente corrigidos. 71 regras com metadados; geração pública validada no prebuild; auditor separa resultado técnico de clínica. | 160/160 testes; auditoria técnica sem erros; TypeScript e build aprovados. Scanner real no navegador e sincronização por HTTP local exercitados com falhas controladas de armazenamento. | 64 regras aguardam fonte específica/reconciliação e revisão profissional. 7 possuem suporte documental cadastrado; isso não certifica o catálogo. Fase 1 não está integralmente concluída. |
| **Fase 2 — EAN, Despensa e Estado Ativo** | Pronta para execução | — | — | — |
| **Fase 3 — Captura, Android/CI e Docs** | Não iniciada | — | — | — |
| **Offline Completo (Achados #10 e #11)** | Adiado por decisão do usuário | Não exigido nesta entrega | Não verificado | Empacotamento local de modelos OCR e modo avião integral |
