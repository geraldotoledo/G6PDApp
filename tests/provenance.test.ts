import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_G6PD_DATABASE } from '../src/data/defaultRules.ts';
import { isValidRulesDatabase } from '../src/services/rulesSync.ts';

const cloneDatabase = () => structuredClone(DEFAULT_G6PD_DATABASE);

describe('Proveniência: integridade não equivale a aprovação clínica', () => {
  it('aceita a base com vínculos resolvidos e pendências explícitas', () => {
    assert.equal(isValidRulesDatabase(DEFAULT_G6PD_DATABASE), true);
    const sources = new Set(DEFAULT_G6PD_DATABASE.sources.map(source => source.id));
    for (const rule of DEFAULT_G6PD_DATABASE.rules) {
      assert.ok(sources.has(rule.sourceRef), rule.id);
      assert.ok(rule.evidenceKind, rule.id);
      if (rule.provenanceStatus === 'PENDING_REVIEW') {
        assert.ok(rule.provenanceNote?.trim(), rule.id);
      }
    }
    assert.ok(DEFAULT_G6PD_DATABASE.rules.some(rule => rule.provenanceStatus === 'PENDING_REVIEW'));
    assert.ok(DEFAULT_G6PD_DATABASE.rules.some(rule => rule.provenanceStatus === 'DOCUMENTED'));
  });

  for (const field of ['sourceRef', 'evidenceKind', 'provenanceStatus']) {
    it(`rejeita regra sem ${field}`, () => {
      const db = cloneDatabase();
      Reflect.deleteProperty(db.rules[0], field);
      assert.equal(isValidRulesDatabase(db), false);
    });
  }

  it('rejeita vínculo a fonte inexistente', () => {
    const db = cloneDatabase();
    db.rules[0].sourceRef = 'fonte-inexistente';
    assert.equal(isValidRulesDatabase(db), false);
  });

  for (const [field, value] of [
    ['evidenceKind', 'CLINICALLY_APPROVED'],
    ['provenanceStatus', 'APPROVED'],
    ['sourceRef', '   '],
  ]) {
    it(`rejeita ${field} inválido`, () => {
      const db = cloneDatabase();
      Object.assign(db.rules[0], { [field]: value });
      assert.equal(isValidRulesDatabase(db), false);
    });
  }

  it('rejeita fonte sem ID e fonte com ID duplicado', () => {
    const missing = cloneDatabase();
    Reflect.deleteProperty(missing.sources[0], 'id');
    assert.equal(isValidRulesDatabase(missing), false);
    const duplicate = cloneDatabase();
    duplicate.sources[1].id = duplicate.sources[0].id;
    assert.equal(isValidRulesDatabase(duplicate), false);
  });

  for (const note of [undefined, '', '   ']) {
    it(`rejeita pendência sem explicação não vazia (${String(note)})`, () => {
      const db = cloneDatabase();
      const pending = db.rules.find(rule => rule.provenanceStatus === 'PENDING_REVIEW');
      assert.ok(pending);
      pending.provenanceNote = note;
      assert.equal(isValidRulesDatabase(db), false);
    });
  }

  it('não apresenta sulfitos novos nem divergências clínicas como documentados', () => {
    for (const id of [
      'sulfite-sulfito-potassio-225', 'sulfite-sulfito-calcio-226',
      'sulfite-bissulfito-calcio-227', 'sulfite-bissulfito-potassio-228',
      'drug-cloranfenicol', 'drug-isoniazida', 'drug-nitrofurantoina',
      'drug-furazolidona', 'drug-acido-nalidixico', 'drug-sulfametoxazol-trimetoprima',
      'drug-sulfadiazina', 'drug-sulfassalazina', 'drug-fenazopiridina',
      'drug-primaquina', 'drug-fluoroquinolonas', 'drug-cloroquina', 'food-quinina-tonica',
    ]) {
      const rule = DEFAULT_G6PD_DATABASE.rules.find(candidate => candidate.id === id);
      assert.ok(rule, id);
      assert.equal(rule.provenanceStatus, 'PENDING_REVIEW', id);
      assert.ok(rule.provenanceNote?.trim(), id);
    }
  });
});
