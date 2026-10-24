# G6PDApp — Leitor Inteligente de Rótulos, Bulas e Guia de Segurança para Deficiência de G6PD

Aplicativo gratuito, *local-first* (funciona 100% offline) e de custo operacional zero para leitura de rótulos de alimentos, medicamentos (princípios ativos e excipientes) e códigos de barras, voltado a famílias, escolas e cuidadores de crianças com **Deficiência de Glicose-6-Fosfato Desidrogenase (G6PD — CID-10: D55.0)**.

---

## 🎯 Propósito e Invariante Central

A Deficiência de G6PD reduz a proteção das hemácias contra o estresse oxidativo. O contato com agentes oxidantes (determinados medicamentos, feijão-fava, quinina, naftalina, henna e, nos protocolos pediátricos preventivos brasileiros, corantes artificiais e sulfitos) pode desencadear **anemia hemolítica aguda**.

> **Invariante #1 de Engenharia (`Zero Falsos Negativos`)**:
> O aplicativo **jamais** depende da opinião aberta de uma IA generativa para liberar um produto (`🟢 LIVRE`). O veredito é dado por um **Motor de Regras Determinístico Auditável** combinado com travas estritas de completude de leitura óptica (OCR) e desambiguação química.

---

## 📚 Documentação Estrutural do Projeto

Toda a concepção clínica, arquitetural e de engenharia está documentada na pasta [`docs/`](./docs/):

1. **[01 — Arquitetura e Contrato de Segurança](./docs/01-arquitetura-e-contrato-seguranca.md)**
   * Arquitetura em Cascata (Câmera Dupla EAN + OCR Local + Motor Determinístico + Handoff para IA do Usuário).
   * **As 4 Blindagens Críticas de Engenharia**:
     1. Trava de Completude Estrutural do Rótulo (proteção contra reflexo/foto cortada).
     2. Normalizador de Homóglifos OCR + Whitelist de Falsos Amigos Químicos (*Sulfato* $\neq$ *Sulfito*, *Vitamina K1* $\neq$ *K3*, *Caramelo I* $\neq$ *III/IV*).
     3. Duplo Veredito para Medicamentos Pediátricos (Princípio Ativo vs. Alerta de Corantes nos Excipientes).
     4. Estratégia Híbrida PWA + Capacitor (Google ML Kit Nativo via GitHub Actions sem exigir Admin na máquina de desenvolvimento).
   * Sincronização Trimestral Gratuita (`g6pd_rules.json` via GitHub Pages / CDN com validação de integridade).
   * Botão *"Analisar a fundo com minha IA"* (`navigator.share` / Android Intents / Deep Links) e Assistente de Voz Nativo.
   * Proteção Legal e Requisitos da Google Play Store.

2. **[02 — Base Clínica de Referência e Fontes Oficiais](./docs/02-base-clinica-referencia.md)**
   * Distinção entre o Consenso Farmacogenético Internacional (CPIC / OMS / Favismo.it) e o Protocolo Pediátrico Preventivo Brasileiro (Ministério da Saúde / EBSERH / SBP / APAE).
   * Tabelas completas de Corantes (Códigos INS e E-Numbers), Conservantes Sulfitos, Antioxidantes Sintéticos, Alimentos Proibidos, Medicamentos (Proibidos vs. Cautela vs. Seguros com atenção a excipientes) e Químicos Domésticos.
   * Sinais de Alerta de Crise Hemolítica e modelo do **Cartão de Bolso e Emergência (Modo Escola)**.
   * Lista de Fontes Oficiais para Auditoria Trimestral.

3. **[03 — Plano de Implementação em Fases](./docs/03-plano-implementacao-fases.md)**
   * Roteiro executável dividido em 5 Fases (da Base de Dados Auditada e Suíte de Testes Clínicos até a publicação do PWA e geração automatizada do `.apk`/`.aab` para a Google Play Store).
