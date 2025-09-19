import React from 'react';
import { FillBlankQuestion } from '../../../../../shared/interfaces/questions/fill-blank.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { MultipleChoiceComponent } from '../common/MultipleChoiceComponent';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

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
      return <Text variant="body" style={[styles.sentenceText, { color: theme.colors.text }]}>{text}</Text>;
    }

    return (
      <View style={styles.sentenceContainer}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <Text variant="body" style={[styles.sentenceText, { color: theme.colors.text }]}>
              {part}
            </Text>
            {index < parts.length - 1 && (
              <View style={[styles.blankSpace, { backgroundColor: theme.colors.primaryLight }]}>
                <Text variant="body" style={[styles.blankText, { color: theme.colors.primary }]}>
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
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.textContainer, { backgroundColor: theme.colors.surface }]}>
        {renderTextWithBlank()}
      </View>

      <MultipleChoiceComponent
        choices={question.choices || []}
        selectedIndex={selectedAnswer?.choiceIndex ?? null}
        onSelect={handleChoiceSelect}
        disabled={disabled}
        showCorrect={showCorrect}
        correctIndex={correctAnswer?.choiceIndex}
      />
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
  textContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
});