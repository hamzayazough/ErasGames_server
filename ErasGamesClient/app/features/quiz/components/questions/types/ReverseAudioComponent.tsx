import React, { useState } from 'react';
import { ReverseAudioQuestion } from '../../../../../shared/interfaces/questions/reverse-audio.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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



  return (
    <View style={styles.container}>
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>

      <View style={[styles.audioContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
        <Text style={[styles.instructionText, { color: theme.colors.textPrimary }]}>
          🔄 Listen to the reversed audio clip
        </Text>
        
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlayReversedAudio}
          disabled={disabled || isPlayingReversed}
          activeOpacity={0.8}
        >
          <Text style={[styles.playButtonText, { color: theme.colors.textOnPrimary }]}>
            {isPlayingReversed ? '🔄 Playing...' : '▶️ Play Reversed Audio'}
          </Text>
        </TouchableOpacity>

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
          question.choices.map((choice, index) => {
            const isSelected = selectedAnswer?.choiceIndex === index;
            const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
            const isWrong = showCorrect && isSelected && index !== correctAnswer?.choiceIndex;
            
            let buttonStyle = [styles.choiceContainer];
            let textColor = theme.colors.accent4;
            
            if (isCorrect) {
              buttonStyle.push({ backgroundColor: theme.colors.success });
              textColor = theme.colors.textOnPrimary;
            } else if (isWrong) {
              buttonStyle.push({ backgroundColor: theme.colors.error });
              textColor = theme.colors.textOnPrimary;
            } else if (isSelected) {
              buttonStyle.push({ backgroundColor: theme.colors.primary });
              textColor = theme.colors.textOnPrimary;
            } else {
              buttonStyle.push({ backgroundColor: theme.colors.accent1 });
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleChoiceSelect(index)}
                disabled={disabled}
                activeOpacity={0.8}
              >
                <Text style={[styles.choiceText, { color: textColor }]}>
                  {typeof choice === 'string' ? choice : `Choice ${index + 1}`}
                </Text>
              </TouchableOpacity>
            );
          })
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
  simpleQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  audioContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    gap: 20,
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
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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