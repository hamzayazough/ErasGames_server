// Simplified interfaces for form components
// These will be transformed to match the actual complex interfaces when submitting

export interface BaseQuestionForm {
  type: string;
  difficulty: "easy" | "medium" | "hard";
  era?: string;
  question: string;
}

export interface AiVisualQuestionForm extends BaseQuestionForm {
  type: "ai-visual";
  imageUrl: string;
  imageFilename: string;
  aiPrompt: string;
  correctAnswerIndex: number;
  options: string[];
}

export interface SoundAlikeSnippetQuestionForm extends BaseQuestionForm {
  type: "sound-alike-snippet";
  audioUrl: string;
  audioFilename: string;
  correctWord: string;
  soundAlikeOptions: Array<{
    word: string;
    soundAlike: string;
  }>;
}

export interface OutfitEraQuestionForm extends BaseQuestionForm {
  type: "outfit-era";
  outfitImageUrl: string;
  imageFilename: string;
  correctEra: string;
  eraOptions: string[];
  historicalContexts: Array<{
    era: string;
    description: string;
    keyFeatures: string[];
  }>;
}

export interface ReverseAudioQuestionForm extends BaseQuestionForm {
  type: "reverse-audio";
  reverseAudioUrl: string;
  audioFilename: string;
  originalWord: string;
  options: string[];
  wordClues: Array<{
    position: number;
    hint: string;
    category: string;
  }>;
  reverseSpeed: number;
  audioQuality: "low" | "standard" | "high";
}

export interface OneSecondQuestionForm extends BaseQuestionForm {
  type: "one-second";
  audioSnippetUrl: string;
  audioFilename: string;
  sourceTitle: string;
  sourceType: "music" | "movie" | "tv_show" | "speech" | "nature" | "other";
  options: string[];
  timestamp?: string;
  contextClues: Array<{
    type: "temporal" | "genre" | "artist" | "contextual";
    clue: string;
    relevance: "high" | "medium" | "low";
  }>;
  snippetDuration: number;
  audioQuality: "low" | "standard" | "high";
  volumeLevel: "low" | "normal" | "high";
}
