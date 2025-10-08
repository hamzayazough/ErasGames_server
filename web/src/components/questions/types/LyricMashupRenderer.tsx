'use client';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { LyricMashupQuestion } from '@/lib/types/interfaces/questions/lyric-mashup.interface';

interface LyricMashupRendererProps {
  question: LyricMashupQuestion;
  showAnswer?: boolean;
}

export function LyricMashupRenderer({ question, showAnswer = false }: LyricMashupRendererProps) {
  const correctMatches = question.correct?.map || {};
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
            <Text variant="h3" className="mb-3 text-purple-600">🎵 Lyric Snippets</Text>
            <div className="space-y-3">
              {question.prompt.snippets?.map((snippet, index) => {
                const correctSong = correctMatches[snippet];
                return (
                  <Card 
                    key={index} 
                    className={`p-3 border-2 ${
                      showAnswer && correctSong
                        ? 'bg-green-50 border-green-300'
                        : 'bg-purple-50 border-purple-200'
                    }`}
                  >
                    <Text className="italic font-medium">"{snippet}"</Text>
                    {showAnswer && correctSong && (
                      <Text className="text-green-700 text-sm mt-1">
                        → {correctSong} ✓
                      </Text>
                    )}
                  </Card>
                );
              })}
            </div>
          </Card>
          
          <Card className="p-4">
            <Text variant="h3" className="mb-3 text-blue-600">🎼 Song Options</Text>
            <div className="space-y-3">
              {question.prompt.optionsPerSnippet?.map((option, index) => {
                const isCorrectMatch = showAnswer && Object.values(correctMatches).includes(option);
                return (
                  <div 
                    key={index} 
                    className={`p-3 border-2 rounded cursor-pointer transition-all ${
                      isCorrectMatch
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {isCorrectMatch && <span className="text-green-600">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        
        {!showAnswer && (
          <Text className="text-center text-gray-600">
            🔗 Drag and drop to match each lyric snippet to its correct song
          </Text>
        )}

        {/* Show correct matches if enabled */}
        {showAnswer && Object.keys(correctMatches).length > 0 && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-center mb-3">
              <Text className="text-green-800 font-medium text-lg">
                🎯 Correct Matches
              </Text>
            </div>
            <div className="space-y-2">
              {Object.entries(correctMatches).map(([snippet, song], index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-green-300">
                  <span className="font-medium text-purple-700">"{snippet}"</span>
                  <span className="text-gray-500">→</span>
                  <span className="font-medium text-blue-700">{song}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}