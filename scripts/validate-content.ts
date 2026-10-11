import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LevelSchema } from '../src/content/schema';

const dir = new URL('../src/content/levels/', import.meta.url);
let failed = 0;

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const raw = JSON.parse(readFileSync(join(dir.pathname, file), 'utf-8'));
  const result = LevelSchema.safeParse(raw);
  if (result.success) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file}`, result.error.issues);
    failed++;
  }
}

if (failed > 0) {
  console.error(`${failed} 个关卡文件校验失败`);
  process.exit(1);
}
console.log('全部关卡数据校验通过');