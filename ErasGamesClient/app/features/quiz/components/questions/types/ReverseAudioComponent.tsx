import React, { useState } from 'react';
import { ReverseAudioQuestion } from '../../../../../shared/interfaces/questions/reverse-audio.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface ReverseAudioComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: ReverseAudioQuestion;
}

export const ReverseAudioComponent: React.FC<ReverseAudioComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();
  const [isPlayingReversed, setIsPlayingReversed] = useState<boolean>(false);

  const handleChoiceSelect = (choiceIndex: number) => {
    if (!disabled) {
      onAnswerChange({ choiceIndex });
    }
  };

  const handlePlayReversedAudio = () => {
    // TODO: Implement actual audio playback for the reversed clip
    setIsPlayingReversed(true);
    setTimeout(() => setIsPlayingReversed(false), 3000); // Simulate 3-second playback
  };

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && isSelected && index !== correctAnswer?.choiceIndex;

    if (isCorrect) {
      return [styles.choiceContainer, styles.correctChoice, { borderColor: theme.colors.success }];
    } else if (isWrong) {
      return [styles.choiceContainer, styles.wrongChoice, { borderColor: theme.colors.error }];
    } else if (isSelected) {
      return [styles.choiceContainer, styles.selectedChoice, { borderColor: theme.colors.primary }];
    } else {
      return [styles.choiceContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }];
    }
  };

  const getChoiceTextStyle = (index: number) => {
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && selectedAnswer?.choiceIndex === index && index !== correctAnswer?.choiceIndex;

    if (isCorrect) {
      return [styles.choiceText, { color: theme.colors.textOnSuccess }];
    } else if (isWrong) {
      return [styles.choiceText, { color: theme.colors.textOnError }];
    } else {
      return [styles.choiceText, { color: theme.colors.text }];
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      <View style={[styles.audioContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="body" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          🔄 Listen to the reversed audio clip
        </Text>
        
        <Pressable
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlayReversedAudio}
          disabled={disabled || isPlayingReversed}
        >
          <Text style={[styles.playButtonText, { color: theme.colors.textOnPrimary }]}>
            {isPlayingReversed ? '🔄 Playing...' : '▶️ Play Reversed Audio'}
          </Text>
        </Pressable>

        {isPlayingReversed && (
          <View style={styles.playingIndicator}>
            <Text variant="caption" style={[styles.playingText, { color: theme.colors.primary }]}>
              🎵 Audio playing in reverse...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.choicesSection}>
        <Text variant="heading4" style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Which song is this?
        </Text>
        
        {question.choices && question.choices.length > 0 ? (
          question.choices.map((choice, index) => (
            <Pressable
              key={index}
              style={getChoiceStyle(index)}
              onPress={() => handleChoiceSelect(index)}
              disabled={disabled}
            >
              <Text variant="body" style={getChoiceTextStyle(index)}>
                {typeof choice === 'string' ? choice : `Choice ${index + 1}`}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text variant="body" style={[styles.noChoicesText, { color: theme.colors.textSecondary }]}>
            No song choices available
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
  choicesSection: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  choiceContainer: {
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
  selectedChoice: {
    backgroundColor: 'rgba(232, 90, 63, 0.15)',
  },
  correctChoice: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  wrongChoice: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  noChoicesText: {
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