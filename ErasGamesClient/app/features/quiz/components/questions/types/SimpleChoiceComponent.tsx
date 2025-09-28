import React from 'react';
import { QuestionComponentProps } from '../QuestionRenderer';
import { MultipleChoiceComponent } from '../common/MultipleChoiceComponent';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

// Generic component for simple multiple choice questions
interface SimpleChoiceComponentProps extends QuestionComponentProps {
  questionText: string;
  subtitle?: string;
  icon?: string;
}

export const SimpleChoiceComponent: React.FC<SimpleChoiceComponentProps> = ({
  question,
  questionText,
  subtitle,
  icon,
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
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {questionText}
      </Text>
      
      {subtitle && (
        <View style={[styles.subtitleContainer, { backgroundColor: theme.colors.surface }]}>
          {icon && (
            <Text style={styles.icon}>{icon}</Text>
          )}
          <Text variant="body" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
      )}

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
    gap: 24,
  },
  questionText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  subtitleContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});