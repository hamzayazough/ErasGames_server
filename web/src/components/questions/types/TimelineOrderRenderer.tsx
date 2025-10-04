'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TimelineOrderQuestion } from '@/lib/types/interfaces/questions/timeline-order.interface';

interface TimelineOrderRendererProps {
  question: TimelineOrderQuestion;
}

export function TimelineOrderRenderer({ question }: TimelineOrderRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {question.prompt.items?.map((item, index) => (
            <Card key={index} className="p-3 bg-purple-50 border-purple-200 cursor-move">
              <Text className="text-center font-medium">{item}</Text>
            </Card>
          ))}
        </div>
        
        <Text className="text-center text-gray-600">
          Drag and drop to arrange in chronological order (Interactive ordering would be implemented here)
        </Text>
      </div>
    </Card>
  );
}