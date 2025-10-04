'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { OddOneOutQuestion } from '@/lib/types/interfaces/questions/odd-one-out.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface OddOneOutRendererProps {
  question: OddOneOutQuestion;
}

export function OddOneOutRenderer({ question }: OddOneOutRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.setRule && (
            <Card className="p-3 bg-orange-50 border-orange-200">
              <Text className="text-orange-800">
                <strong>Rule:</strong> {question.prompt.setRule}
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