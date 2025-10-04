'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { MoodMatchQuestion } from '@/lib/types/interfaces/questions/mood-match.interface';
import { MultipleChoice } from '../common/MultipleChoice';

interface MoodMatchRendererProps {
  question: MoodMatchQuestion;
}

export function MoodMatchRenderer({ question }: MoodMatchRendererProps) {
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

        <MultipleChoice
          choices={question.choices}
          onSelect={(choice) => console.log('Selected:', choice)}
        />
      </div>
    </Card>
  );
}