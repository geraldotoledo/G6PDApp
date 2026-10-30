# G6PDApp — Apoio à leitura de rótulos e bulas

Projeto de aplicativo gratuito para ajudar famílias, escolas e cuidadores a identificar componentes que merecem atenção na deficiência de G6PD. Combina leitura de composição, consulta de produtos e regras rastreáveis, com encaminhamento opcional à IA do usuário.

O objetivo é oferecer informação compreensível para apoiar decisões, com alertas proporcionais e explicação das limitações. Resultado do aplicativo não certifica segurança de consumo nem substitui avaliação profissional.

## Comece aqui

- [Índice e autoridade dos documentos](docs/index.md)
- [Contexto, público e objetivos](docs/produto/contexto.md)
- [Estado atual e pendências](docs/governanca/estado-atual.md)
- [Propostas em discussão](docs/governanca/propostas.md) e [decisões registradas](docs/governanca/decisoes.md)
- [Como propor, revisar, implementar e atualizar a documentação](CONTRIBUTING.md)

## Limites atuais

A revisão clínica está incompleta; consulte o [registro de evidências e lacunas](docs/clinica/base-clinica.md). Testes de software não comprovam validade clínica. O plano vigente prioriza uso conectado; funcionamento integral offline, entrega Android e publicação em loja exigem evidência própria e não devem ser presumidos pelos registros iniciais.

Em 30/10/2026, esta documentação também descreve alterações locais ainda não commitadas: a base local está na versão 2026.10.3, com 71 regras; o commit `406ec3e` em `master` contém a versão 2026.10.1, com 62 regras. Uma publicação apenas da documentação não inclui essas alterações de código e base, nem comprova a versão implantada no aplicativo.

A gratuidade e a baixa dependência de serviços pagos são objetivos de produto, não garantias de capacidade ilimitada de terceiros. Leia o estado atual antes de reutilizar promessas dos documentos históricos.

## Desenvolvimento local

Com as dependências já disponíveis, `npm run dev` inicia o desenvolvimento. Comandos de validação e critérios de escolha estão em [CONTRIBUTING.md](CONTRIBUTING.md). Instalações, publicação e operações remotas dependem de autorização específica.
