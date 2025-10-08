'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { PopularityMatchQuestion } from '@/lib/types/interfaces/questions/popularity-match.interface';

interface PopularityMatchRendererProps {
  question: PopularityMatchQuestion;
  showAnswer?: boolean;
}

export function PopularityMatchRenderer({ question, showAnswer = false }: PopularityMatchRendererProps) {
  const correctOrder = question.correct?.values || [];
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.asOf && (
            <Card className="p-3 bg-yellow-50 border-yellow-200">
              <Text className="text-yellow-800">
                <strong>Data as of:</strong> {question.prompt.asOf}
              </Text>
            </Card>
          )}
        </div>

        {/* Items to order */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {question.choices?.map((choice, index) => {
              const choiceText = typeof choice === 'string' ? choice : choice.text;
              return (
                <Card key={index} className="p-4 bg-purple-50 border-purple-200 cursor-move hover:bg-purple-100 transition-colors">
                  <div className="flex items-center justify-center">
                    <span className="text-center font-medium text-purple-900">{choiceText}</span>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <Text className="text-center text-gray-600 text-sm">
            🔄 Drag and drop to order by popularity (most popular first)
          </Text>
        </div>

        {/* Show correct answer if enabled */}
        {showAnswer && correctOrder.length > 0 && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-center mb-3">
              <Text className="text-green-800 font-medium text-lg">
                Correct Order (Most → Least Popular)
              </Text>
            </div>
            <div className="space-y-2">
              {correctOrder.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border border-green-300">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-green-900">{item}</span>
                  {index === 0 && <span className="text-green-600 ml-auto text-sm">👑 Most Popular</span>}
                  {index === correctOrder.length - 1 && <span className="text-green-600 ml-auto text-sm">📉 Least Popular</span>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}