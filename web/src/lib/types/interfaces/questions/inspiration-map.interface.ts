import { BasicQuestion } from "./basic-question.interface";
import { InspirationMapPrompt } from "../prompts/prompt-interfaces";

export interface InspirationMapQuestion extends BasicQuestion {
  questionType: "inspiration-map";
  prompt: InspirationMapPrompt;
  choices: string[];
  correct: number;
}
/**
 * Inspiration Mapping: Player selects the correct inspiration or relationship mapping for a song or event.
 */
