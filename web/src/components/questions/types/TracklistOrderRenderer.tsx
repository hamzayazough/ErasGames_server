'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TracklistOrderQuestion } from '@/lib/types/interfaces/questions/tracklist-order.interface';

interface TracklistOrderRendererProps {
  question: TracklistOrderQuestion;
}

export function TracklistOrderRenderer({ question }: TracklistOrderRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.album && (
            <Card className="p-3 bg-purple-50 border-purple-200">
              <Text className="text-purple-800">
                <strong>Album:</strong> {question.prompt.album}
              </Text>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {question.prompt.tracks?.map((track, index) => (
            <Card key={index} className="p-3 bg-green-50 border-green-200 cursor-move">
              <Text className="text-center font-medium">{track}</Text>
            </Card>
          ))}
        </div>
        
        <Text className="text-center text-gray-600">
          Drag and drop to arrange in correct album order (Interactive ordering would be implemented here)
        </Text>
      </div>
    </Card>
  );
}