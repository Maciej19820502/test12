export type SectionType = 'voice' | 'text' | 'video';

export interface PromptDTO {
  content: string;
  voiceModel?: string;
  textModel?: string;
}

export interface SectionDTO {
  id: number;
  title: string;
  order: number;
  type: SectionType;
  videoUrl?: string | null;
  prompt?: PromptDTO | null;
}

export interface TrainingDTO {
  id: number;
  title: string;
  description?: string | null;
  sections: SectionDTO[];
}
