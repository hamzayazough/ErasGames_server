import React, { useState } from 'react';
import { OneSecondQuestion } from '../../../../../shared/interfaces/questions/one-second.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface OneSecondComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: OneSecondQuestion;
}

export const OneSecondComponent: React.FC<OneSecondComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleSongSelect = (choiceIndex: number) => {
    onAnswerChange({ choiceIndex });
  };

  const handlePlayAudio = () => {
    // TODO: Implement actual audio playback
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1000); // Simulate 1-second playback
  };

  const getSongStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer;

    if (isCorrect) {
      return [styles.songOption, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }];
    } else if (isWrong) {
      return [styles.songOption, { backgroundColor: theme.colors.error, borderColor: theme.colors.error }];
    } else if (isSelected) {
      return [styles.songOption, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }];
    } else {
      return [styles.songOption, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }];
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      <View style={[styles.audioContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="body" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          ⚡ Listen to this 1-second clip
        </Text>
        
        <View style={styles.timerContainer}>
          <Text variant="heading2" style={[styles.timerText, { color: theme.colors.primary }]}>
            1.0s
          </Text>
          <Text variant="caption" style={[styles.timerLabel, { color: theme.colors.textSecondary }]}>
            duration
          </Text>
        </View>
        
        <Pressable
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlayAudio}
          disabled={disabled || isPlaying}
        >
          <Text style={[styles.playButtonText, { color: theme.colors.textOnPrimary }]}>
            {isPlaying ? '⏱️ Playing...' : '▶️ Play 1-Second Clip'}
          </Text>
        </Pressable>

        {isPlaying && (
          <View style={styles.playingIndicator}>
            <Text variant="caption" style={[styles.playingText, { color: theme.colors.primary }]}>
              🎵 Listen carefully...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.songOptions}>
        <Text variant="heading4" style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Which song is this?
        </Text>
        
        {question.choices?.map((choice, index) => (
          <Pressable
            key={index}
            style={getSongStyle(index)}
            onPress={() => !disabled && handleSongSelect(index)}
            disabled={disabled}
          >
            <Text variant="body" style={[styles.songText, { color: theme.colors.text }]}>
              {choice}
            </Text>
          </Pressable>
        )) || (
          <Text variant="body" style={[styles.noSongsText, { color: theme.colors.textSecondary }]}>
            No song options available
          </Text>
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
    gap: 24,
  },
  questionText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  audioContainer: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 20,
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timerContainer: {
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timerLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
  },
  playButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playingIndicator: {
    marginTop: 12,
  },
  playingText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  songOptions: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  songOption: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  songText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  noSongsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 15,
    fontWeight: '500',
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
});