import React, { useState } from 'react';
import { AiVisualQuestion } from '../../../../../shared/interfaces/questions/ai-visual.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Image, Pressable, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Text } from '../../../../../ui/Text';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface AiVisualComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: AiVisualQuestion;
}

const { width: screenWidth } = Dimensions.get('window');
const imageWidth = Math.min(screenWidth - 48, 280);

export const AiVisualComponent: React.FC<AiVisualComponentProps> = ({
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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Debug logging
  console.log('AiVisualComponent Debug:', {
    mediaRefs: question.mediaRefs,
    mediaRefsLength: question.mediaRefs?.length,
    firstMediaRef: question.mediaRefs?.[0],
    imageUrl: question.mediaRefs?.[0]?.url
  });

  const imageUrl = question.mediaRefs?.[0]?.url;
  
  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (error: any) => {
    console.error('Image failed to load:', imageUrl);
    console.error('Error nativeEvent:', error?.nativeEvent);
    
    // Check if it's a network error vs other type
    if (error?.nativeEvent?.error) {
      console.error('Native error:', error.nativeEvent.error);
    }
    
    setImageError(true);
    setImageLoading(false);
  };

  const handleChoiceSelect = (choiceIndex: number) => {
    onAnswerChange({ choiceIndex });
  };

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;

    if (isCorrect) {
      return [
        styles.choiceButton, 
        { 
          backgroundColor: theme.colors.success + '20', 
          borderColor: theme.colors.success,
          borderWidth: 2
        }
      ];
    } else if (isWrong) {
      return [
        styles.choiceButton, 
        { 
          backgroundColor: theme.colors.error + '20', 
          borderColor: theme.colors.error,
          borderWidth: 2
        }
      ];
    } else if (isSelected) {
      return [
        styles.choiceButton, 
        { 
          backgroundColor: theme.colors.primary + '15', 
          borderColor: theme.colors.primary,
          borderWidth: 2
        }
      ];
    } else {
      return [
        styles.choiceButton, 
        { 
          backgroundColor: theme.colors.surface, 
          borderColor: theme.colors.border,
          borderWidth: 1
        }
      ];
    }
  };

  const getChoiceTextStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;

    if (isCorrect) {
      return { color: theme.colors.success };
    } else if (isWrong) {
      return { color: theme.colors.error };
    } else if (isSelected) {
      return { color: theme.colors.primary };
    }
    return { color: theme.colors.text };
  };

  return (
    <View style={styles.container}>
      <Text variant="h3" weight="semibold" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      {/* Simple AI Image Display */}
      {question.mediaRefs && question.mediaRefs.length > 0 && (
        <View style={styles.imageContainer}>
          {imageError ? (
            <View style={[styles.aiImage, styles.errorContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text variant="caption" style={{ color: theme.colors.error, textAlign: 'center' }}>
                Failed to load image
              </Text>
              <Text variant="caption" style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4, fontSize: 10 }}>
                {imageUrl}
              </Text>
              <Pressable 
                style={{ marginTop: 8, padding: 4, backgroundColor: theme.colors.primary + '20', borderRadius: 4 }}
                onPress={() => {
                  setImageError(false);
                  setImageLoading(true);
                }}
              >
                <Text variant="caption" style={{ color: theme.colors.primary }}>
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {imageLoading && (
                <View style={[styles.aiImage, styles.loadingContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
                    Loading image...
                  </Text>
                </View>
              )}
              <Image
                source={{ 
                  uri: imageUrl,
                  cache: 'default'
                }}
                style={[
                  styles.aiImage, 
                  { borderColor: theme.colors.border },
                  imageLoading && { position: 'absolute', opacity: 0 }
                ]}
                resizeMode="cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                onLoadStart={() => {
                  console.log('Image load started:', imageUrl);
                  setImageLoading(true);
                }}
              />
            </>
          )}
        </View>
      )}

      {/* Simple Choice Grid - 2 per row */}
      <View style={styles.choicesGrid}>
        {question.choices?.map((choice, index) => (
          <Pressable
            key={choice.id || index}
            style={getChoiceStyle(index)}
            onPress={() => !disabled && handleChoiceSelect(index)}
            disabled={disabled}
          >
            <Text 
              variant="body" 
              weight="medium" 
              style={[styles.choiceText, getChoiceTextStyle(index)]}
            >
              {choice.text || choice}
            </Text>
          </Pressable>
        )) || (
          <View style={styles.noChoicesContainer}>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              No album options available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingHorizontal: 16,
  },
  questionText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  aiImage: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 12,
    borderWidth: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  choiceButton: {
    width: '48%', // Fixed percentage width for exactly 2 per row
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    marginBottom: 12, // Add bottom margin instead of gap
  },
  choiceText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 16,
  },
  noChoicesContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 32,
  },
});