'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TracklistOrderQuestion } from '@/lib/types/interfaces/questions/tracklist-order.interface';

interface TracklistOrderRendererProps {
  question: TracklistOrderQuestion;
  showAnswer?: boolean;
}

export function TracklistOrderRenderer({ question, showAnswer = false }: TracklistOrderRendererProps) {
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

        {/* Tracks to order */}
        <div>
          <Text className="text-center text-gray-600 mb-4">
            Arrange these tracks in their correct album order:
          </Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {question.prompt.tracks?.map((track, index) => (
              <Card key={index} className="p-3 bg-blue-50 border-blue-200 cursor-move hover:bg-blue-100 transition-colors">
                <Text className="text-center font-medium">{track}</Text>
              </Card>
            ))}
          </div>
        </div>

        {/* Show correct order if enabled */}
        {showAnswer && question.correct?.values && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-center">
              <Text className="text-green-800 font-medium mb-3">
                Correct Album Order:
              </Text>
              <div className="flex flex-wrap justify-center gap-2">
                {question.correct.values.map((track, index) => (
                  <div key={index} className="flex items-center bg-white border border-green-300 rounded-lg px-3 py-2">
                    <span className="text-green-600 font-bold mr-2">{index + 1}.</span>
                    <span className="font-medium">{track}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
        
        {!showAnswer && (
          <Text className="text-center text-gray-600">
            Drag and drop to arrange in correct album order (Interactive ordering would be implemented here)
          </Text>
        )}
      </div>
    </Card>
  );
}