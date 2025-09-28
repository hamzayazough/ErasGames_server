import React from 'react';
import { StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { View, Text, Button } from '../../../ui';
import { useTheme, RetroBackground } from '../../../core/theme';
import type { RootStackScreenProps } from '../../../navigation/types';
import { allQuizMocks, QuizMock } from '../constants/quizMocks';
import { GlobalHeader } from '../../../shared/components';

type Props = RootStackScreenProps<'QuizSelection'>;

export default function QuizSelectionScreen({ navigation }: Props) {
  const theme = useTheme();

  const handleQuizSelect = (quiz: QuizMock) => {
    navigation.navigate('TestQuiz', { selectedQuiz: quiz });
  };

  return (
    <RetroBackground style={styles.container}>
      {/* Global Header */}
      <GlobalHeader
        showBack={true}
        showProfile={true}
        showLeaderboard={true}
        onProfilePress={() => {
          console.log('Profile pressed');
        }}
        onLeaderboardPress={() => {
          console.log('Leaderboard pressed');
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/erasgames-title.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
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
                  <Text style={[styles.quizTitle, { color: theme.colors.textOnSurface }]}>
                    {quiz.title}
                  </Text>
                  <Text style={[styles.quizMeta, { color: theme.colors.textOnSurface }]}>
                    {quiz.questions.length} questions • {quiz.estimatedTime} min • {quiz.difficulty}
                  </Text>
                </View>
                <Text style={[styles.arrow, { color: theme.colors.textOnSurface }]}>
                  →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </RetroBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoImage: {
    width: 280,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  quizList: {
    paddingHorizontal: 24,
  },
  quizItem: {
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(244, 229, 177, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  quizMeta: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  bottomPadding: {
    height: 60,
  },
});