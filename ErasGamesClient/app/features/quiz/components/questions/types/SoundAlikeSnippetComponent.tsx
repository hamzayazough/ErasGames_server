import React, { useState, useEffect } from 'react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [audioDuration, setAudioDuration] = useState(8); // Default 8 seconds

  // Debug logging to understand the structure
  console.log('SoundAlikeSnippetComponent Debug:', {
    choices: question.choices,
    choicesType: typeof question.choices,
    firstChoice: question.choices?.[0],
    firstChoiceType: typeof question.choices?.[0]
  });

  const handleChoiceSelect = (index: number) => {
    if (!disabled) {
      onAnswerChange({ choiceIndex: index });
    }
  };

  const handlePlayAudio = () => {
    if (playCount >= 2) return; // Max 2 plays as per requirements
    
    // TODO: Implement actual audio playback
    setIsPlaying(true);
    setPlayCount(prev => prev + 1);
    
    // Simulate audio playback duration
    setTimeout(() => {
      setIsPlaying(false);
    }, audioDuration * 1000);
  };

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && correctAnswer && index === correctAnswer.choiceIndex;
    const isWrong = showCorrect && isSelected && correctAnswer && index !== correctAnswer.choiceIndex;

    if (isCorrect) {
      return [styles.choiceButton, styles.correctChoice, { borderColor: theme.colors.success }];
    } else if (isWrong) {
      return [styles.choiceButton, styles.wrongChoice, { borderColor: theme.colors.error }];
    } else if (isSelected) {
      return [styles.choiceButton, styles.selectedChoice, { borderColor: theme.colors.primary }];
    } else {
      return [styles.choiceButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }];
    }
  };

  const getChoiceTextStyle = (index: number) => {
    const isCorrect = showCorrect && correctAnswer && index === correctAnswer.choiceIndex;
    const isWrong = showCorrect && selectedAnswer?.choiceIndex === index && correctAnswer && index !== correctAnswer.choiceIndex;

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
      {/* Prompt */}
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      {/* Audio Player */}
      <View style={[styles.audioPlayerContainer, { backgroundColor: theme.colors.surface }]}>
        <Pressable
          style={[
            styles.playButton,
            { backgroundColor: isPlaying ? theme.colors.accent : theme.colors.primary },
            (disabled || playCount >= 2) && styles.playButtonDisabled
          ]}
          onPress={handlePlayAudio}
          disabled={disabled || isPlaying || playCount >= 2}
        >
          <Text style={[styles.playButtonIcon, { color: theme.colors.textOnPrimary }]}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </Pressable>
        
        <View style={styles.audioInfo}>
          <Text variant="body" style={[styles.audioLabel, { color: theme.colors.text }]}>
            {isPlaying ? 'Playing Snippet...' : `Play Snippet (0:0${audioDuration})`}
          </Text>
          {playCount > 0 && (
            <Text variant="caption" style={[styles.playCountText, { color: theme.colors.textSecondary }]}>
              Played {playCount}/2 times
            </Text>
          )}
        </View>
      </View>

      {/* Multiple Choice Options */}
      <View style={styles.choicesContainer}>
        {question.choices.map((choice, index) => (
          <Pressable
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => handleChoiceSelect(index)}
            disabled={disabled}
          >
            <Text variant="body" style={getChoiceTextStyle(index)}>
              {typeof choice === 'string' ? choice : choice?.text || choice?.id || `Option ${index + 1}`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  questionText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  audioPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  playButtonIcon: {
    fontSize: 20,
  },
  audioInfo: {
    flex: 1,
  },
  audioLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  playCountText: {
    fontSize: 12,
    marginTop: 4,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChoice: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  correctChoice: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  wrongChoice: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});