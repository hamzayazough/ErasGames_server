import { BasicQuestion } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { StringChoice } from '../choices/string-choice.type';

export interface LifeTriviaQuestion extends BasicQuestion {
  questionType: 'life_trivia';
  prompt: {
    task: string;
    question: string;
  };
  choices: StringChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Life Trivia: Player answers a trivia question about Taylor Swift's life or career.
 */
