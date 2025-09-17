/**
 * MediaRef represents a media asset (image or audio) associated with a question.
 */
export interface MediaRef {
  type: 'image' | 'audio';
  url: string;
}
