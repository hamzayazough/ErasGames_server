import React from 'react';
import { StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { View, Text, Button } from '../../../ui';
import { useTheme, ThemedBackground } from '../../../core/theme';
import type { RootStackScreenProps } from '../../../navigation/types';
import { allQuizMocks, QuizMock } from '../constants/quizMocks';
import { GlobalHeader } from '../../../shared/components';

type Props = RootStackScreenProps<'QuizSelection'>;

export default function QuizSelectionScreen({ navigation }: Props) {
  const theme = useTheme();

  const handleQuizSelect = (quiz: QuizMock) => {
    navigation.navigate('TestQuiz', { selectedQuiz: quiz });
  };

  const styles = createStyles(theme);

  return (
    <ThemedBackground style={styles.container}>
      {/* Global Header */}
      <GlobalHeader
        showBack={true}
        showProfile={true}
        showLeaderboard={true}
        onProfilePress={() => {
          console.log('Profile pressed - navigating...');
          navigation.navigate('Profile', {userId: undefined});
        }}
        onLeaderboardPress={() => {
          console.log('Leaderboard pressed - navigating...');
          navigation.navigate('Leaderboard');
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={theme.assets.titleImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          PRACTICE QUIZZES
        </Text>


        {/* Quiz List */}
        <View style={styles.quizList}>
          {allQuizMocks.map((quiz, index) => (
            <TouchableOpacity
              key={quiz.id}
              style={styles.quizItem}
              onPress={() => handleQuizSelect(quiz)}
              activeOpacity={0.8}
            >
              <View style={styles.quizItemContent}>
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>
                    {quiz.title}
                  </Text>
                  <Text style={styles.quizMeta}>
                    {quiz.questions.length} questions • {quiz.estimatedTime} min • {quiz.difficulty}
                  </Text>
                </View>
                <Text style={styles.arrow}>
                  →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedBackground>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing(2.5),
  },
  logoImage: {
    width: 280,
    height: 120,
  },
  title: {
    fontSize: theme.text.size['4xl'],
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: theme.spacing(1.5),
    letterSpacing: 1,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.text.size.lg,
    fontWeight: theme.text.weight.normal,
    textAlign: 'center',
    marginBottom: theme.spacing(5),
    paddingHorizontal: theme.spacing(3),
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  quizList: {
    paddingHorizontal: theme.spacing(3),
  },
  quizItem: {
    marginBottom: theme.spacing(2),
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.currentMode === 'main' 
      ? 'rgba(230, 230, 250, 0.8)' // Lavender with transparency for main theme
      : theme.colors.accent1, // Cream for retro theme
    borderWidth: 1,
    borderColor: theme.currentMode === 'main'
      ? 'rgba(221, 160, 221, 0.4)' // Light plum border for main theme
      : theme.colors.border, // Dark teal border for retro theme
    ...theme.shadows.md,
  },
  quizItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: theme.text.size['2xl'],
    fontWeight: '900',
    marginBottom: theme.spacing(0.75),
    letterSpacing: 0.5,
    color: theme.currentMode === 'main' 
      ? theme.colors.text // Indigo for main theme
      : theme.colors.charcoal, // Dark charcoal for retro theme
  },
  quizMeta: {
    fontSize: theme.text.size.sm,
    fontWeight: theme.text.weight.normal,
    color: theme.currentMode === 'main'
      ? theme.colors.textMuted // Medium slate blue for main theme
      : theme.colors.darkNeutral, // Darker neutral for retro theme
  },
  arrow: {
    fontSize: theme.text.size.xl,
    fontWeight: theme.text.weight.semibold,
    marginLeft: theme.spacing(2),
    color: theme.colors.primary,
  },
  bottomPadding: {
    height: theme.spacing(7.5),
  },
});