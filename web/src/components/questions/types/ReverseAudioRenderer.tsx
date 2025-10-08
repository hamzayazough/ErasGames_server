'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { ReverseAudioQuestion } from '@/lib/types/interfaces/questions/reverse-audio.interface';
import { MultipleChoice } from '../common/MultipleChoice';
import { MediaPlayer } from '../common/MediaPlayer';

interface ReverseAudioRendererProps {
  question: ReverseAudioQuestion;
  showAnswer?: boolean;
}

export function ReverseAudioRenderer({ question, showAnswer = false }: ReverseAudioRendererProps) {
  const correctIndex = question.correct?.index;
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

        <Card className="p-4 bg-red-50 border-red-200 max-w-md mx-auto">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-red-600">🔄</span>
            <Text className="text-red-800 font-medium">
              Reversed Audio Challenge
            </Text>
          </div>
        </Card>

        {/* Song choices */}
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