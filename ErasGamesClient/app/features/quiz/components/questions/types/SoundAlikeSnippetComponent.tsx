import React, { useState, useEffect } from 'react';
import { SoundAlikeSnippetQuestion } from '../../../../../shared/interfaces/questions/sound-alike-snippet.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

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
    
    if (showCorrect && correctAnswer) {
      const isCorrect = index === correctAnswer.choiceIndex;
      const isWrong = isSelected && index !== correctAnswer.choiceIndex;
      
      if (isCorrect) {
        return [styles.choiceButton, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }];
      } else if (isWrong) {
        return [styles.choiceButton, { backgroundColor: theme.colors.error, borderColor: theme.colors.error }];
      }
    }
    
    return [
      styles.choiceButton,
      {
        backgroundColor: isSelected ? theme.colors.accent1 : theme.colors.background,
        borderColor: theme.colors.accent1,
      }
    ];
  };

  const getChoiceTextColor = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    
    if (showCorrect && correctAnswer) {
      const isCorrect = index === correctAnswer.choiceIndex;
      const isWrong = isSelected && index !== correctAnswer.choiceIndex;
      
      if (isCorrect || isWrong) {
        return theme.colors.textOnPrimary;
      }
    }
    
    return isSelected ? theme.colors.accent4 : theme.colors.textPrimary;
  };

  return (
    <View style={styles.container}>
      {/* Question Instruction - Simple text */}
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>

      {/* Audio Player */}
      <View style={[styles.audioPlayerContainer, { backgroundColor: theme.colors.accent1, borderColor: theme.colors.accent1 }]}>
        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: isPlaying ? theme.colors.primary : theme.colors.accent4 },
            (disabled || playCount >= 2) && styles.playButtonDisabled
          ]}
          onPress={handlePlayAudio}
          disabled={disabled || isPlaying || playCount >= 2}
          activeOpacity={0.8}
        >
          <Text style={[styles.playButtonIcon, { color: theme.colors.textOnPrimary }]}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.audioInfo}>
          <Text style={[styles.audioLabel, { color: theme.colors.accent4 }]}>
            {isPlaying ? 'Playing Snippet...' : `Play Snippet (0:0${audioDuration})`}
          </Text>
          {playCount > 0 && (
            <Text style={[styles.playCountText, { color: theme.colors.accent4, opacity: 0.7 }]}>
              Played {playCount}/2 times
            </Text>
          )}
        </View>
      </View>

      {/* Multiple Choice Options */}
      <View style={styles.choicesContainer}>
        {question.choices.map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => handleChoiceSelect(index)}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Text style={[styles.choiceText, { color: getChoiceTextColor(index) }]}>
              {typeof choice === 'string' ? choice : choice?.text || choice?.id || `Option ${index + 1}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  audioPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    borderWidth: 2,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
  },
  playCountText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});