'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { AiVisualQuestion } from '@/lib/types/interfaces/questions/ai-visual.interface';
import { MultipleChoice } from '../common/MultipleChoice';
import { MediaDisplay } from '../common/MediaDisplay';

interface AiVisualRendererProps {
  question: AiVisualQuestion;
}

export function AiVisualRenderer({ question }: AiVisualRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
        </div>

        {question.mediaRefs && question.mediaRefs.length > 0 && (
          <div className="max-w-md mx-auto">
            {question.mediaRefs.map((media, index) => (
              <MediaDisplay
                key={index}
                url={media.url}
                alt={`AI Generated Image ${index + 1}`}
                className="w-full"
              />
            ))}
          </div>
        )}

        <Card className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center gap-2 justify-center">
            <span>🤖</span>
            <Text className="text-purple-800 font-medium">
              AI-Generated Visual
            </Text>
          </div>
        </Card>

        <MultipleChoice
          choices={question.choices}
          onSelect={(choice) => console.log('Selected:', choice)}
        />
      </div>
    </Card>
  );
}