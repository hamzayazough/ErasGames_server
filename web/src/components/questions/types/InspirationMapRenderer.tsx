'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { InspirationMapQuestion } from '@/lib/types/interfaces/questions/inspiration-map.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface InspirationMapRendererProps {
  question: InspirationMapQuestion;
}

export function InspirationMapRenderer({ question }: InspirationMapRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.disclaimer && (
            <Card className="p-3 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">⚠️</span>
                <Text className="text-yellow-800 text-sm">
                  {question.prompt.disclaimer}
                </Text>
              </div>
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