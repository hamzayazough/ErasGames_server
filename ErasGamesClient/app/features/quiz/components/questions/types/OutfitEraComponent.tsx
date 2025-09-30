import React from 'react';
import { OutfitEraQuestion } from '../../../../../shared/interfaces/questions/outfit-era.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
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
        }
      ];
    } else if (isWrong) {
      return [
        styles.choiceItem, 
        { 
          backgroundColor: theme.colors.error,
        }
      ];
    } else if (isSelected) {
      return [
        styles.choiceItem, 
        { 
          backgroundColor: theme.colors.primary,
        }
      ];
    } else {
      return [
        styles.choiceItem, 
        { 
          backgroundColor: theme.colors.accent1,
        }
      ];
    }
  };

  const getChoiceTextStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;

    if (isCorrect || isWrong || isSelected) {
      return { color: theme.colors.textOnPrimary };
    }
    return { color: theme.colors.accent4 };
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>

      {/* Outfit Images Section */}
      {question.mediaRefs && question.mediaRefs.length > 0 && (
        <View style={[styles.imageSection, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
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
          <TouchableOpacity
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => !disabled && handleChoiceSelect(index)}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Text style={[styles.choiceText, getChoiceTextStyle(index)]}>
              {typeof choice === 'string' ? choice : choice.text}
            </Text>
          </TouchableOpacity>
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
    gap: 20,
  },
  simpleQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  imageSection: {
    borderRadius: 16,
    borderWidth: 3,
    padding: 24,
    alignItems: 'center',
    minHeight: 80,
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
    gap: 16,
    marginTop: 8,
  },
  choicesLabel: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  choiceItem: {
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
  noChoicesContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 28,
  },
  hintContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  hintText: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: '500',
  },
});