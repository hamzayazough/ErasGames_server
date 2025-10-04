'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { AlbumYearGuessQuestion } from '@/lib/types/interfaces/questions/album-year-guess.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface AlbumYearGuessRendererProps {
  question: AlbumYearGuessQuestion;
}

export function AlbumYearGuessRenderer({ question }: AlbumYearGuessRendererProps) {
  // Find the correct answer text
  const getCorrectAnswer = () => {
    if (!question.correct) return null;
    
    const correctChoice = question.choices[question.correct.index];
    if (typeof correctChoice === 'string') {
      return correctChoice;
    }
    return correctChoice.text;
  };

  const correctAnswer = getCorrectAnswer();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Question Task */}
        <div className="text-center">
          <Text variant="h2" className="mb-2">
            {question.prompt.task}
          </Text>
          {question.prompt.album && (
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full">
              <Text variant="body" className="font-medium">
                Album: {question.prompt.album}
              </Text>
            </div>
          )}
        </div>

        {/* Multiple Choice Options */}
        <MultipleChoice
          choices={question.choices}
          onSelect={(choice) => {
            console.log('Selected:', choice);
          }}
        />

        {/* Show Correct Answer */}
        {correctAnswer && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Text variant="body" className="text-green-800">
              <span className="font-semibold">Correct Answer:</span> {correctAnswer}
            </Text>
          </div>
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