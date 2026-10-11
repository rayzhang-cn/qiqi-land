export type AgeBand = '3-4' | '5-6';
export type Domain = 'language' | 'math' | 'science' | 'art';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  ageBand: AgeBand;
}