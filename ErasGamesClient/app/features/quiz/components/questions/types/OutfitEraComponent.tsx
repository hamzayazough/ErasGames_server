import React, { useState, useMemo, useCallback } from 'react';
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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());

  // Debug logging (removed to prevent render loops)
  // console.log('OutfitEraComponent Debug:', {
  //   questionType: question.questionType,
  //   mediaRefs: question.mediaRefs,
  //   mediaRefsLength: question.mediaRefs?.length,
  //   imageMediaRefs: question.mediaRefs?.filter(ref => ref.type === 'image'),
  //   choices: question.choices,
  //   prompt: question.prompt
  // });

  // Memoize filtered image mediaRefs to prevent recalculation on every render
  const imageMediaRefs = useMemo(() => 
    question.mediaRefs?.filter(ref => ref.type === 'image') || [], 
    [question.mediaRefs]
  );

  const handleChoiceSelect = useCallback((choiceIndex: number) => {
    onAnswerChange({ choiceIndex });
  }, [onAnswerChange]);

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

  const handleImageError = useCallback((url: string) => {
    // console.log('OutfitEra Image failed to load:', url);
    setImageErrors(prev => new Set(prev).add(url));
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  }, []);

  const handleImageLoad = useCallback((url: string) => {
    // console.log('OutfitEra Image loaded successfully:', url);
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  }, []);

  const handleImageLoadStart = useCallback((url: string) => {
    // console.log('OutfitEra Image load started:', url);
    setImageLoading(prev => new Set(prev).add(url));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>

      {/* Outfit Images Section */}
      {imageMediaRefs.length > 0 ? (
        <View style={[styles.imageSection, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.imageScrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {imageMediaRefs.map((mediaRef, index) => {
                return (
                  <View key={index} style={styles.imageContainer}>
                    {imageLoading.has(mediaRef.url) && !imageErrors.has(mediaRef.url) && (
                      <View style={[styles.outfitImage, styles.loadingOverlay, { backgroundColor: '#e0e0e0' }]}>
                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                          Loading image...
                        </Text>
                      </View>
                    )}
                    <Image 
                      source={
                        imageErrors.has(mediaRef.url) 
                          ? require('../../../../../assets/images/error-image.png')
                          : { uri: mediaRef.url }
                      } 
                      style={styles.outfitImage}
                      resizeMode="cover"
                      onLoadStart={() => handleImageLoadStart(mediaRef.url)}
                      onLoad={() => handleImageLoad(mediaRef.url)}
                      onError={() => handleImageError(mediaRef.url)}
                    />
                  </View>
                );
              })}
          </ScrollView>
          
          {/* Image indicator dots */}
          {imageMediaRefs.length > 1 && (
            <View style={styles.indicatorContainer}>
              {imageMediaRefs.map((_, index) => (
                <View 
                  key={index} 
                  style={[styles.indicator, { backgroundColor: theme.colors.accent3 }]} 
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.imageSection, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
          <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
            No images available for this question
          </Text>
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
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
  },
  imageScrollView: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    width: maxImageWidth * 0.8,
    marginHorizontal: 8,
  },
  outfitImage: {
    width: maxImageWidth * 0.8,
    height: 250,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
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