export type RiskLevel =
  | 'HIGH_RISK'       // 🔴 Proibição global / Alto risco comprovado (CPIC / OMS)
  | 'RESTRICTED_BR'   // 🔴 Restrito pelo Protocolo Pediátrico Brasileiro (SBP / APAE / MS)
  | 'CAUTION'         // 🟡 Cautela, avaliação de dose ou ambiguidade no rótulo
  | 'SAFE';           // 🟢 Seguro (ou nutriente / corante natural)

export type Category =
  | 'DYE_ARTIFICIAL'
  | 'DYE_NATURAL'
  | 'DYE_CARAMEL'
  | 'SULFITE'
  | 'ANTIOXIDANT'
  | 'FOOD_BEVERAGE'
  | 'DRUG_ANALGESIC'
  | 'DRUG_ANTIBIOTIC'
  | 'DRUG_ANTIMALARIAL'
  | 'DRUG_URICOLYTIC'
  | 'DRUG_CARDIOVASCULAR'
  | 'DRUG_VITAMIN'
  | 'DRUG_OTHER'
  | 'HOUSEHOLD_CHEMICAL';

export type ProtocolSource =
  | 'GLOBAL_CPIC_WHO'
  | 'BRAZIL_SBP_APAE'
  | 'ANVISA'
  | 'FAVISMO_IT'
  | 'MINISTERIO_DA_SAUDE';

export type EvidenceKind =
  | 'DIRECT_HEMOLYTIC_RISK'
  | 'PEDIATRIC_PRECAUTION'
  | 'DOSE_DEPENDENT_CAUTION'
  | 'AMBIGUOUS_LABEL'
  | 'SAFE_REFERENCE';

export type ProvenanceStatus = 'DOCUMENTED' | 'PENDING_REVIEW';

export interface G6PDSourceReference {
  id: string;
  name: string;
  organization: string;
  documentTitle: string;
  editionOrDate: string;
  url: string;
  sectionOrTable: string;
}

export interface G6PDRule {
  id: string;
  name: string;
  category: Category;
  riskLevel: RiskLevel;
  insCode?: string;          // Ex.: "102"
  eNumber?: string;          // Ex.: "E102"
  synonyms: string[];        // Sinônimos em PT, ES, EN e nomes comerciais
  regexPatterns?: string[];  // Regex customizadas para INS/E-numbers
  protocolSource: ProtocolSource;
  clinicalMechanism: string; // Explicação médica sucinta
  pediatricSyrupWarning?: string; // Alerta específico de excipientes se for remédio
  isAmbiguous?: boolean;     // Ex.: "corante caramelo" sem especificar I ou IV
  evidenceKind: EvidenceKind; // Natureza da classificação; não é aprovação clínica.
  sourceRef: string;
  provenanceStatus: ProvenanceStatus;
  provenanceNote?: string;   // Obrigatório e não vazio quando PENDING_REVIEW.
}

export interface SafeLookalike {
  id: string;
  term: string;              // Ex.: "sulfato ferroso"
  category: string;
  explanation: string;
}

export interface G6PDRulesDatabase {
  schemaVersion: number;
  rulesVersion: string;
  updatedAt: string;
  description: string;
  sources: G6PDSourceReference[];
  safeLookalikes: SafeLookalike[];
  rules: G6PDRule[];
}

export type ProfileMode =
  | 'BRAZIL_PEDIATRIC'  // Padrão: Zero Corantes Artificiais + Sulfitos + Dipirona + CPIC
  | 'STRICT_ZERO_DYES'  // Alerta até corantes naturais
  | 'GLOBAL_CPIC';      // Apenas restrições com evidência farmacogenética internacional

export type VerdictStatus =
  | 'RED_BLOCKED'               // 🔴 Não consumir
  | 'YELLOW_ATTENTION'          // 🟡 Cautela / Alerta de Excipientes / Ambiguidade
  | 'YELLOW_INCOMPLETE_SCAN'    // 🟡 Foto cortada ou com reflexo (sem delimitador)
  | 'GREEN_SAFE';               // 🟢 Nenhum item proibido e leitura íntegra

export interface RuleMatch {
  rule: G6PDRule;
  matchedTerm: string;
  startIdx: number;
  endIdx: number;
  effectiveRisk: RiskLevel;
}

export interface TextHighlightSpan {
  start: number;
  end: number;
  text: string;
  type: 'RED' | 'YELLOW' | 'SAFE_LOOKALIKE';
  ruleName?: string;
  message?: string;
}

export interface CompletenessCheckResult {
  isComplete: boolean;
  hasStartAnchor: boolean;
  hasEndAnchor: boolean;
  startAnchorMatched?: string;
  endAnchorMatched?: string;
  cleanedText: string;
  unreadableTokenRatio: number;
  reason?: string;
}

export interface AnalysisResult {
  status: VerdictStatus;
  statusTitle: string;
  statusBadge: string;
  summary: string;
  rawText: string;
  normalizedText: string;
  completeness: CompletenessCheckResult;
  matches: RuleMatch[];
  safeActiveDrugsDetected: RuleMatch[];
  restrictedExcipientsOrAdditivesDetected: RuleMatch[];
  safeLookalikesDetected: SafeLookalike[];
  pediatricSyrupAlerts: string[];
  highlightSpans: TextHighlightSpan[];
  rulesVersion: string;
  protocolModeUsed: ProfileMode;
}
