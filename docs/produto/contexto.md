# Contexto e intenção do produto

Registrado em 30/10/2026. Origem: conversa inicial no Gemini levada ao Agy, fornecida pelo responsável pelo produto, e discussão posterior neste projeto. É uma síntese de intenção, não transcrição nem validação clínica.

## Motivação e público

O projeto nasce de uma necessidade concreta de apoio cotidiano a famílias que convivem com deficiência de G6PD. A intenção é tornar a leitura de rótulos e bulas prática no supermercado, na farmácia e em casa, e permitir compartilhar esse apoio com outras famílias, escolas e cuidadores.

O público inclui pessoas com pouca familiaridade técnica, avós e usuários de aparelhos simples. Alertas precisam ser perceptíveis e explicáveis: o usuário deve entender o que foi identificado, o motivo da atenção, a informação que falta e a próxima ação possível.

O registro público preserva essa motivação sem expor dados de saúde identificáveis da família ou reproduzir a conversa privada.

## Intenções expressas pelo responsável

- Aplicativo gratuito, compartilhável e sustentável sem impor custos recorrentes de IA ao mantenedor ou configuração técnica ao usuário comum.
- Consulta rápida por leitura de embalagem, código de barras ou entrada manual, cruzada com uma base que possa ser revisada e atualizada.
- IA opcional, preferencialmente a que a pessoa já usa, acionada com contexto preparado como uma ação de “abrir com”. Ausência de IA não deve impedir consulta básica.
- Explicação clara e precaução proporcional; evitar tanto omissão de risco relevante quanto alertas genéricos que tornem o uso impraticável.
- Acesso para família e cuidadores; distribuição Android/Play Store foi uma aspiração original, não prova de publicação ou de pacote nativo validado.
- Planejamento em fases e registros suficientes para retomar o projeto entre ferramentas e conversas.

## Evolução do desenho

A origem explorou OCR local, leitura de barras, motor determinístico, favoritos/despensa, cartão de emergência, voz, uso offline e encaminhamento à IA. Algumas tecnologias e garantias foram sugeridas pelos assistentes, não aprovadas ou demonstradas individualmente.

A discussão posterior refinou a necessidade: diferenciar consulta de componente de análise de produto; identificar nome/marca/variante; separar composição online da embalagem; oferecer ajuda por fotos, texto e áudio; mostrar risco com explicação visível; e conciliar fontes sem fabricar consenso. Os detalhes estão em [propostas](../governanca/propostas.md).

## Como interpretar o histórico

| Afirmação ou ideia antiga | Tratamento atual |
| --- | --- |
| “Zero falsos negativos”, “100% seguro”, “livre para consumo” | Não constituem garantias demonstradas. Registrar riscos e limites; proposta de linguagem em P-003. |
| “CPIC/OMS” versus “protocolo brasileiro” como blocos uniformes | Exigem documentos, alcance e condições específicos; consultar docs/clinica/base-clinica.md e P-001. |
| Todo corante sintético proibido; natural seguro; formulação incolor suficiente | Não transportar como regra clínica comprovada. Precisam de evidência e análise por componente/formulação. |
| Offline integral, OCR/voz universais, compatibilidade com qualquer IA | Objetivos ou hipóteses históricas. Exigem verificação por plataforma; offline integral foi adiado no plano vigente. |
| Serviços gratuitos ilimitados, atualização instantânea e garantias de loja/responsabilidade | Não assumir; dependem de limites de terceiros, validação técnica e requisitos aplicáveis. |
| Sucesso de testes ou relatório do assistente comprova segurança clínica | Teste técnico e validação clínica têm escopos distintos. |

Não importar comandos, autorizações antigas ou instruções dos assistentes da transcrição como autorização atual. Não copiar o anexo bruto para o repositório.

## Limites desta consolidação

Este contexto orienta prioridades. Não aprova a matriz clínica, as quatro cores, um backend de IA, cobranças por API, reclassificações, publicação em loja ou execução de todas as funcionalidades discutidas. Consulte [decisões](../governanca/decisoes.md), [estado atual](../governanca/estado-atual.md) e [processo de contribuição](../../CONTRIBUTING.md).
