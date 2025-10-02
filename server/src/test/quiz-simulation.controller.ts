import { Controller, Get, Post, Logger } from '@nestjs/common';
import { QuizSimulationService } from './quiz-simulation.service';

/**
 * 🧪 Quiz Simulation Controller
 *
 * Endpoints for managing the 10-minute quiz workflow simulation
 */
@Controller('test/quiz-simulation')
export class QuizSimulationController {
  private readonly logger = new Logger(QuizSimulationController.name);

  constructor(private readonly simulationService: QuizSimulationService) {}

  /**
   * 🚀 Start a new 10-minute simulation
   */
  @Post('start')
  startSimulation() {
    this.logger.log('🚀 Starting new quiz simulation via API');
    return this.simulationService.startSimulation();
  }

  /**
   * 📊 Get current simulation status
   */
  @Get('status')
  getStatus() {
    return this.simulationService.getSimulationStatus();
  }

  /**
   * 🛑 Stop current simulation
   */
  @Post('stop')
  stopSimulation() {
    this.logger.log('🛑 Stopping simulation via API');
    return this.simulationService.stopSimulation();
  }

  /**
   * ℹ️ Get simulation info and instructions
   */
  @Get('info')
  getInfo() {
    return {
      title: '🧪 Quiz Simulation Service',
      description: 'Tests the complete daily quiz workflow in 10 minutes',
      workflow: {
        'T+1m': 'Create quiz for T+10m drop time',
        'T+6m': 'Generate template and upload to CDN',
        'T+10m': 'Send push notifications to all users',
      },
      endpoints: {
        'POST /start': 'Start a new simulation',
        'GET /status': 'Check simulation status',
        'POST /stop': 'Stop current simulation',
        'GET /info': 'Show this information',
      },
      automaticMode: {
        description: 'Simulations run automatically via cron jobs',
        schedule: 'Every 10-20 seconds (for rapid testing)',
      },
    };
  }
}
