/**
 * Union type for all possible correct answer types for questions.
 */
import { SingleChoiceCorrect } from './single-choice-correct.interface';
import { StringArrayCorrect } from './string-array-correct.interface';
import { StringMapCorrect } from './string-map-correct.interface';
import { SpeedTapCorrect } from './speed-tap-correct.interface';
import { LyricMashupCorrect } from './lyric-mashup-correct.interface';
import { NumberCorrect } from './number-correct.type';

export type Correct =
  | SingleChoiceCorrect
  | StringArrayCorrect
  | StringMapCorrect
  | SpeedTapCorrect
  | LyricMashupCorrect
  | NumberCorrect;
