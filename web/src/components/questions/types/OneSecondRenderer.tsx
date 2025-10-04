'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { OneSecondQuestion } from '@/lib/types/interfaces/questions/one-second.interface';
import { MultipleChoice } from '../common/MultipleChoice';
import { MediaPlayer } from '../common/MediaPlayer';

interface OneSecondRendererProps {
  question: OneSecondQuestion;
}

export function OneSecondRenderer({ question }: OneSecondRendererProps) {
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

        {/* Multiple Choice Options */}
        <MultipleChoice
          choices={question.choices}
          onSelect={(choice) => {
            console.log('Selected:', choice);
          }}
        />

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