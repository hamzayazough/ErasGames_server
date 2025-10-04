'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { LifeTriviaQuestion } from '@/lib/types/interfaces/questions/life-trivia.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface LifeTriviaRendererProps {
  question: LifeTriviaQuestion;
}

export function LifeTriviaRenderer({ question }: LifeTriviaRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.question && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <Text className="text-lg text-blue-900">
                {question.prompt.question}
              </Text>
            </Card>
          )}
        </div>

        <MultipleChoice
          choices={question.choices}
          onSelect={(choice) => console.log('Selected:', choice)}
        />
      </div>
    </Card>
  );
}