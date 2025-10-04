'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SpeedTapQuestion } from '@/lib/types/interfaces/questions/speed-tap.interface';

interface SpeedTapRendererProps {
  question: SpeedTapQuestion;
}

export function SpeedTapRenderer({ question }: SpeedTapRendererProps) {
  const [timeLeft, setTimeLeft] = useState(question.prompt.roundSeconds || 15);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, timeLeft]);

  const handleItemTap = (item: string) => {
    if (!gameStarted || timeLeft <= 0) return;
    
    if (!selectedItems.includes(item)) {
      setSelectedItems([...selectedItems, item]);
      // This would calculate score based on correct/incorrect taps
      setScore(score + (question.scoringHints?.perCorrect || 10));
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(question.prompt.roundSeconds || 15);
    setSelectedItems([]);
    setScore(0);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <Text variant="h2" className="mb-4">
            {question.prompt.task}
          </Text>
          
          {question.prompt.targetRule && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <Text className="text-blue-800">
                <strong>Target:</strong> {question.prompt.targetRule}
              </Text>
            </Card>
          )}
        </div>

        <div className="flex justify-center gap-4 text-lg font-bold">
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span className={timeLeft <= 5 ? 'text-red-600' : 'text-blue-600'}>
              {timeLeft}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span className="text-green-600">{score}</span>
          </div>
        </div>

        {!gameStarted ? (
          <div className="text-center">
            <Button onClick={startGame} size="lg" className="mb-4">
              Start Speed Tap Challenge!
            </Button>
            <Text className="text-gray-600">
              You have {question.prompt.roundSeconds || 15} seconds to tap all the correct items!
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {question.prompt.grid?.map((item, index) => {
              const isSelected = selectedItems.includes(item);
              const isTimeUp = timeLeft <= 0;
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`h-16 text-sm ${
                    isSelected ? 'bg-green-600 text-white' : 'hover:bg-gray-50'
                  } ${isTimeUp ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => handleItemTap(item)}
                  disabled={isTimeUp}
                >
                  {item}
                </Button>
              );
            })}
          </div>
        )}

        {gameStarted && timeLeft <= 0 && (
          <Card className="p-4 bg-green-50 border-green-200">
            <Text className="text-center text-green-800 font-bold">
              Time's up! Final Score: {score}
            </Text>
            <div className="text-center mt-2">
              <Button onClick={startGame} size="sm">
                Play Again
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}