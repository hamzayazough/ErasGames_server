import React from 'react';
import { MoodMatchQuestion } from '../../../../../shared/interfaces/questions/mood-match.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { MatchingComponent } from '../common/MatchingComponent';

interface MoodMatchComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: MoodMatchQuestion;
}

export const MoodMatchComponent: React.FC<MoodMatchComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const leftItems = question.lyrics?.map((lyric, index) => ({
    id: index.toString(),
    content: lyric,
    subtitle: `Lyric Excerpt ${index + 1}`
  })) || [];

  const rightItems = question.moods?.map((mood, index) => ({
    id: index.toString(),
    content: mood,
    subtitle: undefined
  })) || [];

  const handleMatchingChange = (pairs: Array<{ leftId: string; rightId: string }>) => {
    const matches = pairs.map(pair => ({
      lyricIndex: parseInt(pair.leftId),
      moodIndex: parseInt(pair.rightId)
    }));
    onAnswerChange({ matches });
  };

  const currentMatches = selectedAnswer?.matches?.map(match => ({
    leftId: match.lyricIndex.toString(),
    rightId: match.moodIndex.toString()
  })) || [];

  const correctMatches = correctAnswer?.matches?.map(match => ({
    leftId: match.lyricIndex.toString(),
    rightId: match.moodIndex.toString()
  })) || [];

  return (
    <MatchingComponent
      title={question.prompt.task}
      leftTitle="🎵 Lyrics"
      rightTitle="💭 Moods"
      leftItems={leftItems}
      rightItems={rightItems}
      selectedMatches={currentMatches}
      onMatchingChange={handleMatchingChange}
      disabled={disabled}
      showCorrect={showCorrect}
      correctMatches={correctMatches}
      showHint={showHint}
    />
  );
};