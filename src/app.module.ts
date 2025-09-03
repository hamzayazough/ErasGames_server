import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartitionManagementService } from './database/services/partition-management.service';
import { AdminPartitionController } from './admin/controllers/admin-partition.controller';

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

@Module({
  imports: [
    // Schedule module for cron jobs
    ScheduleModule.forRoot(),

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
      ],
      synchronize: false, // Never use true in production - use migrations instead
      logging: process.env.NODE_ENV === 'development',
      migrations: ['dist/db/*.js'],
      migrationsTableName: 'migrations',
    }),

    // Register repositories for partition service
    TypeOrmModule.forFeature([Attempt, DailyQuizQuestion]),
  ],
  controllers: [AppController, AdminPartitionController],
  providers: [AppService, PartitionManagementService],
})
export class AppModule {}
