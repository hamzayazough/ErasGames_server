'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { LongestSongQuestion } from '@/lib/types/interfaces/questions/longest-song.interface';

interface LongestSongRendererProps {
  question: LongestSongQuestion;
  showAnswer?: boolean;
}

export function LongestSongRenderer({ question, showAnswer = false }: LongestSongRendererProps) {
  const correctIndex = question.correct?.index;
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

        {/* Song choices with durations */}
        <div className="grid grid-cols-1 gap-3">
          {question.choices?.map((choice, index) => {
            // Handle both string and object choice formats
            const choiceText = typeof choice === 'string' ? choice : choice.text;
            const duration = typeof choice === 'object' && choice.duration ? choice.duration : undefined;
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-blue-600">{String.fromCharCode(65 + index)}.</span>
                    <span className="font-medium">{choiceText}</span>
                    {isCorrect && <span className="text-green-600">✓ Longest</span>}
                  </div>
                  {duration && (
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      isCorrect 
                        ? 'bg-green-100 text-green-800 font-bold' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {formatDuration(duration)}
                    </span>
                  )}
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
                🏆 Longest Song: {(() => {
                  const correctChoice = question.choices[correctIndex];
                  const choiceText = typeof correctChoice === 'string' ? correctChoice : correctChoice?.text || 'Unknown';
                  const duration = typeof correctChoice === 'object' && correctChoice.duration 
                    ? ` (${formatDuration(correctChoice.duration)})` 
                    : '';
                  return choiceText + duration;
                })()}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}