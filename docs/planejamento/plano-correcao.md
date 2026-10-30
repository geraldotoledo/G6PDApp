# Achados (erros) da avaliação do G6PDApp

## Erros confirmados em execução

1. **Normalização apaga uma restrição:** `INS 223 e sal` vira `ins 223e sal`, deixa de corresponder ao sulfito e recebe `GREEN_SAFE`. Com vírgula após o código, o bloqueio funciona. Origem: `src/engine/normalizer.ts:35–40`.
2. **Completude aprova leitura insuficiente:** listas contendo `???`, listas sem ingredientes entre as âncoras e `Composição: amoxicilina. Excipientes:` recebem `GREEN_SAFE`. Origem: `src/engine/completenessGate.ts:81–93` e decisão final em `ruleEngine.ts:228–240`.
3. **Catálogo diverge do contrato documentado:** listas completas com INS 225, 226, 227 ou 228; `corante` ou `corante artificial`; cloranfenicol ou isoniazida recebem `GREEN_SAFE`. A documentação prevê restrição ou cautela nesses casos. A constatação é de divergência entre contrato e implementação, não de validação médica independente.
4. **Despensa apresenta aprovação sem validação:** o serviço aceita um produto contendo fava e o texto compartilhado o declara conferido no rótulo físico e aprovado. A despensa também nasce com produtos previamente declarados seguros, sem validação da família. Origens: `src/services/pantryStorage.ts` e `src/components/SafePantryScreen.tsx`.
5. **Consulta por EAN contradiz o motor:** ingredientes com `corante caramelo` produzem `YELLOW_ATTENTION`, mas a mensagem do serviço afirma `🟢 Aparentemente seguro`. A interface também colore resultados não vermelhos de verde. Origens: `src/services/openFoodFacts.ts:139–151` e `BarcodeScannerModal.tsx:221–234`.
6. **Atualização inválida pode liberar substância restrita:** uma cópia da base sem `riskLevel` na regra da tartrazina passa no validador; a análise de um rótulo com tartrazina retorna `GREEN_SAFE`. Origem: `src/services/rulesSync.ts:69–78`.
7. **Pré-processamento inverte a imagem:** na execução da função com pixels controlados e Canvas simulado, preto vira branco e branco vira preto. A fórmula de contraste usa uma escala que torna o fator negativo. Não foi medida a precisão do OCR em fotografias reais. Origem: `src/services/imageOcr.ts:53–66`.

## Erros e lacunas identificados por inspeção estática

8. **Aprovação pela base colaborativa contorna a conferência física:** o resultado do Open Food Facts pode ser salvo diretamente na despensa, embora a análise dispense a trava de completude e não comprove o rótulo da embalagem em mãos.
9. **A aprovação da despensa não acompanha o perfil clínico:** a tela não recebe o perfil atual nem recalcula a aprovação quando perfil ou base mudam.
10. **OCR não está entregue para primeira utilização offline:** o Tesseract usa recursos externos padrão de worker e idioma. Eles não estão empacotados localmente.
11. **Instalação PWA não garante os bundles offline:** o pré-cache omite JavaScript/CSS; o registro após `load` não garante que os recursos da primeira visita sejam armazenados pelo service worker.
12. **Leitura de barras não tem o fallback previsto:** sem `BarcodeDetector`, a função retorna `null`; não há ZXing implementado.
13. **Consulta por EAN ignora a despensa:** consulta o cache do Open Food Facts, mas não os produtos cadastrados ou importados pela família.
14. **Atualização automática não está integrada:** a sincronização só é chamada pelo botão; cabeçalho e tela Sobre exibem dados da base embutida, não necessariamente da ativa.
15. **ML Kit nativo não está implementado:** não há plugins nem caminho nativo de OCR e leitura de barras correspondentes ao checklist.
16. **Pipeline Android pode declarar sucesso sem APK:** falhas de Gradle são suprimidas; o upload inclui `dist/`, permitindo um artefato com nome de pacote Android contendo somente arquivos web.
17. **Artefatos release/AAB declarados não são gerados:** o caminho normal executa `assembleDebug`; não há geração de AAB ou assinatura release configurada.
18. **Proveniência clínica insuficiente:** selos agregados e páginas institucionais não identificam documento, edição, tabela ou página que sustenta cada classificação. Há inconsistência interna entre AAS como cautela na consulta e como proibido no cartão de emergência.

## Limites e evidências da avaliação de origem

- Leitura prévia de README e dos quatro documentos existentes em `docs/`.
- `npm test`: 14 testes aprovados.
- `npm run audit`: aprovado, com 62 regras e 12 entradas de whitelist.
- `npx tsc --noEmit`: sem erros.
- Vite iniciado e resposta HTTP observada.
- Casos adicionais executados diretamente no motor e nos serviços; armazenamento dos ensaios simulado em memória.
- Não houve validação interativa completa da interface, câmera física, fotografias reais, instalação/modo avião ou APK. O acesso interativo pelo navegador foi negado.
- As linhas citadas registram o estado avaliado; deverão ser conferidas antes de editar.

# Plano de implementação em três fases — funcionamento conectado

## Decisão de escopo e instruções ao executor

**Executor previsto:** Terra, em sessão posterior. Este documento também pode orientar outro agente executor.

**Decisão expressa do usuário:** adiar, por enquanto, a exigência de funcionar offline. Este plano substitui o roteiro anterior a partir desta seção; os achados acima permanecem como registro histórico, não como lista integral de bloqueadores desta entrega.

**Objetivo atual:** corrigir a segurança dos resultados e entregar os demais fluxos funcionando com acesso à internet. Não iniciar implementação apenas pela leitura deste documento.

### O que fica adiado e por quê

| Item | Situação nesta entrega | Justificativa |
| :--- | :--- | :--- |
| Achado 10: primeiro OCR sem rede | Adiado | Worker, WASM e idioma podem ser baixados durante o uso conectado; não é obrigatório empacotá-los agora |
| Achado 11: instalação e cache offline completos | Adiado | Não implementar inventário completo de pré-cache nem exigir abertura em modo avião |
| Transcrição de voz offline | Adiada | A consulta por voz deve funcionar no ambiente conectado suportado; não exige motor local de transcrição |
| Disponibilidade inicial de modelos Android sem rede | Adiada | Downloads iniciais de modelos são permitidos; a captura nativa continua no escopo |
| Ensaios de modo avião e instalação offline | Fora da aceitação atual | Não impedem concluir esta entrega conectada, mas não podem ser registrados como aprovados |

**Não confundir:** offline é disponibilidade sem internet. Ele não é requisito para corrigir um falso verde, validar uma atualização, guardar dados no aparelho ou conferir um rótulo. Esses comportamentos continuam obrigatórios.

- Manter OCR, câmera, fallback de barras, voz, despensa, atualização e Android. A decisão não autoriza substituir captura por digitação nem remover funcionalidades.
- Preservar armazenamento local, base embutida e capacidades já existentes; não apagar mecanismos apenas porque offline foi adiado.
- Corrigir falhas de cache que impeçam a versão conectada atual de carregar ou apresentar recursos coerentes. Isso é correção de funcionamento online, não implantação do offline completo.
- Atualizar mensagens e documentação que prometem `100% offline`, distinguindo a meta futura do suporte atual. Não declarar os achados 10 e 11 resolvidos.
- Permitir downloads de recursos necessários em ambiente autorizado, sem instalar SDKs pesados ou pacotes globais na máquina corporativa. Não alterar Defender, firewall ou permissões administrativas.
- Não adicionar servidor de OCR ou serviço pago: o processamento pode continuar local após o carregamento dos recursos pela rede.

### Orientações comuns

1. Ler `README.md`, `docs/index.md`, `docs/produto/arquitetura.md`, `docs/clinica/base-clinica.md` e este documento conforme a tarefa; consultar o histórico em `docs/init/` quando necessário. A decisão de adiar offline prevalece sobre requisitos antigos conflitantes. Conferir os arquivos atuais antes de editar.
2. Executar fase 1 → fase 2 → fase 3. Cada fase inclui implementação e sua própria verificação, sem deixar todas as regressões para o final.
3. Não apagar dados reais ou alterações alheias ao trabalho. Não executar `git add -A`, commit, push, deploy remoto ou publicação na loja automaticamente.
4. Reutilizar padrões existentes, migrar consumidores de contratos alterados e remover caminhos obsoletos. Não aplicar trechos de código de outro plano sem conferir compatibilidade e comportamento.
5. Usar dados fictícios nos ensaios; não enviar mensagens reais a terceiros.
6. Não declarar revisão clínica, instalação em aparelho ou execução de pipeline que não ocorreu.

### Invariantes mantidos

- Substância restrita detectada prevalece sobre leitura incompleta.
- Ausência de correspondência não basta para afirmar segurança.
- Lista vazia, ilegibilidade relevante e excipientes ausentes impedem aprovação do produto.
- Amarelo não pode ser apresentado como verde.
- Base colaborativa não comprova conferência física.
- Atualização inválida preserva a última base válida.
- Aprovação registra perfil, versão da base e evidência de conferência.
- Falha de rede ou OCR não pode reutilizar um resultado anterior como se pertencesse à nova captura.
- Conferência humana reduz risco, mas não comprova infalibilidade; não prometer zero falsos negativos.

## Fase 1 — Núcleo de segurança, catálogo e validação da base

**Objetivo:** eliminar os falsos verdes do núcleo e definir um contrato confiável para os consumidores.

**Achados:** 1, 2, 3, 6 e 18.

**Dependência:** leitura inicial e fontes verificáveis para mudanças clínicas. Pendência clínica não impede corrigir regex, completude e schema.

### 1.1 — Normalização e completude

**Arquivos principais:** `src/engine/normalizer.ts`, `completenessGate.ts`, `ruleEngine.ts`, `types.ts`, `tests/ruleEngine.test.ts`.

- [ ] Corrigir a normalização de `INS 223 e sal`, sem incorporar a conjunção ao código e sem quebrar sufixos legítimos ou `INS 15O d`.
- [ ] Delimitar o conteúdo real da lista e rejeitar ausência de ingredientes entre âncoras.
- [ ] Tratar `???`, caractere de substituição e sinais relevantes de ilegibilidade no interior da lista como leitura incompleta, sem diluí-los no restante do texto.
- [ ] Não considerar um ponto após o princípio ativo como fechamento de uma seção de excipientes ausente ou truncada.
- [ ] Separar status do princípio ativo da aprovação da apresentação completa; definir como essa informação chega aos consumidores.
- [ ] Preservar bloqueio por ingrediente restrito mesmo em leitura parcial.

**Justificativa:** uma heurística estrutural detecta alguns cortes, não prova integridade da foto. Corrigir o motor não elimina a conferência física da fase 2.

### 1.2 — Regras específicas, ambiguidade e proveniência clínica

**Arquivos principais:** `src/data/rules.json`, `public/g6pd_rules.json`, `src/data/defaultRules.ts`, `src/engine/ruleEngine.ts`, `types.ts`, `scripts/audit-rules.ts`, `docs/clinica/base-clinica.md`.

- [ ] Cruzar o catálogo com substâncias e códigos prometidos na documentação.
- [ ] Verificar referências para INS 225–228, cloranfenicol e isoniazida; implementar a classificação sustentada pelo protocolo, não copiar mecanismos médicos sem fonte.
- [ ] Tratar `corante` sem identificação como ambiguidade e `corante artificial` segundo o perfil aplicável.
- [ ] Dar precedência contextual à identidade específica: `corante natural urucum` não deve gerar amarelo genérico quando permitido.
- [ ] Não suprimir uma ocorrência genérica distinta no mesmo rótulo apenas porque outro corante foi identificado.
- [ ] Preservar correspondências seguras reconhecidas; separar identificação de substâncias problemáticas e representação visual. Se o contrato mudar, migrar todos os consumidores e testes comportamentais pertinentes.
- [ ] Vincular classificação a organização, documento, edição/data, URL e seção/tabela/página verificável.
- [ ] Distinguir risco, precaução e dependência de dose; revisar linguagem absoluta.
- [ ] Definir uma fonte autoritativa e gerar a cópia pública, evitando espelhamento manual sujeito a divergência.
- [ ] Ampliar o auditor para integridade e cobertura documental, sem chamá-lo de validação médica.

**Dependência clínica:** buscar as fontes disponíveis. Sem sustentação suficiente, registrar exatamente a regra, a evidência faltante e a decisão pendente. Não inventar revisão profissional nem converter incerteza em liberação. Uma aprovação clínica não pode ser substituída pela aprovação dos testes.

### 1.3 — Validação estrutural e ativação segura

**Arquivos principais:** `src/services/rulesSync.ts`, `src/engine/types.ts`, `scripts/audit-rules.ts`.

- [ ] Validar schema suportado, campos obrigatórios, enums de risco/categoria/protocolo, identificadores únicos, sinônimos, whitelist, versões, datas e referências.
- [ ] Rejeitar regras sem `riskLevel` ou `synonyms`, tipos inválidos e versões malformadas.
- [ ] Aplicar a mesma validação à base remota e à persistida.
- [ ] Preservar a última base válida se download, validação ou armazenamento falharem; não anunciar ativação antes da persistência confirmada.

**Justificativa:** isso é integridade do veredito, não uma funcionalidade offline. Internet disponível não torna um JSON semanticamente válido.

### Verificação e conclusão da fase 1

| Cenário | Resultado obrigatório |
| :--- | :--- |
| Lista completa com `INS 223 e sal` | Reconhecer INS 223 e bloquear no perfil aplicável |
| Lista vazia ou com ilegibilidade relevante | Não aprovar |
| `Composição: amoxicilina. Excipientes:` | Não aprovar a apresentação |
| Medicamento seguro com excipiente restrito | Bloquear produto sem confundir com status do princípio ativo |
| Sulfato/sulfito e K1/K3 | Preservar distinção |
| Corante natural identificado | Aplicar perfil sem alerta genérico indevido |
| Corante identificado e outra ocorrência genérica | Não esconder ambiguidade independente |
| Base sem risco/sinônimos ou schema incompatível | Rejeitar; manter base íntegra |

- [ ] Manter regressões determinísticas dos defeitos corrigidos.
- [ ] Executar `npm test`, `npm run audit` e `npx tsc --noEmit`.
- [ ] Exercitar o motor com os casos acima; adaptar consumidores imediatamente se necessário para manter o app utilizável.
- [ ] Registrar resultado observado, contratos alterados e pendências clínicas.

**Saída:** núcleo corrigido e contrato estabilizado. Não declarar aprovação clínica de uma regra sem a revisão correspondente.

## Fase 2 — EAN, despensa, sincronização e consistência da interface

**Objetivo:** impedir que serviços e telas transformem informação provisória em aprovação e refletir corretamente a base ativa.

**Achados:** 4, 5, 8, 9, 13, 14 e conclusão da apresentação do achado 18; completa a autenticidade das atualizações do achado 6.

**Dependência:** contrato do motor e validação estrutural da fase 1.

### 2.1 — Semáforo e conferência física

**Arquivos:** `src/services/openFoodFacts.ts`, `src/components/BarcodeScannerModal.tsx`, `ScannerScreen.tsx`, `DrugSearchScreen.tsx`.

- [ ] Preservar vermelho, amarelo e verde nas mensagens, badges, explicações e ações.
- [ ] Não tratar qualquer estado não vermelho como seguro; tratar também ausência de ingredientes e leitura incompleta.
- [ ] Separar consulta por termo/princípio ativo, resultado provisório online e avaliação completa do produto.
- [ ] Encaminhar os ingredientes obtidos por EAN ao fluxo de conferência, sem salvar diretamente como aprovados.
- [ ] Exigir confirmação explícita de comparação com o rótulo físico antes de registrar aprovação. Reiniciar essa confirmação quando os ingredientes mudarem.
- [ ] Não usar `isSearchQuery: true` como atalho para aprovar uma apresentação.
- [ ] Exibir o texto efetivamente lido e separar informações do princípio ativo e dos excipientes.

**Justificativa:** trocar o texto de um botão ou copiar ingredientes online para o scanner não comprova a embalagem em mãos. A confirmação deve estar associada ao conteúdo conferido.

### 2.2 — Despensa e migração não destrutiva

**Arquivos:** `src/services/pantryStorage.ts`, `src/components/SafePantryScreen.tsx`, `ScannerScreen.tsx`, `App.tsx`.

- [ ] Iniciar despensa real vazia; manter exemplos fora da lista de aprovados.
- [ ] Guardar origem, data, perfil, versão da base e evidência da conferência.
- [ ] Migrar cadastros antigos sem evidência para pendentes, preservando ingredientes e dados da família.
- [ ] Aplicar o mesmo contrato a cadastro manual, importação e scanner; validar tipos e campos consumidos pela interface.
- [ ] Reavaliar itens quando perfil/base mudarem; preservar o cadastro sem preservar aprovação que deixou de ser válida.
- [ ] Compartilhar como aprovados apenas itens elegíveis e conferidos. Identificar pendentes e bloqueados separadamente.
- [ ] Propagar falha de persistência, sem mensagem falsa de sucesso.
- [ ] Consultar a despensa por EAN antes da API pública e distinguir a origem do resultado; não confundir achado local com confirmação física atual.

**Justificativa:** armazenamento no aparelho e consulta à despensa continuam úteis com internet e não estão suspensos pela decisão sobre offline.

### 2.3 — Autenticidade e estado ativo das regras

**Arquivos:** `src/services/rulesSync.ts`, `src/App.tsx`, `Header.tsx`, `AboutScreen.tsx`, `DrugSearchScreen.tsx`, `ScannerScreen.tsx`, `SafePantryScreen.tsx`, scripts de publicação e workflow correspondente.

- [ ] Implementar verificação de integridade/autenticidade prevista no contrato, com metadados assinados e chave pública confiável no cliente.
- [ ] Manter chave privada fora do repositório e do cliente; configurar assinatura no ambiente autorizado. Checksum recebido junto do mesmo conteúdo não prova autoria.
- [ ] Rejeitar assinatura inválida antes da ativação, preservando a base íntegra.
- [ ] Integrar verificação automática não bloqueante na inicialização conectada.
- [ ] Exibir versão, data e fontes da base ativa em todos os consumidores.
- [ ] Recalcular análise aberta, busca e aprovação da despensa após ativação, sem exigir editar texto ou reiniciar.
- [ ] Distinguir revisão clínica, tentativa de atualização e verificação bem-sucedida.

**Justificativa:** assinatura é um requisito de confiança da atualização já documentado, independente do offline. A configuração de segredo pode exigir participação do responsável; não expor chaves no chat nem simular assinatura de produção.

### 2.4 — Coerência clínica nas saídas

**Arquivos:** `EmergencyCardScreen.tsx`, `DrugSearchScreen.tsx`, `AboutScreen.tsx`, `src/services/aiHandoff.ts`.

- [ ] Harmonizar AAS e demais recomendações entre consulta, cartão, impressão e texto compartilhado, com protocolo identificado.
- [ ] Exibir referências e qualificações definidas na fase 1; não rotular recomendação preventiva como consenso universal.
- [ ] Manter a IA como explicação opcional, sem autorização para substituir o veredito.

### Verificação e conclusão da fase 2

- [ ] `corante caramelo` mantém amarelo no modal EAN.
- [ ] Produto com fava nunca aparece nem é compartilhado como aprovado.
- [ ] Resultado online, item importado e registro antigo sem evidência não ganham conferência física automaticamente.
- [ ] Trocar para perfil estrito reavalia produtos com corantes naturais.
- [ ] EAN cadastrado apenas na despensa é localizado pela consulta.
- [ ] Base assinada válida atualiza versão e resultados abertos; assinatura/schema inválidos preservam a base anterior.
- [ ] Falha de armazenamento não mostra sucesso; importação inválida não derruba a tela.
- [ ] Exercitar esses fluxos na interface conectada com dados fictícios.
- [ ] Executar regressões pertinentes, auditor e build.

**Saída:** fluxos e aprovações coerentes com a evidência, perfil e base ativa. Registrar migração, ensaios e acessos externos pendentes.

## Fase 3 — Captura conectada, Android e aceitação integrada

**Objetivo:** entregar captura e instaladores reais, verificar o aplicativo completo conectado e documentar honestamente o escopo.

**Achados:** 7, 12, 15, 16 e 17; aceitação integrada dos demais. Achados 10 e 11 continuam adiados.

**Dependência:** aplicação corrigida nas fases 1 e 2. Aparelho Android e segredos de assinatura são necessários às verificações correspondentes, mas não a todo trabalho local.

### 3.1 — Contraste, OCR, barras e voz

**Arquivos:** `src/services/imageOcr.ts`, `voiceAssistant.ts`, `src/components/ScannerScreen.tsx`, `BarcodeScannerModal.tsx`, `package.json`, `package-lock.json`.

- [ ] Corrigir a fórmula de contraste para fator positivo e avaliar perda por saturação antes de escolher o parâmetro.
- [ ] Usar como referência calculada: a fórmula antiga produz aproximadamente `-8,21655`; `contrastOffset = 45` produz aproximadamente `1,42386`. O parâmetro é candidato, não melhoria de OCR já demonstrada.
- [ ] Preservar ordem não decrescente de luminância; não prometer preservação de todas as diferenças após clipping.
- [ ] Verificar carregamento dos recursos Tesseract pela rede no caminho real de produção. Não exigir empacotamento local nesta entrega.
- [ ] Implementar fallback de barras em navegadores sem `BarcodeDetector`; não substituir captura por digitação.
- [ ] Em cancelamento, falha de download ou OCR vazio, exibir estado coerente e impedir que o resultado anterior pareça pertencer à nova foto.
- [ ] Exercitar transcrição e síntese de voz no ambiente conectado suportado. Explicar dependência de rede e indisponibilidade de APIs quando aplicável.

**Justificativa:** o defeito de contraste e a ausência de fallback afetam o uso conectado e continuam obrigatórios. Download inicial de recursos não é, por si só, defeito no escopo atual.

### 3.2 — Android nativo e pipeline

**Arquivos:** `package.json`, `package-lock.json`, `capacitor.config.ts`, serviços de captura, projeto Android e `.github/workflows/build-android-and-pages.yml`.

- [ ] Fixar versões compatíveis de Capacitor e plugins ML Kit e integrar caminhos nativos de OCR e barras no Android.
- [ ] Preservar o caminho web; configurar permissões e ciclo de vida da câmera, sem simular leitura em caso de falha.
- [ ] Permitir instalação/download inicial dos modelos com rede, explicando progresso e erros; não exigir primeiro uso em modo avião.
- [ ] Compilar pelo CI autorizado; não instalar Android SDK ou ferramentas globais na máquina corporativa.
- [ ] Remover supressão de erros de preparação e Gradle.
- [ ] Separar artefatos web de instaladores e exigir presença dos binários anunciados.
- [ ] Gerar APK de instalação e AAB release com assinatura válida usando segredos do CI.
- [ ] Preservar Pages, sem usar sucesso web como prova de build Android.
- [ ] Não executar push, deploy ou publicação na loja sem autorização.

**Justificativa:** adiar offline não adia o Android já documentado. Um pacote contendo apenas `dist/` não é APK, mesmo que a aplicação web funcione.

### 3.3 — Aceitação ponta a ponta e documentação

- [ ] Executar `npm test`, `npm run audit` e `npm run build` na versão candidata.
- [ ] Verificar a superfície real conectada: onboarding, perfis, texto, foto, EAN, busca, despensa, cadastro/importação/exportação, IA, cartão, impressão/PDF e conteúdo compartilhável.
- [ ] Reexecutar os cenários de falso verde com os critérios das fases 1 e 2.
- [ ] Avaliar fotos reais de embalagens claras, curvas e com reflexo; registrar texto esperado, extraído e veredito.
- [ ] Verificar fallback de barras e consulta por voz em ambientes suportados.
- [ ] Instalar APK em aparelho real e testar captura, permissões, armazenamento, perfil e atualização da base com rede disponível.
- [ ] Validar AAB com ferramenta Android apropriada e assinatura dos artefatos.
- [ ] Demonstrar, em ambiente de CI autorizado, que falha de Gradle falha o job e não publica pacote web como instalador.
- [ ] Verificar carregamento e atualização da versão web conectada sem mistura de HTML/bundles incompatíveis; corrigir apenas o necessário a esse funcionamento.
- [ ] Atualizar `README.md`, a arquitetura atual, a base clínica quando pertinente, mensagens de interface e este plano: offline adiado por decisão do usuário, sem promessas de suporte integral atual. Preservar os documentos iniciais como histórico, sem reescrevê-los como estado vigente.
- [ ] Remover scripts descartáveis e dados de ensaio; manter regressões relevantes.

### Critério final de conclusão desta entrega

1. Nenhum falso verde conhecido permanece reproduzível nos casos cobertos.
2. Fluxos incluídos neste plano funcionam conectados na plataforma correspondente e possuem evidência de execução.
3. Aprovações são rastreáveis e coerentes com perfil, base e conferência.
4. Atualizações inválidas não alteram o veredito por corrupção da base.
5. Fontes clínicas são auditáveis e revisão profissional só é declarada se ocorreu.
6. Pipeline entrega os artefatos anunciados e propaga falhas.
7. Offline está explicitamente adiado, não falsamente resolvido nem usado como impedimento desta entrega.
8. Falta de aparelho, segredo ou decisão clínica é registrada como pendência concreta; não é escondida com mock ou conclusão fictícia.

## Registro e passagem de contexto

Registrar a cada bloco: tarefas concluídas, arquivos/contratos alterados, comandos/cenários executados, resultados observados e pendências. Se houver bloqueio externo, concluir o trabalho independente possível e especificar exatamente o acesso ou decisão faltante.

| Fase | Estado | Implementação | Evidências | Pendências |
| :--- | :--- | :--- | :--- | :--- |
| **1 — Núcleo de segurança** | **Correção técnica verificada; conclusão clínica pendente** | Segunda correção em `docs/planejamento/correcao-fase-1.md`: C1–C4 implementados; base v2026.10.3 com 71 vínculos e natureza de evidência, 7 DOCUMENTED e 64 PENDING_REVIEW com notas individuais; geração validada da cópia pública no prebuild, auditor sem reparação silenciosa. | 160/160 testes; auditoria técnica aprovada; `npx tsc --noEmit` e build aprovados. Scanner exercitado no navegador para excipientes q.s.p., ###/@@, lista legível e tartrazina com ruído. Sincronização exercitada via HTTP local e armazenamento isolado, incluindo falhas da base e do metadado. | 64 pendências clínicas individualizadas em `docs/clinica/base-clinica.md` e na base: fontes específicas/reconciliação profissional. Não declarar fase 1 integralmente concluída nem aprovação médica pelo sucesso dos testes. |
| **2 — Fluxos e estado ativo** | Pronta para execução | — | — | — |
| **3 — Captura, Android e aceitação conectada** | Não iniciada | — | — | — |
| **Offline completo — fora destas fases** | Adiado por decisão do usuário | Não exigido nesta entrega | Não verificado | Achados 10 e 11 e requisitos associados |

**Modelo de passagem:** fase/bloco atual; tarefas concluídas; arquivos e contratos; migração; comandos e resultados; pendências clínicas ou de acesso; próxima ação concreta.
