# Retomada do chat — avaliação e plano do G6PDApp

> Registro histórico anterior à segunda correção. Para estado e instruções atuais, consulte o [índice](../index.md) e o [estado atual](../governanca/estado-atual.md). Caminhos locais e dados identificadores foram omitidos nesta cópia de arquivo.

Registro solicitado pelo usuário para sair e continuar posteriormente com o contexto preservado. Este arquivo é um resumo estruturado da conversa, não uma exportação literal de todas as mensagens e saídas de ferramentas. A reabertura da mesma conversa depende do histórico da interface; este documento e o Memorix permitem recuperar o contexto se uma nova conversa for necessária.

## Projeto e instrução vigente

- Projeto: G6PDApp; não confundir com o diretório inicial da sessão que originou o registro.
- Idioma: português.
- O usuário pediu inicialmente avaliação, leitura da documentação antes e nenhuma alteração no aplicativo.
- Depois autorizou criar e atualizar documentos de planejamento. Nenhuma implementação foi autorizada ou iniciada neste chat.
- O estágio atual é um aplicativo de testes que deve ser funcional. Arquitetura e hospedagem no GitHub são temporárias; não usar isso para justificar funcionalidades ausentes.
- Decisão posterior e prevalente: **adiar funcionamento offline por enquanto**; o restante continua no escopo.
- Executor futuro indicado: **Terra**. O usuário também discutiu um plano do **Agy/Antigravity** para Gemini 3.8.
- Não iniciar implementação automaticamente na retomada. Primeiro recuperar contexto e atender ao novo pedido do usuário.

## Documentos e ponto de parada

1. `docs/05-plano-correcao-achados-avaliacao.md`: documento criado e atualizado neste chat. Começa com 18 achados e depois contém o plano atual em três fases para funcionamento conectado, com justificativas, critérios e registro de execução.
2. `docs/06-checklist-implementacao-3-fases.md`: encontrado na pasta ao salvar esta retomada; **não foi criado neste chat**. A inspeção de títulos e trechos mostrou checklist baseado no docs/05, escopo conectado, restrições da máquina e tarefas ainda não marcadas nos trechos exibidos. Ler integralmente antes de usá-lo ou modificá-lo. Não presumir que houve implementação.
3. Este arquivo: contexto de retomada, não relatório de implementação.
4. Documentos originais lidos antes da avaliação: README e os então documentos 01 a 04; os históricos 01, 03 e 04 estão atualmente em `docs/init/`, e 02 permanece na raiz de `docs/`.

A última solicitação do usuário foi salvar o chat localmente e no Memorix para poder sair e retornar com o contexto.

## Plano atual — três fases

### Fase 1 — Núcleo de segurança

- Normalização INS sem consumir a conjunção de `INS 223 e sal`.
- Completude: lista vazia, ilegibilidade e excipientes ausentes não podem liberar produto.
- Separação entre princípio ativo e apresentação completa.
- Cobertura do catálogo, ambiguidade contextual e fontes clínicas específicas.
- Preservação das correspondências seguras e migração dos consumidores se houver mudança do contrato.
- Validação profunda da base remota e persistida; rejeitar campos ausentes e schema inválido.

### Fase 2 — EAN, despensa e estado ativo

- Semáforo coerente: amarelo não pode virar verde.
- Consulta colaborativa não equivale a conferência física.
- Aprovação com confirmação ligada ao texto conferido, origem, data, perfil e versão da base.
- Despensa inicial vazia, migração não destrutiva de registros antigos para pendentes quando faltar evidência.
- Reavaliação por perfil/base e compartilhamento sem aprovações indevidas.
- Consulta à despensa por EAN antes da API pública.
- Atualização autenticada, estado reativo da base ativa e sincronização automática não bloqueante.
- Coerência das recomendações entre busca, cartão, impressão, compartilhamento e IA.

### Fase 3 — Captura conectada, Android e aceitação

- Corrigir contraste e validar fotos reais; não assumir que um parâmetro matematicamente válido melhora o OCR.
- OCR com recursos baixados pela rede é permitido.
- Fallback de barras e voz conectada continuam no escopo.
- ML Kit/Capacitor, permissões, pipeline que falha honestamente, APK/AAB assinados.
- Verificação real dos fluxos, documentação alinhada e registro de limites.

### Offline adiado, não resolvido

- Achados 10 e 11 ficam adiados: primeiro OCR sem rede e cache/instalação offline completos.
- Não exigir empacotamento local de worker/WASM/idioma, modo avião ou transcrição local nesta entrega.
- Preservar armazenamento no aparelho e capacidades já existentes.
- Corrigir cache que quebre funcionamento conectado, sem transformar isso em projeto de offline completo.
- Remover/qualificar promessas atuais de `100% offline` quando implementar a atualização documental.
- Android, OCR, câmera, barras, segurança e revisão de fontes não foram retirados do escopo.

## Achados principais e evidência histórica

A avaliação foi do estado encontrado naquele momento; não presumir que os arquivos continuam iguais na retomada.

### Confirmados por execução do motor/serviços

1. `Ingredientes: açúcar, conservador INS 223 e sal. ALÉRGICOS: CONTÉM LEITE.` virou `ins 223e` e recebeu `GREEN_SAFE`; a versão com vírgula após 223 bloqueou.
2. Lista com `???` entre ingredientes, lista vazia entre âncoras e `Composição: amoxicilina. Excipientes:` receberam `GREEN_SAFE`.
3. Listas completas com INS 225–228, corante genérico/artificial, cloranfenicol ou isoniazida receberam verde apesar do tratamento previsto na documentação. Isso demonstra divergência contratual, não validação médica independente das classificações.
4. Serviço da despensa aceitou fava e gerou texto afirmando que os produtos eram conferidos fisicamente e aprovados. Inicialização incluía duas amostras pré-aprovadas.
5. `corante caramelo` produziu `YELLOW_ATTENTION` no motor e mensagem verde de aparentemente seguro no serviço EAN.
6. Base copiada em memória sem `riskLevel` na regra da tartrazina foi aceita pelo validador; rótulo com tartrazina passou como verde.
7. Pré-processamento real exercitado com pixels controlados e Canvas simulado inverteu preto/branco. Não houve medição do OCR em fotos reais.

### Inspeção estática

- EAN permitia salvar produto colaborativo como aprovado sem conferência física.
- Despensa não reavaliava aprovação por perfil/base.
- Recursos OCR dependiam de CDN; pré-cache não garantia bundles offline (agora adiados).
- Sem fallback ZXing quando BarcodeDetector não existe.
- Busca EAN ignorava despensa da família.
- Sincronização somente manual; versão mostrada em telas vinha da base embutida.
- ML Kit não integrado.
- Pipeline escondia erro Gradle e podia publicar dist como se fosse pacote Android; AAB/release não gerados conforme prometido.
- Fontes clínicas genéricas e divergência de classificação do AAS entre consulta e cartão.

## Verificações efetivamente executadas na avaliação

- `npm test`: 14 testes aprovados.
- `npm run audit`: aprovado, 62 regras e 12 entradas de whitelist.
- `npx tsc --noEmit`: sem erros.
- Vite iniciado em `127.0.0.1:5178`; resposta HTTP observada. Servidor encerrado após avaliação.
- Scripts temporários inline exercitaram motor, serviços e pixels; armazenamento de teste em memória, sem cadastrar dados reais.
- Não executar esses resultados históricos como se fossem evidência da versão futura.
- Não houve build de produção nesta avaliação, teste Android, câmera física, OCR com foto real ou verificação visual interativa completa.
- A abertura do navegador chegou a informar título/URL, mas a inspeção interativa foi negada; não repetir acesso negado sem nova autorização.

## Discussão com o Agy — conclusões úteis

Plano externo do Agy (v3.0 na leitura). A localização local foi omitida; o documento pode ter mudado desde então.

- Concordância: o plano anterior do Codex tinha fase 1 ampla; separar núcleo de serviços/interface melhora isolamento. As restrições Windows sem admin deveriam estar explícitas.
- Código-alvo não deve ser chamado de verificado sem evidência de execução.
- Valor exato calculado da fórmula antiga de contraste: aproximadamente **-8,21655**, não -3,17.
- `contrastOffset = 45` dá aproximadamente **+1,42386**; é candidato, não melhoria de OCR comprovada. Com clipping, cinzas 20 e 30 viram zero; monotonicidade é não decrescente, não preservação de todas as diferenças.
- Descobrir bundles pelo HTML e ignorar falhas no install do SW não garante offline; hoje esse trabalho está adiado.
- `isSearchQuery: true` serve para identificação/reavaliação de termos, não como prova de completude ou conferência.
- Remover SAFE de matches exige revisar contrato; teste existente verificava reconhecimento de urucum/cúrcuma.
- Classificações clínicas precisam de referências, não apenas JSON pronto.
- Não executar automaticamente git add -A, commit, push ou deploy; podem incluir alterações alheias e publicar sem autorização.
- Conferência humana reduz risco, não elimina erros por decreto.

## Estimativas — correção importante

O assistente inicialmente estimou 10–18 dias úteis; o usuário questionou se eram correções de horas e validações distribuídas por dias. O assistente reconheceu exagero e retirou a faixa como previsão confiável. Defeitos localizados são trabalho de horas; integrações ausentes e verificação em dispositivos podem exigir mais ciclos. Não reutilizar a estimativa retirada como compromisso.

## Restrições e retomada segura

- Máquina Windows corporativa sem administrador; não instalar pacotes globais/SDK Android local nem alterar Defender ou firewall.
- Compilação Android prevista no CI autorizado.
- Assinatura e aparelho real podem exigir acesso externo; informar exatamente o bloqueio e terminar o que for independente.
- Não inventar fontes médicas, aprovação profissional, binários, testes ou deploy.
- Mudanças observadas depois deste chat são do usuário/outros agentes; preservar e adaptar.
- Ao iniciar a retomada, ler docs/05, docs/06 e o estado atual necessário, sem presumir que nada mudou.

## Memorix e possíveis memórias antigas

Ao iniciar a persistência, o Memorix foi vinculado explicitamente ao projeto G6PDApp; caminho local e identificador da sessão foram omitidos nesta cópia.

O cartão de continuação citou memórias antigas de outro agente, inclusive #750 com título de implementação concluída/publicada. Esse título não foi validado neste chat e não substitui as evidências acima nem prova execução deste plano. Conferir fonte/data/escopo se for relevante. A decisão mais recente deste chat adia offline e a implementação não foi iniciada por este assistente.

## Mensagem sugerida para continuar

> Mensagem histórica de retomada: consultar este registro e o Memorix, depois os documentos 05 e 06; aguardar novo pedido antes de implementar. Para continuar hoje, use o índice e o estado atual.
