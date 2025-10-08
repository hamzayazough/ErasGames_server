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
        
        <div className="text-center">
          <Text className="text-gray-600 mb-4">
            Drag and drop or click to match each song to its correct album
          </Text>
          
          {/* Interactive matching would be implemented here */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Text className="text-yellow-800 text-sm">
              🚧 Interactive matching interface coming soon
            </Text>
          </div>
        </div>

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