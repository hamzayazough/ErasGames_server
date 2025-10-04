'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { ReverseAudioQuestion } from '@/lib/types/interfaces/questions/reverse-audio.interface';
import { MultipleChoice } from '../common/MultipleChoice';
import { MediaPlayer } from '../common/MediaPlayer';

interface ReverseAudioRendererProps {
  question: ReverseAudioQuestion;
}

export function ReverseAudioRenderer({ question }: ReverseAudioRendererProps) {
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

        <MultipleChoice
          choices={question.choices}
          onSelect={(choice) => console.log('Selected:', choice)}
        />
      </div>
    </Card>
  );
}