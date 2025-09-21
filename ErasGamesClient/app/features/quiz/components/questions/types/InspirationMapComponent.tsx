import React from 'react';
import { InspirationMapQuestion } from '../../../../../shared/interfaces/questions/inspiration-map.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View } from '../../../../../ui';
import { MultipleChoiceComponent } from '../common/MultipleChoiceComponent';

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
  const handleChoiceSelect = (choiceIndex: number) => {
    onAnswerChange({ choiceIndex });
  };

  const selectedChoiceIndex = typeof selectedAnswer === 'object' && selectedAnswer?.choiceIndex !== undefined 
    ? selectedAnswer.choiceIndex 
    : typeof selectedAnswer === 'number' 
    ? selectedAnswer 
    : null;

  const correctChoiceIndex = typeof correctAnswer === 'number' 
    ? correctAnswer 
    : null;

  return (
    <View style={{ flex: 1 }}>
      <MultipleChoiceComponent
        title={question.prompt.task}
        disclaimer={question.prompt.disclaimer}
        choices={question.choices}
        selectedChoice={selectedChoiceIndex}
        onChoiceSelect={handleChoiceSelect}
        disabled={disabled}
        showCorrect={showCorrect}
        correctChoice={correctChoiceIndex}
        showHint={showHint}
        hint={question.hint}
      />
    </View>
  );
};