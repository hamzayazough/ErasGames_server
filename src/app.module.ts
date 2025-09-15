import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartitionManagementService } from './database/services/partition-management.service';
import { AdminPartitionController } from './admin/controllers/admin-partition.controller';
import { AdminDailyQuizController } from './admin/controllers/admin-daily-quiz.controller';
import { QuestionController } from './admin/controllers/question.controller';

// Question Creation Services
import { QuestionCreationService } from './database/services/question-creation/question-creation.service';
import { QuestionService } from './database/services/question-creation/question.service';
import { AudioBasedQuestionService } from './database/services/question-creation/child-services/audio-based-question.service';
import { InteractiveGameQuestionService } from './database/services/question-creation/child-services/interactive-game-question.service';
import { KnowledgeTriviaQuestionService } from './database/services/question-creation/child-services/knowledge-trivia-question.service';
import { VisualAestheticQuestionService } from './database/services/question-creation/child-services/visual-aesthetic-question.service';

// Daily Quiz Composer Module
import { DailyQuizComposerModule } from './database/services/daily-quiz-composer';

// Import all entities for TypeORM
import { User } from './database/entities/user.entity';
import { Question } from './database/entities/question.entity';
import { DailyQuiz } from './database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from './database/entities/daily-quiz-question.entity';
import { Attempt } from './database/entities/attempt.entity';
import { PracticeAttempt } from './database/entities/practice-attempt.entity';
import { LeaderboardSnapshot } from './database/entities/leaderboard-snapshot.entity';
import { DailyEntitlements } from './database/entities/daily-entitlements.entity';
import { Subscription } from './database/entities/subscription.entity';
import { Purchase } from './database/entities/purchase.entity';
import { BillingEvent } from './database/entities/billing-event.entity';
import { ProviderTransaction } from './database/entities/provider-transaction.entity';
import { DailyDropTZ } from './database/entities/daily-drop-tz.entity';
import { CompositionLogEntity } from './database/entities/composition-log.entity';

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

    // TypeORM configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'erasgames',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'erasgames',
      entities: [
        User,
        Question,
        DailyQuiz,
        DailyQuizQuestion,
        Attempt,
        PracticeAttempt,
        LeaderboardSnapshot,
        DailyEntitlements,
        Subscription,
        Purchase,
        BillingEvent,
        ProviderTransaction,
        DailyDropTZ,
        CompositionLogEntity,
      ],
      synchronize: false, // Never use true in production - use migrations instead
      logging: process.env.NODE_ENV === 'development',
      migrations: ['dist/db/*.js'],
      migrationsTableName: 'migrations',
    }),

    // Register repositories for partition service and question creation
    TypeOrmModule.forFeature([
      Attempt,
      DailyQuizQuestion,
      Question, // Add Question repository for question creation services
    ]),
  ],
  controllers: [
    AppController,
    AdminPartitionController,
    AdminDailyQuizController,
    QuestionController,
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
  ],
})
export class AppModule {}
