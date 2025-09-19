import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Button } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { Choice } from '../../../../../shared/interfaces/choices/choice.type';

export interface MultipleChoiceProps {
  choices: Choice[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  correctIndex?: number;
  seed?: string;
}

export const MultipleChoiceComponent: React.FC<MultipleChoiceProps> = ({
  choices,
  selectedIndex,
  onSelect,
  disabled = false,
  showCorrect = false,
  correctIndex,
  seed
}) => {
  const theme = useTheme();

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedIndex === index;
    const isCorrect = showCorrect && index === correctIndex;
    const isWrong = showCorrect && index === selectedIndex && index !== correctIndex;

    if (isCorrect) {
      return [styles.choice, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }];
    } else if (isWrong) {
      return [styles.choice, { backgroundColor: theme.colors.error, borderColor: theme.colors.error }];
    } else if (isSelected) {
      return [styles.choice, styles.selectedChoice, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }];
    } else {
      return [styles.choice, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }];
    }
  };

  const getTextStyle = (index: number) => {
    const isSelected = selectedIndex === index;
    const isCorrect = showCorrect && index === correctIndex;
    const isWrong = showCorrect && index === selectedIndex && index !== correctIndex;

    if (isCorrect || isWrong) {
      return [styles.choiceText, { color: theme.colors.textOnPrimary }];
    } else if (isSelected) {
      return [styles.choiceText, { color: theme.colors.primary }];
    } else {
      return [styles.choiceText, { color: theme.colors.text }];
    }
  };

  const getChoiceText = (choice: Choice): string => {
    if (typeof choice === 'string') return choice;
    if ('text' in choice) return choice.text;
    if ('url' in choice) return choice.id || 'Media Option';
    return 'Option';
  };

  return (
    <View style={styles.container}>
      {choices.map((choice, index) => (
        <Button
          key={index}
          title={getChoiceText(choice)}
          onPress={() => !disabled && onSelect(index)}
          style={getChoiceStyle(index)}
          textStyle={getTextStyle(index)}
          disabled={disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  choice: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 60,
    justifyContent: 'center',
  },
  selectedChoice: {
    borderWidth: 2,
  },
  choiceText: {
    fontSize: 16,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});