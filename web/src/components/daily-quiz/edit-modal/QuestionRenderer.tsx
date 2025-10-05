'use client';

import React from 'react';
import type { QuizQuestion } from '@/lib/types/api.types';

// Question renderer imports
import { AlbumYearGuessRenderer } from '@/components/questions/types/AlbumYearGuessRenderer';
import { SongAlbumMatchRenderer } from '@/components/questions/types/SongAlbumMatchRenderer';
import { FillBlankRenderer } from '@/components/questions/types/FillBlankRenderer';
import { GuessByLyricRenderer } from '@/components/questions/types/GuessByLyricRenderer';
import { OddOneOutRenderer } from '@/components/questions/types/OddOneOutRenderer';
import { AiVisualRenderer } from '@/components/questions/types/AiVisualRenderer';
import { SoundAlikeSnippetRenderer } from '@/components/questions/types/SoundAlikeSnippetRenderer';
import { MoodMatchRenderer } from '@/components/questions/types/MoodMatchRenderer';
import { InspirationMapRenderer } from '@/components/questions/types/InspirationMapRenderer';
import { LifeTriviaRenderer } from '@/components/questions/types/LifeTriviaRenderer';
import { TimelineOrderRenderer } from '@/components/questions/types/TimelineOrderRenderer';
import { PopularityMatchRenderer } from '@/components/questions/types/PopularityMatchRenderer';
import { LongestSongRenderer } from '@/components/questions/types/LongestSongRenderer';
import { TracklistOrderRenderer } from '@/components/questions/types/TracklistOrderRenderer';
import { OutfitEraRenderer } from '@/components/questions/types/OutfitEraRenderer';
import { LyricMashupRenderer } from '@/components/questions/types/LyricMashupRenderer';
import { SpeedTapRenderer } from '@/components/questions/types/SpeedTapRenderer';
import { ReverseAudioRenderer } from '@/components/questions/types/ReverseAudioRenderer';
import { OneSecondRenderer } from '@/components/questions/types/OneSecondRenderer';

interface QuestionRendererProps {
  question: QuizQuestion;
}

export default function QuestionRenderer({ question }: QuestionRendererProps) {
  if (!question.questionType) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-yellow-800 font-medium">Unsupported Question Type: Unknown</h4>
        <p className="text-yellow-700 text-sm mt-1">Task: {question.prompt?.task || 'No task available'}</p>
        <pre className="mt-2 text-xs text-yellow-600 bg-yellow-100 p-2 rounded overflow-auto">
          {JSON.stringify(question, null, 2)}
        </pre>
      </div>
    );
  }

  // Transform question data to match renderer expectations
  const questionProps = {
    ...question,
    prompt: question.prompt,
    themes: question.themes || [],
    choices: question.choices || question.choicesJSON || [],
    correct: question.correct || question.correctJSON,
    mediaRefs: question.mediaRefs || question.mediaJSON || []
  };

  const normalizedType = question.questionType.replace(/_/g, '-');

  try {
    switch (normalizedType) {
      case 'album-year-guess':
        return <AlbumYearGuessRenderer question={questionProps as any} showAnswer={true} />;
      case 'song-album-match':
        return <SongAlbumMatchRenderer question={questionProps as any} showAnswer={true} />;
      case 'fill-blank':
        return <FillBlankRenderer question={questionProps as any} showAnswer={true} />;
      case 'guess-by-lyric':
        return <GuessByLyricRenderer question={questionProps as any} showAnswer={true} />;
      case 'odd-one-out':
        return <OddOneOutRenderer question={questionProps as any} showAnswer={true} />;
      case 'ai-visual':
        return <AiVisualRenderer question={questionProps as any} showAnswer={true} />;
      case 'sound-alike-snippet':
        return <SoundAlikeSnippetRenderer question={questionProps as any} showAnswer={true} />;
      case 'mood-match':
        return <MoodMatchRenderer question={questionProps as any} showAnswer={true} />;
      case 'inspiration-map':
        return <InspirationMapRenderer question={questionProps as any} showAnswer={true} />;
      case 'life-trivia':
        return <LifeTriviaRenderer question={questionProps as any} showAnswer={true} />;
      case 'timeline-order':
        return <TimelineOrderRenderer question={questionProps as any} showAnswer={true} />;
      case 'popularity-match':
        return <PopularityMatchRenderer question={questionProps as any} showAnswer={true} />;
      case 'longest-song':
        return <LongestSongRenderer question={questionProps as any} showAnswer={true} />;
      case 'tracklist-order':
        return <TracklistOrderRenderer question={questionProps as any} showAnswer={true} />;
      case 'outfit-era':
        return <OutfitEraRenderer question={questionProps as any} showAnswer={true} />;
      case 'lyric-mashup':
        return <LyricMashupRenderer question={questionProps as any} showAnswer={true} />;
      case 'speed-tap':
        return <SpeedTapRenderer question={questionProps as any} showAnswer={true} />;
      case 'reverse-audio':
        return <ReverseAudioRenderer question={questionProps as any} showAnswer={true} />;
      case 'one-second':
        return <OneSecondRenderer question={questionProps as any} showAnswer={true} />;
      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-yellow-800 font-medium">
              Unsupported Question Type: {question.questionType} (normalized: {normalizedType})
            </h4>
            <p className="text-yellow-700 text-sm mt-1">Task: {question.prompt?.task || 'No task available'}</p>
            <pre className="mt-2 text-xs text-yellow-600 bg-yellow-100 p-2 rounded overflow-auto">
              {JSON.stringify(question, null, 2)}
            </pre>
          </div>
        );
    }
  } catch (error) {
    console.error('Error rendering question:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="text-red-800 font-medium">Error Rendering Question</h4>
        <p className="text-red-700 text-sm mt-1">Type: {question.questionType}</p>
        <p className="text-red-700 text-sm">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}