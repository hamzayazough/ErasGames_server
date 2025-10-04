'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { LyricMashupQuestion } from '@/lib/types/interfaces/questions/lyric-mashup.interface';

interface LyricMashupRendererProps {
  question: LyricMashupQuestion;
}

export function LyricMashupRenderer({ question }: LyricMashupRendererProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <Text variant="h3" className="mb-3 text-purple-600">Lyric Snippets</Text>
            <div className="space-y-2">
              {question.prompt.snippets?.map((snippet, index) => (
                <Card key={index} className="p-3 bg-purple-50 border-purple-200">
                  <Text className="italic">"{snippet}"</Text>
                </Card>
              ))}
            </div>
          </Card>
          
          <Card className="p-4">
            <Text variant="h3" className="mb-3 text-green-600">Song Options</Text>
            <div className="space-y-2">
              {question.prompt.optionsPerSnippet?.map((option, index) => (
                <div key={index} className="p-2 bg-green-50 border border-green-200 rounded cursor-pointer hover:bg-green-100">
                  {option}
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <Text className="text-center text-gray-600">
          Match each lyric snippet to its correct song (Interactive matching would be implemented here)
        </Text>
      </div>
    </Card>
  );
}