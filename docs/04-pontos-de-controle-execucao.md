# 04 — Lista de Pontos de Controle de Execução (Fases 3, 4 e 5)

Este documento registra os pontos de controle das Fases 3, 4 e 5 do **G6PDApp**, servindo como ledger de persistência permanente do progresso.

---

## 📌 Checklist de Execução

### FASE 3: Câmera Dupla (Código de Barras EAN-13 + OCR de Rótulo) + Despensa Segura
- [ ] **PC-3.1**: Serviço Open Food Facts (`src/services/openFoodFacts.ts`) com busca por EAN-13, cache local e Trava contra Reformulação Silenciosa.
- [ ] **PC-3.2**: Leitor de Código de Barras (`src/components/BarcodeScannerModal.tsx`) usando a API nativa `BarcodeDetector` + captura por câmera/arquivo.
- [ ] **PC-3.3**: Módulo de OCR Local por Foto (`src/services/imageOcr.ts`) com pré-processamento de imagem em Canvas (contraste, escala de cinza, redução de reflexos) para extrair texto de fotos de rótulos.
- [ ] **PC-3.4**: Despensa Segura da Família (`src/components/SafePantryScreen.tsx` e `src/services/pantryStorage.ts`):
  - Salvar produtos validados pelos pais (nome, marca, código EAN, ingredientes e data).
  - Exportar / Importar Despensa Segura (JSON e texto WhatsApp) para envio com 1 clique aos celulares dos avós e escola.
- [ ] **PC-3.5**: Integração com a navegação principal, verificação de testes unitários e commit no Git (`feat(camera-pantry)`).

---

### FASE 4: Sincronizador Remoto Gratuito (`SyncEngine`), Voz Nativa e PWA Offline
- [ ] **PC-4.1**: `SyncEngine` (`src/services/rulesSync.ts`):
  - Verificação silenciosa de versão mais recente do `g6pd_rules.json` via GitHub Pages / jsDelivr CDN com bypass de cache.
  - Validação de integridade anti-corrupção (contra Wi-Fi público de supermercado / captive portals) antes de atualizar o armazenamento local.
  - Painel de status e botão manual "Verificar Atualizações" no app.
- [ ] **PC-4.2**: Assistente de Voz Nativo ("Esse produto pode?"):
  - Integração no `ScannerScreen` com `SpeechRecognition` para ditar perguntas por voz e `speechSynthesis` para falar o veredito em voz alta sem custos de nuvem.
- [ ] **PC-4.3**: Configuração PWA Completa (`public/manifest.webmanifest`, ícones SVG, Service Worker `public/sw.js` para cache offline de assets e registro em `src/main.tsx`).
- [ ] **PC-4.4**: Validação de testes, build de produção e commit no Git (`feat(sync-voice-pwa)`).

---

### FASE 5: Pipeline GitHub Actions (Compilação Android APK/AAB sem Admin) + Auditoria
- [ ] **PC-5.1**: Configuração Capacitor (`capacitor.config.ts`) para empacotamento híbrido Android com Google ML Kit nativo.
- [ ] **PC-5.2**: Workflow GitHub Actions (`.github/workflows/build-android-and-pages.yml`):
  - Publicação automática do PWA e do `g6pd_rules.json` no GitHub Pages.
  - Compilação na nuvem dos pacotes Android (`app-release.apk` para instalação direta e `.aab` para Google Play Console) sem exigir Admin na máquina corporativa.
- [ ] **PC-5.3**: Script de Auditoria Trimestral (`scripts/audit-rules.ts`):
  - Validador estrito de integridade do `g6pd_rules.json` (checa duplicatas de INS, sinônimos vazios e integridade de referências).
- [ ] **PC-5.4**: Validação final de ponta a ponta (`npm test`, `npm run build`), atualização da documentação (`README.md`, `docs/`) e commit final no Git (`feat(release-pipeline)`).
