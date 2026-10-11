export function toChars(line: string): string[] {
  return Array.from(line.replace(/[\s，。、；：！？「」『』（）“”‘’]/g, ''));
}
