import {
  AnalysisResult,
  G6PDRulesDatabase,
  ProfileMode,
  RuleMatch,
  SafeLookalike,
  TextHighlightSpan,
  VerdictStatus
} from './types.ts';
import { getActiveRulesDatabase } from '../services/rulesSync.ts';
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
  const database = options?.database || getActiveRulesDatabase();
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
  const rawSpans: TextHighlightSpan[] = [];
  const pediatricSyrupAlerts: string[] = [];
  const specificSpans: Span[] = [];

  for (const safe of safeSpans) {
    rawSpans.push({
      start: safe.start,
      end: safe.end,
      text: safe.term,
      type: 'SAFE_LOOKALIKE',
      message: 'Nutriente/Substância Segura (não confundir com sulfitos/corantes)'
    });
  }

  // Avaliar regras específicas primeiro e regras ambíguas por último
  const sortedRules = [...database.rules].sort(
    (a, b) => (a.isAmbiguous ? 1 : 0) - (b.isAmbiguous ? 1 : 0)
  );

  for (const rule of sortedRules) {
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

        // Se a regra for ambígua e o trecho sobrepor uma regra específica já casada, IGNORAR!
        if (rule.isAmbiguous) {
          const overlapsSpecific = specificSpans.some(
            s => Math.max(start, s.start) < Math.min(end, s.end)
          );
          if (overlapsSpecific) {
            continue;
          }
        }

        const matchedTermStr = normalized.substring(start, end);
        const isRed = effectiveRisk === 'HIGH_RISK' || effectiveRisk === 'RESTRICTED_BR';
        const spanType = isRed ? 'RED' : (effectiveRisk === 'SAFE' ? 'SAFE_LOOKALIKE' : 'YELLOW');

        // Se for regra específica de corante, incluir eventual prefixo qualificador imediato ("corante natural de ", "corante ")
        // para impedir falso alerta da regra genérica na mesma expressão
        let spanStartForSpecific = start;
        if (!rule.isAmbiguous && rule.category.startsWith('DYE_')) {
          const beforeText = normalized.slice(0, start);
          const dyePrefixMatch = /(?:^|[^a-z0-9])(corantes?(?:\s+(?:naturais?|natural|artificiais?|artificial|alimenticios?|inorganicos?|organicos?|simples))?(?:\s*:\s*|\s+de\s+|\s+da\s+|\s+do\s+|\s+)(?:extrato\s+de\s+|vermelho\s+de\s+)?)(\s*\(?\s*)$/i.exec(beforeText);
          if (dyePrefixMatch) {
            const fullPrefix = dyePrefixMatch[1] + (dyePrefixMatch[2] || '');
            spanStartForSpecific = start - fullPrefix.length;
          }
        }

        rawSpans.push({
          start: spanStartForSpecific,
          end,
          text: normalized.substring(spanStartForSpecific, end),
          type: spanType,
          ruleName: rule.name,
          message: rule.clinicalMechanism
        });

        if (!rule.isAmbiguous) {
          specificSpans.push({
            start: spanStartForSpecific,
            end,
            term: normalized.substring(spanStartForSpecific, end)
          });
        }

        const existing = matches.find(m => m.rule.id === rule.id);
        if (!existing) {
          matches.push({
            rule,
            matchedTerm: matchedTermStr,
            startIdx: start,
            endIdx: end,
            effectiveRisk
          });
        } else {
          if (!existing.matchedTerm.includes(matchedTermStr)) {
            existing.matchedTerm += `, ${matchedTermStr}`;
          }
        }
        ruleMatched = true;
      }
    }

    // Se o medicamento seguro tiver aviso de excipientes pediátricos e foi citado
    if (ruleMatched && rule.pediatricSyrupWarning) {
      pediatricSyrupAlerts.push(rule.pediatricSyrupWarning);
    }
  }

  // -----------------------------------------------------------
  // 3. Montar Destaques Visuais (Highlight Spans) & Fundir Sobreposições
  // -----------------------------------------------------------
  // Ordenar por início crescente e, em caso de empate, pelo maior comprimento primeiro
  rawSpans.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  const highlightSpans: TextHighlightSpan[] = [];
  for (const span of rawSpans) {
    if (highlightSpans.length === 0) {
      highlightSpans.push({ ...span });
      continue;
    }
    const prev = highlightSpans[highlightSpans.length - 1];
    if (span.start < prev.end) {
      // Há sobreposição: expandir o fim se necessário e manter a maior severidade (RED > YELLOW > SAFE_LOOKALIKE)
      if (span.end > prev.end) {
        prev.end = span.end;
        prev.text = normalized.substring(prev.start, prev.end);
      }
      if (span.type === 'RED' || (span.type === 'YELLOW' && prev.type === 'SAFE_LOOKALIKE')) {
        prev.type = span.type;
        prev.ruleName = span.ruleName || prev.ruleName;
        prev.message = span.message || prev.message;
      }
    } else {
      highlightSpans.push({ ...span });
    }
  }

  // -----------------------------------------------------------
  // 4. Determinar Veredito Final (Semáforo) e Separação Ativo vs Excipientes
  // -----------------------------------------------------------
  const safeActiveDrugsDetected = matches.filter(
    m => m.effectiveRisk === 'SAFE' && m.rule.category.startsWith('DRUG_')
  );
  const restrictedExcipientsOrAdditivesDetected = matches.filter(
    m =>
      (m.effectiveRisk === 'HIGH_RISK' ||
        m.effectiveRisk === 'RESTRICTED_BR' ||
        m.effectiveRisk === 'CAUTION') &&
      !m.rule.category.startsWith('DRUG_')
  );

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
    const forbiddenNames = Array.from(
      new Set(
        matches
          .filter(m => m.effectiveRisk === 'HIGH_RISK' || m.effectiveRisk === 'RESTRICTED_BR')
          .map(m => m.rule.name)
      )
    );
    if (safeActiveDrugsDetected.length > 0 && restrictedExcipientsOrAdditivesDetected.length > 0) {
      const safeDrugNames = Array.from(new Set(safeActiveDrugsDetected.map(m => m.rule.name))).join(', ');
      summary = `O princípio ativo (${safeDrugNames}) é seguro isoladamente, mas esta apresentação foi BLOQUEADA por conter excipiente/aditivo restrito para Deficiência de G6PD: ${forbiddenNames.join(', ')}.`;
    } else {
      summary = `Identificado(s) componente(s) restrito(s) para Deficiência de G6PD: ${forbiddenNames.join(', ')}.`;
    }
  } else if (hasYellow) {
    status = 'YELLOW_ATTENTION';
    statusTitle = '🟡 ATENÇÃO / VERIFICAR';
    statusBadge = 'ATENÇÃO';
    const cautionNames = Array.from(
      new Set(matches.filter(m => m.effectiveRisk === 'CAUTION').map(m => m.rule.name))
    );
    if (safeActiveDrugsDetected.length > 0 && restrictedExcipientsOrAdditivesDetected.length > 0) {
      const safeDrugNames = Array.from(new Set(safeActiveDrugsDetected.map(m => m.rule.name))).join(', ');
      summary = `O princípio ativo (${safeDrugNames}) é seguro isoladamente, mas esta apresentação contém excipiente/aditivo que exige cautela ou confirmação com o fabricante: ${cautionNames.join(', ')}.`;
    } else {
      summary = `Identificado(s) item(ns) que exigem atenção médica, de dose ou confirmação com o fabricante: ${cautionNames.join(', ')}.`;
    }
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
    safeActiveDrugsDetected,
    restrictedExcipientsOrAdditivesDetected,
    safeLookalikesDetected: detectedSafeLookalikes,
    pediatricSyrupAlerts,
    highlightSpans,
    rulesVersion: database.rulesVersion,
    protocolModeUsed: profileMode
  };
}
