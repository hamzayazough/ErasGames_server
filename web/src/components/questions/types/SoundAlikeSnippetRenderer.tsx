'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { SoundAlikeSnippetQuestion } from '@/lib/types/interfaces/questions/sound-alike-snippet.interface';
import { MultipleChoice } from '../common/MultipleChoice';
import { MediaPlayer } from '../common/MediaPlayer';

interface SoundAlikeSnippetRendererProps {
  question: SoundAlikeSnippetQuestion;
}

export function SoundAlikeSnippetRenderer({ question }: SoundAlikeSnippetRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.description && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <Text className="text-blue-800">
                <strong>Description:</strong> {question.prompt.description}
              </Text>
            </Card>
          )}
        </div>

        {question.mediaRefs && question.mediaRefs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.mediaRefs.map((media, index) => (
              <div key={index}>
                <Text className="mb-2 font-medium">Clip {index + 1}</Text>
                <MediaPlayer
                  url={media.url}
                  type="audio"
                  controls={true}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}

        <MultipleChoice
          choices={question.choices}
          onSelect={(choice) => console.log('Selected:', choice)}
        />
      </div>
    </Card>
  );
}