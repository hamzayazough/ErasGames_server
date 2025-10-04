'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { OutfitEraQuestion } from '@/lib/types/interfaces/questions/outfit-era.interface';
import { MultipleChoice } from '../common/MultipleChoice';
import { MediaDisplay } from '../common/MediaDisplay';

interface OutfitEraRendererProps {
  question: OutfitEraQuestion;
}

export function OutfitEraRenderer({ question }: OutfitEraRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Question Task */}
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
        </div>

        {/* Media Display */}
        {question.mediaRefs && question.mediaRefs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {question.mediaRefs.map((media, index) => (
              <MediaDisplay
                key={index}
                url={media.url}
                alt={`Outfit ${index + 1}`}
                className="w-full"
              />
            ))}
          </div>
        )}

        {/* Hint */}
        {question.hint && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600">💡</span>
              <Text className="text-yellow-800">
                <strong>Hint:</strong> {question.hint}
              </Text>
            </div>
          </Card>
        )}

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