'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { InspirationMapQuestion } from '@/lib/types/interfaces/questions/inspiration-map.interface';

interface InspirationMapRendererProps {
  question: InspirationMapQuestion;
  showAnswer?: boolean;
}

export function InspirationMapRenderer({ question, showAnswer = false }: InspirationMapRendererProps) {
  const correctIndex = typeof question.correct === 'number' ? question.correct : question.correct?.index;
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.disclaimer && (
            <Card className="p-3 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">⚠️</span>
                <Text className="text-yellow-800 text-sm">
                  {question.prompt.disclaimer}
                </Text>
              </div>
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
                  {isCorrect && <span className="text-green-600 ml-auto">✓ Correct</span>}
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
                🎯 Correct Answer: {question.choices[correctIndex]}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}