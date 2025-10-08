'use client';

import { AnyQuestion } from '@/lib/types/interfaces/questions/any-question.type';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';

// Question type renderers
import { AlbumYearGuessRenderer } from './types/AlbumYearGuessRenderer';
import { GuessByLyricRenderer } from './types/GuessByLyricRenderer';
import { FillBlankRenderer } from './types/FillBlankRenderer';
import { OddOneOutRenderer } from './types/OddOneOutRenderer';
import { SongAlbumMatchRenderer } from './types/SongAlbumMatchRenderer';
import { TimelineOrderRenderer } from './types/TimelineOrderRenderer';
import { OutfitEraRenderer } from './types/OutfitEraRenderer';
import { AiVisualRenderer } from './types/AiVisualRenderer';
import { SoundAlikeSnippetRenderer } from './types/SoundAlikeSnippetRenderer';
import { MoodMatchRenderer } from './types/MoodMatchRenderer';
import { ReverseAudioRenderer } from './types/ReverseAudioRenderer';
import { TracklistOrderRenderer } from './types/TracklistOrderRenderer';
import { LifeTriviaRenderer } from './types/LifeTriviaRenderer';
import { PopularityMatchRenderer } from './types/PopularityMatchRenderer';
import { LongestSongRenderer } from './types/LongestSongRenderer';
import { InspirationMapRenderer } from './types/InspirationMapRenderer';
import { LyricMashupRenderer } from './types/LyricMashupRenderer';
import { OneSecondRenderer } from './types/OneSecondRenderer';
import { SpeedTapRenderer } from './types/SpeedTapRenderer';

interface QuestionRendererProps {
  question: AnyQuestion;
}

export function QuestionRenderer({ question }: QuestionRendererProps) {
  const renderQuestionByType = () => {
    switch (question.questionType) {
      case 'album-year-guess':
        return <AlbumYearGuessRenderer question={question} />;
      
      case 'guess-by-lyric':
        return <GuessByLyricRenderer question={question} />;
      
      case 'fill-blank':
        return <FillBlankRenderer question={question} />;
      
      case 'odd-one-out':
        return <OddOneOutRenderer question={question} />;
      
      case 'song-album-match':
        return <SongAlbumMatchRenderer question={question} />;
      
      case 'timeline-order':
        return <TimelineOrderRenderer question={question} />;
      
      case 'outfit-era':
        return <OutfitEraRenderer question={question} />;
      
      case 'ai-visual':
        return <AiVisualRenderer question={question} />;
      
      case 'sound-alike-snippet':
        return <SoundAlikeSnippetRenderer question={question} />;
      
      case 'mood-match':
        return <MoodMatchRenderer question={question} />;
      
      case 'reverse-audio':
        return <ReverseAudioRenderer question={question} />;
      
      case 'tracklist-order':
        return <TracklistOrderRenderer question={question} />;
      
      case 'life-trivia':
        return <LifeTriviaRenderer question={question} />;
      
      case 'popularity-match':
        return <PopularityMatchRenderer question={question} />;
      
      case 'longest-song':
        return <LongestSongRenderer question={question} />;
      
      case 'inspiration-map':
        return <InspirationMapRenderer question={question} />;
      
      case 'lyric-mashup':
        return <LyricMashupRenderer question={question} />;
      
      case 'one-second':
        return <OneSecondRenderer question={question} />;
      
      case 'speed-tap':
        return <SpeedTapRenderer question={question} />;
      
      default:
        return (
          <Card className="p-6">
            <Text className="text-red-600">
              Unsupported question type: {(question as any).questionType}
            </Text>
            <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(question, null, 2)}
            </pre>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderQuestionByType()}
    </div>
  );
}