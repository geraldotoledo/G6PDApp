import { describe, it } from 'node:test';
import assert from 'node:assert';
import { analyzeIngredientsText } from '../src/engine/ruleEngine.ts';

describe('G6PDApp Rule Engine & Safety Invariants', () => {

  it('1. Deve bloquear biscoito com Metabissulfito de Sódio e TBHQ (🔴 RED_BLOCKED)', () => {
    const rawLabel = `
      INGREDIENTES: Farinha de trigo enriquecida com ferro e ácido fólico, açúcar,
      gordura vegetal hidrogenada, amido de milho, sal, conservador metabissulfito de sódio (INS 223),
      antioxidante TBHQ (INS 319) e aromatizante.
      ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO E SOJA. CONTÉM GLÚTEN.
    `;
    const result = analyzeIngredientsText(rawLabel);

    assert.strictEqual(result.status, 'RED_BLOCKED');
    assert.strictEqual(result.statusBadge, 'BLOQUEADO');
    assert.ok(result.matches.some(m => m.rule.id === 'sulfite-metabissulfito-sodio-223'));
    assert.ok(result.matches.some(m => m.rule.id === 'antiox-tbhq-319'));
  });

  it('2. Deve bloquear biscoito com Caramelo IV mesmo tendo corantes naturais urucum e cúrcuma (🔴 RED_BLOCKED)', () => {
    const rawLabel = `
      Ingredientes: Farinha de trigo enriquecida com ferro e ácido fólico, açúcar refinado,
      óleo de palma, extrato de malte, corante caramelo IV (processo sulfito-amônia),
      corante natural urucum, corante natural cúrcuma, sal refinado e fermentos químicos.
      ALÉRGICOS: CONTÉM DERIVADOS DE CEVADA E TRIGO. CONTÉM GLÚTEN.
    `;
    const result = analyzeIngredientsText(rawLabel);

    assert.strictEqual(result.status, 'RED_BLOCKED');
    assert.ok(result.matches.some(m => m.rule.id === 'dye-caramelo-iv-150d'));
    // Urucum e cúrcuma devem ter sido lidos
    assert.ok(result.matches.some(m => m.rule.id === 'dye-urucum-160b'));
    assert.ok(result.matches.some(m => m.rule.id === 'dye-curcuma-100'));
  });

  it('3. Deve liberar alimento 100% seguro com leitura íntegra (🟢 GREEN_SAFE)', () => {
    const rawLabel = `
      INGREDIENTES: Farinha de trigo enriquecida com ferro e ácido fólico, açúcar,
      gordura vegetal, coco ralado desidratado, amido de milho, sal, fermentos químicos
      (bicarbonato de amônio e bicarbonato de sódio) e aromatizante.
      ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO. PODE CONTER SOJA, LEITE E AVEIA. CONTÉM GLÚTEN.
    `;
    const result = analyzeIngredientsText(rawLabel);

    assert.strictEqual(result.status, 'GREEN_SAFE');
    assert.strictEqual(result.statusBadge, 'LIBERADO');
    assert.strictEqual(result.matches.length, 0);
    assert.strictEqual(result.completeness.isComplete, true);
  });

  it('4. Deve liberar chocolate puro com lecitina de soja (🟢 GREEN_SAFE)', () => {
    const rawLabel = `
      Ingredientes: Açúcar, manteiga de cacau, leite em pó integral, massa de cacau,
      soro de leite desmineralizado e emulsificante lecitina de soja.
      ALÉRGICOS: CONTÉM LEITE E DERIVADOS DE SOJA. NÃO CONTÉM GLÚTEN.
    `;
    const result = analyzeIngredientsText(rawLabel);

    assert.strictEqual(result.status, 'GREEN_SAFE');
    assert.ok(result.safeLookalikesDetected.some(s => s.id === 'safe-lecitina-soja'));
  });

  it('5. Blindagem 2: Não confundir Sulfato Ferroso / Sulfato de Zinco com Sulfito (Safe Lookalikes Whitelist)', () => {
    const infantCerealLabel = `
      INGREDIENTES: Farinha de milho enriquecida, açúcar, extrato de malte,
      sulfato ferroso (ferro), sulfato de zinco (zinco), vitamina K1 (fitomenadiona),
      ácido fólico, sal e aromatizante vanilina.
      ALÉRGICOS: CONTÉM DERIVADOS DE CEVADA. NÃO CONTÉM GLÚTEN.
    `;
    const result = analyzeIngredientsText(infantCerealLabel);

    // JAMAIS deve bloquear achando que sulfato é sulfito!
    assert.strictEqual(result.status, 'GREEN_SAFE');
    assert.ok(result.safeLookalikesDetected.some(s => s.term === 'sulfato ferroso'));
    assert.ok(result.safeLookalikesDetected.some(s => s.term === 'sulfato de zinco'));
    assert.ok(result.safeLookalikesDetected.some(s => s.term === 'vitamina k1'));
    assert.ok(!result.matches.some(m => m.rule.category === 'SULFITE'));
  });

  it('6. Blindagem 1: Leitura cortada por reflexo sem delimitadores NUNCA deve dar sinal verde (🟡 YELLOW_INCOMPLETE_SCAN)', () => {
    // Foto cortada mostrando apenas um fragmento de ingredientes no meio da lista
    const truncatedLabel = `Farinha de trigo, açúcar, óleo vegetal, amido de milho, cacau em pó`;
    const result = analyzeIngredientsText(truncatedLabel);

    assert.strictEqual(result.status, 'YELLOW_INCOMPLETE_SCAN');
    assert.strictEqual(result.statusBadge, 'LEITURA PARCIAL');
    assert.strictEqual(result.completeness.isComplete, false);
  });

  it('7. Invariante de Segurança: Leitura parcial contendo item proibido deve disparar 🔴 BLOQUEADO imediatamente', () => {
    // Foto cortada mas que pegou a palavra metabissulfito
    const partialForbiddenLabel = `amido, sal, metabissulfito de sódio, óleo vegetal`;
    const result = analyzeIngredientsText(partialForbiddenLabel);

    assert.strictEqual(result.status, 'RED_BLOCKED');
    assert.strictEqual(result.statusBadge, 'BLOQUEADO');
  });

  it('8. Blindagem 3: Medicamentos seguros (Ibuprofeno/Amoxicilina) devem alertar sobre corantes em excipientes de xaropes', () => {
    const drugQuery = `Ibuprofeno gotas 100mg/ml`;
    const result = analyzeIngredientsText(drugQuery, { isSearchQuery: true });

    assert.strictEqual(result.status, 'GREEN_SAFE');
    assert.ok(result.pediatricSyrupAlerts.length > 0);
    assert.ok(result.pediatricSyrupAlerts[0].includes('suspensões e xaropes pediátricos'));
  });

  it('9. Medicamento restrito no Brasil: Dipirona deve ser bloqueada (🔴 RED_BLOCKED)', () => {
    const drugQuery = `Novalgina / Dipirona gotas 500mg`;
    const result = analyzeIngredientsText(drugQuery, { isSearchQuery: true });

    assert.strictEqual(result.status, 'RED_BLOCKED');
    assert.ok(result.matches.some(m => m.rule.id === 'drug-dipirona-metamizol'));
  });

  it('10. Medicamentos de Alto Risco Global (CPIC): Bactrim e Primaquina (🔴 RED_BLOCKED)', () => {
    const bactrim = analyzeIngredientsText(`Bactrim F (sulfametoxazol e trimetoprima)`, { isSearchQuery: true });
    assert.strictEqual(bactrim.status, 'RED_BLOCKED');

    const primaquina = analyzeIngredientsText(`Fosfato de primaquina 15mg`, { isSearchQuery: true });
    assert.strictEqual(primaquina.status, 'RED_BLOCKED');
  });

  it('11. Alimentos e Químicos de alto risco: Feijão-fava, Água Tônica e Naftalina (🔴 RED_BLOCKED)', () => {
    const fava = analyzeIngredientsText(`Salada com grão de feijão-fava fresco`, { isSearchQuery: true });
    assert.strictEqual(fava.status, 'RED_BLOCKED');

    const tonica = analyzeIngredientsText(`Água Tônica contendo quinina`, { isSearchQuery: true });
    assert.strictEqual(tonica.status, 'RED_BLOCKED');

    const naftalina = analyzeIngredientsText(`Bolinhas de naftalina antimofo`, { isSearchQuery: true });
    assert.strictEqual(naftalina.status, 'RED_BLOCKED');
  });

  it('12. Corante Caramelo Ambíguo (sem número) deve gerar alerta de atenção (🟡 YELLOW_ATTENTION)', () => {
    const ambiguousLabel = `
      INGREDIENTES: Água gaseificada, açúcar, extrato de noz de cola, corante caramelo e acidulante ins 338.
      NÃO CONTÉM GLÚTEN.
    `;
    const result = analyzeIngredientsText(ambiguousLabel);

    assert.strictEqual(result.status, 'YELLOW_ATTENTION');
    assert.ok(result.matches.some(m => m.rule.id === 'dye-caramelo-generico-ambiguo'));
  });

  it('13. Tolerância a Homóglifos de OCR (metabissulf1to e INS 15O d)', () => {
    const ocrGlitchLabel = `
      INGREDIENTES: Farinha de trigo, acucar, metabissulf1to de sod1o, corante ins 15o d.
      ALERGICOS: CONTEM GLUTEN.
    `;
    const result = analyzeIngredientsText(ocrGlitchLabel);

    assert.strictEqual(result.status, 'RED_BLOCKED');
    assert.ok(result.matches.some(m => m.rule.id === 'sulfite-metabissulfito-sodio-223'));
    assert.ok(result.matches.some(m => m.rule.id === 'dye-caramelo-iv-150d'));
  });

  it('14. Deduplicação e Fusão de Spans: "corante caramelo IV (INS 150d)" não deve duplicar cards da mesma regra nem gerar spans sobrepostos', () => {
    const rawLabel = `
      Ingredientes: Farinha de trigo, açúcar, extrato de malte, corante caramelo IV (INS 150d), sal e fermento.
      ALÉRGICOS: CONTÉM GLÚTEN.
    `;
    const result = analyzeIngredientsText(rawLabel);

    assert.strictEqual(result.status, 'RED_BLOCKED');
    const matchesCaramel = result.matches.filter(m => m.rule.id === 'dye-caramelo-iv-150d');
    assert.strictEqual(matchesCaramel.length, 1);

    for (let i = 0; i < result.highlightSpans.length - 1; i++) {
      const current = result.highlightSpans[i];
      const next = result.highlightSpans[i + 1];
      assert.ok(
        current.end <= next.start,
        `Span sobreposto detectado: [${current.start}, ${current.end}] sobrepõe [${next.start}, ${next.end}]`
      );
    }
  });

});
