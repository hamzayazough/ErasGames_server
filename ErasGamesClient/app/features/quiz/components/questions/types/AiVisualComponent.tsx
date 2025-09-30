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
            <View style={styles.errorImageContainer}>
              <Image
                source={require('../../../../../assets/images/error-image.png')}
                style={[styles.aiImage, { borderColor: theme.colors.border }]}
                resizeMode="cover"
              />
              <Pressable 
                style={[styles.retryButton, { backgroundColor: theme.colors.primary + '20' }]}
                onPress={() => {
                  setImageError(false);
                  setImageLoading(true);
                }}
              >
                <Text variant="caption" style={{ color: theme.colors.primary, textAlign: 'center' }}>
                  🔄 Retry
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
                  cache: 'default',
                  headers: {
                    'User-Agent': 'ErasGames/1.0',
                  }
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
                defaultSource={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUI5Q0E0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD4KPHN2Zz4=' }}
              />
            </>
          )}
        </View>
      )}

      {/* Simple Choice Grid - 2 per row */}
      <View style={styles.choicesGrid}>
        {question.choices?.map((choice, index) => (
          <Pressable
            key={choice.url || index}
            style={getChoiceStyle(index)}
            onPress={() => !disabled && handleChoiceSelect(index)}
            disabled={disabled}
          >
            <Text 
              variant="body" 
              weight="medium" 
              style={[styles.choiceText, getChoiceTextStyle(index)]}
            >
              {choice.alt || `Option ${index + 1}`}
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
    gap: 24,
    paddingHorizontal: 0,
  },
  questionText: {
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  aiImage: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  choiceButton: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  choiceText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  noChoicesContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 36,
  },
  errorImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  retryButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 8,
    borderRadius: 6,
  },
});