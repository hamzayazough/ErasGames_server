import { BasicQuestion } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';

export interface GuessByLyricQuestion extends BasicQuestion {
  questionType: 'guess_by_lyric';
  prompt: {
    task: string;
    lyric: string;
  };
  choices: string[];
  correct: SingleChoiceCorrect;
}
/**
 * Guess by Lyric: Player is shown a lyric and must pick the correct song from multiple choices.
 */
