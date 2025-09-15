import { BasicQuestion } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { StringChoice } from '../choices/string-choice.type';
import { LifeTriviaPrompt } from '../prompts/prompt-interfaces';

export interface LifeTriviaQuestion extends BasicQuestion {
  questionType: 'life-trivia';
  prompt: LifeTriviaPrompt;
  choices: StringChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Life Trivia: Player answers a trivia question about Taylor Swift's life or career.
 */
