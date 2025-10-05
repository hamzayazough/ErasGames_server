import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../guards/admin.guard';
import { DailyQuizMode } from '../../database/services/daily-quiz-composer';
import { AdminService } from '../../services/quiz-creation/admin.service';
import { AdminJobManagementService } from '../../services/quiz-creation/admin-job-management.service';
import { AdminTestingService } from '../../services/quiz-creation/admin-testing.service';

/**
 * 🔧 Admin Daily Quiz Controller
 *
 * Centralized admin controller for all daily quiz operations including:
 * - Manual quiz composition and monitoring
 * - System health validation and statistics
 * - Testing endpoints for React Native development
 * - Job management and workflow testing
 *
 * This controller consolidates functionality from both the original admin controller
 * and the daily quiz test controller into a single comprehensive admin interface.
 */
@Controller('admin/daily-quiz')
@UseGuards(AdminGuard)
export class AdminDailyQuizController {
  private readonly logger = new Logger(AdminDailyQuizController.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly jobManagementService: AdminJobManagementService,
    private readonly testingService: AdminTestingService,
  ) {}

  // ========== MANUAL COMPOSITION ENDPOINTS ==========

  /**
   * Manually compose a daily quiz for a specific date/time
   * POST /admin/daily-quiz/compose
   */
  @Post('compose')
  async composeDailyQuiz(
    @Body()
    request: {
      dropAtUTC: string;
      mode?: DailyQuizMode;
      config?: any;
    },
  ) {
    return await this.adminService.composeDailyQuiz(request);
  }

  /**
   * Get question availability statistics
   * GET /admin/daily-quiz/availability
   */
  @Get('availability')
  async getQuestionAvailability() {
    return await this.adminService.getQuestionAvailability();
  }

  /**
   * Preview quiz composition without creating records
   * POST /admin/daily-quiz/preview
   */
  @Post('preview')
  async previewDailyQuiz(
    @Body()
    request: {
      dropAtUTC: string;
      mode?: DailyQuizMode;
      config?: any;
    },
  ) {
    return await this.adminService.previewDailyQuiz(request);
  }

  // ========== SYSTEM MONITORING ENDPOINTS ==========

  /**
   * Get composition health check
   * GET /admin/daily-quiz/health
   */
  @Get('health')
  async getCompositionHealth() {
    return await this.adminService.getCompositionHealth();
  }

  /**
   * Get quiz for a specific number of days from now
   * GET /admin/daily-quiz/by-days?days=0 (0=today, 1=tomorrow, etc.)
   */
  @Get('by-days')
  async getQuizByDaysFromNow(@Query('days') days: string = '0') {
    return await this.adminService.getQuizByDaysFromNow({ days });
  }

  /**
   * Get available themes and modes
   * GET /admin/daily-quiz/options
   */
  @Get('options')
  getCompositionOptions() {
    return this.adminService.getCompositionOptions();
  }

  /**
   * Get recent composition logs
   * GET /admin/daily-quiz/logs
   */
  @Get('logs')
  async getCompositionLogs(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ) {
    return await this.adminService.getCompositionLogs({ limit, offset });
  }

  // ========== JOB MANAGEMENT ENDPOINTS ==========

  /**
   * Manually trigger daily composition job
   * POST /admin/daily-quiz/jobs/trigger-composition
   */
  @Post('jobs/trigger-composition')
  async triggerDailyComposition(@Body() request: { dropAtUTC: string }) {
    return await this.jobManagementService.triggerDailyComposition(request);
  }

  /**
   * Manually trigger template warmup job
   * POST /admin/daily-quiz/jobs/trigger-warmup
   */
  @Post('jobs/trigger-warmup')
  async triggerTemplateWarmup(@Body() request: { quizId: string }) {
    return await this.jobManagementService.triggerTemplateWarmup(request);
  }

  /**
   * Get job status and scheduling information
   * GET /admin/daily-quiz/jobs/status
   */
  @Get('jobs/status')
  getJobStatus() {
    return this.jobManagementService.getJobStatus();
  }

  /**
   * Test the complete daily quiz workflow (composition + warmup)
   * POST /admin/daily-quiz/jobs/test-workflow
   */
  @Post('jobs/test-workflow')
  async testCompleteWorkflow(
    @Body() request: { dropAtUTC: string; mode?: DailyQuizMode },
  ) {
    return await this.jobManagementService.testCompleteWorkflow(request);
  }

  // ========== TESTING ENDPOINTS (from DailyQuizTestController) ==========

  /**
   * 🚀 Create Today's and Tomorrow's Quiz for Testing
   * POST /admin/daily-quiz/create-todays-quiz
   *
   * This endpoint mimics the daily quiz job crons to:
   * 1. Create today's quiz with drop time in 5 minutes
   * 2. Create tomorrow's quiz with standard drop time
   * 3. Generate and upload CDN templates for both
   * 4. Schedule notifications for both quizzes
   *
   * Perfect for testing the React Native app with real quiz data!
   */
  @Post('create-todays-quiz')
  async createTodaysQuiz() {
    return await this.testingService.createTodaysQuiz();
  }

  /**
   * 📊 Get current quiz status for testing (today and tomorrow)
   * GET /admin/daily-quiz/status
   */
  @Get('status')
  async getQuizStatus() {
    return await this.adminService.getQuizStatus();
  }

  /**
   * 🚀 Create ONLY Today's Quiz (for immediate testing)
   * POST /admin/daily-quiz/create-today-only
   */
  @Post('create-today-only')
  async createTodayOnly() {
    return await this.testingService.createTodayOnly();
  }

  /**
   * 🧹 Clean up today's and tomorrow's quizzes (for testing)
   * POST /admin/daily-quiz/cleanup
   */
  @Post('cleanup')
  async cleanupTodaysQuiz() {
    return await this.adminService.cleanupTodaysQuiz();
  }

  // ========== NEW QUIZ MANAGEMENT ENDPOINTS ==========

  /**
   * 🎯 Create a custom quiz with specific questions
   * POST /admin/daily-quiz/create-custom
   */
  @Post('create-custom')
  async createCustomQuiz(
    @Body()
    request: {
      dropAtUTC: string;
      questionIds: string[];
      mode?: DailyQuizMode;
      replaceExisting?: boolean;
    },
  ) {
    return await this.adminService.createCustomQuiz(request);
  }

  /**
   * 🕒 Update quiz drop time
   * PATCH /admin/daily-quiz/update-drop-time
   */
  @Patch('update-drop-time')
  async updateQuizDropTime(
    @Body()
    request: {
      quizId: string;
      newDropAtUTC: string;
    },
  ) {
    return await this.adminService.updateQuizDropTime(request);
  }

  /**
   * 📝 Update quiz questions
   * PATCH /admin/daily-quiz/update-questions
   */
  @Patch('update-questions')
  async updateQuizQuestions(
    @Body()
    request: {
      quizId: string;
      questionIds: string[];
    },
  ) {
    return await this.adminService.updateQuizQuestions(request);
  }

  /**
   * 🎨 Regenerate quiz template
   * POST /admin/daily-quiz/regenerate-template
   */
  @Post('regenerate-template')
  async regenerateTemplate(
    @Body()
    request: {
      quizId: string;
    },
  ) {
    return await this.adminService.regenerateTemplate(request);
  }

  /**
   * 📋 Get quiz details with questions
   * GET /admin/daily-quiz/details?quizId=X
   */
  @Get('details')
  async getQuizDetails(@Query('quizId') quizId: string) {
    return await this.adminService.getQuizDetails(quizId);
  }

  /**
   * 🗑️ Delete a quiz (only if not yet dropped)
   * DELETE /admin/daily-quiz/delete
   */
  @Delete('delete')
  async deleteQuiz(
    @Body()
    request: {
      quizId: string;
    },
  ) {
    return await this.adminService.deleteQuiz(request.quizId);
  }
}
