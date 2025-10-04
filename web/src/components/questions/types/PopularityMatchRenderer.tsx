'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { PopularityMatchQuestion } from '@/lib/types/interfaces/questions/popularity-match.interface';

interface PopularityMatchRendererProps {
  question: PopularityMatchQuestion;
}

export function PopularityMatchRenderer({ question }: PopularityMatchRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.asOf && (
            <Card className="p-3 bg-yellow-50 border-yellow-200">
              <Text className="text-yellow-800">
                <strong>Data as of:</strong> {question.prompt.asOf}
              </Text>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {question.choices?.map((choice, index) => (
            <Card key={index} className="p-3 bg-orange-50 border-orange-200 cursor-move">
              <Text className="text-center font-medium">{choice}</Text>
            </Card>
          ))}
        </div>
        
        <Text className="text-center text-gray-600">
          Drag and drop to order by popularity (Interactive ordering would be implemented here)
        </Text>
      </div>
    </Card>
  );
}