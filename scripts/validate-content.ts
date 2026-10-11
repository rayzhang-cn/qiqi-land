import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LevelSchema } from '../src/content/schema';

const dir = fileURLToPath(new URL('../src/content/levels/', import.meta.url));
let failed = 0;

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  try {
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
    const result = LevelSchema.safeParse(raw);
    if (result.success) {
      console.log(`✅ ${file}`);
    } else {
      console.error(`❌ ${file}`, result.error.issues);
      failed++;
    }
  } catch (e) {
    console.error(`❌ ${file} 无法解析 JSON:`, e instanceof Error ? e.message : e);
    failed++;
  }
}

if (failed > 0) {
  console.error(`${failed} 个关卡文件校验失败`);
  process.exit(1);
}
console.log('全部关卡数据校验通过');