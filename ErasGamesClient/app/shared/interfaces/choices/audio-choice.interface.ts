/**
 * Audio choice for questions where the option is an audio clip.
 */
export interface AudioChoice {
  type: 'audio';
  url: string;
  label?: string;
}
