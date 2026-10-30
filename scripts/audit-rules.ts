import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { G6PDRulesDatabase } from '../src/engine/types.ts';
import { analyzeIngredientsText } from '../src/engine/ruleEngine.ts';
import { isValidRulesDatabase } from '../src/services/rulesSync.ts';

function runAudit() {
  console.log('====================================================');
  console.log('AUDITORIA TÉCNICA G6PD — SCHEMA, PARIDADE, VÍNCULOS E INVARIANTES');
  console.log('====================================================\n');

  const authoritativePath = resolve(process.cwd(), 'src/data/rules.json');
  const publicPath = resolve(process.cwd(), 'public/g6pd_rules.json');

  console.log(`Fonte Autoritativa: ${authoritativePath}`);
  const rawAuth = readFileSync(authoritativePath, 'utf-8');

  const rawPublic = readFileSync(publicPath, 'utf-8');
  const parsed: unknown = JSON.parse(rawAuth);

  // Falhar antes de consumir estruturas inválidas; a auditoria não repara a cópia pública.
  if (!isValidRulesDatabase(parsed)) {
    console.error('FALHA ESTRUTURAL/VÍNCULO: schema, enums, IDs de fontes, sourceRef e notas de pendência devem ser válidos.');
    process.exit(1);
  }
  const db: G6PDRulesDatabase = parsed;

  console.log(`Versão da Base: ${db.rulesVersion}`);
  console.log(`Última Atualização: ${db.updatedAt}`);
  console.log(`Fontes Estruturadas: ${db.sources.length}`);
  console.log(`Total de Regras: ${db.rules.length}`);
  console.log(`Total de Falsos Amigos Seguros (Whitelist): ${db.safeLookalikes.length}\n`);

  const errors: string[] = [];
  const warnings: string[] = [];

  if (rawAuth !== rawPublic) {
    errors.push('FALHA DE PARIDADE: src/data/rules.json e public/g6pd_rules.json divergem!');
  } else {
    console.log('  ✔ Paridade Exata (src/data/rules.json === public/g6pd_rules.json): OK');
  }

  console.log('  ✔ Schema e integridade referencial (isValidRulesDatabase): OK');
  console.log('    Este resultado não verifica conteúdo médico nem autenticidade das fontes.');

  const sourceIds = new Set(db.sources.map(source => source.id));
  const invalidLinks = db.rules.filter(rule => !sourceIds.has(rule.sourceRef));
  if (invalidLinks.length > 0) {
    errors.push(`VÍNCULOS INVÁLIDOS: ${invalidLinks.map(rule => rule.id).join(', ')}`);
  } else {
    console.log(`  ✔ Vínculos resolvidos: ${db.rules.length}/${db.rules.length} regras`);
  }

  const documented = db.rules.filter(rule => rule.provenanceStatus === 'DOCUMENTED');
  const pending = db.rules.filter(rule => rule.provenanceStatus === 'PENDING_REVIEW');
  console.log(`\n--- Estado documental declarado: ${documented.length} DOCUMENTED; ${pending.length} PENDING_REVIEW ---`);
  console.log('DOCUMENTED indica suporte documental cadastrado para a classificação, não revisão profissional do catálogo.');
  pending.forEach(rule => console.log(`  PENDENTE ${rule.id} [${rule.sourceRef}]: ${rule.provenanceNote}`));

  // 1. Checar IDs duplicados
  const ruleIds = new Set<string>();
  db.rules.forEach((rule, idx) => {
    if (!rule.id) {
      errors.push(`Regra #${idx} sem ID.`);
    } else if (ruleIds.has(rule.id)) {
      errors.push(`ID duplicado encontrado: "${rule.id}".`);
    } else {
      ruleIds.add(rule.id);
    }

    if (!rule.name) errors.push(`Regra "${rule.id}" sem nome.`);
    if (!rule.clinicalMechanism) errors.push(`Regra "${rule.id}" sem explicação de mecanismo clínico.`);
    if (!rule.synonyms || rule.synonyms.length === 0) {
      warnings.push(`Regra "${rule.id}" não possui sinônimos adicionais cadastrados.`);
    }
  });

  // 2. Checar Falsos Amigos Seguros
  const safeTerms = new Set<string>();
  db.safeLookalikes.forEach((safe) => {
    if (safeTerms.has(safe.term)) {
      errors.push(`Falso amigo duplicado na whitelist: "${safe.term}".`);
    } else {
      safeTerms.add(safe.term);
    }
  });

  // 3. Regressões do comportamento atual; não demonstram validade clínica dos bloqueios.
  console.log('--- Verificando invariantes determinísticos do motor (não evidência clínica) ---');
  const sulfitoTest = analyzeIngredientsText('conservante metabissulfito de sódio (INS 223)');
  if (sulfitoTest.status !== 'RED_BLOCKED') {
    errors.push('FALHA DE INVARIANTE: Metabissulfito de sódio não foi bloqueado!');
  } else {
    console.log('  ✔ Bloqueio de Metabissulfito de Sódio (INS 223): OK');
  }

  const sulfito228Test = analyzeIngredientsText('conservante INS 228 e antioxidante');
  if (sulfito228Test.status !== 'RED_BLOCKED') {
    errors.push('FALHA DE INVARIANTE: Bissulfito de potássio (INS 228) não foi bloqueado!');
  } else {
    console.log('  ✔ Bloqueio de Bissulfito de Potássio (INS 228): OK');
  }

  const sulfatoTest = analyzeIngredientsText('sulfato ferroso (ferro) e sulfato de zinco (zinco)');
  if (sulfatoTest.status === 'RED_BLOCKED') {
    errors.push('FALHA DE INVARIANTE: Sulfato ferroso foi bloqueado indevidamente como sulfito!');
  } else {
    console.log('  ✔ Desambiguação Sulfato vs Sulfito: OK');
  }

  const carameloIvTest = analyzeIngredientsText('corante caramelo IV processo sulfito amonia');
  if (carameloIvTest.status !== 'RED_BLOCKED') {
    errors.push('FALHA DE INVARIANTE: Caramelo IV não foi bloqueado!');
  } else {
    console.log('  ✔ Bloqueio de Caramelo IV: OK');
  }

  const coranteArtificialTest = analyzeIngredientsText('farinha de trigo, colorido artificialmente e sal');
  if (coranteArtificialTest.status !== 'RED_BLOCKED') {
    errors.push('FALHA DE INVARIANTE: Colorido artificialmente não foi bloqueado no modo Brasil!');
  } else {
    console.log('  ✔ Bloqueio de Corante Artificial / Colorido Artificialmente: OK');
  }

  const coranteAmbiguoTest = analyzeIngredientsText('farinha, acucar, corante e sal', { isSearchQuery: true });
  if (coranteAmbiguoTest.status !== 'YELLOW_ATTENTION') {
    errors.push('FALHA DE INVARIANTE: Termo corante ambíguo isolado não gerou YELLOW_ATTENTION!');
  } else {
    console.log('  ✔ Alerta de Cautela em Corante Ambíguo Isolado: OK');
  }

  const coranteNaturalTest = analyzeIngredientsText(
    'INGREDIENTES: Farinha de trigo, oleo, corante natural urucum, corante caramelo I e sal. CONTEM GLUTEN.'
  );
  if (coranteNaturalTest.status !== 'GREEN_SAFE') {
    errors.push('FALHA DE INVARIANTE: Corante natural urucum ou caramelo I foi bloqueado indevidamente por regra genérica!');
  } else {
    console.log('  ✔ Supressão Contextual de Ambiguidade em Corante Natural Urucum e Caramelo I: OK');
  }

  const duplaOcorrenciaCoranteTest = analyzeIngredientsText(
    'INGREDIENTES: Farinha de trigo, corante natural de urucum, acucar e corante. CONTEM GLUTEN.'
  );
  if (duplaOcorrenciaCoranteTest.status !== 'YELLOW_ATTENTION') {
    errors.push('FALHA DE INVARIANTE: Segunda ocorrência genérica de corante no mesmo rótulo foi suprimida indevidamente!');
  } else {
    console.log('  ✔ Preservação de Alerta em 2ª Ocorrência Genérica de Corante no Mesmo Rótulo: OK');
  }

  const cloranfenicolTest = analyzeIngredientsText('Cloranfenicol suspensão 250mg', { isSearchQuery: true });
  if (cloranfenicolTest.status !== 'YELLOW_ATTENTION') {
    errors.push('FALHA DE INVARIANTE: Cloranfenicol não gerou YELLOW_ATTENTION!');
  } else {
    console.log('  ✔ Alerta de Cautela em Cloranfenicol: OK');
  }

  const dipironaTest = analyzeIngredientsText('Dipirona sódica gotas 500mg/ml');
  if (dipironaTest.status !== 'RED_BLOCKED') {
    errors.push('FALHA DE INVARIANTE: Dipirona não foi bloqueada no modo Brasil Pediátrico!');
  } else {
    console.log('  ✔ Bloqueio de Dipirona (SBP/APAE): OK');
  }

  const ibuprofenoTest = analyzeIngredientsText('Ibuprofeno suspensão oral 100mg/ml');
  if (ibuprofenoTest.pediatricSyrupAlerts.length === 0) {
    errors.push('FALHA DE INVARIANTE: Ibuprofeno líquido não disparou alerta de excipientes pediátricos!');
  } else {
    console.log('  ✔ Alerta de Excipientes Pediátricos em Ibuprofeno: OK');
  }

  // 4. Relatório Final
  console.log('\n====================================================');
  if (errors.length > 0) {
    console.error(`❌ AUDITORIA REPROVADA! ${errors.length} erro(s) crítico(s):`);
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  } else {
    console.log('AUDITORIA TÉCNICA APROVADA: schema/paridade/vínculos/invariantes sem erros.');
    console.log('   - 0 erros técnicos críticos; conteúdo das fontes não foi validado automaticamente.');
    if (pending.length > 0) {
      console.log(`   - BLOQUEIO CLÍNICO EXTERNO: ${pending.length} regras aguardam fonte específica/reconciliação e revisão profissional.`);
      console.log('   - A fase 1 NÃO está integralmente concluída; aprovação técnica não é validação clínica.');
    } else {
      console.log('   - Nenhuma pendência declarada; ainda assim este auditor não certifica aprovação clínica profissional.');
    }
    if (warnings.length > 0) {
      console.log(`   - ${warnings.length} aviso(s) leve(s):`);
      warnings.forEach(w => console.log(`     ↳ ${w}`));
    }
    console.log('====================================================\n');
  }
}

runAudit();
