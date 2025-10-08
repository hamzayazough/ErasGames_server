'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { OneSecondQuestion } from '@/lib/types/interfaces/questions/one-second.interface';
import { MediaPlayer } from '../common/MediaPlayer';

interface OneSecondRendererProps {
  question: OneSecondQuestion;
  showAnswer?: boolean;
}

export function OneSecondRenderer({ question, showAnswer = false }: OneSecondRendererProps) {
  const correctIndex = typeof question.correct === 'number' ? question.correct : question.correct?.index;
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Question Task */}
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          <Text className="text-gray-600 mb-4">
            Listen carefully - you only get one second!
          </Text>
        </div>

        {/* Audio Player */}
        {question.mediaRefs && question.mediaRefs.length > 0 && (
          <div className="max-w-md mx-auto">
            {question.mediaRefs.map((media, index) => (
              <MediaPlayer
                key={index}
                url={media.url}
                type="audio"
                controls={true}
                className="w-full"
              />
            ))}
          </div>
        )}

        {/* Challenge Info */}
        <Card className="p-4 bg-red-50 border-red-200 max-w-md mx-auto">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-red-600">⚡</span>
            <Text className="text-red-800 font-medium">
              Challenge: Identify from just 1 second of audio
            </Text>
          </div>
        </Card>

        {/* Answer choices */}
        <div className="grid grid-cols-1 gap-3">
          {question.choices.map((choice, index) => {
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
                  <span className="font-medium">{choice}</span>
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
                🏆 Correct Answer: {question.choices[correctIndex]}
              </Text>
            </div>
          </Card>
        )}

        {/* Subjects/Themes Display */}
        {(question.subjects || question.themes) && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {question.themes?.map((theme, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {theme}
                </span>
              ))}
              {question.subjects?.map((subject, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}