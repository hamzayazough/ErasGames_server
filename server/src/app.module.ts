import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Ensure ConfigModule loads first
import { config } from 'dotenv';
config();

// Environment-aware database configuration
const isProduction = process.env.NODE_ENV === 'production';

const createDatabaseConfig = () => {
  const baseConfig = {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'erasgames',
    synchronize: false,
    migrations: ['dist/db/*.js'],
    migrationsTableName: 'migrations',
  };

  if (isProduction) {
    return {
      ...baseConfig,
      ssl: { rejectUnauthorized: false },
      extra: { max: 20, connectionTimeoutMillis: 30000 },
      retryAttempts: 5,
      retryDelay: 3000,
      logging: false,
    };
  }

  // Development configuration
  return {
    ...baseConfig,
    ssl: false,
    extra: { max: 5, connectionTimeoutMillis: 10000 },
    retryAttempts: 3,
    retryDelay: 2000,
    logging: false,
  };
};

console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
console.log('📊 Database:', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'erasgames',
});

import { PartitionManagementService } from './database/services/partition-management.service';
import { AdminPartitionController } from './admin/controllers/admin-partition.controller';
import { AdminDailyQuizController } from './admin/controllers/admin-daily-quiz.controller';
import { QuestionController } from './admin/controllers/question.controller';
import { AdminJobController } from './admin/controllers/admin-job.controller';
import { DailyQuizController } from './controllers/daily-quiz.controller';
import { AttemptsController } from './controllers/attempts.controller';
import { TestController } from './admin/controllers/cdn-test.controller';
import { AuthController } from './controllers/auth.controller';
import { NotificationController } from './controllers/notification.controller';

// Services
import { DailyQuizJobProcessor } from './services/daily-quiz-job-processor.service';
import { NotificationService } from './services/notification.service';
import { FirebaseService } from './services/firebase.service';
import { AuthService } from './services/auth.service';
import { FirebaseAuthMiddleware } from './middleware/firebase-auth.middleware';

// Question Creation Services
import { QuestionCreationService } from './database/services/question-creation/question-creation.service';
import { QuestionService } from './database/services/question-creation/question.service';
import { AudioBasedQuestionService } from './database/services/question-creation/child-services/audio-based-question.service';
import { InteractiveGameQuestionService } from './database/services/question-creation/child-services/interactive-game-question.service';
import { KnowledgeTriviaQuestionService } from './database/services/question-creation/child-services/knowledge-trivia-question.service';
import { VisualAestheticQuestionService } from './database/services/question-creation/child-services/visual-aesthetic-question.service';

// Daily Quiz Composer Module
import { DailyQuizComposerModule } from './database/services/daily-quiz-composer';

// Attempt Scoring Services
import { AttemptScoringService } from './services/attempt-scoring/attempt-scoring.service';
import { QuestionCorrectnessService } from './services/attempt-scoring/question-correctness.service';

// Import entities for TypeORM relationship resolution
import { BaseEntityTimestamps } from './database/entities/base.entity';
import { User } from './database/entities/user.entity';
import { Question } from './database/entities/question.entity';
import { DailyQuiz } from './database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from './database/entities/daily-quiz-question.entity';
import { Attempt } from './database/entities/attempt.entity';
import { AttemptAnswer } from './database/entities/attempt-answer.entity';
import { PracticeAttempt } from './database/entities/practice-attempt.entity';
import { LeaderboardSnapshot } from './database/entities/leaderboard-snapshot.entity';
import { DailyEntitlements } from './database/entities/daily-entitlements.entity';
import { Subscription } from './database/entities/subscription.entity';
import { Purchase } from './database/entities/purchase.entity';
import { BillingEvent } from './database/entities/billing-event.entity';
import { ProviderTransaction } from './database/entities/provider-transaction.entity';
import { DailyDropTZ } from './database/entities/daily-drop-tz.entity';
import { CompositionLogEntity } from './database/entities/composition-log.entity';
import { UserDevice } from './database/entities/user-device.entity';
import { Season } from './database/entities/season.entity';
import { SeasonParticipation } from './database/entities/season-participation.entity';
import { DailySeasonProgress } from './database/entities/daily-season-progress.entity';
import { SeasonLeaderboardSnapshot } from './database/entities/season-leaderboard-snapshot.entity';
import { SeasonService } from './database/services/season.service';
import { SeasonIntegrationService } from './services/season-integration.service';
import { SeasonsController } from './controllers/seasons.controller';
import { AdminSeasonsController } from './admin/controllers/admin-seasons.controller';
import { QuizSimulationModule } from './test/quiz-simulation.module';

@Module({
  imports: [
    // Configuration module to load .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Schedule module for cron jobs
    ScheduleModule.forRoot(),

    // Daily Quiz Composer module
    DailyQuizComposerModule,

    // Quiz Simulation module (for testing)
    QuizSimulationModule,

    // TypeORM configuration with environment-aware settings
    TypeOrmModule.forRoot({
      ...createDatabaseConfig(),
      entities: [
        BaseEntityTimestamps,
        User,
        Question,
        DailyQuiz,
        DailyQuizQuestion,
        Attempt,
        AttemptAnswer,
        PracticeAttempt,
        LeaderboardSnapshot,
        DailyEntitlements,
        Subscription,
        Purchase,
        BillingEvent,
        ProviderTransaction,
        DailyDropTZ,
        CompositionLogEntity,
        UserDevice,
        Season,
        SeasonParticipation,
        DailySeasonProgress,
        SeasonLeaderboardSnapshot,
      ],
    }),

    // Register repositories for partition service and question creation
    TypeOrmModule.forFeature([
      Attempt,
      AttemptAnswer,
      DailyQuiz,
      DailyQuizQuestion,
      Question, // Add Question repository for question creation services
      User, // Add User repository for attempts
      UserDevice, // Add UserDevice repository for notifications
      Season, // Add Season repository for season management
      SeasonParticipation, // Add SeasonParticipation repository
      DailySeasonProgress, // Add DailySeasonProgress repository
      SeasonLeaderboardSnapshot, // Add SeasonLeaderboardSnapshot repository
    ]),
  ],
  controllers: [
    AppController,
    AdminPartitionController,
    AdminDailyQuizController,
    QuestionController,
    AdminJobController,
    DailyQuizController,
    AttemptsController,
    TestController,
    AuthController,
    NotificationController,
    SeasonsController,
    AdminSeasonsController,
  ],
  providers: [
    AppService,
    PartitionManagementService,
    // Question Creation Services
    QuestionCreationService,
    QuestionService,
    AudioBasedQuestionService,
    InteractiveGameQuestionService,
    KnowledgeTriviaQuestionService,
    VisualAestheticQuestionService,
    // Job Processing Services
    DailyQuizJobProcessor,
    // Notification Services
    NotificationService,
    // Authentication Services
    FirebaseService,
    AuthService,
    // Attempt Scoring Services
    AttemptScoringService,
    QuestionCorrectnessService,
    // Season Services
    SeasonService,
    SeasonIntegrationService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FirebaseAuthMiddleware)
      .forRoutes(
        'auth/authenticate',
        'attempts',
        'daily/status',
        'seasons/current/my-stats',
        'seasons/current/participation',
      );
  }
}
