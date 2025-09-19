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
      
      <View style={[styles.albumContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="caption" style={[styles.albumLabel, { color: theme.colors.primary }]}>
          💿 ALBUM:
        </Text>
        <Text variant="heading2" style={[styles.albumName, { color: theme.colors.text }]}>
          {question.prompt.album}
        </Text>
      </View>

      <View style={[styles.instructionContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="caption" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          🎵 Arrange tracks in the correct album order
        </Text>
      </View>

      <OrderingComponent
        items={items}
        orderedItems={currentOrder}
        onReorder={handleReorder}
        disabled={disabled}
        showCorrect={showCorrect}
        correctOrder={correctAnswer}
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  albumLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  albumName: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionContainer: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 12,
    textAlign: 'center',
  },
});