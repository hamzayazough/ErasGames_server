import React, { useState } from 'react';
import { OneSecondQuestion } from '../../../../../shared/interfaces/questions/one-second.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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



  return (
    <View style={styles.container}>
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>

      <View style={[styles.audioContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
        <Text style={[styles.instructionText, { color: theme.colors.textPrimary }]}>
          ⚡ Listen to this 1-second clip
        </Text>
        
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: theme.colors.primary }]}>
            1.0s
          </Text>
          <Text style={[styles.timerLabel, { color: theme.colors.accent4 }]}>
            duration
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlayAudio}
          disabled={disabled || isPlaying}
          activeOpacity={0.8}
        >
          <Text style={[styles.playButtonText, { color: theme.colors.textOnPrimary }]}>
            {isPlaying ? '⏱️ Playing...' : '▶️ Play 1-Second Clip'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.songOptions}>
        <Text variant="heading4" style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Which song is this?
        </Text>
        
        {question.choices?.length ? question.choices.map((choice, index) => {
          const isSelected = selectedAnswer?.choiceIndex === index;
          const isCorrect = showCorrect && index === correctAnswer;
          const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer;
          
          let buttonStyle = [styles.songOption];
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
              onPress={() => !disabled && handleSongSelect(index)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Text style={[styles.songText, { color: textColor }]}>
                {typeof choice === 'string' ? choice : choice.text}
              </Text>
            </TouchableOpacity>
          );
        }) : (
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
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  songText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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