#!/usr/bin/env ts-node

/**
 * Script to populate 200 bot users with realistic season data for leaderboards
 * This creates users with varied participation patterns, scores, and streaks
 *
 * Usage: npm run populate:bot-users
 */

import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { Season } from '../src/database/entities/season.entity';
import { SeasonParticipation } from '../src/database/entities/season-participation.entity';
import { DailySeasonProgress } from '../src/database/entities/daily-season-progress.entity';
import { SeasonLeaderboardSnapshot } from '../src/database/entities/season-leaderboard-snapshot.entity';
import { Subscription } from '../src/database/entities/subscription.entity';
import { Purchase } from '../src/database/entities/purchase.entity';
import { DailyEntitlements } from '../src/database/entities/daily-entitlements.entity';
import { Attempt } from '../src/database/entities/attempt.entity';
import { PracticeAttempt } from '../src/database/entities/practice-attempt.entity';
import { DailyQuiz } from '../src/database/entities/daily-quiz.entity';
import { Question } from '../src/database/entities/question.entity';
import { DailyQuizQuestion } from '../src/database/entities/daily-quiz-question.entity';
import { AttemptAnswer } from '../src/database/entities/attempt-answer.entity';
import { UserDevice } from '../src/database/entities/user-device.entity';
import { BillingEvent } from '../src/database/entities/billing-event.entity';
import { ProviderTransaction } from '../src/database/entities/provider-transaction.entity';
import { LeaderboardSnapshot } from '../src/database/entities/leaderboard-snapshot.entity';
import { CompositionLogEntity } from '../src/database/entities/composition-log.entity';
import { DailyDropTZ } from '../src/database/entities/daily-drop-tz.entity';
import {
  UserRole,
  UserStatus,
  AuthProvider,
} from '../src/database/enums/user.enums';
import { SeasonStatus } from '../src/database/enums/season-status.enum';

// Database configuration
const createDatabaseConfig = () => {
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5430'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'erasgames',
    entities: [
      User,
      Season,
      SeasonParticipation,
      DailySeasonProgress,
      SeasonLeaderboardSnapshot,
      Subscription,
      Purchase,
      DailyEntitlements,
      Attempt,
      PracticeAttempt,
      DailyQuiz,
      Question,
      DailyQuizQuestion,
      AttemptAnswer,
      UserDevice,
      BillingEvent,
      ProviderTransaction,
      LeaderboardSnapshot,
      CompositionLogEntity,
      DailyDropTZ,
    ],
    synchronize: false,
    logging: false,
  };
};

// Bot user data templates - Mix of real names, fan names, and Taylor Swift inspired usernames
const botNames = [
  // Real names with Taylor Swift fan vibes
  'Emma_Swiftie',
  'Sarah13',
  'MikeRedTour',
  'Jessica_Fearless',
  'Ashley_Lover',
  'Ryan_Enchanted',
  'Madison_22',
  'Tyler_Folklore',
  'Olivia_Evermore',
  'Jake_Midnight',
  'Sophia_Reputation',
  'Ethan_1989',
  'Chloe_SpeakNow',
  'Noah_RedTV',
  'Ava_Tortured',
  'Liam_Cardigan',
  'Mia_Willow',
  'Lucas_August',
  'Zoe_Betty',
  'Mason_Ivy',
  'Lily_Champagne',
  'Jackson_Dorothea',
  'Grace_Marjorie',
  'Aiden_Closure',
  'Hannah_Gold',
  'Carter_Lavender',
  'Ella_Cowboy',
  'Owen_Tis',
  'Cora_Long',
  'Blake_Right',

  // Taylor Swift song/album inspired usernames
  'BlankSpace_Fan',
  'ShakeItOff_13',
  'BadBlood_Lover',
  'WildestDreams_22',
  'Style_Icon',
  'OutOfWoods_13',
  'CleanSlate_Fan',
  'NewRomantics_Era',
  'Delicate_Touch',
  'ReadyForIt_Now',
  'EndGame_Player',
  'GetawayCard_13',
  'KingOfMyHeart',
  'CallItWhatYouWant',
  'Gorgeous_Vibes',
  'PerfectStorm_13',
  'CorneliaStreet_NY',
  'TheArcher_Aim',
  'Lover_Forever',
  'TheMan_13',
  'DeathByAThousand',
  'Cornelia_Street',
  'Daylight_Golden',
  'PaperRings_Love',
  'Invisible_String',
  'MadWoman_Era',
  'Exile_Story',
  'MyTears_Ricochet',
  'Mirrorball_Spin',
  'Seven_Years',
  'Cardigan_Cozy',
  'August_Slipped',
  'Illicit_Affairs',
  'Betty_James',
  'Peace_Dove',
  'Hoax_Truth',
  'Willow_Dance',
  'Champagne_Problems',
  'Gold_Rush_Feeling',
  'Tis_The_Damn',
  'Tolerate_It_13',
  'No_Body_No_Crime',
  'Happiness_Found',
  'Dorothea_Friend',
  'Coney_Island',
  'Ivy_Grows',
  'Cowboy_Like_Me',
  'Long_Story_Short',
  'Evermore_Love',
  'Right_Where_Left',
  'Its_Time_To_Go',
  'Lavender_Haze',
  'Maroon_Lips',
  'Anti_Hero_13',
  'Snow_On_Beach',
  'Youre_On_Your_Own',
  'Midnight_Rain_13',
  'Question_Mark_13',
  'Vigilante_Shit',
  'Bejeweled_Queen',
  'Labyrinth_Lost',
  'Karma_Is_A_Cat',
  'Sweet_Nothing_13',
  'Mastermind_Plan',
  'High_Infidelity',

  // Swiftie fan culture names
  'Swiftie_Since_06',
  'Era_Hopper_13',
  'Track5_Crier',
  'Easter_Egg_Hunter',
  'Clown_Makeup_Ready',
  'Theory_Mastermind',
  'Vault_Track_Lover',
  'Red_Scarf_Owner',
  'Cardigan_Weather',
  'Folklore_Cabin',
  'Evermore_Woods',
  'Midnights_Mayhem',
  'Tortured_Poet_13',
  'Eras_Tour_Survivor',
  'Friendship_Bracelet',
  'Lucky_Number_13',
  'Surprise_Song_Fan',
  'Stadium_Screamer',
  'Sparkly_Dress_13',
  'Fearless_Heart',
  'Golden_Hour_13',
  'Autumn_Leaves_TS',
  'Purple_Skies_13',
  'Ocean_Waves_Lover',
  'Starlight_Dreamer',

  // Regular names with numbers/underscores (realistic usernames)
  'Alex_Martinez_22',
  'Samantha_Lee_13',
  'Jordan_Smith_89',
  'Taylor_Johnson_15',
  'Casey_Williams_07',
  'Morgan_Brown_91',
  'Avery_Davis_13',
  'Riley_Wilson_88',
  'Quinn_Miller_22',
  'Sage_Anderson_13',
  'River_Thompson_77',
  'Phoenix_Garcia_13',
  'Skylar_Rodriguez_44',
  'Rowan_Lewis_13',
  'Dakota_Walker_99',
  'Hayden_Hall_13',
  'Peyton_Allen_23',
  'Cameron_Young_13',
  'Emery_King_18',
  'Finley_Wright_13',

  // International fan names
  'Sophie_Paris_13',
  'Luca_Milano_22',
  'Yuki_Tokyo_13',
  'Emma_London_89',
  'Lars_Stockholm_13',
  'Amelie_Berlin_22',
  'Diego_Madrid_13',
  'Nina_Moscow_89',
  'Kai_Seoul_13',
  'Zara_Mumbai_22',
  'Finn_Dublin_13',
  'Ana_Barcelona_89',
  'Max_Vienna_13',
  'Cleo_Athens_22',
  'Leo_Rome_13',

  // Creative Swift-inspired handles
  'Enchanted_13_Forever',
  'Love_Story_Romeo',
  'Tim_McGraw_First',
  'Our_Song_Radio',
  'Picture_To_Burn',
  'Teardrops_Guitar_13',
  'Should_Said_No',
  'Mary_Song_13',
  'Stay_Beautiful_Always',
  'Tied_Together',
  'White_Horse_Rider',
  'You_Belong_With_Me',
  'Breathe_Colbie_13',
  'Tell_Me_Why_13',
  'Youre_Not_Sorry',
  'Way_I_Loved_You',
  'Forever_Winter_13',
  'Come_Back_Be_Here',
  'I_Almost_Do_13',
  'We_Are_Never',
  'Stay_Stay_Stay_13',
  'Last_Kiss_10Min',
  'Long_Live_Era',
  'Ours_Forever_13',
  'Superman_Hero',

  // Modern Swiftie usernames
  'Karma_Army_13',
  'Lavender_Haze_Vibes',
  'Anti_Hero_Club',
  'Maroon_Mood_13',
  'Snow_Beach_Dreams',
  'Midnight_Rain_ASMR',
  'Bejeweled_Crown_13',
  'Mastermind_Energy',
  'Paris_13_Forever',
  'Glitch_In_Matrix',
  'Would_Could_Should',
  'Dear_Reader_13',
  'Hits_Different_22',
  'Forever_Winter_Sad',
  'Right_Where_You',
  'Message_In_Bottle',
  'I_Bet_You_Think',
  'Run_Taylor_Version',
  'All_Too_Well_22',
  'Nothing_New_Feat',

  // Casual fan names
  'MusicLover_Sarah',
  'PopQueen_Stan',
  'ConcertGoer_Mike',
  'PlaylistMaker_13',
  'SongWriter_Fan',
  'Melody_Hunter_22',
  'Beat_Keeper_13',
  'Harmony_Seeker',
  'Rhythm_Rider_89',
  'Tune_Collector_13',
  'Sound_Explorer_22',
  'Music_Addict_13',
  'Song_Discoverer',
  'Beat_Detective_22',
  'Melody_Maven_13',
];

const countries = [
  'US',
  'CA',
  'GB',
  'AU',
  'DE',
  'FR',
  'BR',
  'MX',
  'JP',
  'KR',
  'IN',
  'IT',
  'ES',
  'NL',
  'SE',
];
const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Australia/Sydney',
  'Asia/Tokyo',
  'Asia/Seoul',
  'America/Sao_Paulo',
];

// Utility functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateBotUserId(): string {
  return `bot_${Date.now()}_${randomInt(1000, 9999)}`;
}

function generateHandle(name: string): string {
  const suffix = randomInt(100, 9999);
  return `${name.toLowerCase()}${suffix}`;
}

// Generate realistic participation patterns with total scores between 0-14000
function generateParticipationData(seasonStartDate: Date, seasonEndDate: Date) {
  const totalDays =
    Math.floor(
      (seasonEndDate.getTime() - seasonStartDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;
  const currentDate = new Date();
  const maxDaysToGenerate = Math.min(
    totalDays,
    Math.floor(
      (currentDate.getTime() - seasonStartDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1,
  );

  // Generate a target total score between 0-14000 first
  const targetTotalScore = randomInt(0, 14000);

  // Different user archetypes with different participation patterns
  // Adjust participation and scores to reach target total
  const archetypes = [
    {
      name: 'casual',
      participationRate: 0.2,
      avgScore: 50,
      streakProne: false,
      scoreRange: [0, 3000],
    },
    {
      name: 'light',
      participationRate: 0.4,
      avgScore: 60,
      streakProne: false,
      scoreRange: [1000, 5000],
    },
    {
      name: 'regular',
      participationRate: 0.6,
      avgScore: 70,
      streakProne: true,
      scoreRange: [3000, 8000],
    },
    {
      name: 'dedicated',
      participationRate: 0.8,
      avgScore: 80,
      streakProne: true,
      scoreRange: [6000, 12000],
    },
    {
      name: 'perfectionist',
      participationRate: 0.95,
      avgScore: 90,
      streakProne: true,
      scoreRange: [8000, 14000],
    },
    {
      name: 'inconsistent',
      participationRate: 0.5,
      avgScore: 65,
      streakProne: false,
      scoreRange: [500, 7000],
    },
  ];

  // Choose archetype based on target score
  let selectedArchetype = archetypes[0];
  for (const archetype of archetypes) {
    if (
      targetTotalScore >= archetype.scoreRange[0] &&
      targetTotalScore <= archetype.scoreRange[1]
    ) {
      selectedArchetype = archetype;
      break;
    }
  }

  const dailyProgress = [];
  let currentStreak = 0;
  let longestStreak = 0;
  let runningTotal = 0;
  let totalQuizzes = 0;
  let perfectScores = 0;

  // Calculate how many days we need to participate to reach target score
  const estimatedDaysNeeded = Math.min(
    maxDaysToGenerate,
    Math.ceil(targetTotalScore / selectedArchetype.avgScore),
  );
  const actualParticipationRate = Math.min(
    1.0,
    estimatedDaysNeeded / maxDaysToGenerate,
  );

  for (let day = 0; day < maxDaysToGenerate; day++) {
    const participated = Math.random() < actualParticipationRate;

    if (participated && runningTotal < targetTotalScore) {
      // Calculate remaining points needed
      const remainingDays = maxDaysToGenerate - day;
      const remainingPoints = targetTotalScore - runningTotal;
      const targetDailyScore =
        remainingDays > 0 ? remainingPoints / remainingDays : 0;

      // Generate score based on target but with realistic variance
      let score;
      if (targetDailyScore > 0) {
        const baseScore = Math.min(100, Math.max(0, targetDailyScore));
        const variance = selectedArchetype.name === 'inconsistent' ? 25 : 15;
        score = Math.max(
          0,
          Math.min(
            100,
            Math.round(baseScore + (Math.random() - 0.5) * variance),
          ),
        );
      } else {
        // Use archetype's average score with variance
        const baseScore = selectedArchetype.avgScore;
        const variance = selectedArchetype.name === 'inconsistent' ? 25 : 15;
        score = Math.max(
          0,
          Math.min(
            100,
            Math.round(baseScore + (Math.random() - 0.5) * variance),
          ),
        );
      }

      // Boost score slightly for streak-prone users on streak days
      if (selectedArchetype.streakProne && currentStreak > 3) {
        score = Math.min(100, score + randomInt(0, 8));
      }

      // Don't exceed target total
      if (runningTotal + score > targetTotalScore) {
        score = Math.max(0, targetTotalScore - runningTotal);
      }

      const isPerfect = score === 100;
      const quizDate = new Date(seasonStartDate);
      quizDate.setDate(quizDate.getDate() + day);

      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
      runningTotal += score;
      totalQuizzes++;
      if (isPerfect) perfectScores++;

      dailyProgress.push({
        quizDate: quizDate.toISOString().split('T')[0],
        pointsEarned: score,
        isPerfectScore: isPerfect,
        streakDay: currentStreak,
        completedAt: new Date(
          quizDate.getTime() + randomInt(8, 23) * 60 * 60 * 1000,
        ), // Random time during the day
      });
    } else {
      currentStreak = 0;
    }
  }

  return {
    dailyProgress,
    totalPoints: runningTotal,
    totalQuizzes,
    perfectScores,
    currentStreak,
    longestStreak,
  };
}

async function main() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Starting bot user population script...');

    // Initialize database connection
    dataSource = new DataSource(createDatabaseConfig());
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Get current active season
    const seasonRepo = dataSource.getRepository(Season);
    const currentSeason = await seasonRepo.findOne({
      where: { status: SeasonStatus.ACTIVE },
    });

    if (!currentSeason) {
      console.error(
        '❌ No active season found. Please ensure there is an active season before running this script.',
      );
      return;
    }

    console.log(`📊 Found active season: ${currentSeason.displayName}`);

    const userRepo = dataSource.getRepository(User);
    const participationRepo = dataSource.getRepository(SeasonParticipation);
    const progressRepo = dataSource.getRepository(DailySeasonProgress);

    // Create 200 bot users
    const botsToCreate = 200;
    const batchSize = 20; // Process in batches to avoid memory issues

    for (let batch = 0; batch < Math.ceil(botsToCreate / batchSize); batch++) {
      console.log(
        `📦 Processing batch ${batch + 1}/${Math.ceil(botsToCreate / batchSize)}`,
      );

      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, botsToCreate);

      for (let i = batchStart; i < batchEnd; i++) {
        const botName = botNames[i % botNames.length];
        const uniqueBotName = `${botName}_${i + 1}`;

        // Create bot user
        const botUser = new User();
        botUser.id = generateBotUserId();
        botUser.email = `${uniqueBotName.toLowerCase()}@erosgamesbot.local`;
        botUser.emailVerified = true;
        botUser.authProvider = AuthProvider.FIREBASE;
        botUser.providerUserId = botUser.id;
        botUser.name = uniqueBotName;
        botUser.handle = generateHandle(uniqueBotName);
        botUser.country = randomChoice(countries);
        botUser.tz = randomChoice(timezones);
        botUser.role = UserRole.USER;
        botUser.status = UserStatus.ACTIVE;
        botUser.pushEnabled = Math.random() > 0.3;
        botUser.leaderboardOptOut = false;
        botUser.shareCountryOnLB = Math.random() > 0.2;
        botUser.analyticsConsent = true;
        botUser.marketingConsent = Math.random() > 0.5;

        // Set realistic last seen dates
        const daysAgo = randomInt(0, 7);
        botUser.lastSeenAt = new Date(
          Date.now() - daysAgo * 24 * 60 * 60 * 1000,
        );

        try {
          await userRepo.save(botUser);

          // Generate participation data
          const seasonStart = new Date(currentSeason.startDate);
          const seasonEnd = new Date(currentSeason.endDate);
          const participationData = generateParticipationData(
            seasonStart,
            seasonEnd,
          );

          // Create season participation record
          const participation = new SeasonParticipation();
          participation.season = currentSeason;
          participation.user = botUser;
          participation.joinedAt = new Date(
            seasonStart.getTime() + randomInt(0, 7) * 24 * 60 * 60 * 1000,
          ); // Joined within first week
          participation.totalPoints = participationData.totalPoints;
          participation.totalQuizzesCompleted = participationData.totalQuizzes;
          participation.perfectScores = participationData.perfectScores;
          participation.currentStreak = participationData.currentStreak;
          participation.longestStreak = participationData.longestStreak;
          participation.isActive =
            participationData.currentStreak > 0 || Math.random() > 0.1;
          participation.lastActivityAt = botUser.lastSeenAt;

          await participationRepo.save(participation);

          // Create daily progress records
          for (const dailyData of participationData.dailyProgress) {
            const progress = new DailySeasonProgress();
            progress.season = currentSeason;
            progress.user = botUser;
            progress.quizDate = dailyData.quizDate;
            progress.pointsEarned = dailyData.pointsEarned;
            progress.isPerfectScore = dailyData.isPerfectScore;
            progress.streakDay = dailyData.streakDay;
            progress.completedAt = dailyData.completedAt;

            await progressRepo.save(progress);
          }

          if ((i + 1) % 10 === 0) {
            console.log(`  ✅ Created ${i + 1}/${botsToCreate} bot users`);
          }
        } catch (error) {
          console.error(`❌ Error creating bot user ${uniqueBotName}:`, error);
        }
      }

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `🎉 Successfully created ${botsToCreate} bot users with season data!`,
    );
    console.log(
      '📈 Bot users have been added to the current season leaderboard',
    );
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    if (dataSource) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

if (require.main === module) {
  main();
}
