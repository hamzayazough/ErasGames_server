import React, { useState, useEffect } from 'react';
import { SpeedTapQuestion } from '../../../../../shared/interfaces/questions/speed-tap.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../../../ui';
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
    if (isFinished && !disabled) {
      const clientSummary = {
        taps: events.length,
        correct: Array.from(tappedItems).filter(item => 
          question.correct?.targets.includes(item)
        ).length,
        wrong: Array.from(tappedItems).filter(item => 
          !question.correct?.targets.includes(item)
        ).length,
      };
      
      const finalAnswer = {
        roundSeconds: question.prompt.roundSeconds,
        events,
        clientSummary,
      };
      
      onAnswerChange(finalAnswer);
      
      // Auto-submit when timer ends - use setTimeout to avoid infinite loops
      const submitTimer = setTimeout(() => {
        if (onAutoSubmit) {
          onAutoSubmit();
        }
      }, 500);
      
      return () => clearTimeout(submitTimer);
    }
  }, [isFinished]); // Only depend on isFinished to avoid infinite loops

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
        return [styles.gridItem, { backgroundColor: theme.colors.accent1, borderColor: theme.colors.warning }];
      }
    }
    
    if (isTapped) {
      return [styles.gridItem, styles.tappedItem, { backgroundColor: theme.colors.accent1, borderColor: theme.colors.accent1 }];
    }
    
    return [styles.gridItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }];
  };

  const getItemTextStyle = (item: string) => {
    const isTapped = tappedItems.has(item);
    const isCorrect = question.correct?.targets.includes(item);
    
    if (showCorrect && isFinished) {
      if (isTapped && isCorrect) {
        return { color: '#FFFFFF', fontWeight: '700' }; // White text on green
      } else if (isTapped && !isCorrect) {
        return { color: '#FFFFFF', fontWeight: '700' }; // White text on red
      } else if (!isTapped && isCorrect) {
        return { color: theme.colors.warning, fontWeight: '700' }; // Warning color for missed correct items
      }
    }
    
    if (isTapped) {
      return { color: theme.colors.accent4, fontWeight: '700' };
    }
    
    return { color: theme.colors.textPrimary };
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
      {/* Question Title Card */}
      <View style={[styles.titleCard, { backgroundColor: theme.colors.accent1, borderColor: theme.colors.accent1 }]}>
        <Text style={[styles.questionTitle, { color: theme.colors.accent4 }]}>
          {question.prompt.task}
        </Text>
        <Text style={[styles.ruleText, { color: theme.colors.accent4, opacity: 0.8 }]}>
          Rule: {question.prompt.targetRule}
        </Text>
      </View>

      <View style={[styles.statusContainer, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: theme.colors.accent1 }]}>⏱️ TIME</Text>
          <Text style={[styles.timer, { color: theme.colors.accent1 }]}>
            {timeLeft}s
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: theme.colors.accent1 }]}>🎯 TAPPED</Text>
          <Text style={[styles.tapCount, { color: theme.colors.accent1 }]}>
            {tappedItems.size}
          </Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {question.prompt.grid.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={getItemStyle(item)}
            onPress={() => handleItemTap(item)}
            disabled={!isActive || disabled}
            activeOpacity={0.8}
          >
            <Text style={[styles.itemText, getItemTextStyle(item)]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isActive && !disabled && (
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleManualSubmit}
          activeOpacity={0.8}
        >
          <Text style={[styles.submitButtonText, { color: theme.colors.textOnPrimary }]}>
            Submit Answer
          </Text>
        </TouchableOpacity>
      )}

      {isFinished && showCorrect && (
        <View style={[styles.resultsContainer, { backgroundColor: theme.colors.accent1, borderColor: theme.colors.accent1 }]}>
          <Text style={[styles.resultsTitle, { color: theme.colors.accent4 }]}>
            Results:
          </Text>
          <View style={styles.resultsRow}>
            <Text style={[styles.resultText, { color: theme.colors.success }]}>
              ✅ Correct: {getScoreSummary().correctTaps}
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.error }]}>
              ❌ Wrong: {getScoreSummary().wrongTaps}
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.warning }]}>
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
  titleCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  ruleText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  statusItem: {
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  timer: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tapCount: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  gridItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    minWidth: 110,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    marginVertical: 4,
  },
  tappedItem: {
    transform: [{ scale: 0.96 }],
  },
  itemText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  resultsContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  resultsTitle: {
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  hintContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  submitButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    minWidth: 200,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});