import {LeaderboardScope} from '../enums/leaderboard-scope.enum';
import type {LbTopJSON} from './leaderboard/top-player.interface';

/**
 * Interface representing periodic leaderboard snapshots for global,
 * daily, season, theme, and regional leaderboards.
 */
export interface LeaderboardSnapshot {
  id: string;
  scope: LeaderboardScope;
  key: string;
  date: string;
  periodStart: string | null;
  periodEnd: string | null;
  topJSON: LbTopJSON;
  createdAt: Date;
}
