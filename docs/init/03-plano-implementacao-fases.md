# 03 — Plano de Implementação em Fases (G6PDApp)

> Documento histórico: este roteiro foi substituído pelo [plano de correção conectado](../planejamento/plano-correcao.md). Promessas e classificações abaixo não são garantia ou orientação clínica atual.

Este documento registrava o roteiro inicial para construir, testar e publicar o **G6PDApp** na máquina local, sem necessidade de Administrador, usando **Bun/Node.js + TypeScript + React/Vite + Capacitor + GitHub Actions**. O caminho local foi omitido nesta cópia de arquivo.

---

## Visão Geral das Fases

```text
[FASE 1: Base Clínica + Motor Determinístico + Suíte de Testes (bun test)]
       │
       ▼
[FASE 2: Interface Principal PWA — Semáforo, Busca Rápida, Cartão Emergência e Handoff IA]
       │
       ▼
[FASE 3: Câmera Dupla (Código de Barras EAN + OCR de Rótulo) + Despensa Segura]
       │
       ▼
[FASE 4: Sincronizador Remoto Gratuito (g6pd_rules.json via GitHub Pages) + Voz Nativa]
       │
       ▼
[FASE 5: Pipeline GitHub Actions para Google Play Store (.apk / .aab com ML Kit Nativo)]
```

---

## Fase 1 — Coração Clínico: Base `g6pd_rules.json` + Motor Determinístico + Testes Automatizados

**Objetivo**: Garantir que o "cérebro" do aplicativo tenha **Zero Falsos Negativos** e **Zero Falsos Positivos por Homógrafos Químicos** antes mesmo de construir a tela de câmera.

### Entregáveis da Fase 1:
1. **Inicialização do Projeto TypeScript/Bun (`package.json`, `tsconfig.json`, `vite.config.ts`)**.
2. **Base Mestre Estruturada (`public/g6pd_rules.json` e `src/data/defaultRules.ts`)**:
   * Cabeçalho de versionamento (`schemaVersion`, `rulesVersion`, `updatedAt`, `sources`).
   * Catálogo completo de **Corantes Artificiais** (`INS 102` a `INS 150d`), **Corantes Naturais** (`INS 100`, `140`, `150a`, `160a/b/c`, `162`, `163`), **Sulfitos** (`INS 220` a `228`), **Antioxidantes Sintéticos** (`INS 319` a `321`), **Alimentos Proibidos** (Fava/*Vicia faba*, Quinina/Água Tônica, Berberina/Ervas), **Químicos Domésticos** (Naftalina, Henna/*Lawsonia*/PPD, Azul de Metileno) e **Medicamentos** (CPIC + SBP/APAE + Alerta de Excipientes).
   * Sinônimos multilíngues (Português, Espanhol e Inglês — essencial para biscoitos e chocolates importados ou com rótulo Mercosul) e variações de escrita de códigos (`INS 150d`, `INS 150IV`, `E150d`, `E-150d`, `(150d)`).
   * Catálogo de **Falsos Amigos Seguros (Safe Lookalikes Whitelist)**: *Sulfato ferroso*, *Sulfato de zinco*, *Sulfato de cálcio*, *Sulfato de magnésio*, *Vitamina K1 (Fitomenadiona)*, *Lecitina de soja (INS 322)*, *Ácido ascórbico alimentar (INS 300)*.
3. **Motor de Regras e Normalização (`src/engine/`)**:
   * `normalizer.ts`: Limpeza de acentos, união de palavras hifenizadas por quebra de linha (`metabis-\nsulfito`), correção seletiva de homóglifos de OCR (`1↔i/l`, `0↔o`, `5↔s`) sem confundir *sulfato* com *sulfito*.
   * `completenessGate.ts`: Validador de fronteira estrutural do rótulo (`INGREDIENTES:` / `COMPOSIÇÃO:` / `EXCIPIENTES:` até `ALÉRGICOS:` / `CONTÉM GLÚTEN`), impedindo `🟢 LIVRE` em leituras cortadas por reflexo.
   * `ruleEngine.ts`: Cruzamento determinístico retornando o veredito (`RED_BLOCKED`, `YELLOW_ATTENTION`, `YELLOW_INCOMPLETE_SCAN`, `GREEN_SAFE`), trechos exatos destacados no texto, explicação clínica, protocolo de origem (Global CPIC vs. Brasil SBP/APAE) e aviso de excipientes.
4. **Suíte de Testes Clínicos Automatizados (`tests/ruleEngine.test.ts` rodando via `bun test`)**:
   * Testes com rótulos reais (ex.: Biscoito com Metabissulfito + TBHQ, Biscoito Piraquê Maltado com Caramelo IV + Urucum + Cúrcuma, Piraquê Coco seguro, Chocolates Cacau Show/Kopenhagen seguros, Farinha láctea com *Sulfato ferroso* garantindo que não acuse *Sulfito*, Suspensão de Amoxicilina com Vermelho 40 nos excipientes, e rótulo cortado no meio sem delimitador final).

---

## Fase 2 — Interface Principal PWA, Semáforo, Busca Rápida, Cartão de Emergência e Botão "Minha IA"

**Objetivo**: Colocar no ar uma aplicação web/mobile responsiva, rápida e intuitiva para pais, avós e escola usarem imediatamente no navegador ou instalada na tela inicial.

### Entregáveis da Fase 2:
1. **Tela 1 — Analisador de Rótulo + Semáforo em Tela Cheia**:
   * Área para colar/digitar/falar ou escanear o rótulo e veredito visual imediato (`🔴 NÃO CONSUMIR`, `🟡 ATENÇÃO / VERIFICAR`, `🟢 LIVRE PARA CONSUMO`).
   * Exibição transparente do texto lido com **grifo colorido** exatamente nas palavras que dispararam regras (vermelho para proibidos, amarelo para cautela/ambíguos, verde para falsos amigos seguros validados como *sulfato ferroso*).
   * Seletor de Perfil de Restrição: **Modo Brasil Pediátrico Restrito (Padrão: Zero Corantes Artificiais + Sulfitos + CPIC)** vs. **Modo Estrito Zero Corantes (bloqueia até naturais)** vs. **Modo Internacional CPIC/OMS**.
2. **Integração ✨ "Analisar a Fundo com Minha IA" (`src/services/aiHandoff.ts`)**:
   * Gerador automático do Super-Prompt contextualizado.
   * Acionamento da gaveta nativa do sistema (`navigator.share`) + cópia automática para a área de transferência + botões diretos de Deep Link para **Gemini**, **ChatGPT**, **Claude** e **Perplexity**.
3. **Tela 2 — Busca Instantânea de Medicamentos, Corantes (INS) e Ingredientes**:
   * Barra de busca ultrarrápida (100% offline) por nome comercial, princípio ativo ou número INS (ex.: digitar `150d`, `Dipirona`, `Bactrim`, `Ibuprofeno`, `Urucum`), exibindo o Duplo Veredito (Princípio Ativo + Alerta de Excipientes Líquidos).
4. **Tela 3 — Cartão de Bolso, Modo Escola e Sinais de Emergência**:
   * Guia rápido de pronto-socorro e supermercado, lista de sintomas de crise hemolítica (urina escura, icterícia, palidez súbita), dados editáveis da criança (salvos localmente no aparelho: nome, peso atual em kg, tipo sanguíneo, contato do hematologista e dos pais) e botão **"Compartilhar Cartão no WhatsApp / Imprimir PDF"** para enviar à escola ou cuidadores.
5. **Onboarding Legal (Termo de Uso de Segurança)**:
   * Modal no primeiro acesso com aviso médico/legal e transparência das fontes.

---

## Fase 3 — Scanner de Câmera Dupla (Código de Barras EAN + OCR de Rótulo) e "Despensa Segura"

**Objetivo**: Permitir apontar a câmera diretamente para o pacote no corredor do mercado ou farmácia e salvar os produtos favoritos da família.

### Entregáveis da Fase 3:
1. **Leitor de Código de Barras EAN-13 (`BarcodeDetector` Nativo + Fallback ZXing) + Open Food Facts API**:
   * Ao ler o código de barras, verifica primeiro a **Despensa Segura da Família** local e depois consulta gratuitamente `world.openfoodfacts.org/api/v2/product/{ean}.json`.
   * Aplica a **Trava contra Reformulação Silenciosa**: se encontrar proibido na base online, bloqueia em `🔴` na hora; se parecer seguro na base online, exibe os ingredientes cadastrados e sugere confirmação rápida por foto do rótulo físico.
2. **Scanner Óptico de Rótulos (Câmera com Pré-processamento de Contraste + OCR Local)**:
   * Captura da foto da lista de ingredientes com recorte/ajuste automático de contraste (para reduzir reflexo de embalagens plásticas) e extração de texto local.
3. **Tela 4 — Despensa Segura da Família ("Liberados para o Nosso Filho")**:
   * Botão de 1 clique após um resultado verde: *"Salvar na Despensa Segura"* (guardando nome, marca, código EAN opcional, ingredientes lidos e data da validação).
   * Função de **Exportar / Importar Despensa (JSON ou Link/Arquivo via WhatsApp)** para que o pai possa validar os biscoitos/chocolates em casa e mandar a lista pronta para o celular dos avós com 1 toque!

---

## Fase 4 — Sincronizador Online Gratuito (`SyncEngine`), Voz Nativa e PWA Offline Completo

**Objetivo**: Garantir funcionamento 100% offline como aplicativo instalado no celular (Android e iPhone) e atualização automática trimestral da base `g6pd_rules.json`.

### Entregáveis da Fase 4:
1. **`SyncEngine` (`src/services/rulesSync.ts`)**:
   * Verificação silenciosa de nova versão do `g6pd_rules.json` no GitHub Pages / jsDelivr CDN, com validação de schema e proteção contra portais Wi-Fi cativos.
   * Painel de status da base no rodapé/configurações (*"Base Clínica v2026.10.1 — Atualizada — Botão Verificar Atualizações"*).
2. **Assistente de Voz Nativo ("Esse produto pode?")**:
   * Microfone integrado usando `SpeechRecognition` para perguntar por voz e resposta falada via `speechSynthesis` (TTS nativo do celular).
3. **Configuração PWA (`manifest.webmanifest` + Service Worker Offline)**:
   * Ícones, instalação na tela inicial de Android e iOS e cache completo de assets para rodar em modo avião.

---

## Fase 5 — Empacotamento Android (`.apk` / `.aab`) via Capacitor + GitHub Actions (Sem Admin)

**Objetivo**: Gerar o aplicativo nativo Android pronto para instalar ou publicar na Google Play Store (integrando o Google ML Kit nativo do Android) usando os servidores gratuitos do GitHub.

### Entregáveis da Fase 5:
1. **Configuração do Capacitor (`capacitor.config.ts`) + Ponte Híbrida de Câmera/ML Kit**:
   * No navegador/iOS usa o motor Web; quando compilado no Android via Capacitor, aciona o Google ML Kit nativo do aparelho.
2. **Workflow Automatizado (`.github/workflows/build-android-deploy-pages.yml`)**:
   * Publica automaticamente o PWA e o arquivo `g6pd_rules.json` no **GitHub Pages** (custo R$ 0,00).
   * Compila na nuvem do GitHub o pacote Android (`.apk` para instalação direta nos celulares da família e `.aab` para a Google Play Store) sem instalar nada como Administrador no seu computador.
3. **Script de Auditoria Trimestral (`scripts/audit-rules.ts`)**:
   * Utilitário para revisar periodicamente a base, validar integridade de sinônimos/INS e gerar o changelog da nova versão trimestral.
