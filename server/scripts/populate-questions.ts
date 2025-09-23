#!/usr/bin/env ts-node

/**
 * Isolated script to populate sample questions in the database
 * This script creates 6 questions with proper typing (3 easy, 2 medium, 1 hard)
 *
 * Usage: npm run populate:questions
 */

import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import { Question } from '../src/database/entities/question.entity';
import { DailyQuizQuestion } from '../src/database/entities/daily-quiz-question.entity';
import { DailyQuiz } from '../src/database/entities/daily-quiz.entity';
import { QuestionType, Difficulty } from '../src/database/enums/question.enums';
import { QuestionTheme } from '../src/database/enums/question-theme.enum';
import { StringArrayCorrect } from '../src/database/entities/corrects/string-array-correct.interface';

// Database configuration
const createDatabaseConfig = () => {
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5430'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'erasgames',
    synchronize: false,
    logging: true,
  };
};

// Sample questions data with proper typing
const sampleQuestions = [
  // Easy Questions (3)
  {
    questionType: QuestionType.ALBUM_YEAR_GUESS,
    difficulty: Difficulty.EASY,
    themesJSON: [QuestionTheme.Albums],
    subjectsJSON: ['album:Fearless', 'era:Fearless'],
    promptJSON: {
      task: 'What year was this album released?',
      album: 'Fearless',
    },
    choicesJSON: ['2008', '2009', '2010', '2011'],
    correctJSON: { index: 0 }, // 2008 is at index 0
    mediaJSON: null,
  },
  {
    questionType: QuestionType.GUESS_BY_LYRIC,
    difficulty: Difficulty.EASY,
    themesJSON: [QuestionTheme.Lyrics],
    subjectsJSON: ['song:Shake It Off', 'artist:Taylor Swift'],
    promptJSON: {
      task: 'Which song contains this lyric?',
      lyric: 'I stay out too late, got nothing in my brain',
    },
    choicesJSON: ['Shake It Off', 'Bad Blood', 'Blank Space', '22'],
    correctJSON: { index: 0 }, // Shake It Off is at index 0
    mediaJSON: null,
  },
  {
    questionType: QuestionType.LIFE_TRIVIA,
    difficulty: Difficulty.EASY,
    themesJSON: [QuestionTheme.Career],
    subjectsJSON: ['artist:Taylor Swift', 'theme:personal'],
    promptJSON: {
      task: 'Answer this trivia question',
      question: 'In which state was Taylor Swift born?',
    },
    choicesJSON: ['Pennsylvania', 'Tennessee', 'New York', 'California'],
    correctJSON: { index: 0 }, // Pennsylvania is at index 0
    mediaJSON: null,
  },
  // Medium Questions (2)
  {
    questionType: QuestionType.ODD_ONE_OUT,
    difficulty: Difficulty.MEDIUM,
    themesJSON: [QuestionTheme.Albums],
    subjectsJSON: ['artist:Taylor Swift', 'theme:albums'],
    promptJSON: {
      task: "Which one doesn't belong?",
      setRule: 'Taylor Swift studio albums',
    },
    choicesJSON: [
      '1989',
      'Red',
      'folklore',
      'Live from Clear Channel Stripped',
    ],
    correctJSON: { index: 3 }, // Live from Clear Channel Stripped is not a studio album
    mediaJSON: null,
  },
  {
    questionType: QuestionType.POPULARITY_MATCH,
    difficulty: Difficulty.MEDIUM,
    themesJSON: [QuestionTheme.Charts],
    subjectsJSON: ['chart:Billboard Hot 100', 'year:2023'],
    promptJSON: {
      task: 'Which song had the highest chart performance?',
      asOf: '2023',
    },
    choicesJSON: ['Anti-Hero', 'Flowers', 'Unholy', 'As It Was'],
    correctJSON: { index: 0 }, // Anti-Hero had great performance in 2023
    mediaJSON: null,
  },
  // Hard Question (1)
  {
    questionType: QuestionType.TIMELINE_ORDER,
    difficulty: Difficulty.HARD,
    themesJSON: [QuestionTheme.Timeline],
    subjectsJSON: ['artist:Taylor Swift', 'theme:discography'],
    promptJSON: {
      task: 'Put these albums in chronological order',
      items: ['1989', 'Red', 'folklore', 'Reputation'],
    },
    choicesJSON: null, // Timeline order questions don't use multiple choice
    correctJSON: {
      values: ['Red', '1989', 'Reputation', 'folklore'],
    } as StringArrayCorrect,
    mediaJSON: null,
  },
];

async function populateQuestions() {
  console.log('🎵 Starting question population script...');
  console.log(
    `📝 Creating ${sampleQuestions.length} sample questions (3 easy, 2 medium, 1 hard)`,
  );

  // Create database connection
  const dataSource = new DataSource({
    ...createDatabaseConfig(),
    entities: [Question, DailyQuizQuestion, DailyQuiz],
    synchronize: false,
  });

  try {
    // Initialize connection
    await dataSource.initialize();
    console.log('✅ Database connection established');

    const questionRepository = dataSource.getRepository(Question);

    // Clear existing questions (optional - comment out if you want to keep existing ones)
    // Note: Using createQueryBuilder to delete all records safely
    console.log('🗑️  Clearing existing questions...');
    await questionRepository.createQueryBuilder().delete().execute();

    console.log('📝 Creating sample questions...');

    for (let i = 0; i < sampleQuestions.length; i++) {
      const questionData = sampleQuestions[i];

      const question = new Question();
      question.questionType = questionData.questionType;
      question.difficulty = questionData.difficulty;
      question.themesJSON = questionData.themesJSON;
      question.subjectsJSON = questionData.subjectsJSON;
      question.promptJSON = questionData.promptJSON;
      question.choicesJSON = questionData.choicesJSON;
      question.correctJSON = questionData.correctJSON;
      question.mediaJSON = questionData.mediaJSON;
      question.approved = true;
      question.disabled = false;
      question.exposureCount = 0;
      question.lastUsedAt = null;

      await questionRepository.save(question);
      console.log(
        `   ✅ Created question ${i + 1}: ${questionData.questionType} (${questionData.difficulty})`,
      );
    }

    console.log(
      `🎉 Successfully created ${sampleQuestions.length} sample questions!`,
    );
    console.log('');
    console.log('📊 Summary:');

    // Count by difficulty
    const difficultyCount = sampleQuestions.reduce(
      (acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log('   Difficulty distribution:');
    Object.entries(difficultyCount).forEach(([difficulty, count]) => {
      console.log(`   - ${difficulty}: ${count} questions`);
    });

    // Count by type
    const typeCount = sampleQuestions.reduce(
      (acc, q) => {
        acc[q.questionType] = (acc[q.questionType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log('   Question types:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} questions`);
    });
  } catch (error) {
    console.error('❌ Error populating questions:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  populateQuestions().catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}
