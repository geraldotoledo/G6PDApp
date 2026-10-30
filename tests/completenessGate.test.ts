import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeIngredientsText } from '../src/engine/ruleEngine.ts';
import { evaluateLabelCompleteness } from '../src/engine/completenessGate.ts';

describe('Integridade da lista de ingredientes e excipientes', () => {
  for (const text of [
    'Excipientes: q.s.p. 1 comprimido.',
    'Excipientes: q.s.p. 1 comprimido. Registro MS 123',
    'Veículo: q.s.p. 5 mL. Registro MS 123',
    'Veículo q.s.p. 5 mL. Registro MS 123',
    'Composição: amoxicilina. Excipientes:',
    'Composição: amoxicilina. Excipientes: q.s.p. 1 comprimido.',
    'Excipientes: q.s.p. 1 comprimido. Modo de usar: ingerir com água.',
    'Veículo: q.s.p. 5 mL. Fabricado por Laboratório Teste.',
    'Excipientes: Instruções de uso: agitar antes de usar.',
    'Excipientes: Posologia: seguir orientação médica.'
  ]) {
    it(`não confunde apresentação ou instruções com ingredientes: ${text}`, () => {
      const result = analyzeIngredientsText(text);
      assert.equal(result.completeness.isComplete, false);
      assert.equal(result.status, 'YELLOW_INCOMPLETE_SCAN');
    });
  }

  for (const text of [
    'Excipientes: água purificada, sacarose. Registro MS 123',
    'Veículo: água purificada, sacarose. Modo de usar: agitar.',
    'Composição: amoxicilina. Excipientes: água purificada, sacarose. Registro MS 123'
  ]) {
    it(`reconhece substâncias reais dos excipientes: ${text}`, () => {
      assert.equal(evaluateLabelCompleteness(text).isComplete, true);
      assert.equal(analyzeIngredientsText(text).status, 'GREEN_SAFE');
    });
  }

  for (const marker of ['###', '@@', '???', '\uFFFD']) {
    it(`não dilui corrupção ${marker} em uma lista longa`, () => {
      const text = `Ingredientes: farinha, açúcar, ${marker}, óleo, água, leite, sal. ALÉRGICOS: CONTÉM LEITE.`;
      const result = analyzeIngredientsText(text);
      assert.equal(result.status, 'YELLOW_INCOMPLETE_SCAN');
      assert.equal(result.completeness.isComplete, false);
    });

    it(`preserva bloqueio por tartrazina junto de ${marker}`, () => {
      const result = analyzeIngredientsText(`Ingredientes: água, ${marker}, tartrazina. CONTÉM GLÚTEN.`);
      assert.equal(result.status, 'RED_BLOCKED');
      assert.equal(result.completeness.isComplete, false);
    });
  }

  it('preserva notações de formulação e percentuais legítimos', () => {
    const text = 'Excipientes: água purificada (95%), sacarose 5% m/v, aroma de baunilha, solução q.s.p. 5 mL. Registro MS 123';
    assert.equal(evaluateLabelCompleteness(text).isComplete, true);
  });

  it('preserva pontuação e códigos INS em lista legível', () => {
    const result = analyzeIngredientsText('Ingredientes: leite em pó (10%), água, emulsificante lecitina de soja (INS 322), ácido cítrico. ALÉRGICOS: CONTÉM LEITE.');
    assert.equal(result.status, 'GREEN_SAFE');
    assert.equal(result.completeness.isComplete, true);
  });

  it('não classifica ruído posterior aos avisos como ingrediente ilegível', () => {
    const result = analyzeIngredientsText('Ingredientes: água, açúcar, sal. ALÉRGICOS: CONTÉM LEITE. SAC: @@');
    assert.equal(result.status, 'GREEN_SAFE');
  });

  it('bloqueia excipiente restrito mesmo sem lista completa', () => {
    const result = analyzeIngredientsText('Excipientes: tartrazina,');
    assert.equal(result.status, 'RED_BLOCKED');
    assert.equal(result.completeness.isComplete, false);
  });
});
