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
    gap: 20,
  },
  questionText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  audioContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 16,
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 14,
  },
  playButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  playingIndicator: {
    marginTop: 8,
  },
  playingText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  choicesSection: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  choiceContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  selectedChoice: {
    backgroundColor: '#E7F3FF',
  },
  correctChoice: {
    backgroundColor: '#E8F5E8',
  },
  wrongChoice: {
    backgroundColor: '#FFEBEE',
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '500',
  },
  noChoicesText: {
    textAlign: 'center',
    fontStyle: 'italic',
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