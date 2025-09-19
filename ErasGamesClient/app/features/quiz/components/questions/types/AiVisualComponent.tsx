import React from 'react';
import { AiVisualQuestion } from '../../../../../shared/interfaces/questions/ai-visual.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, Image, Pressable } from 'react-native';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

interface AiVisualComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: AiVisualQuestion;
}

export const AiVisualComponent: React.FC<AiVisualComponentProps> = ({
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

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;

    if (isCorrect) {
      return [styles.imageChoice, { borderColor: theme.colors.success, borderWidth: 3 }];
    } else if (isWrong) {
      return [styles.imageChoice, { borderColor: theme.colors.error, borderWidth: 3 }];
    } else if (isSelected) {
      return [styles.imageChoice, { borderColor: theme.colors.primary, borderWidth: 3 }];
    } else {
      return [styles.imageChoice, { borderColor: theme.colors.border, borderWidth: 2 }];
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.instructionContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="caption" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          🎨 Choose the image that best matches the description
        </Text>
      </View>

      <View style={styles.imageGrid}>
        {question.mediaRefs?.map((mediaRef, index) => (
          <Pressable
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => !disabled && handleChoiceSelect(index)}
            disabled={disabled}
          >
            <Image
              source={{ uri: mediaRef.url }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={[styles.choiceLabel, { backgroundColor: theme.colors.card }]}>
              <Text variant="caption" style={[styles.choiceLabelText, { color: theme.colors.text }]}>
                Option {index + 1}
              </Text>
            </View>
          </Pressable>
        )) || (
          <Text variant="body" style={[styles.noMediaText, { color: theme.colors.textSecondary }]}>
            No images available
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
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  imageChoice: {
    width: 150,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  choiceLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    alignItems: 'center',
  },
  choiceLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  noMediaText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});