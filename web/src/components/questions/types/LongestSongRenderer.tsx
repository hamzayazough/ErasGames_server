'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { LongestSongQuestion } from '@/lib/types/interfaces/questions/longest-song.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface LongestSongRendererProps {
  question: LongestSongQuestion;
}

export function LongestSongRenderer({ question }: LongestSongRendererProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.context && (
            <Card className="p-3 bg-green-50 border-green-200">
              <Text className="text-green-800">
                <strong>Context:</strong> {question.prompt.context}
              </Text>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.choices?.map((choice, index) => (
            <Card key={choice.id} className="p-4 hover:bg-gray-50 cursor-pointer border">
              <div className="flex justify-between items-center">
                <Text className="font-medium">{choice.text}</Text>
                {choice.duration && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {formatDuration(choice.duration)}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}