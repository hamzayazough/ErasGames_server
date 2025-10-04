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
            {question.prompt.task || question.prompt.main_prompt || 'Analyze this AI-generated image'}
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

        {/* Image-based choices */}
        <div className="grid grid-cols-2 gap-4">
          {question.choices.map((choice, index) => {
            const hasUrl = choice.url;
            const hasText = choice.text;
            
            return (
              <div key={choice.id || index} className="cursor-pointer hover:opacity-80 transition-opacity">
                {hasUrl ? (
                  <div className="relative">
                    <MediaDisplay
                      url={choice.url}
                      alt={`Choice ${index + 1}`}
                      className="w-full rounded-lg border-2 border-gray-200 hover:border-blue-400"
                    />
                    <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                  </div>
                ) : hasText ? (
                  <Card className="p-4 text-center border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50">
                    <span className="font-medium">{choice.text}</span>
                  </Card>
                ) : (
                  <Card className="p-4 text-center border-2 border-gray-200">
                    <span className="text-gray-500">Choice {index + 1}</span>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}