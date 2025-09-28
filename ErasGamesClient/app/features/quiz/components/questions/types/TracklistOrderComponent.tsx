import React from 'react';
import { TracklistOrderQuestion } from '../../../../../shared/interfaces/questions/tracklist-order.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { OrderingComponent, OrderingItem } from '../common/OrderingComponent';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

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

  const items: OrderingItem[] = question.prompt.tracks.map(track => ({
    id: track,
    label: track
  }));

  const handleReorder = (newOrder: string[]) => {
    onAnswerChange({ orderedTracks: newOrder });
  };

  // Initialize with tracks in the order they appear in the prompt if no answer yet
  const currentOrder = selectedAnswer?.orderedTracks || question.prompt.tracks;

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.albumContainer, { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.primary + '20',
        shadowColor: theme.colors.shadow || '#000'
      }]}>
        <View style={[styles.albumIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={styles.albumIcon}>💿</Text>
        </View>
        
        <View style={styles.albumTextContainer}>
          <Text variant="caption" style={[styles.albumLabel, { color: theme.colors.primary }]}>
            ALBUM
          </Text>
          <Text variant="heading2" style={[styles.albumName, { color: theme.colors.text }]}>
            {question.prompt.album}
          </Text>
          <View style={[styles.albumDivider, { backgroundColor: theme.colors.primary + '30' }]} />
        </View>
      </View>

      <View style={[styles.instructionContainer, { backgroundColor: theme.colors.primary + '08' }]}>
        <Text variant="caption" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          🔄 Drag and drop to arrange tracks in album order
        </Text>
      </View>

      <OrderingComponent
        items={items}
        orderedItems={currentOrder}
        onReorder={handleReorder}
        disabled={disabled}
        showCorrect={showCorrect}
        correctOrder={correctAnswer?.values}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  questionText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  albumContainer: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.4)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginVertical: 12,
  },
  albumIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  albumIcon: {
    fontSize: 32,
  },
  albumTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  albumLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  albumName: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    fontSize: 20,
    letterSpacing: 1,
  },
  albumDivider: {
    height: 3,
    width: 80,
    borderRadius: 2,
  },
  instructionContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.3)',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});