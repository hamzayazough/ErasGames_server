'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { LifeTriviaQuestion } from '@/lib/types/interfaces/questions/life-trivia.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface LifeTriviaRendererProps {
  question: LifeTriviaQuestion;
  showAnswer?: boolean;
}

export function LifeTriviaRenderer({ question, showAnswer = false }: LifeTriviaRendererProps) {
  const correctIndex = question.correct?.index;
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.question && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <Text className="text-lg text-blue-900">
                {question.prompt.question}
              </Text>
            </Card>
          )}
        </div>

        {/* Answer choices */}
        <div className="grid grid-cols-1 gap-3">
          {question.choices.map((choice, index) => {
            // Handle both string and object choice formats
            const choiceText = typeof choice === 'string' ? choice : choice.text;
            const isCorrect = showAnswer && correctIndex === index;
            
            return (
              <Card 
                key={index} 
                className={`p-4 border-2 cursor-pointer hover:opacity-80 transition-all ${
                  isCorrect 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-blue-600">{String.fromCharCode(65 + index)}.</span>
                  <span className="font-medium">{choiceText}</span>
                  {isCorrect && <span className="text-green-600 ml-auto">✓</span>}
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