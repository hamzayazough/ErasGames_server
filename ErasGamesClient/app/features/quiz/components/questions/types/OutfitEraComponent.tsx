import React from 'react';
import { OutfitEraQuestion } from '../../../../../shared/interfaces/questions/outfit-era.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface OutfitEraComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: OutfitEraQuestion;
}

export const OutfitEraComponent: React.FC<OutfitEraComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  const handleEraSelect = (eraIndex: number) => {
    onAnswerChange({ eraIndex });
  };

  const getEraStyle = (index: number) => {
    const isSelected = selectedAnswer?.eraIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.eraIndex;
    const isWrong = showCorrect && index === selectedAnswer?.eraIndex && index !== correctAnswer?.eraIndex;

    if (isCorrect) {
      return [styles.eraOption, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }];
    } else if (isWrong) {
      return [styles.eraOption, { backgroundColor: theme.colors.error, borderColor: theme.colors.error }];
    } else if (isSelected) {
      return [styles.eraOption, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }];
    } else {
      return [styles.eraOption, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }];
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      {question.outfitDescription && (
        <View style={[styles.outfitContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="body" style={[styles.outfitDescription, { color: theme.colors.text }]}>
            👗 {question.outfitDescription}
          </Text>
        </View>
      )}

      {question.outfitImageUrl && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: question.outfitImageUrl }} 
            style={styles.outfitImage}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={styles.eraOptions}>
        {question.eras?.map((era, index) => (
          <Pressable
            key={index}
            style={getEraStyle(index)}
            onPress={() => !disabled && handleEraSelect(index)}
            disabled={disabled}
          >
            <Text variant="body" style={[styles.eraText, { color: theme.colors.text }]}>
              {era}
            </Text>
          </Pressable>
        )) || (
          <Text variant="body" style={[styles.noErasText, { color: theme.colors.textSecondary }]}>
            No era options available
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
  questionText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  outfitContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  outfitDescription: {
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  outfitImage: {
    width: 200,
    height: 250,
    borderRadius: 12,
  },
  eraOptions: {
    gap: 12,
  },
  eraOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  eraText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noErasText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hintContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  hintText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});