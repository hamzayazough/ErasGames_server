import React from 'react';
import { LifeTriviaQuestion } from '../../../../../shared/interfaces/questions/life-trivia.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { SimpleChoiceComponent } from './SimpleChoiceComponent';

interface LifeTriviaComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: LifeTriviaQuestion;
}

export const LifeTriviaComponent: React.FC<LifeTriviaComponentProps> = (props) => {
  const { question } = props;
  
  return (
    <SimpleChoiceComponent
      {...props}
      questionText={question.prompt.question}
      subtitle="Trivia Question"
      icon="🧠"
    />
  );
};