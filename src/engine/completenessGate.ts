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

  // 2. Procurar âncora de fim
  let matchedEnd: string | undefined;
  let endIdx = -1;

  for (const anchor of END_ANCHORS) {
    const idx = normalized.indexOf(anchor, startIdx !== -1 ? startIdx + (matchedStart?.length || 0) : 0);
    if (idx !== -1) {
      if (endIdx === -1 || idx < endIdx) {
        endIdx = idx;
        matchedEnd = anchor;
      }
    }
  }

  // Se houver ponto final formal após a lista de ingredientes com pelo menos 3 vírgulas/itens
  const hasSentencePeriod = startIdx !== -1 && /[a-z0-9]\.\s+/i.test(normalized.slice(startIdx));

  // 3. Avaliar ruído / tokens ilegíveis (ex: "???", caracteres estranhos)
  const tokens = normalized.split(/\s+/);
  const unreadableTokens = tokens.filter(t => /\?{2,}|[^\w\s,\.\-:\(\)\/]{2,}/.test(t));
  const unreadableRatio = tokens.length > 0 ? unreadableTokens.length / tokens.length : 0;

  const hasStart = startIdx !== -1;
  const hasEnd = endIdx !== -1 || (hasStart && hasSentencePeriod);

  // IsComplete requer tanto início quanto fim demarcado, e baixa taxa de ruído
  const isComplete = hasStart && hasEnd && unreadableRatio < 0.15;

  let reason: string | undefined;
  if (!hasStart && !hasEnd) {
    reason = 'Não foi encontrada a palavra "INGREDIENTES" nem os avisos finais ("ALÉRGICOS/GLÚTEN"). A foto pode mostrar apenas a tabela nutricional ou a frente do pacote.';
  } else if (!hasStart) {
    reason = 'Início da lista ("INGREDIENTES:") não localizado. A foto pode ter começado no meio da lista.';
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
