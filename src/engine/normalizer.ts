/**
 * Utilitários de normalização textual e correção seletiva de homóglifos de OCR.
 */

export function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza o texto bruto vindo de OCR, teclado ou leitor de código de barras:
 * 1. Converte para minúsculas e remove acentos
 * 2. Une palavras hifenizadas quebradas em final de linha (ex: "metabis-\nsulfito" -> "metabissulfito")
 * 3. Normaliza quebras de linha e múltiplos espaços
 * 4. Corrige homóglifos clássicos de OCR em códigos INS e termos químicos específicos sem corromper palavras seguras
 */
export function normalizeText(rawText: string): string {
  if (!rawText) return '';

  // 1. Unir hifenizações de quebra de linha
  let text = rawText.replace(/([a-zA-Z0-9])-\s*[\r\n]+\s*([a-zA-Z0-9])/g, '$1$2');

  // 2. Remover acentuação e passar para minúsculas
  text = stripAccents(text).toLowerCase();

  // 3. Normalizar variações de códigos INS e E-numbers com correção de homóglifos ópticos (ex: "ins 15o d" -> "ins 150d")
  // Sufixos válidos com espaço são algarismos romanos (iv, iii, ii, i) ou letras (a, b, c, d, f) - NUNCA a conjunção portuguesa "e"
  text = text.replace(
    /\bins[\s\.\-_]*([0-9oO]{3})(?:([a-df-h]|i{1,3}|iv)|\s+(iv|iii|ii|i|[a-df]))\b/gi,
    (_match, num, attachedSuffix, spacedSuffix) => {
      const fixedNum = num.replace(/[oO]/g, '0');
      const suffix = (attachedSuffix || spacedSuffix || '').trim().toLowerCase();
      return `ins ${fixedNum}${suffix}`;
    }
  );

  // Normalizar códigos INS puramente numéricos (ex: "ins  223", "ins-223", "ins223" -> "ins 223") sem engolir conjunção "e"
  text = text.replace(/\bins[\s\.\-_]*([0-9oO]{3})\b/gi, (_match, num) => {
    return `ins ${num.replace(/[oO]/g, '0')}`;
  });

  // Normalizar E-numbers (ex: "e-102", "e 102", "e102", "e-150d")
  text = text.replace(/\be[\s\.\-_]*([0-9]{3}[a-df-h]?)\b/gi, (_match, code) => {
    return `e${code.toLowerCase()}`;
  });

  // 5. Correção de homóglifos pontuais comuns em palavras químicas conhecidas
  // (Ex.: "1" no lugar de "i" ou "l" em metabissulf1to, sod1o ou tartraz1na)
  text = text
    .replace(/\bmetabissulf[1l]to\b/g, 'metabissulfito')
    .replace(/\bmetabisulf[1l]to\b/g, 'metabisulfito')
    .replace(/\bsod[1l]o\b/g, 'sodio')
    .replace(/\bsod[1l]ca\b/g, 'sodica')
    .replace(/\bpotass[1l]o\b/g, 'potassio')
    .replace(/\btartraz[1l]na\b/g, 'tartrazina')
    .replace(/\bqu[1l]n[1l]na\b/g, 'quinina')
    .replace(/\bd[1l]p[1l]rona\b/g, 'dipirona')
    .replace(/\bparacetam[o0]l\b/g, 'paracetamol')
    .replace(/\b[1l]buprofeno\b/g, 'ibuprofeno')
    .replace(/\bnaftal[1l]na\b/g, 'naftalina');

  // 6. Colapsar múltiplos espaços em branco
  text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

  return text;
}
