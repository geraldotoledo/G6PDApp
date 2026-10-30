import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isValidRulesDatabase } from '../src/services/rulesSync.ts';

const sourcePath = resolve(process.cwd(), 'src/data/rules.json');
const targetPath = resolve(process.cwd(), 'public/g6pd_rules.json');
const content = readFileSync(sourcePath, 'utf-8');
if (!isValidRulesDatabase(JSON.parse(content))) {
  throw new Error('Base autoritativa inválida: a cópia pública não foi gerada.');
}
writeFileSync(targetPath, content, 'utf-8');
console.log('Base pública gerada a partir de src/data/rules.json. Isso não representa validação clínica.');
