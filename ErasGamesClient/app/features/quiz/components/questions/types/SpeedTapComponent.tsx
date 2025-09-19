import React, { useState, useEffect } from 'react';
import { SpeedTapQuestion } from '../../../../../shared/interfaces/questions/speed-tap.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface SpeedTapComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: SpeedTapQuestion;
}

export const SpeedTapComponent: React.FC<SpeedTapComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimit || 10);
  const [tapCount, setTapCount] = useState<number>(selectedAnswer?.tapCount || 0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            setIsFinished(true);
            onAnswerChange({ tapCount });
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, tapCount, onAnswerChange]);

  const handleStart = () => {
    if (!disabled && !isFinished) {
      setIsActive(true);
      setTapCount(0);
    }
  };

  const handleTap = () => {
    if (isActive && !disabled) {
      const newTapCount = tapCount + 1;
      setTapCount(newTapCount);
      onAnswerChange({ tapCount: newTapCount });
    }
  };

  const handleReset = () => {
    if (!disabled) {
      setTimeLeft(question.timeLimit || 10);
      setTapCount(0);
      setIsActive(false);
      setIsFinished(false);
      onAnswerChange({ tapCount: 0 });
    }
  };

  const getButtonColor = () => {
    if (isFinished) {
      if (showCorrect) {
        const target = correctAnswer?.tapCount || question.targetTaps || 0;
        const tolerance = Math.max(1, Math.floor(target * 0.1)); // 10% tolerance
        const isCorrect = Math.abs(tapCount - target) <= tolerance;
        return isCorrect ? theme.colors.success : theme.colors.error;
      }
      return theme.colors.textSecondary;
    }
    return isActive ? theme.colors.primary : theme.colors.secondary;
  };

  const getStatusText = () => {
    if (isFinished) {
      if (showCorrect) {
        const target = correctAnswer?.tapCount || question.targetTaps || 0;
        const tolerance = Math.max(1, Math.floor(target * 0.1));
        const isCorrect = Math.abs(tapCount - target) <= tolerance;
        return isCorrect ? '🎉 Great timing!' : `🎯 Target was around ${target} taps`;
      }
      return '⏰ Time\'s up!';
    }
    if (isActive) {
      return '🔥 Keep tapping!';
    }
    return '👆 Tap "Start" to begin';
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      <View style={[styles.gameContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="heading2" style={[styles.timer, { color: theme.colors.primary }]}>
          {timeLeft}s
        </Text>

        <Text variant="heading1" style={[styles.tapCounter, { color: theme.colors.text }]}>
          {tapCount}
        </Text>
        <Text variant="caption" style={[styles.tapLabel, { color: theme.colors.textSecondary }]}>
          taps
        </Text>

        <Text variant="body" style={[styles.statusText, { color: theme.colors.text }]}>
          {getStatusText()}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {!isActive && !isFinished && (
          <Pressable
            style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleStart}
            disabled={disabled}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textOnPrimary }]}>
              Start Tapping
            </Text>
          </Pressable>
        )}

        {isActive && (
          <Pressable
            style={[styles.tapButton, { backgroundColor: getButtonColor() }]}
            onPress={handleTap}
            disabled={disabled}
          >
            <Text style={[styles.tapButtonText, { color: theme.colors.textOnPrimary }]}>
              TAP!
            </Text>
          </Pressable>
        )}

        {isFinished && (
          <Pressable
            style={[styles.resetButton, { backgroundColor: theme.colors.secondary }]}
            onPress={handleReset}
            disabled={disabled}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textOnSecondary }]}>
              Try Again
            </Text>
          </Pressable>
        )}
      </View>

      {showHint && question.hint && (
        <View style={[styles.hintContainer, { backgroundColor: theme.colors.warning + '20' }]}>
          <Text variant="caption" style={[styles.hintText, { color: theme.colors.text }]}>
            💡 Hint: {question.hint}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  questionText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  gameContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  timer: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tapCounter: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  tapLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    gap: 12,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  tapButton: {
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tapButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  hintContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  hintText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});