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
const cardWidth = (screenWidth - 48) / 2; // 2 cards per row with margins

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
        styles.eraCard, 
        { 
          backgroundColor: theme.colors.success + '20', 
          borderColor: theme.colors.success,
          borderWidth: 3,
          transform: [{ scale: 1.02 }]
        }
      ];
    } else if (isWrong) {
      return [
        styles.eraCard, 
        { 
          backgroundColor: theme.colors.error + '20', 
          borderColor: theme.colors.error,
          borderWidth: 3,
          transform: [{ scale: 0.98 }]
        }
      ];
    } else if (isSelected) {
      return [
        styles.eraCard, 
        { 
          backgroundColor: theme.colors.primary + '15', 
          borderColor: theme.colors.primary,
          borderWidth: 2,
          transform: [{ scale: 1.05 }]
        }
      ];
    } else {
      return [
        styles.eraCard, 
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

  const getEraEmoji = (eraText: string) => {
    const era = eraText.toLowerCase();
    if (era.includes('fearless')) return '🤠';
    if (era.includes('speak now')) return '💜';
    if (era.includes('red')) return '❤️';
    if (era.includes('1989')) return '🌈';
    if (era.includes('reputation')) return '🐍';
    if (era.includes('lover')) return '💗';
    if (era.includes('folklore')) return '🌲';
    if (era.includes('evermore')) return '🍂';
    if (era.includes('midnights')) return '🌙';
    return '✨';
  };

  return (
    <View style={styles.container}>
      <Text variant="h2" weight="bold" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      {/* Outfit Images Section */}
      {question.mediaRefs && question.mediaRefs.length > 0 && (
        <View style={[styles.outfitSection, { backgroundColor: theme.colors.surface }]}>
          <Text variant="h3" weight="semibold" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Outfit Images
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageScrollContainer}
          >
            {question.mediaRefs
              .filter(ref => ref.type === 'image')
              .map((mediaRef, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image 
                    source={{ uri: mediaRef.url }} 
                    style={styles.outfitImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <Text variant="caption" weight="medium" style={styles.imageLabel}>
                      Outfit {index + 1}
                    </Text>
                  </View>
                </View>
              ))}
          </ScrollView>
        </View>
      )}

      {/* Era Selection Grid */}
      <View style={styles.sectionDivider}>
        <Text variant="h3" weight="semibold" style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Which Era?
        </Text>
      </View>

      <View style={styles.eraGrid}>
        {question.choices?.map((choice, index) => (
          <Pressable
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => !disabled && handleChoiceSelect(index)}
            disabled={disabled}
          >
            <Text variant="h1" style={styles.eraEmoji}>
              {getEraEmoji(choice)}
            </Text>
            <Text 
              variant="body" 
              weight="semibold" 
              style={[styles.eraText, getChoiceTextStyle(index)]}
            >
              {choice}
            </Text>
            {selectedAnswer?.choiceIndex === index && (
              <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                <Text variant="caption" weight="bold" style={styles.selectedText}>
                  SELECTED
                </Text>
              </View>
            )}
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
          <Text variant="caption" weight="medium" style={[styles.hintText, { color: theme.colors.text }]}>
            💡 Hint: {question.hint}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  questionText: {
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
  },
  outfitSection: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  imageScrollContainer: {
    gap: 16,
    paddingHorizontal: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  outfitImage: {
    width: cardWidth * 1.2,
    height: cardWidth * 1.5,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageLabel: {
    color: 'white',
    fontSize: 12,
  },
  sectionDivider: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  eraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  eraCard: {
    width: cardWidth,
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    position: 'relative',
  },
  eraEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  eraText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedText: {
    color: 'white',
    fontSize: 10,
  },
  noChoicesContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 32,
  },
  hintContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  hintText: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});