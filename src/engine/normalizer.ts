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

  // 3. Normalizar variações de códigos INS e E-numbers
  // Ex: "ins  102", "ins-102", "ins102", "ins. 102", "e-102", "e 102"
  text = text.replace(/\bins[\s\.\-_]*([0-9]{3}[a-z]?|[0-9]{3}\s*(?:iv|iii|ii|i))\b/gi, (match, code) => {
    return `ins ${code.replace(/\s+/g, '')}`;
  });

  text = text.replace(/\be[\s\.\-_]*([0-9]{3}[a-z]?)\b/gi, (match, code) => {
    return `e${code}`;
  });

  // 4. Correção de homóglifos ópticos em padrões de código INS
  // Ex: "ins 15o d" ou "ins 15od" -> "ins 150d"
  text = text.replace(/\bins\s*([0-9oO]{3})\s*([a-ziv]+)?\b/gi, (match, num, suffix) => {
    const fixedNum = num.replace(/[oO]/g, '0');
    return `ins ${fixedNum}${suffix ? suffix.trim() : ''}`;
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
