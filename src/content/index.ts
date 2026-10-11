import { LevelSchema, type LevelData, PoemSchema, type Poem } from './schema';

const modules = import.meta.glob('./levels/*.json', { eager: true, import: 'default' });

export const levels: LevelData[] = (Object.values(modules) as unknown[])
  .map((raw) => {
    const result = LevelSchema.safeParse(raw);
    return result.success ? result.data : null;
  })
  .filter((l): l is LevelData => l !== null);

export function getChapterLevels(chapterId: string): LevelData[] {
  return levels.filter((l) => l.chapter === chapterId).sort((a, b) => a.order - b.order);
}

export function getLevel(id: string): LevelData | undefined {
  return levels.find((l) => l.id === id);
}

const poemModules = import.meta.glob('./poems/*.json', { eager: true, import: 'default' });

export const poems: Poem[] = (Object.values(poemModules) as unknown[])
  .map((raw) => {
    const result = PoemSchema.safeParse(raw);
    return result.success ? result.data : null;
  })
  .filter((p): p is Poem => p !== null);

export function getPoems(): Poem[] {
  return poems;
}

export function getPoem(id: string): Poem | undefined {
  return poems.find((p) => p.id === id);
}