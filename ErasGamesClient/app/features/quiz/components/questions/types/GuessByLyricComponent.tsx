import React from 'react';
import { GuessByLyricQuestion } from '../../../../../shared/interfaces/questions/guess-by-lyric.interface';
import { QuestionComponentProps } from '../QuestionRenderer';

import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface GuessByLyricComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: GuessByLyricQuestion;
}

export const GuessByLyricComponent: React.FC<GuessByLyricComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  const handleChoiceSelect = (index: number) => {
    onAnswerChange({ choiceIndex: index });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.lyricContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
        <Text style={[styles.lyricLabel, { color: theme.colors.accent4 }]}>
          🎵 LYRIC:
        </Text>
        <Text style={[styles.lyricText, { color: theme.colors.textSecondary }]}>
          "{question.prompt.lyric}"
        </Text>
      </View>

      <View style={styles.choicesContainer}>
        {question.choices?.map((choice, index) => {
          const isSelected = selectedAnswer?.choiceIndex === index;
          const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
          const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;
          
          let buttonStyle = [styles.choiceButton];
          let textStyle = [styles.choiceText];
          
          if (isCorrect) {
            buttonStyle.push({ backgroundColor: theme.colors.success });
            textStyle.push({ color: theme.colors.textOnPrimary });
          } else if (isWrong) {
            buttonStyle.push({ backgroundColor: theme.colors.error });
            textStyle.push({ color: theme.colors.textOnPrimary });
          } else if (isSelected) {
            buttonStyle.push({ backgroundColor: theme.colors.primary });
            textStyle.push({ color: theme.colors.textOnPrimary });
          } else {
            buttonStyle.push({ backgroundColor: theme.colors.accent1 });
            textStyle.push({ color: theme.colors.accent4 });
          }

          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              onPress={() => handleChoiceSelect(index)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Text style={textStyle}>
                {choice}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  lyricContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  lyricLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  lyricText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  choicesContainer: {
    gap: 16,
    marginTop: 8,
  },
  choiceButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
});