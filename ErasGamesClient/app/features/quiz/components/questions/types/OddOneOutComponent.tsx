import React from 'react';
import { OddOneOutQuestion } from '../../../../../shared/interfaces/questions/odd-one-out.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { SimpleChoiceComponent } from './SimpleChoiceComponent';

interface OddOneOutComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: OddOneOutQuestion;
}

export const OddOneOutComponent: React.FC<OddOneOutComponentProps> = (props) => {
  const { question } = props;
  
  return (
    <SimpleChoiceComponent
      {...props}
      questionText={question.prompt.task}
      subtitle={`Rule: ${question.prompt.setRule}`}
      icon="🔍"
    />
  );
};