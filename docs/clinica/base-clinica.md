# Registro documental e pendências clínicas da base G6PD

## 1. Limites deste registro

Este registro descreve o catálogo em `src/data/rules.json`, versão **2026.10.3**, atualizado em **26/10/2026**, e sua cópia de distribuição `public/g6pd_rules.json`. Na organização documental de 30/10/2026, essa versão estava apenas no diretório local, enquanto o commit `406ec3e` em `master` continha a versão **2026.10.1**, com 62 regras. A publicação exclusivamente documental não incluiu a base local; consulte o histórico Git para verificar integração posterior.

As 71 regras recebem natureza da classificação (`evidenceKind`), vínculo (`sourceRef`), estado documental (`provenanceStatus`) e nota específica. São **7 DOCUMENTED e 64 PENDING_REVIEW**. Essas contagens descrevem o cadastro, não resultado de ensaio automatizado ou aprovação profissional.

- `DOCUMENTED`: um documento específico recuperado sustenta a **classificação** descrita, com localização registrada. Não certifica cada sinônimo comercial, mecanismo, dose ou excipiente; as notas delimitam o alcance.
- `PENDING_REVIEW`: a classificação legada foi preservada, mas o documento é somente candidato, não cobre o item, apresenta recomendação divergente ou deixa lacuna relevante. A nota identifica a lacuna e a decisão clínica necessária. Não é aprovação tácita.
- `evidenceKind` descreve a natureza pretendida da regra; em uma pendência, não afirma que essa evidência já foi demonstrada. Identificação química/INS, política de precaução pediátrica e risco hemolítico são coisas distintas.
- `protocolSource` e `clinicalMechanism` preexistentes foram mantidos para não fazer uma reclassificação médica automática. Atribuições a CPIC/OMS/SBP/APAE nesses campos **não foram todas comprovadas**; divergências abaixo e nas notas impedem tratá-las como endosso institucional.
- Ausência de um item na CPIC não demonstra segurança, contraindicação ou ausência de risco. A diretriz tem escopo farmacogenético definido, não é catálogo completo de aditivos alimentares.

**Bloqueio clínico externo:** faltam documento específico e/ou reconciliação por profissional habilitado para as 64 pendências individualizadas abaixo, incluindo dose, via, população, agrupamentos e fontes brasileiras alegadas. Não anunciar validação clínica do catálogo nem conclusão integral da fase 1 enquanto esse critério estiver aberto. O agente não alterou classificações para resolver divergências por inferência.

## 2. Fontes recuperadas e alcance real

### CPIC — `src-cpic-g6pd`

Gammal RS et al. **Expanded Clinical Pharmacogenetics Implementation Consortium Guideline for Medication Use in the Context of G6PD Genotype**. DOI **10.1002/cpt.2735**; aceito em 26/08/2022; publicação em *Clinical Pharmacology & Therapeutics*, 113(5), maio de 2023. A atribuição anterior a “Luzum et al., 2022 Update” foi removida.

[PDF primário recuperado](https://files.cpicpgx.org/data/guideline/publication/G6PD/2022/36049896.pdf) · [página da diretriz](https://cpicpgx.org/guidelines/cpic-guideline-for-g6pd/).

Localizações: tabela 2 nas páginas 4–5 do PDF (risco por fármaco); tabela 3 na página 6 (alto risco); tabela 4 na página 7 (primaquina/dose); seção nitrofurantoína na página 8 e tabela 5 (risco intermediário); seção *Incidental findings* na página 4 e *Recommendations for incidental findings* na página 8 (fava). `Low to no` não elimina cuidados usuais nem torna todo medicamento adequado à automedicação. A CPIC ressalva exposição acima da estudada e deficiência com anemia hemolítica não esferocítica crônica.

A tabela 2 classifica o azul de toluidina por **extrapolação** do azul de metileno (nota a); o vínculo documental não deve ser descrito como ensaio direto independente de toluidina.

### HU-UFJF / HU Brasil — `src-ebserh-ms-g6pd`

Tojo IAA, Ferreira AA, Grunewald STF. **Deficiência de G6PD: guia prático para famílias e cuidadores**. Hospital Universitário da Universidade Federal de Juiz de Fora / HU Brasil, Juiz de Fora, **2026**, 28 páginas (créditos e catalogação na página 2).

[PDF primário recuperado](https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-sudeste/hu-ufjf/comunicacao/noticias/2026-1/cartilha-orienta-sobre-a-deficiencia-de-g6pd/DeficinciadeG6PD_CartilhaA52.pdf) · [anúncio institucional de 08/07/2026](https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-sudeste/hu-ufjf/comunicacao/noticias/2026-1/cartilha-orienta-sobre-a-deficiencia-de-g6pd).

Localizações: páginas 16–17, substâncias a evitar; páginas 18–20, medicamentos **provavelmente seguros nas doses habituais**, sempre com orientação médica. Página 17 determina evitar favas, naftalina e tinturas à base de henna; página 19 inclui paracetamol, dipirona/metamizol, cloranfenicol, isoniazida, cloroquina/hidroxicloroquina e ácido nalidíxico entre provavelmente seguros; página 20 inclui quinina e sulfas. Página 16 recomenda evitar nitrofurantoína e fenazopiridina, em divergência com os níveis da CPIC.

O documento recuperado **não** contém a lista de exclusão de corantes INS 100–180 ou sulfitos INS 220–228 que o cadastro anterior lhe atribuía. Sua existência não valida essa atribuição, nem o transforma em protocolo nacional do Ministério da Saúde ou SBP/APAE. A cartilha avisa que não substitui avaliação médica (página 3).

### FAO / Codex — `src-codex-sulphites`

**SULPHITES**, [página histórica primária recuperada](https://www.fao.org/4/y0474s/y0474s6m.htm). Data de edição não indicada no trecho; não foi inventada edição vigente.

Tabela inicial: sulfur dioxide 220; sodium sulphite 221; sodium hydrogen sulphite 222; sodium metabisulphite 223; potassium metabisulphite 224; potassium sulphite 225; calcium hydrogen sulphite 227; potassium bisulphite 228; sodium thiosulphate 539. **Não lista 226**. Confirma identidades/códigos ali presentes, não risco de hemólise em G6PD. A página GSFA atual consultada retornou HTTP 403; não foi usada como se tivesse sido lida.

### EFSA — `src-efsa-sulfites-2022`

**Follow-up of the re-evaluation of sulfur dioxide (E 220), sodium sulfite (E 221), sodium bisulfite (E 222), sodium metabisulfite (E 223), potassium metabisulfite (E 224), calcium sulfite (E 226), calcium bisulfite (E 227) and potassium bisulfite (E 228)**, resumo em linguagem simples, **24/11/2022**.

[PDF primário recuperado](https://www.efsa.europa.eu/sites/default/files/2022-11/7594-PLS-sulfites.pdf). Página 1, título e seção *Sulfur dioxide-sulfites – an overview*: identifica calcium sulfite **E226**, calcium bisulfite E227 e potassium bisulfite E228. Página 2 descreve insuficiência de dados e preocupações de exposição alimentar elevada. Essa avaliação toxicológica geral **não** demonstra alto risco hemolítico específico em G6PD nem valida o código **INS226** automaticamente.

## 3. Candidatos e tentativas sem comprovação

| ID | Fonte candidata | Situação honesta |
| --- | --- | --- |
| `src-sbp-spsp-g6pd` | [SPSP](https://www.spsp.org.br/) / SBP | Nenhum título/edição/trecho específico recuperado que sustente a exclusão ampla de corantes, sulfitos, TBHQ/BHA/BHT ou dipirona atribuída a SBP/APAE. Portal não é protocolo. |
| `src-favismo-it` | [Favismo.it](https://www.favismo.it/) | Documento/edição/trecho específico não recuperado. Removida a alegação de “Referência Europeia / EMA”; portal não prova endosso da EMA. |
| `src-anvisa-bulario` | [Bulário Eletrônico ANVISA](https://consultas.anvisa.gov.br/#/bulario/) | Portal de consulta, não bula selecionada. Faltam produto registrado, apresentação, data e seção para alegações sobre composição; tampouco comprova norma de rotulagem ou classificação G6PD. |

O [Protocolo de Atenção às Crianças com Deficiência de Glicose-6-Fosfato Desidrogenase da SES-DF](https://www.saude.df.gov.br/documents/37101/78832/Defici%C3%AAncia+de+G6PD.pdf/7ba4f35f-a12b-a8ef-3b24-295fe57f6d6d?t=1648504042062) foi localizado na pesquisa. O servidor forneceu PDF binário, mas a extração de texto falhou, inclusive em URL alternativa; não atribuímos páginas/recomendações não lidas. A cartilha HU-UFJF o cita como GDF/SES-DF, 2013; essa citação não é conferência da edição no original. A página RCH recuperada não expôs o corpo do guia; não foi usada para documentar uma regra.

## 4. Registro individual — corantes e antioxidantes

Abreviações: **P** = `PENDING_REVIEW`; **D** = `DOCUMENTED`. **PP** = `PEDIATRIC_PRECAUTION`; **AL** = `AMBIGUOUS_LABEL`; **SR** = `SAFE_REFERENCE`; **HR** = `DIRECT_HEMOLYTIC_RISK`; **DC** = `DOSE_DEPENDENT_CAUTION`. “CPIC” remete a `src-cpic-g6pd`; “HU” a `src-ebserh-ms-g6pd`; “SBP” a `src-sbp-spsp-g6pd`; “ANVISA” a `src-anvisa-bulario`; “Codex” e “EFSA” aos respectivos IDs acima. O catálogo guarda notas completas por regra.

| Regra / classificação preservada | Estado / natureza / vínculo | Evidência disponível e lacuna ou decisão necessária |
| --- | --- | --- |
| `dye-tartrazina-102` / RESTRICTED_BR | P / PP / SBP | INS102: falta protocolo nominal recuperável de exclusão em G6PD; não há comprovação de hemólise pelo portal. |
| `dye-amarelo-crepusculo-110` / RESTRICTED_BR | P / PP / SBP | INS110: falta trecho pediátrico brasileiro; classe azoica não prova risco clínico. |
| `dye-azorrubina-122` / RESTRICTED_BR | P / PP / SBP | INS122: falta documento específico e validação profissional da restrição. |
| `dye-amaranto-123` / RESTRICTED_BR | P / PP / SBP | INS123: portal candidato; falta recomendação nominal em G6PD. |
| `dye-ponceau-124` / RESTRICTED_BR | P / PP / SBP | INS124: falta protocolo; presença em excipientes não comprova hemólise. |
| `dye-eritrosina-127` / RESTRICTED_BR | P / PP / SBP | INS127: exclusão brasileira sem título/trecho; mecanismo legado não validado. |
| `dye-vermelho-40-129` / RESTRICTED_BR | P / PP / SBP | INS129: falta protocolo nominal; frequência em xaropes não sustenta classificação. |
| `dye-azul-patente-131` / RESTRICTED_BR | P / PP / SBP | INS131: falta fonte específica; não extrapolar azul de metileno. |
| `dye-indigotina-132` / RESTRICTED_BR | P / PP / SBP | INS132: documento de exclusão não localizado; decisão profissional necessária. |
| `dye-azul-brilhante-133` / RESTRICTED_BR | P / PP / SBP | INS133: identidade/origem sintética não sustentam a restrição sem fonte clínica. |
| `dye-verde-rapido-143` / RESTRICTED_BR | P / PP / SBP | INS143: falta referência nominal pediátrica para G6PD. |
| `dye-caramelo-iv-150d` / RESTRICTED_BR | P / PP / SBP | Falta protocolo e evidência de exposição/resíduos; processo sulfito-amônia não comprova hemólise alimentar. |
| `dye-caramelo-iii-150c` / RESTRICTED_BR | P / PP / SBP | Falta protocolo; processo amônia não é prova de presença de sulfitos ou hemólise. |
| `dye-caramelo-ii-150b` / RESTRICTED_BR | P / PP / SBP | Falta documento e suporte clínico sobre resíduos de sulfitos. |
| `dye-caramelo-generico-ambiguo` / CAUTION | P / AL / ANVISA | Política de ambiguidade; falta norma/documento para atribuição ANVISA e vínculo clínico com sulfitos. |
| `dye-artificial-generico` / RESTRICTED_BR | P / PP / SBP | Falta protocolo que autorize bloqueio de toda a classe; generalização não é hemólise demonstrada. |
| `dye-corante-generico-ambiguo` / CAUTION | P / AL / ANVISA | Cautela de identificação, não risco comprovado; falta norma/bula específica. |
| `dye-caramelo-i-150a` / SAFE | P / SR / CPIC | Não avaliado na tabela 2; falta fonte específica de segurança em G6PD. |
| `antiox-tbhq-319` / RESTRICTED_BR | P / PP / SBP | Falta protocolo; derivação de hidroquinona não demonstra risco clínico. |
| `antiox-bha-320` / CAUTION | P / PP / SBP | Diretriz preventiva não recuperada; confirmar recomendação em G6PD. |
| `antiox-bht-321` / CAUTION | P / PP / SBP | Falta documento de precaução e justificativa específica para G6PD. |
| `dye-urucum-160b` / SAFE | P / SR / CPIC | Não avaliado; falta referência para bixina/norbixina em G6PD. |
| `dye-curcuma-100` / SAFE | P / SR / CPIC | Não avaliada; origem vegetal não comprova ausência de potencial oxidante. |
| `dye-caroteno-160a` / SAFE | P / SR / CPIC | Não avaliado; falta referência nominal de segurança. |
| `dye-beterraba-162` / SAFE | P / SR / CPIC | Betanina não avaliada; falta documento específico de segurança. |
| `dye-paprica-160c` / SAFE | P / SR / CPIC | Não avaliada; falta referência para capsantina/capsorrubina. |
| `dye-clorofila-140` / SAFE | P / SR / CPIC | Não avaliada; revisar agrupamento clorofila/clorofilina e fonte de segurança. |
| `dye-antocianina-163` / SAFE | P / SR / CPIC | Não avaliada; falta fonte específica para grupo/extratos. |

## 5. Registro individual — sulfitos, com prioridade aos novos itens

A natureza PP registra a restrição preventiva pretendida, **não** converte a identidade química em evidência clínica; HIGH_RISK é legado preservado, não conclusão desta pesquisa.

| Regra / classificação preservada | Estado / natureza / vínculo | Evidência disponível e lacuna ou decisão necessária |
| --- | --- | --- |
| `sulfite-metabissulfito-sodio-223` / HIGH_RISK | P / PP / Codex | Identidade INS223 confirmada; faltam evidência G6PD e protocolo brasileiro de alto risco. |
| `sulfite-metabissulfito-potassio-224` / HIGH_RISK | P / PP / Codex | Identidade INS224 confirmada; falta hemólise demonstrada e suporte SBP/APAE. |
| `sulfite-dioxido-enxofre-220` / HIGH_RISK | P / PP / Codex | INS220 confirmado como aditivo; falta fonte clínica e parecer sobre HIGH_RISK. |
| `sulfite-bissulfito-sodio-222` / HIGH_RISK | P / PP / Codex | Codex separa hydrogen sulphite 222 de sulphite 221, agrupados na regra. Rever identidade/sinônimos e suporte de alto risco. |
| `sulfite-sulfito-potassio-225` / HIGH_RISK | P / PP / Codex | **Novo:** potassium sulphite INS225 confirmado; falta documento clínico/pediátrico G6PD. |
| `sulfite-sulfito-calcio-226` / HIGH_RISK | P / PP / EFSA | **Novo:** calcium sulfite E226 confirmado na página 1; Codex histórico não lista 226. Revisar INS e obter suporte clínico G6PD. |
| `sulfite-bissulfito-calcio-227` / HIGH_RISK | P / PP / Codex | **Novo:** INS227 hydrogen sulphite; EFSA confirma calcium bisulfite E227. Nenhuma dessas identidades prova hemólise G6PD; falta fonte clínica. |
| `sulfite-bissulfito-potassio-228` / HIGH_RISK | P / PP / Codex | **Novo:** INS228 potassium bisulphite; EFSA confirma E228. Falta evidência de crise hemolítica e protocolo nominal. |
| `sulfite-generico` / HIGH_RISK | P / PP / Codex | Família química identificada; falta justificar bloqueio para qualquer menção/contexto alimentar. |

## 6. Registro individual — alimentos e exposições domésticas

| Regra / classificação preservada | Estado / natureza / vínculo | Evidência disponível e lacuna ou decisão necessária |
| --- | --- | --- |
| `food-fava-beans` / HIGH_RISK | D / HR / CPIC | Páginas 4 e 8: favismo potencialmente fatal e recomendação de evitar Vicia faba. Não representa auditoria de cada sinônimo. |
| `food-quinina-tonica` / HIGH_RISK | P / HR / CPIC | **Divergência individual:** tabela 2, quinine Low to no/Optional. Não sustenta proibição de água tônica em toda apresentação; decidir clinicamente. |
| `food-berberina-chas` / CAUTION | P / DC / `src-favismo-it` | Trecho não recuperado; rever agrupamento de berberina/Coptis, Calculus bovis e Flos Lonicerae, dose e contexto neonatal. |
| `chem-naftalina` / HIGH_RISK | D / HR / HU | Página 17: orientação explícita de não contato; sustenta bloqueio, não quantificação de gravidade/dose do texto legado. |
| `chem-henna-ppd` / HIGH_RISK | P / HR / HU | Página 17 sustenta evitar henna preta/vermelha; não cobre PPD isolada ou equivalência de todo agrupamento. |
| `chem-anilina` / HIGH_RISK | P / HR / `src-favismo-it` | Falta documento recuperável para anilina e todos os derivados de alcatrão agrupados. |
| `chem-mentol-canfora` / CAUTION | P / DC / `src-favismo-it` | Falta trecho, dose, via e evidência infantil específica em G6PD. |

## 7. Registro individual — medicamentos e incompatibilidades com CPIC

Tabela 2 CPIC é a referência das comparações, salvo indicação diferente. Os níveis legados foram preservados. Cada divergência é pendência, não recomendação para suspender/iniciar medicamento.

| Regra / classificação preservada | Estado / natureza / vínculo | Evidência disponível e lacuna ou decisão necessária |
| --- | --- | --- |
| `drug-dapsona` / HIGH_RISK | D / HR / CPIC | Dapsone High/Strong; tabela 3 recomenda evitar em deficiência G6PD. |
| `drug-nitrofurantoina` / HIGH_RISK | P / HR / CPIC | **Divergência:** Medium/Optional, cautela e monitoramento, não proibição universal. HU p.16 recomenda evitar; reconciliar profissionalmente. |
| `drug-furazolidona` / HIGH_RISK | P / HR / CPIC | **Divergência:** furazolidone Low to no/Optional; fonte não sustenta contraindicação geral. |
| `drug-acido-nalidixico` / HIGH_RISK | P / HR / CPIC | **Divergência:** Low to no/Optional; HU p.19, provavelmente seguro. Falta suporte/reconciliação de HIGH_RISK. |
| `drug-sulfametoxazol-trimetoprima` / HIGH_RISK | P / HR / CPIC | **Divergência:** sulfamethoxazole Low to no/Optional e seção própria recomenda uso habitual; HU p.20 inclui combinação entre provavelmente seguros. Rever também trimetoprima isolada agrupada. |
| `drug-sulfadiazina` / HIGH_RISK | P / HR / CPIC | **Divergência:** sulfadiazine Low to no/Optional; HU p.20, provavelmente segura. Rever ainda prata/via tópica. |
| `drug-sulfassalazina` / HIGH_RISK | P / HR / CPIC | **Divergência:** sulfasalazine Low to no/Optional; falta fonte alternativa e reconciliação. |
| `drug-cloranfenicol` / CAUTION | P / DC / CPIC | **Nova / divergência:** chloramphenicol Low to no/Moderate; HU p.19, provavelmente seguro em dose habitual. Não sustenta risco moderado geral ou cautela para todas as vias/colírio; decisão clínica necessária. |
| `drug-isoniazida` / CAUTION | P / DC / HU | **Nova / divergência documental:** HU p.19, provavelmente segura em doses habituais; ausente da tabela 2 CPIC. Falta fonte de risco oxidativo e suporte para cautela geral. |
| `drug-fenazopiridina` / HIGH_RISK | P / HR / CPIC | **Divergência:** phenazopyridine Low to no/Optional; HU p.16 recomenda evitar. Reconciliar antes de validar HIGH_RISK/altíssimo potencial. |
| `drug-primaquina` / HIGH_RISK | P / HR / CPIC | **Incompatibilidade de escopo:** tabelas 2 e 4 têm High, Medium ou Low to no conforme esquema/dose. Regra sem dose não representa exceções; exige decisão clínica. |
| `drug-tafenoquina` / HIGH_RISK | D / HR / CPIC | Tafenoquine High/Strong; tabela 3 recomenda evitar em deficiência G6PD. |
| `drug-rasburicase` / HIGH_RISK | D / HR / CPIC | Rasburicase e pegloticase High/Strong; tabela 3 e seção própria sustentam bloqueio de ambas. |
| `drug-azul-metileno` / HIGH_RISK | D / HR / CPIC | Methylene blue/toluidine blue High/Moderate; toluidina por extrapolação (nota a), não evidência direta independente. |
| `drug-vitamina-k3` / HIGH_RISK | P / HR / CPIC | **Lacuna de formulação:** Vitamin K Low to no na tabela não valida HIGH_RISK de menadiona/K3. Não extrapolar K1; obter fonte dose/formulação específica. |
| `drug-dipirona-metamizol` / RESTRICTED_BR | P / PP / HU | **Divergência:** HU p.19, provavelmente segura em dose habitual; protocolo SBP/APAE não recuperado. Dipirona não consta da tabela 2 CPIC; remover alegação documental de que essa tabela a classifica. |
| `drug-aspirina-aas` / CAUTION | P / DC / CPIC | **Lacuna/dose:** até 1 g/dia Low to no/Moderate; acima disso sem recomendação, não risco comprovado. Falta fonte para hemólise/limiar e Reye pediátrico. |
| `drug-fluoroquinolonas` / CAUTION | P / DC / CPIC | **Divergência por componente:** ciprofloxacin/norfloxacin Low to no; moxifloxacin sem recomendação; levofloxacino não avaliado na tabela. Falta justificar cautela de todo o grupo. |
| `drug-cloroquina` / CAUTION | P / DC / CPIC | **Divergência:** chloroquine/hydroxychloroquine Low to no/Moderate; HU p.19, provavelmente seguras. Não sustenta risco intermediário. |
| `drug-vitamina-c-megadose` / CAUTION | P / DC / CPIC | **Lacuna/dose/via:** Vitamin C Low to no em regimes usuais; fonte não valida limiar de 1 g/dia ou via IV da regra. Obter documento específico. |
| `drug-ibuprofeno` / SAFE | P / SR / CPIC | Ausente da tabela 2; falta fonte nominal de segurança e comparação de maior segurança. Bula necessária para excipientes. |
| `drug-paracetamol` / SAFE | D / SR / HU | Páginas 18–19, provavelmente seguro em doses habituais e com orientação. Não valida marcas/excipientes. |
| `drug-amoxicilina` / SAFE | P / SR / CPIC | Ausente da tabela 2; falta fonte nominal para amoxicilina e associação com clavulanato, além de bula da apresentação. |
| `drug-cefalexina` / SAFE | P / SR / CPIC | Ausente da tabela 2; falta fonte específica em G6PD, sem inferir segurança por classe. |
| `drug-azitromicina` / SAFE | P / SR / CPIC | Ausente da tabela 2; falta fonte específica e bula para composição. |
| `drug-prednisolona` / SAFE | P / SR / CPIC | Prednisolona/prednisona ausentes; faltam fontes nominais e bulas verificadas de Predsim/Prelona. |
| `drug-loratadina` / SAFE | P / SR / CPIC | Loratadina/desloratadina ausentes; falta referência específica e bula da formulação. |

## 8. Auditoria técnica, geração e revisão profissional

O validador compartilhado rejeita ausência de `sourceRef`/`evidenceKind`/`provenanceStatus`, enum inválido, ID de fonte ausente/duplicado, vínculo órfão e pendência sem nota não vazia. As regressões de contrato e proveniência foram executadas na suíte integrada de 160 testes; isso não representa validação clínica.

`scripts/audit-rules.ts` distingue schema, paridade, integridade referencial e estado documental declarado. Lista os **IDs e notas das pendências**; suas invariantes testam o comportamento atual do motor, **não** demonstram que um bloqueio é clinicamente correto. Aprovação técnica não certifica conteúdo, autenticidade de fontes ou aprovação profissional. O auditor não repara silenciosamente uma cópia pública divergente.

A geração validada da cópia pública é separada do auditor e executada automaticamente pelo `prebuild`. Para gerá-la explicitamente:

```sh
npm run rules:sync
```

A aceitação técnica de `docs/planejamento/correcao-fase-1.md` foi exercitada: suíte integrada, auditoria técnica, TypeScript, build e scanner real no navegador. Os registros de execução distinguem esses resultados das 64 pendências clínicas.

Para encerrar uma pendência: recuperar documento identificável e trecho específico, reconciliar diferenças entre fontes, obter decisão profissional sobre risco/dose/via/grupo, atualizar regra/nota/referência sem atribuições genéricas e só então promover o estado quando a classificação tiver suporte. Nem todos os medicamentos seguros têm excipientes seguros: composição exige conferência da apresentação real, sem alegações universais sobre marcas.
