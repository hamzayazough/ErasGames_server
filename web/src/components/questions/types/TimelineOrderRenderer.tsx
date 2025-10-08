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
        
        <div className="text-center">
          <Text className="text-gray-600 mb-4">
            Drag and drop to arrange in chronological order (earliest to latest)
          </Text>
          
          {/* Interactive ordering would be implemented here */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Text className="text-yellow-800 text-sm">
              🚧 Interactive drag-and-drop ordering interface coming soon
            </Text>
          </div>
        </div>

        {/* Subjects/Themes Display */}
        {(question.subjects || question.themes) && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {question.themes?.map((theme, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {theme}
                </span>
              ))}
              {question.subjects?.map((subject, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}