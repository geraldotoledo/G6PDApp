# RL-004 — Verificação da candidata para uso pessoal

- Data: 30/10/2026; categoria: `pre_merge_or_release_validation`.
- Objetivo: verificar a versão local antes da publicação solicitada para revisão pessoal. Este registro é da **pré-publicação** e, por si só, não comprova integração nem deploy.
- Base da comparação: `master` remoto em `406ec3e`; branch documental em `fe1e4a3`. Na verificação, código e testes da candidata ainda eram alterações locais não commitadas.
- Observação: a base servida pelo endereço do GitHub Pages retornou versão 2026.10.1 e 62 regras. A base candidata é 2026.10.3 com 71 regras; duas cópias locais tinham SHA-256 idêntico.

## Verificações técnicas

- `npm test`: 160 testes aprovados, nenhum reprovado.
- `npm run audit`: auditoria técnica aprovada; o próprio relatório mantém 64 regras pendentes de fonte e/ou reconciliação clínica.
- `npm run rules:sync`: concluído; a cópia pública tinha o mesmo hash da base de origem antes e depois.
- TypeScript `tsc --noEmit`: aprovado. Vite gerou o build de produção em diretório temporário novo, preservando a pasta de build preexistente. A tentativa inicial de repassar `--outDir` por `npm run build` falhou por interpretação do argumento; a sequência equivalente de sincronização, TypeScript e Vite foi executada separadamente.
- Preview local do build: HTML, JavaScript, CSS e JSON da base responderam HTTP 200; o JSON retornou versão 2026.10.3 e 71 regras. A primeira consulta ao subcaminho do site no servidor local recebeu o fallback HTML; o preview foi conferido na raiz apropriada à configuração relativa do Vite.
- A ferramenta de navegador não inicializou; uma tentativa alternativa de iniciar navegador headless foi bloqueada pela revisão automática, que informou bloqueio por política. **Navegação visual, cliques, câmera, OCR real e uso em aparelho não foram verificados nesta rodada.**

## Limites e passagem

Os testes demonstram os cenários executados e não comprovam segurança clínica. Permanecem 64 regras `PENDING_REVIEW` e a necessidade de reconciliar classificações e mensagens. A publicação pessoal solicitada não equivale a aprovação clínica nem torna privadas páginas públicas.

O material candidato compreende os arquivos rastreados modificados de código, testes e base, mais `scripts/sync-rules.ts` e os três testes novos; a documentação deve acompanhar a mudança. Não incluir o cache nem o pacote histórico de transferência. Na data da verificação não havia sido feito commit, push ou deploy dessa candidata; consultar o histórico Git e o pipeline para o resultado posterior.
