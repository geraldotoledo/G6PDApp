import { G6PDRulesDatabase } from '../engine/types.ts';
import { DEFAULT_G6PD_DATABASE } from '../data/defaultRules.ts';

const DYNAMIC_RULES_STORAGE_KEY = 'g6pd_dynamic_rules_database_v1';
const LAST_CHECK_KEY = 'g6pd_rules_last_sync_check';

// URL padrão no GitHub Pages (custo R$ 0,00)
export const DEFAULT_REMOTE_RULES_URL =
  'https://geraldotoledo.github.io/G6PDApp/g6pd_rules.json';

export interface SyncCheckResult {
  updated: boolean;
  currentVersion: string;
  remoteVersion?: string;
  updatedAt?: string;
  message: string;
  error?: string;
}

/**
 * Compara duas versões no formato YYYY.MM.DD ou SemVer numericamente
 * Retorna > 0 se vA > vB, < 0 se vA < vB, e 0 se iguais.
 */
export function compareRulesVersion(vA: string, vB: string): number {
  const partsA = vA.replace(/^v/i, '').split('.').map(Number);
  const partsB = vB.replace(/^v/i, '').split('.').map(Number);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const a = partsA[i] || 0;
    const b = partsB[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}

/**
 * Retorna a base de regras ativa (usando a versão atualizada pela nuvem,
 * ou o fallback embutido de fábrica se offline ou primeira execução).
 */
export function getActiveRulesDatabase(): G6PDRulesDatabase {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_G6PD_DATABASE;
  }
  try {
    const stored = localStorage.getItem(DYNAMIC_RULES_STORAGE_KEY);
    if (stored) {
      const parsed: G6PDRulesDatabase = JSON.parse(stored);
      // Validar integridade mínima
      if (isValidRulesDatabase(parsed)) {
        // Usar a que tiver versão mais recente numericamente
        if (compareRulesVersion(parsed.rulesVersion, DEFAULT_G6PD_DATABASE.rulesVersion) >= 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar base dinâmica, usando embutida:', err);
  }

  return DEFAULT_G6PD_DATABASE;
}

/**
 * Validador estrito anti-corrupção (Captive Portal Guard):
 * Garante que uma rede Wi-Fi de mercado interceptando a requisição com tela de login
 * não corrompa a base do aplicativo.
 */
export function isValidRulesDatabase(data: unknown): data is G6PDRulesDatabase {
  if (!data || typeof data !== 'object') return false;
  const db = data as Partial<G6PDRulesDatabase>;

  if (typeof db.schemaVersion !== 'number') return false;
  if (typeof db.rulesVersion !== 'string') return false;
  if (!Array.isArray(db.rules) || db.rules.length < 25) return false;
  if (!Array.isArray(db.safeLookalikes) || db.safeLookalikes.length < 5) return false;

  return true;
}

/**
 * Sincroniza a base de regras com a nuvem silenciosamente ou sob demanda
 */
export async function syncRulesFromRemote(
  remoteUrl = DEFAULT_REMOTE_RULES_URL
): Promise<SyncCheckResult> {
  const currentDb = getActiveRulesDatabase();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    // Cache-busting com timestamp para evitar que a CDN sirva arquivo velho
    const cacheBustedUrl = `${remoteUrl}?t=${Date.now()}`;

    const res = await fetch(cacheBustedUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        updated: false,
        currentVersion: currentDb.rulesVersion,
        message: `Servidor retornou status ${res.status}. Base local mantida intacta.`
      };
    }

    const json = await res.json();

    // TRAVA ANTI-CORRUPÇÃO
    if (!isValidRulesDatabase(json)) {
      return {
        updated: false,
        currentVersion: currentDb.rulesVersion,
        message: 'O arquivo baixado não passou no teste de integridade clínica. Base local protegida.',
        error: 'Schema inválido ou incompleto'
      };
    }

    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());

    // Comparar versão numericamente
    if (compareRulesVersion(json.rulesVersion, currentDb.rulesVersion) > 0) {
      localStorage.setItem(DYNAMIC_RULES_STORAGE_KEY, JSON.stringify(json));
      return {
        updated: true,
        currentVersion: json.rulesVersion,
        remoteVersion: json.rulesVersion,
        updatedAt: json.updatedAt,
        message: `Base atualizada com sucesso para a versão ${json.rulesVersion} (${json.rules.length} regras)!`
      };
    }

    return {
      updated: false,
      currentVersion: currentDb.rulesVersion,
      remoteVersion: json.rulesVersion,
      message: `A sua base (v${currentDb.rulesVersion}) já está na versão mais recente disponível.`
    };
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      updated: false,
      currentVersion: currentDb.rulesVersion,
      message: isAbort
        ? 'A verificação de atualização demorou muito. O app continua funcionando 100% offline.'
        : 'Sem conexão com o servidor de atualizações. O app continua funcionando 100% offline.',
      error: err instanceof Error ? err.message : 'Erro de rede'
    };
  }
}
