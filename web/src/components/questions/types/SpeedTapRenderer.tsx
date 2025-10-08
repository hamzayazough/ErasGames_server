'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SpeedTapQuestion } from '@/lib/types/interfaces/questions/speed-tap.interface';

interface SpeedTapRendererProps {
  question: SpeedTapQuestion;
  showAnswer?: boolean;
}

export function SpeedTapRenderer({ question, showAnswer = false }: SpeedTapRendererProps) {
  const correctTargets = question.correct?.targets || [];
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
              const isCorrectTarget = correctTargets.includes(item);
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`h-16 text-sm ${
                    showAnswer && isCorrectTarget
                      ? 'bg-green-500 text-white border-green-600'
                      : isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-gray-50'
                  } ${isTimeUp ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => handleItemTap(item)}
                  disabled={isTimeUp || showAnswer}
                >
                  <div className="flex flex-col items-center">
                    <span>{item}</span>
                    {showAnswer && isCorrectTarget && (
                      <span className="text-xs mt-1">✓ Target</span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        )}

        {/* Show correct targets if enabled */}
        {showAnswer && correctTargets.length > 0 && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-center mb-3">
              <Text className="text-green-800 font-medium text-lg">
                🎯 Correct Targets to Tap
              </Text>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {correctTargets.map((target, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  {target}
                </span>
              ))}
            </div>
            <Text className="text-center text-green-700 text-sm mt-2">
              Tap these {correctTargets.length} items as fast as possible!
            </Text>
          </Card>
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