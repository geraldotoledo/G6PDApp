import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { G6PDRulesDatabase } from '../src/engine/types.ts';
import { analyzeIngredientsText } from '../src/engine/ruleEngine.ts';

function runAudit() {
  console.log('====================================================');
  console.log('🔍 AUDITORIA TRIMESTRAL DE REGRAS E SEGURANÇA G6PD');
  console.log('====================================================\n');

  const jsonPath = resolve(process.cwd(), 'public/g6pd_rules.json');
  console.log(`Lendo arquivo: ${jsonPath}`);
  const raw = readFileSync(jsonPath, 'utf-8');
  const db: G6PDRulesDatabase = JSON.parse(raw);

  console.log(`Versão da Base: ${db.rulesVersion}`);
  console.log(`Última Atualização: ${db.updatedAt}`);
  console.log(`Fontes Oficiais: ${db.sources.length}`);
  console.log(`Total de Regras: ${db.rules.length}`);
  console.log(`Total de Falsos Amigos Seguros (Whitelist): ${db.safeLookalikes.length}\n`);

  const errors: string[] = [];
  const warnings: string[] = [];

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

  // 3. Teste de Fogo com Rótulos de Calibração
  console.log('--- Testando Calibração Clínica do Motor ---');
  const sulfitoTest = analyzeIngredientsText('conservante metabissulfito de sódio (INS 223)');
  if (sulfitoTest.status !== 'RED_BLOCKED') {
    errors.push('FALHA DE CALIBRAÇÃO: Metabissulfito de sódio não foi bloqueado!');
  } else {
    console.log('  ✔ Bloqueio de Metabissulfito de Sódio: OK');
  }

  const sulfatoTest = analyzeIngredientsText('sulfato ferroso (ferro) e sulfato de zinco (zinco)');
  if (sulfatoTest.status === 'RED_BLOCKED') {
    errors.push('FALHA DE CALIBRAÇÃO: Sulfato ferroso foi bloqueado indevidamente como sulfito!');
  } else {
    console.log('  ✔ Desambiguação Sulfato vs Sulfito: OK');
  }

  const carameloIvTest = analyzeIngredientsText('corante caramelo IV processo sulfito amonia');
  if (carameloIvTest.status !== 'RED_BLOCKED') {
    errors.push('FALHA DE CALIBRAÇÃO: Caramelo IV não foi bloqueado!');
  } else {
    console.log('  ✔ Bloqueio de Caramelo IV: OK');
  }

  const dipironaTest = analyzeIngredientsText('Dipirona sódica gotas 500mg/ml');
  if (dipironaTest.status !== 'RED_BLOCKED') {
    errors.push('FALHA DE CALIBRAÇÃO: Dipirona não foi bloqueada no modo Brasil Pediátrico!');
  } else {
    console.log('  ✔ Bloqueio de Dipirona (SBP/APAE): OK');
  }

  const ibuprofenoTest = analyzeIngredientsText('Ibuprofeno suspensão oral 100mg/ml');
  if (ibuprofenoTest.pediatricSyrupAlerts.length === 0) {
    errors.push('FALHA DE CALIBRAÇÃO: Ibuprofeno líquido não disparou alerta de excipientes pediátricos!');
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
    console.log(`✅ AUDITORIA APROVADA COM SUCESSO!`);
    console.log(`   - 0 erros críticos`);
    if (warnings.length > 0) {
      console.log(`   - ${warnings.length} aviso(s) leve(s):`);
      warnings.forEach(w => console.log(`     ↳ ${w}`));
    }
    console.log('====================================================\n');
  }
}

runAudit();
