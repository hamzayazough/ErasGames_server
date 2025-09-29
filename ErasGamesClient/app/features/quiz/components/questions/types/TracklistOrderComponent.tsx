import React from 'react';
import { TracklistOrderQuestion } from '../../../../../shared/interfaces/questions/tracklist-order.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface TracklistOrderComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: TracklistOrderQuestion;
}

export const TracklistOrderComponent: React.FC<TracklistOrderComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  const handleReorder = (newOrder: string[]) => {
    onAnswerChange({ orderedTracks: newOrder });
  };

  // Initialize with tracks in the order they appear in the prompt if no answer yet
  const currentOrder = selectedAnswer?.orderedTracks || question.prompt.tracks;

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    
    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    handleReorder(newOrder);
  };

  const getTrackStyle = (trackId: string, index: number) => {
    if (showCorrect && correctAnswer?.orderedTracks) {
      const isCorrectPosition = correctAnswer.orderedTracks[index] === trackId;
      return [
        styles.trackItem,
        {
          backgroundColor: isCorrectPosition ? theme.colors.success : theme.colors.error,
          borderColor: isCorrectPosition ? theme.colors.success : theme.colors.error,
        }
      ];
    }
    
    return [
      styles.trackItem,
      {
        backgroundColor: theme.colors.accent1,
        borderColor: theme.colors.accent1,
      }
    ];
  };

  const getTextColor = (trackId: string, index: number) => {
    if (showCorrect && correctAnswer?.orderedTracks) {
      return theme.colors.textOnPrimary;
    }
    return theme.colors.accent4;
  };

  return (
    <View style={styles.container}>
      {/* Question Instruction - Simple text */}
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.albumContainer, { backgroundColor: theme.colors.accent1, borderColor: theme.colors.accent1 }]}>
        <View style={[styles.albumIconContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.albumIcon, { color: theme.colors.textOnPrimary }]}>💿</Text>
        </View>
        
        <View style={styles.albumTextContainer}>
          <Text style={[styles.albumLabel, { color: theme.colors.accent4 }]}>
            ALBUM
          </Text>
          <Text style={[styles.albumName, { color: theme.colors.accent4 }]}>
            {question.prompt.album}
          </Text>
        </View>
      </View>

      {/* Track Ordering */}
      <View style={styles.tracklistContainer}>
        {currentOrder.map((trackId, index) => (
          <View key={trackId} style={styles.trackItemWrapper}>
            <View style={[styles.trackNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.trackNumberText, { color: theme.colors.textOnPrimary }]}>
                {index + 1}
              </Text>
            </View>
            
            <View style={getTrackStyle(trackId, index)}>
              <View style={styles.trackContent}>
                <Text style={[styles.trackText, { color: getTextColor(trackId, index) }]}>
                  {trackId}
                </Text>
                
                {!disabled && !showCorrect && (
                  <View style={styles.controls}>
                    {index > 0 && (
                      <TouchableOpacity
                        onPress={() => moveItem(index, Math.max(0, index - 1))}
                        style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.controlButtonText, { color: theme.colors.textOnPrimary }]}>↑</Text>
                      </TouchableOpacity>
                    )}
                    {index < currentOrder.length - 1 && (
                      <TouchableOpacity
                        onPress={() => moveItem(index, Math.min(currentOrder.length - 1, index + 1))}
                        style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.controlButtonText, { color: theme.colors.textOnPrimary }]}>↓</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  simpleQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  albumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  albumIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumIcon: {
    fontSize: 20,
  },
  albumTextContainer: {
    flex: 1,
  },
  albumLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  albumName: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,
  },
  tracklistContainer: {
    gap: 8,
  },
  trackItemWrapper: {
    position: 'relative',
  },
  trackNumber: {
    position: 'absolute',
    left: -16,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  trackNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trackItem: {
    borderRadius: 16,
    borderWidth: 2,
    marginLeft: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  trackText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'column',
    gap: 4,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});