export type Difficulty = "easy" | "medium" | "hard";

export type MediaRef = {
  type: "image" | "audio";
  url: string;
};

export type QuestionType =
  | "album_year_guess"
  | "song_album_match"
  | "fill_blank"
  | "guess_by_lyric"
  | "odd_one_out"
  | "ai_visual"
  | "sound_alike_snippet"
  | "mood_match"
  | "inspiration_map"
  | "life_trivia"
  | "timeline_order"
  | "popularity_match"
  | "longest_song"
  | "tracklist_order"
  | "outfit_era"
  | "lyric_mashup"
  | "speed_tap"
  | "reverse_audio"
  | "one_second";

  //🧩 Base Interface
  export interface BasicQuestion {
  id: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  themes: string[];   // e.g. ["lyrics", "charts"]
  subjects: string[]; // normalized refs like "song:Cardigan"
  prompt: any;        // specialized per type
  choices?: string[]; // multiple-choice (if applicable)
  correct: any;       // flexible: string | number | string[] | object
  mediaRefs?: MediaRef[];
  scoringHints?: Record<string, any>;
}

//1) Album Year Guess
export interface AlbumYearGuessQuestion extends BasicQuestion {
  questionType: "album_year_guess";
  prompt: {
    task: string;
    album: string;
  };
  choices: string[];
  correct: number; // index in choices
}

// 2) Song ↔ Album Match
export interface SongAlbumMatchQuestion extends BasicQuestion {
  questionType: "song_album_match";
  prompt: {
    task: string;
    left: string[];  // songs
    right: string[]; // albums
  };
  correct: Record<string, string>; // mapping: song → album
}

//Album year guess
export interface AlbumYearGuessQuestion extends BasicQuestion {
  questionType: "album_year_guess";
  prompt: {
    task: string;
    album: string;
  };
  choices: string[];
  correct: number; // index in choices
}


// Song <--> Album Match
export interface SongAlbumMatchQuestion extends BasicQuestion {
  questionType: "song_album_match";
  prompt: {
    task: string;
    left: string[];  // songs
    right: string[]; // albums
  };
  correct: Record<string, string>; // mapping: song → album
}


// Fill in the blank
export interface FillBlankQuestion extends BasicQuestion {
  questionType: "fill_blank";
  prompt: {
    task: string;
    text: string; // with blank
  };
  choices: string[];
  correct: number;
}


//4) Guess by Lyric
export interface GuessByLyricQuestion extends BasicQuestion {
  questionType: "guess_by_lyric";
  prompt: {
    task: string;
    lyric: string;
  };
  choices: string[];
  correct: number;
}

5) Odd One Out
export interface OddOneOutQuestion extends BasicQuestion {
  questionType: "odd_one_out";
  prompt: {
    task: string;
    setRule: string;
  };
  choices: string[];
  correct: number;
}

6) AI-Generated Era Visual
export interface AiVisualQuestion extends BasicQuestion {
  questionType: "ai_visual";
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}

7) Sound-alike Snippet
export interface SoundAlikeSnippetQuestion extends BasicQuestion {
  questionType: "sound_alike_snippet";
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}

8) Mood Matching
export interface MoodMatchQuestion extends BasicQuestion {
  questionType: "mood_match";
  prompt: {
    task: string;
    moodTags: string[];
    note?: string;
  };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}

9) Inspiration Mapping
export interface InspirationMapQuestion extends BasicQuestion {
  questionType: "inspiration_map";
  prompt: {
    task: string;
    disclaimer?: string;
  };
  choices: string[];
  correct: number;
}

10) Life Trivia
export interface LifeTriviaQuestion extends BasicQuestion {
  questionType: "life_trivia";
  prompt: {
    task: string;
    question: string;
  };
  choices: string[];
  correct: number;
}

11) Timeline Ordering
export interface TimelineOrderQuestion extends BasicQuestion {
  questionType: "timeline_order";
  prompt: {
    task: string;
    items: string[];
  };
  correct: string[]; // correct chronological order
}

12) Popularity Match
export interface PopularityMatchQuestion extends BasicQuestion {
  questionType: "popularity_match";
  prompt: {
    task: string;
    asOf: string;
  };
  choices: string[];
  correct: string[];
}

13) Longest Song
export interface LongestSongQuestion extends BasicQuestion {
  questionType: "longest_song";
  prompt: { task: string };
  choices: string[];
  correct: number;
}

14) Tracklist Order
export interface TracklistOrderQuestion extends BasicQuestion {
  questionType: "tracklist_order";
  prompt: {
    task: string;
    album: string;
    tracks: string[];
  };
  correct: string[];
}

15) Outfit Era
export interface OutfitEraQuestion extends BasicQuestion {
  questionType: "outfit_era";
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}

16) Lyric Mashup
export interface LyricMashupQuestion extends BasicQuestion {
  questionType: "lyric_mashup";
  prompt: {
    task: string;
    snippets: string[];
    optionsPerSnippet: string[];
  };
  correct: Record<string, string>; // snippet → song
}

17) Speed Tap
export interface SpeedTapQuestion extends BasicQuestion {
  questionType: "speed_tap";
  prompt: {
    task: string;
    targetRule: string;
    roundSeconds: number;
    grid: string[];
  };
  correct: { targets: string[] };
  scoringHints?: { perCorrect: number; perWrong: number };
}

18) Reverse Audio
export interface ReverseAudioQuestion extends BasicQuestion {
  questionType: "reverse_audio";
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}

19) One Second Challenge
export interface OneSecondQuestion extends BasicQuestion {
  questionType: "one_second";
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}

🎯 Usage

You can make a union type to accept all:

export type AnyQuestion =
  | AlbumYearGuessQuestion
  | SongAlbumMatchQuestion
  | FillBlankQuestion
  | GuessByLyricQuestion
  | OddOneOutQuestion
  | AiVisualQuestion
  | SoundAlikeSnippetQuestion
  | MoodMatchQuestion
  | InspirationMapQuestion
  | LifeTriviaQuestion
  | TimelineOrderQuestion
  | PopularityMatchQuestion
  | LongestSongQuestion
  | TracklistOrderQuestion
  | OutfitEraQuestion
  | LyricMashupQuestion
  | SpeedTapQuestion
  | ReverseAudioQuestion
  | OneSecondQuestion;