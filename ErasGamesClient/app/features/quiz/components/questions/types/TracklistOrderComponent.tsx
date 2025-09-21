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
    gap: 20,
  },
  questionText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  albumContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 8,
  },
  albumIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  albumIcon: {
    fontSize: 28,
  },
  albumTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  albumLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  albumName: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  albumDivider: {
    height: 2,
    width: 60,
    borderRadius: 1,
  },
  instructionContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
});