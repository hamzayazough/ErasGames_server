/**
 * Union type for all possible choice types in the system.
 */
import { StringChoice } from './string-choice.type';
import { ImageChoice } from './image-choice.interface';
import { AudioChoice } from './audio-choice.interface';

export type Choice = StringChoice | ImageChoice | AudioChoice;
