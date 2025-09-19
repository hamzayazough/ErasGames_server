import React from 'react';
import { InspirationMapQuestion } from '../../../../../shared/interfaces/questions/inspiration-map.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { MatchingComponent } from '../common/MatchingComponent';

interface InspirationMapComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: InspirationMapQuestion;
}

export const InspirationMapComponent: React.FC<InspirationMapComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const leftItems = question.songs?.map((song, index) => ({
    id: index.toString(),
    content: song,
    subtitle: 'Taylor Swift Song'
  })) || [];

  const rightItems = question.sources?.map((source, index) => ({
    id: index.toString(),
    content: source,
    subtitle: 'Inspiration Source'
  })) || [];

  const handleMatchingChange = (pairs: Array<{ leftId: string; rightId: string }>) => {
    const connections = pairs.map(pair => ({
      songIndex: parseInt(pair.leftId),
      sourceIndex: parseInt(pair.rightId)
    }));
    onAnswerChange({ connections });
  };

  const currentMatches = selectedAnswer?.connections?.map(connection => ({
    leftId: connection.songIndex.toString(),
    rightId: connection.sourceIndex.toString()
  })) || [];

  const correctMatches = correctAnswer?.connections?.map(connection => ({
    leftId: connection.songIndex.toString(),
    rightId: connection.sourceIndex.toString()
  })) || [];

  return (
    <MatchingComponent
      title={question.prompt.task}
      leftTitle="🎵 Songs"
      rightTitle="💡 Inspirations"
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