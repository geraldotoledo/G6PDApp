# 01 — Arquitetura e Contrato de Segurança do G6PDApp

> Histórico: o desenho abaixo contém afirmações e garantias não validadas. Consulte [arquitetura](../produto/arquitetura.md), [base clínica](../clinica/base-clinica.md) e [plano de correção](../planejamento/plano-correcao.md) para o contexto vigente.

Este documento consolida o contrato arquitetural, os invariantes de segurança clínica e as decisões técnicas do **G6PDApp**.

---

## 1. Princípios Diretores

1. **Segurança Asssimétrica (`Zero Falsos Negativos`)**:
   * Para emitir `🔴 PROIBIDO / ALTO RISCO`, basta **1 evidência parcial** (no código de barras ou em um fragmento do rótulo).
   * Para emitir `🟢 LIVRE PARA CONSUMO`, exige-se **leitura completa e íntegra da lista de ingredientes** do rótulo físico e zero ocorrências de substâncias restritas ou ambíguas.
2. **Processamento 100% Local (*Local-First* & *Offline-First*)**:
   * O aplicativo deve funcionar dentro de supermercados ou farmácias sem sinal de internet e em aparelhos antigos/simples (ex.: celulares de avós e cuidadores), sem exigir download de modelos pesados de IA (1.5 GB) nem cadastro de chaves de API.
3. **Custo Operacional R$ 0,00 (*Zero-Server-Cost*)**:
   * O aplicativo será disponibilizado gratuitamente para apoiar outras famílias. Toda a infraestrutura de atualização da base de regras e consulta de produtos roda sem servidores pagos.
4. **Consciência de Duplo Protocolo Clínico**:
   * **Nível Crítico Global (CPIC / OMS / Favismo.it)**: Substâncias com evidência comprovada de hemólise aguda (ex.: Feijão-fava, Primaquina, Dapsona, Sulfas, Azul de Metileno, Nitrofurantoína, Naftalina, Henna, Quinina).
   * **Nível Preventivo Pediátrico Brasileiro (SBP / APAE / Ministério da Saúde)**: Restrição preventiva de corantes artificiais (azoicos e sintéticos INS 102–150d), sulfitos (INS 220–228), antioxidantes fenólicos (TBHQ/BHA/BHT) e Dipirona.
   * O aplicativo opera por padrão no **Modo Proteção Total (Global + Protocolo Pediátrico Brasileiro)**, deixando explícito para a família o motivo e a fonte de cada alerta.

---

## 2. Arquitetura em Cascata (Fluxo Duplo de Captura + Decisão Local)

```text
[Entrada: Câmera (Rótulo ou Código EAN) | Foto | Busca por Texto/Voz]
       │
       ├──► Via A: Código de Barras (EAN-13 / GTIN)
       │      1. Consulta "Despensa Segura da Família" (Cache local já validado pelos pais)
       │      2. Consulta API Pública Open Food Facts (direto do aparelho -> R$ 0,00)
       │      ⚠️ TRAVA CONTRA REFORMULAÇÃO SILENCIOSA:
       │         • Se a base online acusar item proibido ──► 🔴 ALERTA VERMELHO IMEDIATO
       │         • Se a base online disser "Sem restrições" ──► 🟡/🟢 "Aparentemente seguro na
       │           base online. Tire uma foto rápida dos ingredientes para 100% de segurança
       │           contra mudança recente de fórmula na fábrica."
       │
       └──► Via B: Leitura Óptica do Rótulo / Bula (OCR On-Device)
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CAMADA 1: Extração de Texto Local (Google ML Kit no Android / Preproc OCR) │
│ • Extrai o texto bruto diretamente no chip do celular (offline e gratuito). │
└─────────────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CAMADA 2: Trava de Completude + Normalizador Químico + Motor Determinístico│
│ • Verifica fronteira completa ("INGREDIENTES:" até "ALÉRGICOS/GLÚTEN").     │
│ • Normaliza homóglifos de OCR (1↔i, 0↔o, 5↔s) e hifenizações de quebra.     │
│ • Filtra Whitelist de Falsos Amigos Seguros (ex.: Sulfato Ferroso ≠ Sulfito)│
│ • Cruza com `g6pd_rules.json` (Códigos INS, E-Numbers, CAS e Sinônimos).    │
└─────────────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CAMADA 3: Semáforo de Veredito em Tela Cheia                                │
│ • 🔴 BLOQUEADO (Não Consumir — destaca em vermelho a substância e a fonte)  │
│ • 🟡 ATENÇÃO / VERIFICAR (Corante natural, termo ambíguo ou leitura parcial)│
│ • 🟢 LIVRE PARA CONSUMO (Lista íntegra lida + botão "Salvar nos Favoritos") │
└─────────────────────────────────────────────────────────────────────────────┘
              │ (Se o usuário quiser explicação aprofundada)
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CAMADA 4 (Sob Demanda): Botão ✨ "Analisar a fundo com minha IA"            │
│ • Monta "Super-Prompt" contextualizado (texto lido + alertas + links CPIC/  │
│   SBP) e aciona a gaveta nativa do celular (Share Sheet / Deep Links) para  │
│   abrir no Gemini, ChatGPT, Claude ou Perplexity do próprio usuário.        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. As 4 Blindagens Críticas de Engenharia

### Blindagem 1: Trava de Completude Estrutural do Rótulo (Anti-Falso-Negativo por Reflexo)
Embalagens de biscoitos e chocolates são curvas e laminadas; o reflexo da luz pode ocultar justamente a linha de um ingrediente proibido.
* **Regra de Engenharia**: O motor **jamais** concede `🟢 LIVRE` apenas porque "não achou palavras proibidas em um texto qualquer".
* Para autorizar `🟢 LIVRE` via OCR, o texto extraído deve conter:
  1. **Âncora de Início**: `INGREDIENTES`, `COMPOSIÇÃO` ou `EXCIPIENTES`.
  2. **Âncora de Fechamento**: Ponto final ou delimitador pós-ingredientes (`ALÉRGICOS:`, `CONTÉM GLÚTEN`, `NÃO CONTÉM GLÚTEN`, `CONTÉM LACTOSE`, `INFORMAÇÃO NUTRICIONAL`, `MODO DE CONSERVAÇÃO`).
  3. **Sanidade de Tokens**: Ausência de blocos ilegíveis truncados no interior da lista.
* Caso falte o início ou o fechamento, e nenhum proibido tenha sido detectado até ali, o status é **obrigatoriamente** `🟡 LEITURA PARCIAL — Aproxime a câmera sem reflexo para ler a lista até o fim`.

### Blindagem 2: Normalizador de Homóglifos OCR + Desambiguação Química (*Sulfato* $\neq$ *Sulfito*)
O uso ingênuo de distância de Levenshtein gera falsos positivos graves em alimentos infantis enriquecidos e falsos negativos em siglas curtas:
* **Falsos Amigos Químicos (Safe Lookalikes Whitelist)**:
  * `Sulfato` (*sulfato ferroso*, *sulfato de zinco*, *sulfato de magnésio*, *sulfato de cálcio*, *sulfato de cobre*, *sulfato de manganês*) tem distância de 1 letra para `Sulfito`, mas é um sal mineral seguro. O normalizador identifica e isola todos os *sulfatos* na Whitelist Segura antes da varredura de *sulfitos*.
  * `Vitamina K1 (Fitomenadiona)` (segura) vs. `Vitamina K3 (Menadiona)` (proibida).
  * `Caramelo I (INS 150a - simples)` (seguro) vs. `Caramelo III (INS 150c)` e `Caramelo IV (INS 150d - processo sulfito-amônia)` (restritos).
* **Detecção de Ambiguidade no Rótulo**:
  * Se o rótulo trouxer apenas `"corante caramelo"` (sem especificar se é I, III ou IV) ou `"corante"` / `"corante artificial"` genérico, o motor aciona alerta preventivo (`🟡/🔴`) explicando que a indústria omitiu o código INS específico.
* **Matriz de Confusão Óptica (OCR Homoglyphs)**:
  * Corrige seletivamente trocas visuais típicas de câmera (`INS 15O d` $\rightarrow$ `INS 150d`, `metabissulf1to` $\rightarrow$ `metabissulfito`, `tartraz1na` $\rightarrow$ `tartrazina`, hifenização de quebra de linha `meta-\nbissulfito` $\rightarrow$ `metabissulfito`).

### Blindagem 3: Duplo Veredito em Medicamentos Pediátricos (Armadilha dos Excipientes)
Muitos medicamentos cujo princípio ativo é seguro na G6PD (como *Amoxicilina*, *Azitromicina*, *Cefalexina*, *Ibuprofeno*, *Paracetamol*, *Loratadina*, *Prednisolona*) possuem versões líquidas infantis (xaropes e suspensões rosas/laranjas/amarelas) que contêm **Tartrazina (INS 102)**, **Amarelo Crepúsculo (INS 110)**, **Vermelho 40 / Allura (INS 129)** ou **Eritrosina (INS 127)** nos excipientes.
* **Regra de Engenharia**:
  * Toda consulta de medicamento exibe separadamente:
    1. **Status do Princípio Ativo** (`🔴 Proibido`, `🟡 Cautela / Dose Terapêutica` ou `🟢 Seguro`).
    2. **Trava de Excipiente Pediátrico**: Aviso destacado instruindo a conferir a linha `"Excipientes / Veículo"` da bula com o scanner ou optar por versões em gotas incolores.

### Blindagem 4: Desenvolvimento Local sem Admin (PWA + Capacitor + GitHub Actions)
Para contornar as restrições de máquina corporativa sem permissão de Administrador (sem Docker, sem WSL, sem Android Studio pesado local):
1. **Desenvolvimento e Testes na Máquina Local (100% User-Space)**:
   * Stack baseada em **TypeScript + React/Vite + Bun/Node.js**.
   * Funciona imediatamente como **PWA (Progressive Web App)** instalável tanto em **Android** quanto em **iOS (iPhones/iPads)**.
2. **Empacotamento Nativo Android (`.apk` / `.aab`) na Nuvem via GitHub Actions**:
   * O repositório integra **Capacitor** com os plugins nativos do **Google ML Kit** (`@capacitor-mlkit/barcode-scanning` e reconhecimento de texto nativo).
   * Um workflow automatizado (`.github/workflows/android-release.yml`) compila o binário Android gratuitamente nos servidores do GitHub a cada *push/tag*, sem exigir instalação do Android SDK na máquina corporativa.

---

## 4. Sincronização Online Gratuita e Auditável (`g6pd_rules.json`)

Para atualizar a lista de substâncias trimestralmente (ou sempre que sair nova nota técnica) para todos os aplicativos instalados, com **custo R$ 0,00**:

1. **Hospedagem Estática Dupla (GitHub Pages + jsDelivr CDN)**:
   * O arquivo `g6pd_rules.json` fica no próprio repositório público no GitHub e é servido via GitHub Pages (atualização em < 1 minuto) com fallback na CDN global jsDelivr.
2. **Base Embutida de Fábrica (*Bundled Offline Fallback*)**:
   * O app já vem com a versão mais recente do `g6pd_rules.json` compilada dentro do pacote para funcionar imediatamente após a instalação, mesmo sem internet.
3. **Protocolo Seguro de Atualização (`SyncEngine`)**:
   * Cabeçalho versionado: `schemaVersion`, `rulesVersion` (ex.: `"2026.10.1"`), `updatedAt`, `minimumRulesCount`.
   * Ao abrir com internet, o app verifica se há `rulesVersion` mais nova.
   * **Validação Anti-Corrupção (Captive Portal Guard)**: Se o usuário estiver num Wi-Fi público de mercado que intercepta requisições, o `SyncEngine` valida o schema JSON e a assinatura de integridade antes de atualizar o `IndexedDB`/`localStorage`. Se inválido, mantém a base local intacta.

---

## 5. Integração "Analisar a Fundo com Minha IA" e Voz Nativa

### 5.1. Botão ✨ "Analisar na Minha IA" (Zero API Key / Zero Custo)
Quando o usuário deseja entender o papel químico ou clínico de um ingrediente detectado:
1. O app gera automaticamente um **Prompt Clínico Estruturado** contendo:
   * O texto literal lido no rótulo;
   * As substâncias sinalizadas pelo motor determinístico, códigos INS e categorias;
   * Os links diretos das diretrizes de referência (CPIC, SBP, Ministério da Saúde).
2. **Acionamento Multi-Canal**:
   * Copia automaticamente o prompt para a Área de Transferência (`navigator.clipboard`).
   * Abre a **Gaveta Nativa do Sistema (`navigator.share` / `Intent.ACTION_SEND`)** para o usuário escolher o app de IA instalado no celular (Gemini, ChatGPT, Claude, Perplexity, Copilot).
   * Oferece botões rápidos de **Deep Link direto** (`https://chatgpt.com/?q=...`, `https://www.perplexity.ai/search?q=...`, `https://claude.ai/new?q=...`) para quem não tem app instalado poder consultar direto no navegador.

### 5.2. Modo Consulta por Voz ("Esse produto pode?")
* Utiliza as APIs nativas gratuitas do sistema/navegador (`Web Speech API`: `SpeechRecognition` + `speechSynthesis`).
* Permite que avós ou cuidadores apertem o microfone e perguntem: *"Pode tomar Dipirona?"* ou *"Pode comer biscoito com Caramelo IV?"*, recebendo a resposta falada em voz alta instantaneamente a partir da base determinística.

---

## 6. Cuidados Legais e Conformidade para Google Play Store

1. **Termo de Uso e Isenção de Responsabilidade Clínica no Onboarding**:
   * Aceite inicial deixando claro que o aplicativo é uma ferramenta auxiliar de conferência de rótulos baseada em diretrizes públicas (CPIC, SBP, Ministério da Saúde, ANVISA), não substitui prescrição médica ou orientação do hematologista/pediatra, e exige conferência visual do rótulo físico na embalagem.
2. **Transparência Total de Leitura ("O que o App Leu")**:
   * Todo resultado exibe exatamente o texto que foi extraído da foto/código de barras, permitindo ao usuário conferir visualmente se a leitura corresponde ao pacote em mãos.
3. **Rastreabilidade da Fonte da Regra**:
   * Cada substância bloqueada ou em alerta exibe o selo da diretriz de origem (`CPIC`, `SBP/APAE`, `OMS`, `Favismo.it`, `ANVISA`) e a data da última revisão da base.
