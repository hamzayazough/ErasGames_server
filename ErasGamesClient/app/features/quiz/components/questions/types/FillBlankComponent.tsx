import React from 'react';
import { FillBlankQuestion } from '../../../../../shared/interfaces/questions/fill-blank.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FillBlankComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: FillBlankQuestion;
}

export const FillBlankComponent: React.FC<FillBlankComponentProps> = ({
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

  // Split the text by blank (represented by ___ or _______ etc.)
  const renderTextWithBlank = () => {
    const text = question.prompt.text;
    const parts = text.split(/_{3,}/); // Split on 3 or more underscores
    
    if (parts.length < 2) {
      // No blank found, just render the text
      return <Text style={[styles.sentenceText, { color: theme.colors.textSecondary }]}>{text}</Text>;
    }

    return (
      <View style={styles.sentenceContainer}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <Text style={[styles.sentenceText, { color: theme.colors.textSecondary }]}>
              {part}
            </Text>
            {index < parts.length - 1 && (
              <View style={[styles.blankSpace, { backgroundColor: theme.colors.accent1 }]}>
                <Text style={[styles.blankText, { color: theme.colors.accent4 }]}>
                  {selectedAnswer?.choiceIndex !== undefined 
                    ? question.choices?.[selectedAnswer.choiceIndex]?.text || question.choices?.[selectedAnswer.choiceIndex] || '___'
                    : '___'
                  }
                </Text>
              </View>
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Question Instruction - Simple text since it's not the main focus */}
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>
      
      {/* Text with blank - same teal background style */}
      <View style={[styles.textContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
        {renderTextWithBlank()}
      </View>

      {/* Answer Choices - Cream/beige buttons like AlbumYearGuessComponent */}
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
              key={choice.id || index}
              style={buttonStyle}
              onPress={() => handleChoiceSelect(index)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Text style={textStyle}>
                {choice.text}
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
  textContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  sentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceText: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '700',
  },
  blankSpace: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  blankText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
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