import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_G6PD_DATABASE } from '../src/data/defaultRules.ts';
import { analyzeIngredientsText } from '../src/engine/ruleEngine.ts';
import type { G6PDRulesDatabase } from '../src/engine/types.ts';
import {
  compareRulesVersion,
  getActiveRulesDatabase,
  isValidRulesDatabase,
  syncRulesFromRemote
} from '../src/services/rulesSync.ts';

const DATABASE_KEY = 'g6pd_dynamic_rules_database_v1';
const LAST_CHECK_KEY = 'g6pd_rules_last_sync_check';
const REMOTE_URL = 'https://rules.invalid/g6pd_rules.json';
const INITIAL_VERSION = '2098.1.1';
const NEW_VERSION = '2098.1.2';

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();
  readonly writes: string[] = [];
  readonly failingKeys = new Set<string>();
  readError = false;

  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  getItem(key: string): string | null {
    if (this.readError) throw new Error('Leitura bloqueada');
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.writes.push(key);
    if (this.failingKeys.has(key)) throw new Error(`Gravação bloqueada: ${key}`);
    this.values.set(key, value);
  }
}

function validDatabase(version = INITIAL_VERSION): G6PDRulesDatabase {
  const db = structuredClone(DEFAULT_G6PD_DATABASE);
  db.rulesVersion = version;
  return db;
}

function setGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
}

function respondWith(payload: unknown, status = 200): void {
  setGlobal('fetch', async () => new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  }));
}

function setField(db: G6PDRulesDatabase, path: readonly (string | number)[], value: unknown): void {
  let parent = db as unknown as Record<string | number, unknown>;
  for (const key of path.slice(0, -1)) {
    parent = parent[key] as Record<string | number, unknown>;
  }
  parent[path[path.length - 1]] = value;
}

type Mutation = readonly [string, readonly (string | number)[], unknown];
const invalidMutations: readonly Mutation[] = [
  ['schema incompatível', ['schemaVersion'], 2],
  ['schema como string', ['schemaVersion'], '1'],
  ['versão ausente', ['rulesVersion'], undefined],
  ['versão malformada', ['rulesVersion'], '2026-10-3'],
  ['versão com sufixo arbitrário', ['rulesVersion'], '2026.10.3-beta'],
  ['versão com espaços', ['rulesVersion'], ' 2026.10.3 '],
  ['versão com quebra final', ['rulesVersion'], '2026.10.3\n'],
  ['descrição vazia', ['description'], '   '],
  ['descrição com tipo incorreto', ['description'], {}],
  ['data impossível', ['updatedAt'], '2026-99-99'],
  ['30 de fevereiro', ['updatedAt'], '2026-02-30'],
  ['29 de fevereiro não bissexto', ['updatedAt'], '2025-02-29'],
  ['século não bissexto', ['updatedAt'], '1900-02-29'],
  ['31 de abril', ['updatedAt'], '2026-04-31'],
  ['dia zero', ['updatedAt'], '2026-10-00'],
  ['ano zero', ['updatedAt'], '0000-01-01'],
  ['data com horário', ['updatedAt'], '2026-10-26T00:00:00Z'],
  ['data com quebra final', ['updatedAt'], '2026-10-26\n'],
  ['fontes ausentes', ['sources'], []],
  ['fonte nula', ['sources', 0], null],
  ['id de fonte ausente', ['sources', 0, 'id'], undefined],
  ['id de fonte duplicado', ['sources', 1, 'id'], DEFAULT_G6PD_DATABASE.sources[0].id],
  ['id de fonte com espaços', ['sources', 0, 'id'], ' fonte '],
  ['nome da fonte inválido', ['sources', 0, 'name'], 42],
  ['organização vazia', ['sources', 0, 'organization'], ''],
  ['documento inválido', ['sources', 0, 'documentTitle'], {}],
  ['edição inválida', ['sources', 0, 'editionOrDate'], false],
  ['seção vazia', ['sources', 0, 'sectionOrTable'], ' '],
  ['URL sem host', ['sources', 0, 'url'], 'https://'],
  ['URL com host inválido', ['sources', 0, 'url'], 'https://[invalid'],
  ['URL com protocolo inválido', ['sources', 0, 'url'], 'javascript:alert(1)'],
  ['URL relativa', ['sources', 0, 'url'], '/referencia.pdf'],
  ['URL com espaços', ['sources', 0, 'url'], 'https://example.org/um documento.pdf'],
  ['URL com objeto', ['sources', 0, 'url'], {}],
  ['regras insuficientes', ['rules'], []],
  ['regra nula', ['rules', 0], null],
  ['id de regra ausente', ['rules', 0, 'id'], undefined],
  ['id de regra duplicado', ['rules', 1, 'id'], DEFAULT_G6PD_DATABASE.rules[0].id],
  ['nome de regra vazio', ['rules', 0, 'name'], ' '],
  ['mecanismo clínico inválido', ['rules', 0, 'clinicalMechanism'], {}],
  ['risco ausente', ['rules', 0, 'riskLevel'], undefined],
  ['risco desconhecido', ['rules', 0, 'riskLevel'], 'UNKNOWN'],
  ['categoria desconhecida', ['rules', 0, 'category'], 'UNKNOWN'],
  ['protocolo desconhecido', ['rules', 0, 'protocolSource'], 'UNKNOWN'],
  ['sinônimos ausentes', ['rules', 0, 'synonyms'], undefined],
  ['sinônimos vazios', ['rules', 0, 'synonyms'], []],
  ['sinônimo não textual', ['rules', 0, 'synonyms'], ['válido', {}]],
  ['sinônimo em branco', ['rules', 0, 'synonyms'], [' ']],
  ['INS com objeto', ['rules', 0, 'insCode'], {}],
  ['INS numérico', ['rules', 0, 'insCode'], 102],
  ['INS malformado', ['rules', 0, 'insCode'], 'INS 102'],
  ['INS com quebra final', ['rules', 0, 'insCode'], '102\n'],
  ['E-number com objeto', ['rules', 0, 'eNumber'], {}],
  ['E-number numérico', ['rules', 0, 'eNumber'], 102],
  ['E-number malformado', ['rules', 0, 'eNumber'], 'E-não-numérico'],
  ['E-number com quebra final', ['rules', 0, 'eNumber'], 'E102\n'],
  ['ambiguidade textual', ['rules', 0, 'isAmbiguous'], 'false'],
  ['ambiguidade nula', ['rules', 0, 'isAmbiguous'], null],
  ['alerta com objeto', ['rules', 0, 'pediatricSyrupWarning'], {}],
  ['alerta vazio', ['rules', 0, 'pediatricSyrupWarning'], ' '],
  ['regex não é lista', ['rules', 0, 'regexPatterns'], {}],
  ['regex não textual', ['rules', 0, 'regexPatterns'], [102]],
  ['regex vazia', ['rules', 0, 'regexPatterns'], ['']],
  ['regex inválida', ['rules', 0, 'regexPatterns'], ['[']],
  ['evidência ausente', ['rules', 0, 'evidenceKind'], undefined],
  ['evidência desconhecida', ['rules', 0, 'evidenceKind'], 'UNKNOWN'],
  ['referência ausente', ['rules', 0, 'sourceRef'], undefined],
  ['referência inexistente', ['rules', 0, 'sourceRef'], 'fonte-inexistente'],
  ['referência com objeto', ['rules', 0, 'sourceRef'], {}],
  ['status de proveniência ausente', ['rules', 0, 'provenanceStatus'], undefined],
  ['status de proveniência desconhecido', ['rules', 0, 'provenanceStatus'], 'APPROVED'],
  ['nota de proveniência inválida', ['rules', 0, 'provenanceNote'], {}],
  ['nota de proveniência vazia', ['rules', 0, 'provenanceNote'], ' '],
  ['whitelist insuficiente', ['safeLookalikes'], []],
  ['entrada segura nula', ['safeLookalikes', 0], null],
  ['id seguro ausente', ['safeLookalikes', 0, 'id'], undefined],
  ['id seguro duplicado', ['safeLookalikes', 1, 'id'], DEFAULT_G6PD_DATABASE.safeLookalikes[0].id],
  ['termo seguro duplicado', ['safeLookalikes', 1, 'term'], DEFAULT_G6PD_DATABASE.safeLookalikes[0].term],
  ['termo seguro equivalente', ['safeLookalikes', 1, 'term'], `  ${DEFAULT_G6PD_DATABASE.safeLookalikes[0].term.toUpperCase()}  `],
  ['termo seguro inválido', ['safeLookalikes', 0, 'term'], {}],
  ['categoria segura vazia', ['safeLookalikes', 0, 'category'], ''],
  ['explicação segura inválida', ['safeLookalikes', 0, 'explanation'], {}]
];

describe('C3/C4 — contrato de regras e confirmação da sincronização', { concurrency: false }, () => {
  let storage: MemoryStorage;
  let originalGlobals: Map<string, PropertyDescriptor | undefined>;

  beforeEach(() => {
    originalGlobals = new Map(['localStorage', 'fetch'].map(name => [
      name, Object.getOwnPropertyDescriptor(globalThis, name)
    ]));
    storage = new MemoryStorage();
    storage.values.set(DATABASE_KEY, JSON.stringify(validDatabase()));
    setGlobal('localStorage', storage);
    setGlobal('fetch', async () => { throw new Error('Transporte não configurado no teste'); });
  });

  afterEach(() => {
    for (const [name, descriptor] of originalGlobals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  });

  it('aceita a base corrigida e preserva a comparação numérica existente', () => {
    assert.equal(isValidRulesDatabase(DEFAULT_G6PD_DATABASE), true);
    assert.equal(compareRulesVersion('2026.10.10', '2026.10.3'), 1);
    assert.equal(compareRulesVersion('v2026.10.2', '2026.10.2'), 0);
    assert.equal(compareRulesVersion('1.10.0', '1.9.0'), 1);
  });

  it('rejeita valores de raiz que não são uma base', () => {
    for (const value of [null, undefined, [], 'html de portal', 42, true]) {
      assert.equal(isValidRulesDatabase(value), false);
    }
  });

  for (const [name, path, value] of invalidMutations) {
    it(`rejeita ${name} no validador, no armazenamento e no payload remoto`, async () => {
      const invalid = validDatabase(NEW_VERSION);
      setField(invalid, path, value);
      assert.equal(isValidRulesDatabase(invalid), false);
      storage.values.set(DATABASE_KEY, JSON.stringify(invalid));
      assert.equal(getActiveRulesDatabase(), DEFAULT_G6PD_DATABASE);

      const previous = JSON.stringify(validDatabase());
      storage.values.set(DATABASE_KEY, previous);
      respondWith(invalid);
      const result = await syncRulesFromRemote(REMOTE_URL);
      assert.equal(result.updated, false);
      assert.equal(result.currentVersion, INITIAL_VERSION);
      assert.match(result.error ?? '', /Schema/);
      assert.equal(storage.values.get(DATABASE_KEY), previous);
      assert.deepEqual(storage.writes, []);
      assert.equal(getActiveRulesDatabase().rulesVersion, INITIAL_VERSION);
    });
  }

  it('aceita datas reais, incluindo exceções seculares de ano bissexto', () => {
    for (const updatedAt of ['2024-02-29', '2000-02-29', '2026-02-28', '2026-04-30', '2026-12-31']) {
      assert.equal(isValidRulesDatabase({ ...validDatabase(), updatedAt }), true, updatedAt);
    }
  });

  it('aceita opcionais ausentes e valida cada opcional quando presente', () => {
    const db = validDatabase();
    const rule = db.rules[0];
    delete rule.insCode;
    delete rule.eNumber;
    delete rule.regexPatterns;
    delete rule.isAmbiguous;
    delete rule.pediatricSyrupWarning;
    rule.provenanceStatus = 'DOCUMENTED';
    delete rule.provenanceNote;
    assert.equal(isValidRulesDatabase(db), true);
    Object.assign(rule, {
      insCode: '150d', eNumber: 'E150d', regexPatterns: ['\\bins\\s*150d\\b'],
      isAmbiguous: false, pediatricSyrupWarning: 'Conferir os excipientes.'
    });
    assert.equal(isValidRulesDatabase(db), true);
    rule.regexPatterns = [];
    assert.equal(isValidRulesDatabase(db), true);
    for (const field of ['insCode', 'eNumber', 'regexPatterns', 'isAmbiguous', 'pediatricSyrupWarning', 'provenanceNote']) {
      const invalid = structuredClone(db);
      setField(invalid, ['rules', 0, field], undefined);
      assert.equal(isValidRulesDatabase(invalid), false, `${field} presente com undefined`);
    }
  });

  it('exige nota explicativa para proveniência pendente e vínculo exato com a fonte', async () => {
    const db = validDatabase(NEW_VERSION);
    db.rules[0].provenanceStatus = 'PENDING_REVIEW';
    delete db.rules[0].provenanceNote;
    assert.equal(isValidRulesDatabase(db), false);
    storage.values.set(DATABASE_KEY, JSON.stringify(db));
    assert.equal(getActiveRulesDatabase(), DEFAULT_G6PD_DATABASE);
    storage.values.set(DATABASE_KEY, JSON.stringify(validDatabase()));
    respondWith(db);
    assert.equal((await syncRulesFromRemote(REMOTE_URL)).updated, false);
    db.rules[0].provenanceNote = 'Falta documento específico que sustente a classificação.';
    assert.equal(isValidRulesDatabase(db), true);
    db.rules[0].sourceRef = ` ${db.sources[0].id} `;
    assert.equal(isValidRulesDatabase(db), false);
  });

  it('rejeita também IDs duplicados por variação de caixa e termos por acentuação', () => {
    for (const collection of ['sources', 'rules', 'safeLookalikes'] as const) {
      const db = validDatabase();
      db[collection][1].id = db[collection][0].id.toUpperCase();
      assert.equal(isValidRulesDatabase(db), false);
    }
    const db = validDatabase();
    db.safeLookalikes[0].term = 'ácido cítrico';
    db.safeLookalikes[1].term = 'acido citrico';
    assert.equal(isValidRulesDatabase(db), false);
  });

  it('uma base persistida com eNumber objeto não alcança o motor', () => {
    const invalid = validDatabase(NEW_VERSION);
    setField(invalid, ['rules', 0, 'eNumber'], {});
    storage.values.set(DATABASE_KEY, JSON.stringify(invalid));
    const result = analyzeIngredientsText('tartrazina', { isSearchQuery: true });
    assert.equal(result.status, 'RED_BLOCKED');
    assert.equal(result.rulesVersion, DEFAULT_G6PD_DATABASE.rulesVersion);
  });

  it('confirma a nova versão somente após gravar a base e depois registra o metadado', async () => {
    respondWith(validDatabase(NEW_VERSION));
    const result = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(result.updated, true);
    assert.equal(result.currentVersion, NEW_VERSION);
    assert.equal(result.remoteVersion, NEW_VERSION);
    assert.equal(result.updatedAt, DEFAULT_G6PD_DATABASE.updatedAt);
    assert.equal(result.error, undefined);
    assert.equal(getActiveRulesDatabase().rulesVersion, result.currentVersion);
    assert.deepEqual(storage.writes, [DATABASE_KEY, LAST_CHECK_KEY]);
    assert.ok(Number.isFinite(Date.parse(storage.values.get(LAST_CHECK_KEY)!)));
  });

  it('falha de gravação da base mantém versão anterior e não vira erro de rede', async () => {
    storage.failingKeys.add(DATABASE_KEY);
    const previous = storage.values.get(DATABASE_KEY);
    respondWith(validDatabase(NEW_VERSION));
    const result = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(result.updated, false);
    assert.equal(result.currentVersion, INITIAL_VERSION);
    assert.equal(result.remoteVersion, NEW_VERSION);
    assert.match(result.error ?? '', /armazenamento/i);
    assert.doesNotMatch(result.message, /rede|conexão/i);
    assert.equal(storage.values.get(DATABASE_KEY), previous);
    assert.equal(getActiveRulesDatabase().rulesVersion, result.currentVersion);
    assert.deepEqual(storage.writes, [DATABASE_KEY]);
  });

  it('falha apenas no metadado conserva atualização confirmada e avisa falha secundária', async () => {
    storage.failingKeys.add(LAST_CHECK_KEY);
    respondWith(validDatabase(NEW_VERSION));
    const result = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(result.updated, true);
    assert.equal(result.currentVersion, NEW_VERSION);
    assert.equal(result.remoteVersion, NEW_VERSION);
    assert.match(result.message, /Aviso.*última verificação/);
    assert.match(result.error ?? '', /metadado.*armazenamento/);
    assert.equal(getActiveRulesDatabase().rulesVersion, result.currentVersion);
    assert.equal(storage.values.has(LAST_CHECK_KEY), false);
    assert.deepEqual(storage.writes, [DATABASE_KEY, LAST_CHECK_KEY]);
  });

  for (const remoteVersion of [INITIAL_VERSION, '2098.1.0']) {
    for (const metadataFailure of [false, true]) {
      it(`não reativa versão ${remoteVersion}; metadado falhando: ${metadataFailure}`, async () => {
        if (metadataFailure) storage.failingKeys.add(LAST_CHECK_KEY);
        const previous = storage.values.get(DATABASE_KEY);
        respondWith(validDatabase(remoteVersion));
        const result = await syncRulesFromRemote(REMOTE_URL);
        assert.equal(result.updated, false);
        assert.equal(result.currentVersion, INITIAL_VERSION);
        assert.equal(result.remoteVersion, remoteVersion);
        assert.equal(storage.values.get(DATABASE_KEY), previous);
        assert.equal(getActiveRulesDatabase().rulesVersion, result.currentVersion);
        assert.deepEqual(storage.writes, [LAST_CHECK_KEY]);
        if (metadataFailure) assert.match(result.error ?? '', /metadado/);
        else assert.equal(result.error, undefined);
      });
    }
  }

  it('não anuncia ativação quando o armazenamento está ausente', async () => {
    Reflect.deleteProperty(globalThis, 'localStorage');
    respondWith(validDatabase(NEW_VERSION));
    const result = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(result.updated, false);
    assert.equal(result.currentVersion, DEFAULT_G6PD_DATABASE.rulesVersion);
    assert.match(result.error ?? '', /armazenamento/i);
    assert.equal(getActiveRulesDatabase(), DEFAULT_G6PD_DATABASE);
  });

  it('acesso bloqueado ao objeto storage usa fallback e retorna erro de armazenamento', async t => {
    t.mock.method(console, 'warn', () => {});
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() { throw new Error('Storage bloqueado'); }
    });
    assert.equal(getActiveRulesDatabase(), DEFAULT_G6PD_DATABASE);
    respondWith(validDatabase(NEW_VERSION));
    const result = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(result.updated, false);
    assert.equal(result.currentVersion, DEFAULT_G6PD_DATABASE.rulesVersion);
    assert.match(result.error ?? '', /armazenamento/i);
  });

  it('erro na leitura usa a base embutida sem sobrescrever dados em falha de comunicação', async t => {
    t.mock.method(console, 'warn', () => {});
    const previous = storage.values.get(DATABASE_KEY);
    storage.readError = true;
    assert.equal(getActiveRulesDatabase(), DEFAULT_G6PD_DATABASE);
    const result = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(result.updated, false);
    assert.equal(result.currentVersion, DEFAULT_G6PD_DATABASE.rulesVersion);
    assert.equal(storage.values.get(DATABASE_KEY), previous);
    assert.deepEqual(storage.writes, []);
  });

  it('JSON persistido malformado e versão persistida antiga usam fallback', t => {
    t.mock.method(console, 'warn', () => {});
    storage.values.set(DATABASE_KEY, '<html>portal</html>');
    assert.equal(getActiveRulesDatabase(), DEFAULT_G6PD_DATABASE);
    storage.values.set(DATABASE_KEY, JSON.stringify(validDatabase('2026.10.1')));
    assert.equal(getActiveRulesDatabase(), DEFAULT_G6PD_DATABASE);
  });

  it('rede indisponível mantém a base e sempre libera o temporizador', async t => {
    const timer = t.mock.method(globalThis, 'clearTimeout');
    const previous = storage.values.get(DATABASE_KEY);
    setGlobal('fetch', async () => { throw new Error('Rede indisponível'); });
    const result = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(result.updated, false);
    assert.equal(result.currentVersion, INITIAL_VERSION);
    assert.match(result.message, /comunicação/i);
    assert.match(result.error ?? '', /Rede indisponível/);
    assert.equal(storage.values.get(DATABASE_KEY), previous);
    assert.deepEqual(storage.writes, []);
    assert.equal(timer.mock.callCount(), 1);
  });

  it('requisição abortada preserva versão e identifica tempo limite', async () => {
    setGlobal('fetch', async () => { throw new DOMException('Abortado', 'AbortError'); });
    const result = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(result.updated, false);
    assert.equal(result.currentVersion, INITIAL_VERSION);
    assert.match(result.message, /demorou muito/);
    assert.deepEqual(storage.writes, []);
  });

  it('HTTP sem sucesso e JSON remoto malformado não escrevem na base', async () => {
    const previous = storage.values.get(DATABASE_KEY);
    respondWith({}, 503);
    const httpResult = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(httpResult.updated, false);
    assert.match(httpResult.message, /503/);
    setGlobal('fetch', async () => new Response('<html>login</html>', { status: 200 }));
    const jsonResult = await syncRulesFromRemote(REMOTE_URL);
    assert.equal(jsonResult.updated, false);
    assert.equal(jsonResult.currentVersion, INITIAL_VERSION);
    assert.match(jsonResult.message, /resposta/);
    assert.equal(storage.values.get(DATABASE_KEY), previous);
    assert.deepEqual(storage.writes, []);
  });
});
