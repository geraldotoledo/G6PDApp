import { CompletenessCheckResult } from './types.ts';
import { normalizeText } from './normalizer.ts';

const START_ANCHORS = [
  'ingredientes:',
  'ingredientes',
  'composicao:',
  'composicao',
  'excipientes:',
  'excipientes',
  'veiculo:',
  'veiculo',
  'lista de ingredientes:',
  'lista de ingredientes'
];

const END_ANCHORS = [
  'alergicos:',
  'alergicos',
  'contem gluten',
  'nao contem gluten',
  'contem lactose',
  'nao contem lactose',
  'informacao nutricional',
  'informacoes nutricionais',
  'fabricado por',
  'lote:',
  'lote',
  'validade:',
  'registro ms',
  'modo de conservacao',
  'modo de usar',
  'modo de uso',
  'instrucoes de uso',
  'posologia',
  'advertencias',
  'conservar em local',
  'sac:'
];

/**
 * Avalia se o texto extraído por OCR ou foto possui integridade estrutural
 * mínima para garantir que o rótulo não foi cortado ou obscurecido por reflexo.
 */
export function evaluateLabelCompleteness(rawText: string): CompletenessCheckResult {
  if (!rawText || rawText.trim().length === 0) {
    return {
      isComplete: false,
      hasStartAnchor: false,
      hasEndAnchor: false,
      cleanedText: '',
      unreadableTokenRatio: 1,
      reason: 'Texto vazio ou não localizado na imagem.'
    };
  }

  const normalized = normalizeText(rawText);

  // 1. Procurar âncora de início
  let matchedStart: string | undefined;
  let startIdx = -1;

  for (const anchor of START_ANCHORS) {
    const idx = normalized.indexOf(anchor);
    if (idx !== -1) {
      if (startIdx === -1 || idx < startIdx) {
        startIdx = idx;
        matchedStart = anchor;
      }
    }
  }

  const hasStart = startIdx !== -1;
  const afterStartIdx = hasStart ? startIdx + (matchedStart?.length || 0) : 0;

  // Checar se é composição de medicamento com seção de excipientes/veículo explícita
  let excipientsAnchorIdx = -1;
  let excipientsAnchorLen = 0;
  const EXCIPIENTS_SUB_ANCHORS = ['excipientes:', 'excipientes', 'veiculo:', 'veiculo'];
  if (hasStart && matchedStart?.includes('composicao')) {
    for (const sub of EXCIPIENTS_SUB_ANCHORS) {
      const idx = normalized.indexOf(sub, afterStartIdx);
      if (idx !== -1 && (excipientsAnchorIdx === -1 || idx < excipientsAnchorIdx)) {
        excipientsAnchorIdx = idx;
        excipientsAnchorLen = sub.length;
      }
    }
  }

  // 2. Procurar âncora de fim
  // Se houver excipientes após composicao, a busca por fim deve considerar o que vem após os excipientes
  const searchEndFrom = excipientsAnchorIdx !== -1
    ? excipientsAnchorIdx + excipientsAnchorLen
    : afterStartIdx;

  let matchedEnd: string | undefined;
  let endIdx = -1;

  for (const anchor of END_ANCHORS) {
    const idx = normalized.indexOf(anchor, searchEndFrom);
    if (idx !== -1) {
      if (endIdx === -1 || idx < endIdx) {
        endIdx = idx;
        matchedEnd = anchor;
      }
    }
  }

  const effectiveEnd = endIdx !== -1 ? endIdx : normalized.length;
  const contentBetween = normalized.slice(afterStartIdx, effectiveEnd);
  const isExcipientsSection =
    excipientsAnchorIdx !== -1 ||
    matchedStart?.startsWith('excipientes') ||
    matchedStart?.startsWith('veiculo');

  // A captura pode começar nos excipientes ou chegar a eles após a composição.
  // Unidades e formas de apresentação não identificam substâncias do veículo.
  const excipientsContent = normalized.slice(searchEndFrom, effectiveEnd);
  const cleanedExcipients = excipientsContent
    .replace(/\bq\.?\s*s\.?\s*p\.?/gi, ' ')
    .replace(
      /\b(comprimidos?|capsulas?|drageas?|gotas?|saches?|envelopes?|ml|mg|g|mcg|ui|cada|contem|veiculo|excipientes?)\b/gi,
      ' '
    );
  const hasRealExcipientsContent =
    !isExcipientsSection || /[a-z]{3,}/i.test(cleanedExcipients);
  const hasRealContent = /[a-z]{3,}/i.test(contentBetween);

  // Não usar pontos de registro/instruções posteriores para fechar a lista.
  const textAfterSearchFrom = excipientsContent.replace(/\bq\.?\s*s\.?\s*p\.?/gi, '');
  const hasSentencePeriod =
    hasStart && /[a-z0-9]{3,}\.(?:\s+|$)/i.test(textAfterSearchFrom);
  const hasEnd = endIdx !== -1 || (hasStart && hasSentencePeriod);

  // Corrupção dentro da lista não pode ser diluída por texto legível ao redor.
  // Preservar percentuais, códigos, abreviaturas e pontuação química legítima.
  const illegiblePattern = /\?{2,}|\uFFFD|[^\p{L}\p{N}\s,.;:\-()\/%+°µ\[\]&'’®™]{2,}/u;
  const hasExplicitIllegible = illegiblePattern.test(contentBetween);
  const tokens = contentBetween.split(/\s+/).filter(Boolean);
  const unreadableTokens = tokens.filter(t => illegiblePattern.test(t));
  const unreadableRatio = tokens.length > 0 ? unreadableTokens.length / tokens.length : 0;

  // isComplete requer:
  // - Âncora de início
  // - Âncora de fim ou ponto final válido após o conteúdo
  // - Conteúdo real entre âncoras (não vazio)
  // - Excipientes não truncados se for composição de medicamento
  // - Sem marcadores explícitos de ilegibilidade (??? ou replacement char)
  // - Baixa taxa geral de ruído (< 15%)
  const isComplete =
    hasStart &&
    hasEnd &&
    hasRealContent &&
    hasRealExcipientsContent &&
    !hasExplicitIllegible &&
    unreadableRatio < 0.15;

  let reason: string | undefined;
  if (!hasStart && !hasEnd) {
    reason = 'Não foi encontrada a palavra "INGREDIENTES" nem os avisos finais ("ALÉRGICOS/GLÚTEN"). A foto pode mostrar apenas a tabela nutricional ou a frente do pacote.';
  } else if (!hasStart) {
    reason = 'Início da lista ("INGREDIENTES:") não localizado. A foto pode ter começado no meio da lista.';
  } else if (hasExplicitIllegible) {
    reason = 'Trecho ilegível ou corrompido na lista de ingredientes/excipientes. Confira o texto com o rótulo e faça uma nova leitura.';
  } else if (!hasRealContent) {
    reason = 'Lista de ingredientes vazia entre as âncoras de início e fim do rótulo.';
  } else if (isExcipientsSection && !hasRealExcipientsContent) {
    reason = 'Seção de excipientes do medicamento vazia ou truncada. Não foi possível confirmar os componentes do veículo/xarope.';
  } else if (!hasEnd) {
    reason = 'Final da lista de ingredientes não demarcado (falta aviso de "ALÉRGICOS", "CONTÉM GLÚTEN" ou ponto final). A embalagem pode estar cortada no fim ou com reflexo apagando a última linha.';
  } else if (unreadableRatio >= 0.15) {
    reason = 'Muitos caracteres ilegíveis ou borrados no meio do texto. Aproxime a câmera e evite reflexos de luz.';
  }

  return {
    isComplete,
    hasStartAnchor: hasStart,
    hasEndAnchor: hasEnd,
    startAnchorMatched: matchedStart,
    endAnchorMatched: matchedEnd,
    cleanedText: normalized,
    unreadableTokenRatio: unreadableRatio,
    reason
  };
}
