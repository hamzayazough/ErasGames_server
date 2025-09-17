import {DailyQuizMode} from '../enums/daily-quiz-mode.enum';

/**
 * Interface representing a daily quiz event, including drop time,
 * mode, theme plan, and CDN template info.
 */
export interface DailyQuiz {
  id: string;
  dropAtUTC: Date;
  mode: DailyQuizMode;
  themePlanJSON: Record<string, any>;
  templateVersion: number;
  templateCdnUrl: string;
  createdAt: Date;
}
