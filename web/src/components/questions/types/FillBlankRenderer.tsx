'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { FillBlankQuestion } from '@/lib/types/interfaces/questions/fill-blank.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface FillBlankRendererProps {
  question: FillBlankQuestion;
}

export function FillBlankRenderer({ question }: FillBlankRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          <Card className="p-4 bg-blue-50 border-blue-200">
            <Text className="text-lg font-mono">
              {question.prompt.text}
            </Text>
          </Card>
        </div>

        <MultipleChoice
          choices={question.choices}
          onSelect={(choice) => console.log('Selected:', choice)}
        />
      </div>
    </Card>
  );
}