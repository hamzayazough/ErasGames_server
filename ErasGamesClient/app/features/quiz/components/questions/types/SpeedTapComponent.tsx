import React, { useState, useEffect } from 'react';
import { SpeedTapQuestion } from '../../../../../shared/interfaces/questions/speed-tap.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '../../../../../ui/Text';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface SpeedTapComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: SpeedTapQuestion;
}

interface TapEvent {
  ts: number;
  option: string;
  action: 'tap' | 'undo';
}

export const SpeedTapComponent: React.FC<SpeedTapComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint,
  onAutoSubmit
}) => {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState<number>(question.prompt.roundSeconds);
  const [tappedItems, setTappedItems] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<TapEvent[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);

  // Auto-start timer when component mounts (using setTimeout to avoid render issues)
  useEffect(() => {
    if (!disabled && !isFinished) {
      const timer = setTimeout(() => {
        const now = Date.now();
        setStartTime(now);
        setIsActive(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [disabled, isFinished]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            setIsFinished(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Separate effect for submitting answer when finished
  useEffect(() => {
    if (isFinished && events.length > 0) {
      const clientSummary = {
        taps: events.length,
        correct: Array.from(tappedItems).filter(item => 
          question.correct?.targets.includes(item)
        ).length,
        wrong: Array.from(tappedItems).filter(item => 
          !question.correct?.targets.includes(item)
        ).length,
      };
      onAnswerChange({
        roundSeconds: question.prompt.roundSeconds,
        events,
        clientSummary,
      });
      
      // Auto-submit when timer ends
      onAutoSubmit?.();
    }
  }, [isFinished, events, tappedItems, onAnswerChange, question.correct?.targets, question.prompt.roundSeconds, onAutoSubmit]);

  const handleItemTap = (item: string) => {
    if (!isActive || disabled) return;

    const now = Date.now();
    const relativeTime = now - startTime;
    
    if (tappedItems.has(item)) {
      // Undo tap
      setTappedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item);
        return newSet;
      });
      const newEvent: TapEvent = { ts: relativeTime, option: item, action: 'undo' };
      setEvents(prev => [...prev, newEvent]);
    } else {
      // Add tap
      setTappedItems(prev => new Set([...prev, item]));
      const newEvent: TapEvent = { ts: relativeTime, option: item, action: 'tap' };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const handleManualSubmit = () => {
    if (!isActive || disabled) return;
    
    setIsActive(false);
    setIsFinished(true);
  };

  const getItemStyle = (item: string) => {
    const isTapped = tappedItems.has(item);
    const isCorrect = question.correct?.targets.includes(item);
    
    if (showCorrect && isFinished) {
      if (isTapped && isCorrect) {
        return [styles.gridItem, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }];
      } else if (isTapped && !isCorrect) {
        return [styles.gridItem, { backgroundColor: theme.colors.error, borderColor: theme.colors.error }];
      } else if (!isTapped && isCorrect) {
        return [styles.gridItem, { backgroundColor: theme.colors.warning + '40', borderColor: theme.colors.warning }];
      }
    }
    
    if (isTapped) {
      return [styles.gridItem, styles.tappedItem, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }];
    }
    
    return [styles.gridItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }];
  };

  const getItemTextStyle = (item: string) => {
    const isTapped = tappedItems.has(item);
    const isCorrect = question.correct?.targets.includes(item);
    
    if (showCorrect && isFinished) {
      if ((isTapped && isCorrect) || (isTapped && !isCorrect)) {
        return { color: 'white', fontWeight: 'bold' };
      }
    }
    
    if (isTapped) {
      return { color: theme.colors.textOnPrimary, fontWeight: 'bold' };
    }
    
    return { color: theme.colors.text };
  };

  const getScoreSummary = () => {
    const correctTaps = Array.from(tappedItems).filter(item => 
      question.correct?.targets.includes(item)
    ).length;
    const wrongTaps = Array.from(tappedItems).filter(item => 
      !question.correct?.targets.includes(item)
    ).length;
    const missedTargets = (question.correct?.targets || []).filter(target => 
      !tappedItems.has(target)
    ).length;

    return { correctTaps, wrongTaps, missedTargets };
  };

  return (
    <View style={styles.container}>
      <Text variant="h3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      <Text variant="body" style={[styles.ruleText, { color: theme.colors.textSecondary }]}>
        Rule: {question.prompt.targetRule}
      </Text>

      <View style={[styles.statusContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="h2" style={[styles.timer, { color: isActive ? theme.colors.primary : theme.colors.textSecondary }]}>
          {timeLeft}s
        </Text>
        
        <Text variant="body" style={[styles.tapCount, { color: theme.colors.text }]}>
          Tapped: {tappedItems.size}
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {question.prompt.grid.map((item, index) => (
          <Pressable
            key={index}
            style={getItemStyle(item)}
            onPress={() => handleItemTap(item)}
            disabled={!isActive || disabled}
          >
            <Text variant="body" style={[styles.itemText, getItemTextStyle(item)]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {isActive && !disabled && (
        <Pressable 
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleManualSubmit}
        >
          <Text variant="body" weight="semibold" style={[styles.submitButtonText, { color: theme.colors.textOnPrimary }]}>
            Submit Answer
          </Text>
        </Pressable>
      )}

      {isFinished && showCorrect && (
        <View style={[styles.resultsContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="h3" style={[styles.resultsTitle, { color: theme.colors.text }]}>
            Results:
          </Text>
          <View style={styles.resultsRow}>
            <Text variant="body" style={{ color: theme.colors.success }}>
              ✅ Correct: {getScoreSummary().correctTaps}
            </Text>
            <Text variant="body" style={{ color: theme.colors.error }}>
              ❌ Wrong: {getScoreSummary().wrongTaps}
            </Text>
            <Text variant="body" style={{ color: theme.colors.warning }}>
              ⚠️ Missed: {getScoreSummary().missedTargets}
            </Text>
          </View>
        </View>
      )}

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
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  ruleText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  timer: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tapCount: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginTop: 12,
  },
  gridItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 3,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  tappedItem: {
    transform: [{ scale: 0.95 }],
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  resultsContainer: {
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.4)',
  },
  resultsTitle: {
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  hintContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  hintText: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});