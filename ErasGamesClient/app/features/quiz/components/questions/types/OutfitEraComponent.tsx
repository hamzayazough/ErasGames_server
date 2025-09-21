import React from 'react';
import { OutfitEraQuestion } from '../../../../../shared/interfaces/questions/outfit-era.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Pressable, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text } from '../../../../../ui/Text';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface OutfitEraComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: OutfitEraQuestion;
}

const { width: screenWidth } = Dimensions.get('window');
const maxImageWidth = screenWidth - 64; // Maximum width with padding

export const OutfitEraComponent: React.FC<OutfitEraComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint,
  onAutoSubmit
}) => {
  const theme = useTheme();

  const handleChoiceSelect = (choiceIndex: number) => {
    onAnswerChange({ choiceIndex });
  };

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;

    if (isCorrect) {
      return [
        styles.choiceItem, 
        { 
          backgroundColor: theme.colors.success,
          borderColor: theme.colors.success,
        }
      ];
    } else if (isWrong) {
      return [
        styles.choiceItem, 
        { 
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
        }
      ];
    } else if (isSelected) {
      return [
        styles.choiceItem, 
        { 
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        }
      ];
    } else {
      return [
        styles.choiceItem, 
        { 
          backgroundColor: theme.colors.surface, 
          borderColor: theme.colors.border,
        }
      ];
    }
  };

  const getChoiceTextStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;

    if (isCorrect || isWrong || isSelected) {
      return { color: 'white' };
    }
    return { color: theme.colors.text };
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      {/* Outfit Images Section */}
      {question.mediaRefs && question.mediaRefs.length > 0 && (
        <View style={[styles.imageSection, { backgroundColor: theme.colors.surface }]}>
          {question.mediaRefs
            .filter(ref => ref.type === 'image')
            .map((mediaRef, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image 
                  source={{ uri: mediaRef.url }} 
                  style={styles.outfitImage}
                  resizeMode="contain"
                  onError={() => console.log('Image failed to load:', mediaRef.url)}
                />
              </View>
            ))}
        </View>
      )}

      {/* Era Selection */}
      <View style={styles.choicesSection}>
        
        {question.choices?.map((choice, index) => (
          <Pressable
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => !disabled && handleChoiceSelect(index)}
            disabled={disabled}
          >
            <Text 
              variant="body" 
              style={[styles.choiceText, getChoiceTextStyle(index)]}
            >
              {choice}
            </Text>
          </Pressable>
        )) || (
          <View style={styles.noChoicesContainer}>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              No era options available
            </Text>
          </View>
        )}
      </View>

      {showHint && question.hint && (
        <View style={[styles.hintContainer, { backgroundColor: theme.colors.primary + '10' }]}>
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
    gap: 16,
    padding: 16,
  },
  questionText: {
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  imageSection: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    alignItems: 'center',
  },
  outfitImage: {
    maxWidth: maxImageWidth * 0.8,
    maxHeight: 300,
    width: '100%',
    aspectRatio: undefined,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  choicesSection: {
    gap: 8,
  },
  choicesLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  choiceItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  noChoicesContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
  },
  hintContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  hintText: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 13,
  },
});