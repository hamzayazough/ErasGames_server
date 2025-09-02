/** ===== Base & util types ===== */

export type QuestionType =
  | 'album_year_guess'
  | 'song_album_match'
  | 'fill_blank'
  | 'guess_by_lyric'
  | 'odd_one_out'
  | 'ai_visual'
  | 'sound_alike_snippet'
  | 'mood_match'
  | 'inspiration_map'
  | 'life_trivia'
  | 'timeline_order'
  | 'popularity_match'
  | 'longest_song'
  | 'tracklist_order'
  | 'outfit_era'
  | 'lyric_mashup'
  | 'speed_tap'
  | 'reverse_audio'
  | 'one_second';

/**
 * Tous les envois sont idempotents : côté serveur,
 * dédupliqués via (attemptId, questionId, idempotencyKey).
 */
export interface BasicResponseReq {
  attemptId: string;
  questionId: string;

  /** Horodatage client (epoch ms) — le serveur utilise sa propre horloge comme source de vérité */
  clientSentAt?: number;

  /** Temps passé sur la question (ms) côté client, purement indicatif pour l’UX/analytics */
  timeSpentMs?: number;

  /** Indique si un indice a été consommé avant cette réponse (le serveur pénalise au scoring) */
  usedHint?: boolean;

  /** Indique si c’est un retry autorisé par l’abonnement/entitlement */
  isRetry?: boolean;

  /**
   * Pour vérifier la permutation côté serveur (déterminisme de shuffle).
   * Ex: hash(optionOrder) ou seed client retour.
   */
  shuffleProof?: { seed?: string; optionOrderHash?: string };

  /** Idempotency key optionnelle pour replays réseau */
  idempotencyKey?: string;
}

/** ===== 1) Album Year Guess ===== */
export interface AlbumYearGuessResponseReq extends BasicResponseReq {
  questionType: 'album_year_guess';
  /** index de la réponse choisie dans choices */
  answer: { choiceIndex: number };
}

/** ===== 2) Song ↔ Album Match (mapping) ===== */
export interface SongAlbumMatchResponseReq extends BasicResponseReq {
  questionType: 'song_album_match';
  /** mapping "song title" -> "album title" tel que présenté au joueur */
  answer: Record<string, string>;
}

/** ===== 3) Fill in the Blank (with choices) ===== */
export interface FillBlankResponseReq extends BasicResponseReq {
  questionType: 'fill_blank';
  answer: { choiceIndex: number };
}

/** ===== 4) Guess the Song by the Lyric ===== */
export interface GuessByLyricResponseReq extends BasicResponseReq {
  questionType: 'guess_by_lyric';
  answer: { choiceIndex: number };
}

/** ===== 5) Odd One Out ===== */
export interface OddOneOutResponseReq extends BasicResponseReq {
  questionType: 'odd_one_out';
  answer: { choiceIndex: number };
}

/** ===== 6) AI-Generated Era Visuals ===== */
export interface AiVisualResponseReq extends BasicResponseReq {
  questionType: 'ai_visual';
  answer: { choiceIndex: number };
}

/** ===== 7) Sound-alike Snippet ===== */
export interface SoundAlikeSnippetResponseReq extends BasicResponseReq {
  questionType: 'sound_alike_snippet';
  answer: { choiceIndex: number };
}

/** ===== 8) Mood Matching ===== */
export interface MoodMatchResponseReq extends BasicResponseReq {
  questionType: 'mood_match';
  answer: { choiceIndex: number };
}

/** ===== 9) Relationship / Inspiration Mapping ===== */
export interface InspirationMapResponseReq extends BasicResponseReq {
  questionType: 'inspiration_map';
  answer: { choiceIndex: number };
}

/** ===== 10) Taylor life related questions ===== */
export interface LifeTriviaResponseReq extends BasicResponseReq {
  questionType: 'life_trivia';
  answer: { choiceIndex: number };
}

/** ===== 11) Timeline Ordering (ordering) =====
 * On envoie les items dans l’ordre choisi (exactement les libellés vus).
 */
export interface TimelineOrderResponseReq extends BasicResponseReq {
  questionType: 'timeline_order';
  answer: { orderedItems: string[] };
}

/** ===== 12) Popularity Match (ranking) =====
 * Classement final de l’utilisateur, du + au - (ou l’inverse selon l’énoncé).
 */
export interface PopularityMatchResponseReq extends BasicResponseReq {
  questionType: 'popularity_match';
  answer: { orderedChoices: string[] };
}

/** ===== 13) Longest Song ===== */
export interface LongestSongResponseReq extends BasicResponseReq {
  questionType: 'longest_song';
  answer: { choiceIndex: number };
}

/** ===== 14) Tracklist Order (within album) ===== */
export interface TracklistOrderResponseReq extends BasicResponseReq {
  questionType: 'tracklist_order';
  answer: { orderedTracks: string[] };
}

/** ===== 15) Guess the Era by Outfit ===== */
export interface OutfitEraResponseReq extends BasicResponseReq {
  questionType: 'outfit_era';
  answer: { choiceIndex: number };
}

/** ===== 16) Lyric Mashups (mapping snippet -> song) ===== */
export interface LyricMashupResponseReq extends BasicResponseReq {
  questionType: 'lyric_mashup';
  answer: Record<string, string>;
}

/** ===== 17) Speed Tap (événements temps réel) =====
 * On envoie un log d’actions pour scoring serveur: taps corrects/incorrects, timestamps.
 * Le serveur peut ignorer/compresser côté worker (ex: compacter en compte final).
 */
export interface SpeedTapResponseReq extends BasicResponseReq {
  questionType: 'speed_tap';
  answer: {
    roundSeconds: number; // ex: 10
    events: Array<{
      ts: number; // epoch ms (client) — le serveur peut recaler
      option: string; // libellé affiché
      action: 'tap' | 'undo'; // si tu supportes l’undo
    }>;
    /** Optionnel: résumé client (le serveur recalcule de toute façon) */
    clientSummary?: {
      taps: number;
      correct: number;
      wrong: number;
    };
  };
}

/** ===== 18) Reverse Audio ===== */
export interface ReverseAudioResponseReq extends BasicResponseReq {
  questionType: 'reverse_audio';
  answer: { choiceIndex: number };
}

/** ===== 19) One Second Challenge ===== */
export interface OneSecondResponseReq extends BasicResponseReq {
  questionType: 'one_second';
  answer: { choiceIndex: number };
}

/** ===== Union sur toutes les réponses ===== */
export type AnyResponseReq =
  | AlbumYearGuessResponseReq
  | SongAlbumMatchResponseReq
  | FillBlankResponseReq
  | GuessByLyricResponseReq
  | OddOneOutResponseReq
  | AiVisualResponseReq
  | SoundAlikeSnippetResponseReq
  | MoodMatchResponseReq
  | InspirationMapResponseReq
  | LifeTriviaResponseReq
  | TimelineOrderResponseReq
  | PopularityMatchResponseReq
  | LongestSongResponseReq
  | TracklistOrderResponseReq
  | OutfitEraResponseReq
  | LyricMashupResponseReq
  | SpeedTapResponseReq
  | ReverseAudioResponseReq
  | OneSecondResponseReq;
