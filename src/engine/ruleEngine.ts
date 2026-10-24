import {
  AnalysisResult,
  G6PDRulesDatabase,
  ProfileMode,
  RuleMatch,
  SafeLookalike,
  TextHighlightSpan,
  VerdictStatus
} from './types.ts';
import { DEFAULT_G6PD_DATABASE } from '../data/defaultRules.ts';
import { normalizeText } from './normalizer.ts';
import { evaluateLabelCompleteness } from './completenessGate.ts';

export interface AnalyzeOptions {
  profileMode?: ProfileMode;
  database?: G6PDRulesDatabase;
  /** Se true, avalia apenas como busca de termo/fragmento, dispensando travas de início/fim de rótulo */
  isSearchQuery?: boolean;
}

interface Span {
  start: number;
  end: number;
  term: string;
}

/**
 * Escapa caracteres especiais para uso seguro em RegExp
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Motor de Regras Determinístico do G6PDApp
 */
export function analyzeIngredientsText(rawText: string, options?: AnalyzeOptions): AnalysisResult {
  const database = options?.database || DEFAULT_G6PD_DATABASE;
  const profileMode: ProfileMode = options?.profileMode || 'BRAZIL_PEDIATRIC';
  const isSearchQuery = !!options?.isSearchQuery;

  const normalized = normalizeText(rawText);
  const completeness = evaluateLabelCompleteness(rawText);

  // -----------------------------------------------------------
  // 1. Identificar Whitelist de Falsos Amigos Seguros (ex.: Sulfatos)
  // -----------------------------------------------------------
  const detectedSafeLookalikes: SafeLookalike[] = [];
  const safeSpans: Span[] = [];

  for (const safe of database.safeLookalikes) {
    const termNorm = normalizeText(safe.term);
    const regex = new RegExp(`\\b${escapeRegex(termNorm)}\\b`, 'gi');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(normalized)) !== null) {
      safeSpans.push({
        start: match.index,
        end: match.index + match[0].length,
        term: match[0]
      });
      if (!detectedSafeLookalikes.some(s => s.id === safe.id)) {
        detectedSafeLookalikes.push(safe);
      }
    }
  }

  // Função auxiliar para checar se um trecho coincide com um falso amigo seguro
  function overlapsWithSafeSpan(start: number, end: number): boolean {
    return safeSpans.some(span => start >= span.start && end <= span.end);
  }

  // -----------------------------------------------------------
  // 2. Cruzar com as Regras da Base G6PD
  // -----------------------------------------------------------
  const matches: RuleMatch[] = [];
  const pediatricSyrupAlerts: string[] = [];

  for (const rule of database.rules) {
    // Determinar risco efetivo conforme o perfil selecionado
    let effectiveRisk = rule.riskLevel;

    if (profileMode === 'GLOBAL_CPIC') {
      if (rule.protocolSource === 'BRAZIL_SBP_APAE' && rule.riskLevel === 'RESTRICTED_BR') {
        // No modo estrito internacional, corantes e dipirona baixam para cautela/informativo
        effectiveRisk = rule.category === 'DYE_ARTIFICIAL' ? 'CAUTION' : 'CAUTION';
      }
    } else if (profileMode === 'STRICT_ZERO_DYES') {
      if (rule.category === 'DYE_NATURAL') {
        effectiveRisk = 'RESTRICTED_BR';
      }
    }

    // Coletar todos os termos e variações para busca
    const searchTerms = [...rule.synonyms];
    if (rule.insCode) {
      searchTerms.push(`ins ${rule.insCode}`);
      searchTerms.push(`ins${rule.insCode}`);
      searchTerms.push(`(${rule.insCode})`);
    }
    if (rule.eNumber) {
      searchTerms.push(rule.eNumber.toLowerCase());
      searchTerms.push(rule.eNumber.toLowerCase().replace('e', 'e-'));
    }

    let ruleMatched = false;

    for (const term of searchTerms) {
      const termNorm = normalizeText(term);
      if (!termNorm) continue;

      const regex = new RegExp(`(?:^|[^a-z0-9])${escapeRegex(termNorm)}(?:$|[^a-z0-9])`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(normalized)) !== null) {
        // Ajustar início/fim ignorando delimitadores de pontuação
        const matchStr = match[0];
        let start = match.index;
        let end = match.index + matchStr.length;

        if (matchStr.startsWith(' ') || matchStr.startsWith('(') || matchStr.startsWith(',')) start++;
        if (matchStr.endsWith(' ') || matchStr.endsWith(')') || matchStr.endsWith(',') || matchStr.endsWith('.')) end--;

        // BLINDAGEM 2: Se o trecho estiver contido em um falso amigo seguro, IGNORAR!
        if (overlapsWithSafeSpan(start, end)) {
          continue;
        }

        matches.push({
          rule,
          matchedTerm: normalized.substring(start, end),
          startIdx: start,
          endIdx: end,
          effectiveRisk
        });
        ruleMatched = true;
      }
    }

    // Se o medicamento seguro tiver aviso de excipientes pediátricos e foi citado
    if (ruleMatched && rule.pediatricSyrupWarning) {
      pediatricSyrupAlerts.push(rule.pediatricSyrupWarning);
    }
  }

  // -----------------------------------------------------------
  // 3. Montar Destaques Visuais (Highlight Spans)
  // -----------------------------------------------------------
  const highlightSpans: TextHighlightSpan[] = [];

  for (const safe of safeSpans) {
    highlightSpans.push({
      start: safe.start,
      end: safe.end,
      text: safe.term,
      type: 'SAFE_LOOKALIKE',
      message: 'Nutriente/Substância Segura (não confundir com sulfitos/corantes)'
    });
  }

  for (const m of matches) {
    const isRed = m.effectiveRisk === 'HIGH_RISK' || m.effectiveRisk === 'RESTRICTED_BR';
    highlightSpans.push({
      start: m.startIdx,
      end: m.endIdx,
      text: m.matchedTerm,
      type: isRed ? 'RED' : 'YELLOW',
      ruleName: m.rule.name,
      message: m.rule.clinicalMechanism
    });
  }

  // Ordenar spans por posição no texto
  highlightSpans.sort((a, b) => a.start - b.start);

  // -----------------------------------------------------------
  // 4. Determinar Veredito Final (Semáforo)
  // -----------------------------------------------------------
  const hasRed = matches.some(m => m.effectiveRisk === 'HIGH_RISK' || m.effectiveRisk === 'RESTRICTED_BR');
  const hasYellow = matches.some(m => m.effectiveRisk === 'CAUTION');

  let status: VerdictStatus;
  let statusTitle: string;
  let statusBadge: string;
  let summary: string;

  if (hasRed) {
    status = 'RED_BLOCKED';
    statusTitle = '🔴 NÃO CONSUMIR (Alerta para G6PD)';
    statusBadge = 'BLOQUEADO';
    const forbiddenNames = Array.from(new Set(matches.filter(m => m.effectiveRisk === 'HIGH_RISK' || m.effectiveRisk === 'RESTRICTED_BR').map(m => m.rule.name)));
    summary = `Identificado(s) componente(s) restrito(s) para Deficiência de G6PD: ${forbiddenNames.join(', ')}.`;
  } else if (hasYellow) {
    status = 'YELLOW_ATTENTION';
    statusTitle = '🟡 ATENÇÃO / VERIFICAR';
    statusBadge = 'ATENÇÃO';
    const cautionNames = Array.from(new Set(matches.map(m => m.rule.name)));
    summary = `Identificado(s) item(ns) que exigem atenção médica, de dose ou confirmação com o fabricante: ${cautionNames.join(', ')}.`;
  } else if (!completeness.isComplete && !isSearchQuery) {
    // BLINDAGEM 1: Se não tem proibido mas a foto está cortada/com reflexo
    status = 'YELLOW_INCOMPLETE_SCAN';
    statusTitle = '🟡 LEITURA INCOMPLETA (Foto Cortada ou com Reflexo)';
    statusBadge = 'LEITURA PARCIAL';
    summary = completeness.reason || 'Não foi possível confirmar 100% dos ingredientes com segurança. Aproxime a câmera sem reflexo para ler a lista até o fim.';
  } else {
    status = 'GREEN_SAFE';
    statusTitle = '🟢 LIVRE PARA CONSUMO';
    statusBadge = 'LIBERADO';
    summary = isSearchQuery
      ? 'Nenhum ingrediente restrito encontrado nesta consulta.'
      : 'Lista completa de ingredientes lida e nenhum agente ou corante restrito detectado para G6PD.';
  }

  return {
    status,
    statusTitle,
    statusBadge,
    summary,
    rawText,
    normalizedText: normalized,
    completeness,
    matches,
    safeLookalikesDetected: detectedSafeLookalikes,
    pediatricSyrupAlerts,
    highlightSpans,
    rulesVersion: database.rulesVersion,
    protocolModeUsed: profileMode
  };
}
