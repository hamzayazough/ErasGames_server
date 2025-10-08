// lib/services/question.service.ts
import { httpService } from "../http.service";
import type {
  Question,
  QuestionCreationDto,
  QuestionStats,
} from "../types/api.types";

export class QuestionService {
  private readonly baseEndpoint = "/questions";

  /**
   * Get supported question types
   */
  async getSupportedQuestionTypes() {
    return httpService.get<{ supportedTypes: string[] }>(
      `${this.baseEndpoint}/types`
    );
  }

  /**
   * Get all questions
   */
  async getAllQuestions() {
    return httpService.get<Question[]>(this.baseEndpoint);
  }

  /**
   * Get question statistics
   */
  async getQuestionStats() {
    return httpService.get<QuestionStats>(`${this.baseEndpoint}/stats`);
  }

  /**
   * Get approved questions
   */
  async getApprovedQuestions() {
    return httpService.get<Question[]>(`${this.baseEndpoint}/approved`);
  }

  /**
   * Get pending questions
   */
  async getPendingQuestions() {
    return httpService.get<Question[]>(`${this.baseEndpoint}/pending`);
  }

  /**
   * Get questions by type
   */
  async getQuestionsByType(type: string) {
    return httpService.get<Question[]>(`${this.baseEndpoint}/type/${type}`);
  }

  /**
   * Get questions by difficulty
   */
  async getQuestionsByDifficulty(difficulty: string) {
    return httpService.get<Question[]>(
      `${this.baseEndpoint}/difficulty/${difficulty}`
    );
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: string) {
    return httpService.get<Question>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Create a new question
   */
  async createQuestion(questionDto: QuestionCreationDto) {
    return httpService.post<Question>(
      `${this.baseEndpoint}/create`,
      questionDto
    );
  }

  /**
   * Create multiple questions
   */
  async createMultipleQuestions(questionDtos: QuestionCreationDto[]) {
    return httpService.post<Question[]>(
      `${this.baseEndpoint}/create/batch`,
      questionDtos
    );
  }

  /**
   * Approve a question
   */
  async approveQuestion(id: string) {
    return httpService.patch<Question>(`${this.baseEndpoint}/${id}/approve`);
  }

  /**
   * Disable a question
   */
  async disableQuestion(id: string) {
    return httpService.patch<Question>(`${this.baseEndpoint}/${id}/disable`);
  }
}

export const questionService = new QuestionService();
