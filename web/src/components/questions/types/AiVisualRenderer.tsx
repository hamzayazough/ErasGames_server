'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { AiVisualQuestion } from '@/lib/types/interfaces/questions/ai-visual.interface';
import { MultipleChoice } from '../common/MultipleChoice';
import { MediaDisplay } from '../common/MediaDisplay';

interface AiVisualRendererProps {
  question: AiVisualQuestion;
  showAnswer?: boolean;
}

export function AiVisualRenderer({ question, showAnswer = false }: AiVisualRendererProps) {
  // Get the correct choice index
  const correctIndex = question.correct?.index;
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task || 'Analyze this AI-generated image'}
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

        {/* Text-based choices */}
        <div className="grid grid-cols-2 gap-4">
          {question.choices.map((choice, index) => {
            // Handle both string and object choice formats
            const choiceText = typeof choice === 'string' ? choice : choice.text;
            const isCorrect = showAnswer && correctIndex === index;
            
            return (
              <Card 
                key={index} 
                className={`p-4 text-center border-2 cursor-pointer hover:opacity-80 transition-all ${
                  isCorrect 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                  <span className="font-medium">{choiceText}</span>
                  {isCorrect && <span className="text-green-600">✓</span>}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Show correct answer if enabled */}
        {showAnswer && correctIndex !== undefined && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-center">
              <Text className="text-green-800 font-medium">
                Correct Answer: {(() => {
                  const correctChoice = question.choices[correctIndex];
                  return typeof correctChoice === 'string' ? correctChoice : correctChoice?.text || 'Unknown';
                })()}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}