import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LevelSchema, PoemSchema } from '../src/content/schema';

const root = fileURLToPath(new URL('../src/content/', import.meta.url));
let failed = 0;

const levelsDir = join(root, 'levels');
for (const file of readdirSync(levelsDir).filter((f) => f.endsWith('.json'))) {
  try {
    const raw = JSON.parse(readFileSync(join(levelsDir, file), 'utf-8'));
    const result = LevelSchema.safeParse(raw);
    if (result.success) {
      console.log(`✅ levels/${file}`);
    } else {
      console.error(`❌ levels/${file}`, result.error.issues);
      failed++;
    }
  } catch (e) {
    console.error(`❌ levels/${file} 无法解析 JSON:`, e instanceof Error ? e.message : e);
    failed++;
  }
}

const poemsDir = join(root, 'poems');
if (existsSync(poemsDir)) {
  for (const file of readdirSync(poemsDir).filter((f) => f.endsWith('.json'))) {
    try {
      const raw = JSON.parse(readFileSync(join(poemsDir, file), 'utf-8'));
      const result = PoemSchema.safeParse(raw);
      if (result.success) {
        console.log(`✅ poems/${file}`);
      } else {
        console.error(`❌ poems/${file}`, result.error.issues);
        failed++;
      }
    } catch (e) {
      console.error(`❌ poems/${file} 无法解析 JSON:`, e instanceof Error ? e.message : e);
      failed++;
    }
  }
}

if (failed > 0) {
  console.error(`${failed} 个内容文件校验失败`);
  process.exit(1);
}
console.log('全部内容数据校验通过');
