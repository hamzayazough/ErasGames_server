'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { MoodMatchQuestion } from '@/lib/types/interfaces/questions/mood-match.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface MoodMatchRendererProps {
  question: MoodMatchQuestion;
  showAnswer?: boolean;
}

export function MoodMatchRenderer({ question, showAnswer = false }: MoodMatchRendererProps) {
  const correctIndex = question.correct?.index;
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.moodTags && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {question.prompt.moodTags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {question.prompt.note && (
            <Card className="p-3 bg-yellow-50 border-yellow-200">
              <Text className="text-yellow-800">
                {question.prompt.note}
              </Text>
            </Card>
          )}
        </div>

        {/* Mood choices */}
        <div className="grid grid-cols-2 gap-4">
          {question.choices.map((choice, index) => {
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
                  <span className="font-medium">{choice}</span>
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
                Correct Answer: {question.choices[correctIndex]}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}