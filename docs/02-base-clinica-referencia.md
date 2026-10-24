# 02 — Base Clínica de Referência para Deficiência de G6PD (CID-10: D55.0)

Este documento reúne a base de conhecimento clínico inicial que alimenta o arquivo mestre `g6pd_rules.json` do **G6PDApp**, consolidando tanto o consenso internacional de farmacogenética (**CPIC / OMS / Favismo.it**) quanto os protocolos clínicos pediátricos de precaução adotados no Brasil (**Ministério da Saúde / EBSERH / SBP / SPSP / APAE / Secretarias de Saúde e Educação**).

---

## 1. Fisiopatologia Resumida

A **Deficiência de Glicose-6-Fosfato Desidrogenase (G6PD)** (CID-10: `D55.0`) é uma condição genética recessiva ligada ao cromossomo X que reduz a capacidade das hemácias (glóbulos vermelhos) de produzir **NADPH** — a coenzima essencial para regenerar a **glutationa reduzida (GSH)** e neutralizar radicais livres e peróxidos. Sem proteção adequada contra o estresse oxidativo, a exposição a agentes oxidantes provoca a desnaturação da hemoglobina (corpúsculos de Heinz) e a destruição precoce das hemácias (**anemia hemolítica aguda**).

---

## 2. Corantes e Aditivos Alimentares (Protocolo de Restrição no Brasil)

Nos protocolos brasileiros de triagem neonatal (APAE, SBP e Secretarias de Saúde/Educação), recomenda-se a exclusão de corantes artificiais (especialmente corantes azoicos e derivados de alcatrão de hulha) e de conservantes à base de sulfitos.

| Categoria | Substância / Nome no Rótulo | Código INS (Brasil) / E-Number (Europa) | Nível de Risco e Mecanismo |
| :--- | :--- | :--- | :--- |
| **Corantes Médicos / Químicos** | **Azul de Metileno** (*Methylene Blue*) e **Azul de Toluidina** (*Toluidine Blue*) | — | 🔴 **Risco Altíssimo (Comprovado Global)**. Potentes agentes oxidantes; causam hemólise severa. |
| **Corantes Artificiais (Amarelos)** | **Tartrazina** (*FD&C Yellow 5*) | `INS 102` / `E102` | 🔴 **Restrito (Protocolos BR)**. Evidência clínica de estresse oxidativo e reações adversas na infância. |
| **Corantes Artificiais (Amarelos)** | **Amarelo Crepúsculo** (*Sunset Yellow FCF / FD&C Yellow 6*) | `INS 110` / `E110` | 🔴 **Restrito (Protocolos BR)**. Corante azoico sintético evitado em cardápios escolares e medicamentos pediátricos. |
| **Corantes Artificiais (Vermelhos)** | **Azorrubina** (*Carmoisina*), **Amaranto** (*Bordeaux S*) e **Ponceau 4R** (*Vermelho Cochinilha A*) | `INS 122`, `INS 123`, `INS 124` (`E122`–`E124`) | 🔴 **Restrito (Protocolos BR)**. Corantes vermelhos sintéticos derivados de anilina/azoicos. |
| **Corantes Artificiais (Vermelhos)** | **Eritrosina** (*FD&C Red 3*) e **Vermelho 40 / Vermelho Allura AC** (*FD&C Red 40*) | `INS 127`, `INS 129` (`E127`, `E129`) | 🔴 **Restrito (Protocolos BR)**. Muito comuns em gelatinas, balas, biscoitos recheados e xaropes/suspensões infantis. |
| **Corantes Artificiais (Azuis e Verdes)** | **Azul Patente V**, **Indigotina** (*Carmim de Índigo*), **Azul Brilhante FCF** e **Verde Rápido FCF** | `INS 131`, `INS 132`, `INS 133`, `INS 143` (`E131`–`E133`, `E143`) | 🔴 **Restrito (Protocolos BR / Alertas Internacionais)**. Estruturalmente evitados por cautela oxidativa. |
| **Corantes Caramelo com Amônia/Sulfito** | **Caramelo III** (processo amônia) e **Caramelo IV** (processo sulfito-amônia) | `INS 150c`, `INS 150d` (`E150c`, `E150d`) | 🔴 **Restrito (Atenção aos Sulfitos)**. O Caramelo IV utiliza sulfitos na fabricação (presente em refrigerantes de cola, molhos e biscoitos escuros). |
| **Conservantes (Sulfitos)** | **Dióxido de enxofre**, **Sulfito de sódio**, **Bissulfito de sódio**, **Metabissulfito de sódio**, **Metabissulfito de potássio**, **Sulfito de cálcio/potássio**, **Bissulfito de cálcio/potássio** | `INS 220` a `INS 228` (`E220`–`E228`) | 🔴 **Risco Moderado/Alto (Restrito)**. Compostos sulfurados com potencial oxidante. Presentes em biscoitos tipo Maria/Maisena, sucos concentrados, frutas secas e vinhos/vinagres. |
| **Antioxidantes Sintéticos** | **TBHQ** (*Terc-butil-hidroquinona*), **BHA** (*Butil-hidroxianisol*) e **BHT** (*Butil-hidroxitolueno*) | `INS 319`, `INS 320`, `INS 321` (`E319`–`E321`) | 🟡/🔴 **Precaução / Restrito**. Derivados fenólicos/hidroquinonas sintéticas; diretrizes restritivas orientam evitar. |

### Notas sobre Corantes Naturais e Sais Minerais (Desambiguação):
* **Corantes Naturais**: Urucum/Bixina/Norbixina (`INS 160b`), Cúrcuma/Curcumina (`INS 100`), Beterraba/Betanina (`INS 162`), Páprica/Capsantina (`INS 160c`), Clorofila (`INS 140`), Carotenos (`INS 160a`), Antocianinas (`INS 163`) e Caramelo I Simples (`INS 150a`) **não possuem potencial hemolítico comprovado** nas diretrizes médicas internacionais. No app, podem ser exibidos como `🟢 Seguro (Corante Natural)` ou `🟡 Atenção (Caso o hematologista oriente regra de Zero Corantes)`.
* **Sais Minerais Seguros (*Sulfatos* $\neq$ *Sulfitos*)**: *Sulfato ferroso*, *Sulfato de zinco*, *Sulfato de cálcio*, *Sulfato de magnésio*, *Sulfato cúprico* e *Sulfato de manganês* são nutrientes/sais minerais **totalmente seguros** (não são sulfitos).

---

## 3. Alimentos e Bebidas Proibidos ou de Risco

1. 🔴 **Feijão-Fava (*Vicia faba* / *Broad beans* / *Fava bean*) — PROIBIÇÃO ABSOLUTA**:
   * Contém **vicina** e **convicina**, glicosídeos metabolizados no intestino em **divicina** e **isouramil** (geradores diretos de radicais livres). É a causa clássica do **Favismo**, capaz de desencadear hemólise aguda grave em 24 a 72 horas (inclusive por farinhas de fava em produtos panificados sem glúten ou pela inalação do pólen da planta).
2. 🔴 **Água Tônica e Bebidas com Quinina — PROIBIÇÃO**:
   * Contém **quinina** (alcaloide antimalárico oxidante) em sua composição aromatizante.
3. 🟡/🔴 **Chá Verde, Chá Preto em Excesso e Ervas Chinesas**:
   * Extratos concentrados e ervas como *Coptis chinensis* (Huang Lian), *Calculus bovis* e *Flos Lonicerae* contêm alcaloides (como **berberina**) associados à hemólise na literatura asiática.
4. 🟡 **Outras Leguminosas (Soja concentrada, Grão-de-bico, Ervilha, Feijão comum)**:
   * *Consenso Internacional (OMS / Itália / Reino Unido)*: Apenas a fava (*Vicia faba*) causa favismo comprovado; feijão comum (*Phaseolus vulgaris*) e *lecitina de soja* (`INS 322`) em alimentos processados são seguros para a grande maioria das variantes.
   * *Nota de Precaução*: Em variantes severas (Classe I/A ou Mediterrânea com baixíssima atividade enzimática), o app permite ativar alerta opcional caso o hematologista da criança oriente restrição adicional de soja/leguminosas.

---

## 4. Medicamentos (Classificação CPIC, OMS e SBP/SPSP)

| Classe Terapêutica | 🔴 Proibidos / Alto Risco (Evitar Sempre) | 🟡 Risco Moderado / Cautela ou Divergência de Protocolo | 🟢 Geralmente Seguros (Atenção aos Excipientes!) |
| :--- | :--- | :--- | :--- |
| **Analgésicos e Antitérmicos** | **Fenazopiridina** (*Pyridium*), **Acetanilida**, **Fenacetina**, **Aminopirina** | **Dipirona (*Metamizol*)**: 🔴/🟡 Restrita em protocolos brasileiros (SBP/APAE), embora a CPIC classifique como baixo risco em doses habituais.<br>**AAS (*Ácido Acetilsalicílico / Aspirina*)**: Risco em altas doses + contraindicado em crianças por Síndrome de Reye. | **Ibuprofeno** (opção mais segura internacionalmente).<br>**Paracetamol (*Acetaminofeno*)**: Seguro **estritamente em dose terapêutica normal** (perigoso em superdosagem). |
| **Antibióticos e Quimioterápicos** | **Dapsona**, **Nitrofurantoína** (*Macrodantina*), **Furazolidona**, **Ácido Nalidíxico**, **Sulfonamidas / Sulfas** (*Sulfametoxazol + Trimetoprima / Bactrim*, *Sulfadiazina*, *Sulfassalazina*) | **Fluoroquinolonas** (*Ciprofloxacino*, *Norfloxacino*, *Moxifloxacino*, *Levofloxacino*), **Cloranfenicol**, **Isoniazida**, **Ácido para-aminossalicílico**, **Estreptomicina** | **Penicilinas** (*Amoxicilina*, *Ampicilina*), **Cefalosporinas** (*Cefalexina*, *Ceftriaxona*), **Macrolídeos** (*Azitromicina*, *Claritromicina*). *(Sempre conferir se a suspensão líquida não contém corantes artificiais!)* |
| **Antimaláricos** | **Primaquina**, **Tafenoquina**, **Pamaquina**, **Pentaquina** | **Cloroquina**, **Hidroxicloroquina**, **Quinina**, **Mefloquina** | — |
| **Antigotosos / Uricolíticos** | **Rasburicase**, **Pegloticase** *(geram peróxido de hidrogênio diretamente)* | **Probenecida**, **Colchicina** | **Alopurinol** |
| **Cardiovasculares, Antídotos e Outros** | **Azul de Metileno**, **Azul de Toluidina**, **Dimercaprol (BAL)**, **Niridazol** | **Nitroprussiato de sódio**, **Nitratos / Nitritos**, **Hidralazina**, **Metildopa**, **Procainamida**, **Quinidina**, **Glibenclamida** (sulfonilureias), **Fenitoína**, **Doxorrubicina** | — |
| **Vitaminas** | **Vitamina K3 hidrossolúvel (*Menadiona*)** em altas doses | **Vitamina C (*Ácido Ascórbico*) em Megadoses** (suplementos efervescentes de alta dosagem $\ge 1\text{g}$ ou via intravenosa) | **Vitamina K1 (*Fitomenadiona*)** (usada ao nascer é segura).<br>**Vitamina C** em doses fisiológicas normais / alimentos / antioxidante alimentar (`INS 300`). |

> ⚠️ **Regra Obrigatória dos Xaropes e Suspensões Pediátricas**:
> Mesmo quando o princípio ativo é seguro (ex.: *Amoxicilina*, *Ibuprofeno*, *Paracetamol*, *Azitromicina*, anti-histamínicos), as apresentações líquidas infantis frequentemente contêm **Vermelho 40 (`INS 129`)**, **Amarelo Crepúsculo (`INS 110`)**, **Tartrazina (`INS 102`)** ou **Ponceau 4R (`INS 124`)** na linha de **Excipientes**. Sempre conferir a bula ou optar por versões em gotas incolores.

---

## 5. Produtos Químicos Domésticos e Cosméticos (Proibidos)

* 🔴 **Naftalina (*Naftaleno*)**: Proibição absoluta. Presente em bolinhas antimofo e pedras sanitárias antigas. A inalação do vapor em roupas guardadas pode causar crise hemolítica gravíssima em crianças.
* 🔴 **Henna Preta e Tinturas com *Lawsonia inermis* (Lawsone) ou PPD (*Parafenilenodiamina*)**: Tatuagens temporárias de praia/festas e tinturas capilares são absorvidas pela pele e desencadeiam hemólise severa.
* 🔴 **Anilina e Derivados de Alcatrão de Hulha**: Corantes de tecidos, couro e tintas artesanais/industriais.
* 🟡 **Mentol e Cânfora (em altas concentrações)**: Presentes em bálsamos descongestionantes, pomadas analgésicas e pastilhas fortes; exigem cautela na infância.

---

## 6. Sinais de Alerta de Crise Hemolítica (Emergência Médica)

As crises geralmente ocorrem entre **24 e 72 horas** após o contato com o agente desencadeante ou durante **infecções virais/bacterianas** (maior causa estatística de hemólise devido aos radicais livres liberados pelos leucócitos). **Procurar Pronto-Socorro imediatamente** se observar:

1. 🚨 **Urina escura** (cor de chá preto, café ou refrigerante de cola — causada pela hemoglobinúria).
2. 🚨 **Icterícia** (pele e parte branca dos olhos amareladas).
3. 🚨 **Palidez súbita** (especialmente visível nos lábios, gengivas, mucosas e palma das mãos).
4. 🚨 **Cansaço extremo**, moleza, sonolência incomum, taquicardia (coração acelerado) ou falta de ar.
5. 🚨 **Dor abdominal** ou dor nas costas/lombar.

---

## 7. Fontes Oficiais para Consulta e Auditoria Trimestral

1. **CPIC (Clinical Pharmacogenetics Implementation Consortium — EUA/Global)**:
   * Diretriz internacional padrão-ouro para medicamentos e G6PD.
   * URL: `https://cpicpgx.org/guidelines/cpic-guideline-for-g6pd/`
2. **Ministério da Saúde / EBSERH (Brasil)**:
   * Cartilha de Orientação às Famílias e Escolas sobre Deficiência de G6PD (HU-UFJF/EBSERH & Triagem Neonatal MS).
3. **Secretaria Municipal de Saúde de São Paulo / Sociedade de Pediatria de São Paulo (SPSP/SBP)**:
   * Protocolo Clínico de Deficiência de G6PD na Atenção Primária e Pediatria.
4. **Secretaria de Educação do Distrito Federal (SEEDF — Brasil)**:
   * Orientações para Cardápio Especial Escolar — Deficiência de G6PD e restrição de corantes sintéticos.
5. **Associazione Italiana Favismo — Deficienza di G6PD (Itália/Europa)**:
   * Base europeia de referência sobre favismo, fármacos (EMA), cosméticos e aditivos.
   * URL: `https://www.favismo.it/`
6. **NHS (Reino Unido) & Royal Children's Hospital Melbourne (Austrália)**:
   * Guias clínicos pediátricos para famílias (`https://www.rch.org.au/kidsinfo/fact_sheets/G6PD_deficiency/`).
7. **Bulário Eletrônico da ANVISA (Brasil)**:
   * Consulta oficial de excipientes e composição de medicamentos registrados no Brasil.
   * URL: `https://consultas.anvisa.gov.br/#/bulario/`
