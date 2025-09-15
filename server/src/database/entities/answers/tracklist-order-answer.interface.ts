import { BasicAnswer } from './basic-answer.interface';

export interface TracklistOrderAnswer extends BasicAnswer {
  questionType: 'tracklist_order';
  answer: { orderedTracks: string[] };
}
