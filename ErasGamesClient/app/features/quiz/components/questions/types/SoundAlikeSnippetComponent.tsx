import React, { useState } from 'react';
import { SoundAlikeSnippetQuestion } from '../../../../../shared/interfaces/questions/sound-alike-snippet.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

interface SoundAlikeSnippetComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: SoundAlikeSnippetQuestion;
}

export const SoundAlikeSnippetComponent: React.FC<SoundAlikeSnippetComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handleChoiceSelect = (index: number) => {
    onAnswerChange({ choiceIndex: index });
  };

  const handlePlayAudio = (index: number) => {
    // TODO: Implement actual audio playback
    setPlayingIndex(index);
    setTimeout(() => setPlayingIndex(null), 2000); // Simulate 2-second playback
  };

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;
    const isPlaying = playingIndex === index;

    if (isCorrect) {
      return [styles.audioChoice, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }];
    } else if (isWrong) {
      return [styles.audioChoice, { backgroundColor: theme.colors.error, borderColor: theme.colors.error }];
    } else if (isSelected) {
      return [styles.audioChoice, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }];
    } else if (isPlaying) {
      return [styles.audioChoice, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }];
    } else {
      return [styles.audioChoice, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }];
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.instructionContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="caption" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          🎵 Tap to play each audio clip, then select your answer
        </Text>
      </View>

      <View style={styles.audioChoices}>
        {question.mediaRefs?.map((mediaRef, index) => (
          <View key={index} style={styles.audioChoiceContainer}>
            <Pressable
              style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handlePlayAudio(index)}
              disabled={disabled}
            >
              <Text style={[styles.playButtonText, { color: theme.colors.textOnPrimary }]}>
                {playingIndex === index ? '⏸️' : '▶️'}
              </Text>
            </Pressable>
            
            <Pressable
              style={getChoiceStyle(index)}
              onPress={() => !disabled && handleChoiceSelect(index)}
              disabled={disabled}
            >
              <Text variant="body" style={[styles.choiceText, { color: theme.colors.text }]}>
                Audio Clip {index + 1}
                {playingIndex === index && (
                  <Text style={[styles.playingIndicator, { color: theme.colors.primary }]}>
                    {' '}♪ Playing...
                  </Text>
                )}
              </Text>
            </Pressable>
          </View>
        )) || (
          <Text variant="body" style={[styles.noMediaText, { color: theme.colors.textSecondary }]}>
            No audio clips available
          </Text>
        )}
      </View>
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
  instructionContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 13,
    textAlign: 'center',
  },
  audioChoices: {
    gap: 12,
  },
  audioChoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 16,
  },
  audioChoice: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  choiceText: {
    fontSize: 14,
  },
  playingIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  noMediaText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});