'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { GuessByLyricQuestion } from '@/lib/types/interfaces/questions/guess-by-lyric.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface GuessByLyricRendererProps {
  question: GuessByLyricQuestion;
}

export function GuessByLyricRenderer({ question }: GuessByLyricRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Question Task */}
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {/* Lyric Display */}
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <Text className="text-lg italic text-purple-900 font-medium">
              "{question.prompt.lyric}"
            </Text>
          </Card>
        </div>

        {/* Multiple Choice Options */}
        <MultipleChoice
          choices={question.choices}
          onSelect={(choice) => {
            console.log('Selected:', choice);
          }}
        />

        {/* Show Correct Answer */}
        {question.correct && (() => {
          const correctChoice = question.choices[question.correct.index];
          const correctAnswer = typeof correctChoice === 'string' ? correctChoice : correctChoice.text;
          return (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Text variant="body" className="text-green-800">
                <span className="font-semibold">Correct Answer:</span> {correctAnswer}
              </Text>
            </div>
          );
        })()}

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