import { Controller, Get, Post, Query } from '@nestjs/common';
import { PartitionManagementService } from '../../database/services/partition-management.service';

interface PartitionResponse {
  message?: string;
  error?: string;
}

/**
 * AdminPartitionController
 *
 * Admin endpoints for managing database partitions.
 * Provides monitoring, manual operations, and health checks for partitioned tables.
 */
@Controller('admin/partitions')
// @UseGuards(AdminAuthGuard) // Add admin authentication guard
export class AdminPartitionController {
  constructor(private readonly partitionService: PartitionManagementService) {}

  /**
   * Get partition information and statistics
   */
  @Get()
  getPartitionInfo() {
    return this.partitionService.getPartitionInfo();
  }

  /**
   * Check partition system health
   */
  @Get('health')
  checkHealth() {
    return this.partitionService.checkPartitionHealth();
  }

  /**
   * Manually create next month's attempt partition
   */
  @Post('attempts/create-monthly')
  async createMonthlyAttemptPartition(): Promise<PartitionResponse> {
    try {
      const result =
        await this.partitionService.createMonthlyAttemptPartition();
      return { message: result };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  /**
   * Manually create next year's quiz question partition
   */
  @Post('quiz-questions/create-yearly')
  async createYearlyQuizQuestionPartition(): Promise<PartitionResponse> {
    try {
      const result =
        await this.partitionService.createYearlyQuizQuestionPartition();
      return { message: result };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  /**
   * Drop old attempt partitions
   */
  @Post('attempts/cleanup')
  async cleanupAttemptPartitions(
    @Query('months') months?: string,
  ): Promise<PartitionResponse> {
    try {
      const monthsToKeep = months ? parseInt(months, 10) : 12;
      const result =
        await this.partitionService.dropOldAttemptPartitions(monthsToKeep);
      return { message: result };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  /**
   * Drop old quiz question partitions
   */
  @Post('quiz-questions/cleanup')
  async cleanupQuizQuestionPartitions(
    @Query('years') years?: string,
  ): Promise<PartitionResponse> {
    try {
      const yearsToKeep = years ? parseInt(years, 10) : 5;
      const result =
        await this.partitionService.dropOldQuizQuestionPartitions(yearsToKeep);
      return { message: result };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  /**
   * Initialize partitions for new deployment
   */
  @Post('initialize')
  async initializePartitions(): Promise<PartitionResponse> {
    try {
      await this.partitionService.initializePartitions();
      return { message: 'Partitions initialized successfully' };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
}
