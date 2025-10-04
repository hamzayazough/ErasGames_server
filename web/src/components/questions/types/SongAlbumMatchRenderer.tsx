'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { SongAlbumMatchQuestion } from '@/lib/types/interfaces/questions/song-album-match.interface';

interface SongAlbumMatchRendererProps {
  question: SongAlbumMatchQuestion;
}

export function SongAlbumMatchRenderer({ question }: SongAlbumMatchRendererProps) {
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
            <Text variant="h3" className="mb-3 text-blue-600">Songs</Text>
            <div className="space-y-2">
              {question.prompt.left?.map((item, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded">
                  {item}
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-4">
            <Text variant="h3" className="mb-3 text-green-600">Albums</Text>
            <div className="space-y-2">
              {question.prompt.right?.map((item, index) => (
                <div key={index} className="p-2 bg-green-50 rounded">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <Text className="text-center text-gray-600">
          Match each song to its correct album (Interactive matching would be implemented here)
        </Text>
      </div>
    </Card>
  );
}