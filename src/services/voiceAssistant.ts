/**
 * Assistente de Voz Nativo do Dispositivo (Web Speech API)
 * Transforma fala em texto (SpeechRecognition) e lê vereditos em voz alta (SpeechSynthesis)
 * com custo R$ 0,00 e funcionamento direto no chip do celular.
 */

// Declaração de tipos para SpeechRecognition do navegador
interface IWindowSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function isVoiceRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindowSpeech;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Inicia a escuta de voz em Português do Brasil
 */
export function startVoiceListening(
  onResult: (transcript: string) => void,
  onError: (errorMessage: string) => void,
  onEnd?: () => void
): () => void {
  const win = window as unknown as IWindowSpeech;
  const SpeechClass = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechClass) {
    onError('Reconhecimento de voz não suportado neste navegador.');
    return () => {};
  }

  const recognition = new SpeechClass();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results?.[0]?.[0]?.transcript;
    if (transcript) {
      onResult(transcript);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Erro no reconhecimento de voz:', event.error);
    if (event.error === 'not-allowed') {
      onError('Permissão de microfone negada.');
    } else if (event.error === 'no-speech') {
      onError('Nenhuma fala detectada. Tente falar novamente.');
    } else {
      onError(`Erro de áudio: ${event.error}`);
    }
  };

  recognition.onend = () => {
    onEnd?.();
  };

  try {
    recognition.start();
  } catch (err) {
    onError('Não foi possível iniciar o microfone.');
  }

  // Retorna função para cancelar escuta
  return () => {
    try {
      recognition.stop();
    } catch {
      // Ignorar
    }
  };
}

/**
 * Fala o veredito clínico em voz alta usando o sintetizador nativo do celular
 */
export function speakVerdict(textToSpeak: string): void {
  if (!isSpeechSynthesisSupported()) return;

  try {
    window.speechSynthesis.cancel(); // Para qualquer fala anterior

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05; // Levemente mais ágil
    utterance.pitch = 1.0;

    // Buscar voz em português do Brasil se disponível
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Falha ao falar em voz alta:', err);
  }
}
