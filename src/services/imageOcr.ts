/**
 * Pré-processador de Imagens para Leitura Óptica de Rótulos (OCR)
 * Aplica ajustes de contraste, escala de cinza e redução de reflexos especulares
 * típicos de embalagens plásticas e brilhantes de biscoitos e chocolates.
 */

export interface PreprocessedImageResult {
  processedDataUrl: string;
  width: number;
  height: number;
}

/**
 * Carrega e pré-processa uma imagem para melhorar a legibilidade de caracteres miúdos
 */
export function preprocessLabelImage(
  file: File,
  targetMaxWidth = 1600
): Promise<PreprocessedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 1. Calcular dimensões proporcionais
        let width = img.width;
        let height = img.height;

        if (width > targetMaxWidth) {
          height = Math.round((height * targetMaxWidth) / width);
          width = targetMaxWidth;
        }

        // 2. Criar canvas de processamento
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
          return;
        }

        // 3. Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // 4. Aplicar filtro de escala de cinza e aumento de contraste adaptativo
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Fator de contraste (1.2 a 1.4 destaca texto escuro em fundo claro)
        const contrast = 1.3;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

        for (let i = 0; i < data.length; i += 4) {
          // Luminância perceptual
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Ajuste de contraste
          const highContrast = factor * (gray - 128) + 128;
          const clamped = Math.max(0, Math.min(255, highContrast));

          data[i] = clamped;     // R
          data[i + 1] = clamped; // G
          data[i + 2] = clamped; // B
        }

        ctx.putImageData(imageData, 0, 0);

        resolve({
          processedDataUrl: canvas.toDataURL('image/jpeg', 0.85),
          width,
          height
        });
      };

      img.onerror = () => reject(new Error('Falha ao carregar a imagem.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Tenta detectar código de barras diretamente na imagem utilizando a API nativa
 * BarcodeDetector do navegador (suportada nativamente no Chrome Android / Play Services)
 */
export async function detectBarcodeFromImage(file: File): Promise<string | null> {
  if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
    return null;
  }

  try {
    const BarcodeDetectorClass = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (bitmap: ImageBitmap) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
    const detector = new BarcodeDetectorClass({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']
    });

    const bitmap = await createImageBitmap(file);
    const barcodes = await detector.detect(bitmap);

    if (barcodes && barcodes.length > 0) {
      return barcodes[0].rawValue;
    }
  } catch (err) {
    console.warn('BarcodeDetector nativo falhou na imagem:', err);
  }

  return null;
}

/**
 * Extrai texto óptico (OCR) da imagem pré-processada sob demanda em Português.
 * Utiliza carregamento dinâmico para manter o bundle principal leve.
 */
export async function extractTextFromPreprocessedImage(
  dataUrl: string,
  onProgress?: (progressPct: number) => void
): Promise<string> {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('por', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          onProgress?.(Math.round(m.progress * 100));
        }
      }
    });

    try {
      const { data } = await worker.recognize(dataUrl);
      return data?.text || '';
    } finally {
      await worker.terminate();
    }
  } catch (err) {
    console.warn('Falha no motor OCR Tesseract:', err);
    throw err;
  }
}
