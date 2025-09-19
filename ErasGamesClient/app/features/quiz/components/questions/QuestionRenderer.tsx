import React from 'react';
import { AnyQuestion } from '../../../../shared/interfaces/questions/any-question.type';
import { AlbumYearGuessComponent } from './types/AlbumYearGuessComponent';
import { SongAlbumMatchComponent } from './types/SongAlbumMatchComponent';
import { FillBlankComponent } from './types/FillBlankComponent';
import { GuessByLyricComponent } from './types/GuessByLyricComponent';
import { OddOneOutComponent } from './types/OddOneOutComponent';
import { LifeTriviaComponent } from './types/LifeTriviaComponent';
import { TimelineOrderComponent } from './types/TimelineOrderComponent';
import { LongestSongComponent } from './types/LongestSongComponent';
import { AiVisualComponent } from './types/AiVisualComponent';
import { SoundAlikeSnippetComponent } from './types/SoundAlikeSnippetComponent';
import { MoodMatchComponent } from './types/MoodMatchComponent';
import { InspirationMapComponent } from './types/InspirationMapComponent';
import { PopularityMatchComponent } from './types/PopularityMatchComponent';
import { TracklistOrderComponent } from './types/TracklistOrderComponent';
import { OutfitEraComponent } from './types/OutfitEraComponent';
import { LyricMashupComponent } from './types/LyricMashupComponent';
import { SpeedTapComponent } from './types/SpeedTapComponent';
import { ReverseAudioComponent } from './types/ReverseAudioComponent';
import { OneSecondComponent } from './types/OneSecondComponent';

export interface QuestionComponentProps {
  question: AnyQuestion;
  selectedAnswer: any;
  onAnswerChange: (answer: any) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  correctAnswer?: any;
  showHint?: boolean;
  seed?: string;
  onAutoSubmit?: () => void; // New prop for auto-submission (e.g., when timer ends)
}

interface QuestionRendererProps extends QuestionComponentProps {}

export const QuestionRenderer: React.FC<QuestionRendererProps> = (props) => {
  const { question } = props;

  switch (question.questionType) {
    case 'album-year-guess':
      return <AlbumYearGuessComponent {...props} question={question} />;
    case 'song-album-match':
      return <SongAlbumMatchComponent {...props} question={question} />;
    case 'fill-blank':
      return <FillBlankComponent {...props} question={question} />;
    case 'guess-by-lyric':
      return <GuessByLyricComponent {...props} question={question} />;
    case 'odd-one-out':
      return <OddOneOutComponent {...props} question={question} />;
    case 'ai-visual':
      return <AiVisualComponent {...props} question={question} />;
    case 'sound-alike-snippet':
      return <SoundAlikeSnippetComponent {...props} question={question} />;
    case 'mood-match':
      return <MoodMatchComponent {...props} question={question} />;
    case 'inspiration-map':
      return <InspirationMapComponent {...props} question={question} />;
    case 'life-trivia':
      return <LifeTriviaComponent {...props} question={question} />;
    case 'timeline-order':
      return <TimelineOrderComponent {...props} question={question} />;
    case 'popularity-match':
      return <PopularityMatchComponent {...props} question={question} />;
    case 'longest-song':
      return <LongestSongComponent {...props} question={question} />;
    case 'tracklist-order':
      return <TracklistOrderComponent {...props} question={question} />;
    case 'outfit-era':
      return <OutfitEraComponent {...props} question={question} />;
    case 'lyric-mashup':
      return <LyricMashupComponent {...props} question={question} />;
    case 'speed-tap':
      return <SpeedTapComponent {...props} question={question} />;
    case 'reverse-audio':
      return <ReverseAudioComponent {...props} question={question} />;
    case 'one-second':
      return <OneSecondComponent {...props} question={question} />;
    default:
      console.warn(`Unsupported question type: ${(question as any).questionType}`);
      return null;
  }
};